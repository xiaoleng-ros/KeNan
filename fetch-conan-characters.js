/**
 * 从 Conanpedia MediaWiki API 抓取所有角色名称
 * 功能：逐节获取《名侦探柯南》角色页面的 wikitext，
 *       解析 {{角色}} 模板提取中文名和日文名
 *
 * {{角色}} 模板格式：
 *   {{角色
 *   |图片名|中文名|日文汉字|假名|罗马字|声优|
 *   描述
 *   }}
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 延迟函数，避免请求过快触发限流
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 发起 HTTPS GET 请求
 * @param {string} url - 请求地址
 * @returns {Promise<string>} 响应体文本
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'ConanCharacterScraper/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

/**
 * 获取指定 section 的 wikitext 内容
 * @param {number} sectionNumber - 节号
 * @returns {Promise<{sectionNumber: number, wikitext: string}>}
 */
async function fetchSection(sectionNumber) {
  const url = `https://www.conanpedia.com/api.php?action=parse&page=%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E8%A7%92%E8%89%B2&prop=wikitext&section=${sectionNumber}&format=json`;
  const raw = await fetchUrl(url);
  const json = JSON.parse(raw);

  if (json.error) {
    console.warn(`  ⚠ Section ${sectionNumber} 返回错误: ${json.error.info}`);
    return { sectionNumber, wikitext: '' };
  }

  const parse = json.parse || {};
  const wikitext = (parse.wikitext && parse.wikitext['*']) || '';

  return { sectionNumber, wikitext };
}

/**
 * 从 wikitext 中提取 section 标题
 * @param {string} wikitext - wikitext 原始文本
 * @returns {string} section 标题
 */
function extractSectionTitle(wikitext) {
  // 匹配 ==标题== 或 ===标题===，取第一个
  const match = wikitext.match(/={2,3}\s*(.+?)\s*={2,3}/);
  return match ? match[1].trim() : '';
}

/**
 * 从 wikitext 中提取角色信息
 * 解析 {{角色|图片|中文名|日文汉字|假名|罗马字|声优|描述}} 模板
 * @param {string} wikitext - wikitext 原始文本
 * @returns {Array<{nameZh: string, nameJa: string}>}
 */
function extractCharacters(wikitext) {
  const characters = [];
  const seen = new Set();

  // 匹配 {{角色 ... }} 块（支持换行）
  // 使用非贪婪匹配找到所有 {{角色 ... }} 块
  const templateRegex = /\{\{角色\s*\n([\s\S]*?)\}\}/g;

  let templateMatch;
  while ((templateMatch = templateRegex.exec(wikitext)) !== null) {
    const blockContent = templateMatch[1];

    // 提取第一行（包含 |图片|中文名|日文汉字|假名|罗马字|声优| 的行）
    const lines = blockContent.split('\n');
    const firstLine = lines.find((l) => l.includes('|'));
    if (!firstLine) continue;

    // 按 | 分割字段
    // 格式：|图片名|中文名|日文汉字|假名|罗马字|声优|
    // 去掉开头的 | 后分割
    const trimmed = firstLine.trim();
    const pipeStr = trimmed.startsWith('|') ? trimmed.substring(1) : trimmed;
    const fields = pipeStr.split('|');

    // 字段索引：0=图片, 1=中文名, 2=日文汉字, 3=假名, 4=罗马字, 5=声优
    if (fields.length < 3) continue;

    const nameZh = fields[1].trim();
    const nameJaKanji = fields[2].trim();

    // 跳过空名称
    if (!nameZh) continue;

    // 去重
    const key = `${nameZh}|${nameJaKanji}`;
    if (seen.has(key)) continue;
    seen.add(key);

    characters.push({
      nameZh,
      nameJa: nameJaKanji,
    });
  }

  return characters;
}

/**
 * 主函数：抓取所有 section 并提取角色
 */
async function main() {
  const sections = [];
  const totalSections = 45; // section 1 到 45

  console.log(`开始抓取 Conanpedia 角色页面（共 ${totalSections} 个 section）...\n`);

  for (let i = 1; i <= totalSections; i++) {
    console.log(`正在抓取 section ${i}/${totalSections}...`);
    try {
      const sectionData = await fetchSection(i);

      if (!sectionData.wikitext) {
        console.log(`  - Section ${i}: 无内容`);
        continue;
      }

      // 提取 section 标题
      const sectionTitle = extractSectionTitle(sectionData.wikitext);

      // 提取角色
      const characters = extractCharacters(sectionData.wikitext);

      // 无论是否提取到角色，都记录 section 信息
      sections.push({
        sectionNumber: i,
        sectionTitle,
        characters,
      });

      if (characters.length > 0) {
        console.log(`  ✓ Section ${i} "${sectionTitle}": 提取到 ${characters.length} 个角色`);
      } else {
        console.log(`  - Section ${i} "${sectionTitle}": 未提取到角色`);
      }
    } catch (err) {
      console.error(`  ✗ Section ${i} 抓取失败: ${err.message}`);
    }

    // 请求间隔 200ms，避免触发限流
    if (i < totalSections) {
      await delay(200);
    }
  }

  // 统计
  const sectionsWithChars = sections.filter((s) => s.characters.length > 0);
  const totalCharacters = sections.reduce((sum, s) => sum + s.characters.length, 0);
  console.log(`\n抓取完成！共 ${sections.length} 个 section，其中 ${sectionsWithChars.length} 个包含角色，共 ${totalCharacters} 个角色。`);

  // 保存 JSON 文件
  const outputPath = path.join(__dirname, 'conan-characters-raw.json');
  const output = { sections };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n结果已保存到: ${outputPath}`);
}

main().catch((err) => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
