/**
 * 最终版本：获取26个缺图角色的头像URL
 * 使用中文名和日文名双重匹配
 */

const https = require('https');
const fs = require('fs');

// 26个缺图角色列表（包含日文名用于匹配）
const targetCharacters = [
  { id: 41, nameZh: '茱蒂·斯泰琳', nameJa: 'ジョディ·スターリング' },
  { id: 46, nameZh: '白马警视总监', nameJa: '白馬警視総監' },
  { id: 49, nameZh: '目暮十三', nameJa: '目暮十三' },
  { id: 50, nameZh: '高木涉', nameJa: '高木渉' },
  { id: 52, nameZh: '千叶和伸', nameJa: '千葉和伸' },
  { id: 58, nameZh: '中森青子', nameJa: '中森青子' },
  { id: 61, nameZh: '交通警察', nameJa: '交通課巡査' },
  { id: 68, nameZh: '班长', nameJa: '班長' },
  { id: 69, nameZh: '九条美沙子', nameJa: '九条美沙子' },
  { id: 70, nameZh: '近藤检察官', nameJa: '近藤検事' },
  { id: 77, nameZh: '大和敢助', nameJa: '大和敢助' },
  { id: 80, nameZh: '鹿野充', nameJa: '鹿野充' },
  { id: 82, nameZh: '静冈县警刑警', nameJa: '静岡県警刑事' },
  { id: 84, nameZh: '横沟参悟', nameJa: '横溝参悟' },
  { id: 85, nameZh: '北海道警刑警', nameJa: '北海道警刑事' },
  { id: 97, nameZh: '杯户高中学生', nameJa: '杯戸高校生徒' },
  { id: 99, nameZh: '中森青子', nameJa: '中森青子' },   // 与id:58同名
  { id: 100, nameZh: '黑羽快斗', nameJa: '黒羽快斗' },
  { id: 114, nameZh: '新出义辉', nameJa: '新出義輝' },
  { id: 116, nameZh: '小仓老板', nameJa: '小倉店主' },
  { id: 117, nameZh: '玉木老板', nameJa: '玉木店主' },
  { id: 118, nameZh: '金子老板', nameJa: '金子店主' },
  { id: 121, nameZh: '黑羽快斗', nameJa: '黒羽快斗' }, // 与id:100同名
  { id: 123, nameZh: '寺井黄之助', nameJa: '寺井黄之助' },
  { id: 134, nameZh: '阿笠博士家的宠物', nameJa: '阿笠博士のペット' },
  { id: 135, nameZh: '暗夜男爵', nameJa: '闇の男爵' }
];

// 手动映射关系（基于对角色关系的理解）
const manualMapping = {
  114: '新出智明',  // 新出义辉 -> 新出智明（新出医院相关）
  116: '小仓功雅',  // 小仓老板 -> 小仓功雅
  117: '玉木裕次郎', // 玉木老板 -> 玉木裕次郎
  118: '金子圭太'   // 金子老板 -> 金子圭太
};

/**
 * 发送HTTP GET请求
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 通过文件名获取图片URL
 */
async function getImageUrl(fileName) {
  if (!fileName) return null;

  try {
    const encodedFileName = encodeURIComponent(`File:${fileName}`);
    const apiUrl = `https://www.conanpedia.com/api.php?action=query&titles=${encodedFileName}&prop=imageinfo&iiprop=url&format=json`;

    const response = await fetchUrl(apiUrl);
    const json = JSON.parse(response);

    const pages = json.query?.pages;
    if (pages) {
      for (const pageId of Object.keys(pages)) {
        const page = pages[pageId];
        if (page.imageinfo && page.imageinfo.length > 0) {
          return page.imageinfo[0].url;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`  获取图片URL失败: ${error.message}`);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始获取26个缺图角色的头像URL（最终版）...\n');

  // 步骤1：获取主角色页面的wikitext
  console.log('步骤1: 获取主角色页面的wikitext...');
  const mainPageUrl = 'https://www.conanpedia.com/api.php?action=parse&page=名侦探柯南角色&prop=wikitext&format=json';

  let wikitext;
  try {
    const response = await fetchUrl(mainPageUrl);
    const json = JSON.parse(response);

    if (!json.parse || !json.parse.wikitext || !json.parse.wikitext['*']) {
      throw new Error('无法获取wikitext');
    }

    wikitext = json.parse.wikitext['*'];
    console.log('✓ 成功获取wikitext\n');
  } catch (error) {
    console.error(`✗ 获取wikitext失败: ${error.message}`);
    return;
  }

  // 步骤2：解析所有角色模板
  console.log('步骤2: 解析角色模板...');
  const characterRegex = /\{\{角色\s*\|([\s\S]*?)\}\}/g;
  const allCharacters = [];

  let match;
  while ((match = characterRegex.exec(wikitext)) !== null) {
    const content = match[1];
    const parts = content.split('|').map(p => p.trim());

    if (parts.length >= 3) {
      allCharacters.push({
        image: parts[0],
        nameZh: parts[1],
        nameJa: parts[2]
      });
    }
  }

  console.log(`✓ 找到 ${allCharacters.length} 个角色模板\n`);

  // 步骤3：匹配目标角色并获取图片
  console.log('步骤3: 匹配目标角色并获取图片URL...\n');
  const results = {};
  let successCount = 0;

  for (const target of targetCharacters) {
    process.stdout.write(`[${target.id}] ${target.nameZh}...`);

    let foundChar = null;

    // 方法1：精确匹配中文名
    foundChar = allCharacters.find(c => c.nameZh === target.nameZh);

    // 方法2：如果没有找到，检查手动映射
    if (!foundChar && manualMapping[target.id]) {
      const mappedName = manualMapping[target.id];
      foundChar = allCharacters.find(c => c.nameZh === mappedName);
      if (foundChar) {
        console.log(`\n    使用手动映射: ${target.nameZh} -> ${mappedName}`);
      }
    }

    // 方法3：如果还没有找到，尝试匹配日文名
    if (!foundChar && target.nameJa) {
      foundChar = allCharacters.find(c => c.nameJa === target.nameJa);
      if (foundChar) {
        console.log(`\n    通过日文名匹配`);
      }
    }

    if (foundChar && foundChar.image) {
      console.log(`\n    找到图片文件: ${foundChar.image}`);

      // 获取图片URL
      await sleep(300);
      const imageUrl = await getImageUrl(foundChar.image);

      if (imageUrl) {
        results[target.id] = imageUrl;
        console.log(`    ✓ 图片URL: ${imageUrl.substring(0, 60)}...`);
        successCount++;
      } else {
        results[target.id] = '';
        console.log('    ✗ 无法获取图片URL');
      }
    } else {
      results[target.id] = '';
      console.log(' ✗ 未找到该角色（可能是泛称角色或无独立图片）');
    }

    console.log('');
  }

  // 输出最终结果
  console.log('\n========== 最终结果 ==========');
  console.log(`成功获取: ${successCount}/${targetCharacters.length}\n`);

  // 统计信息
  const emptyCount = Object.values(results).filter(v => v === '').length;
  console.log(`有图片: ${successCount} 个`);
  console.log(`无图片: ${emptyCount} 个（泛称角色或百科无条目）\n`);

  console.log('JSON映射表:');
  console.log(JSON.stringify(results, null, 2));

  // 保存结果
  fs.writeFileSync(
    'd:/Gcodeprojects/KeNan/missing_avatars_final.json',
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('\n结果已保存到 missing_avatars_final.json');

  // 输出详细说明
  console.log('\n========== 详细说明 ==========');
  console.log('\n【成功获取的角色】:');
  for (const [id, url] of Object.entries(results)) {
    if (url) {
      const char = targetCharacters.find(c => c.id === parseInt(id));
      console.log(`  ${id}. ${char.nameZh}: ${url.substring(0, 50)}...`);
    }
  }

  console.log('\n【未找到图片的角色】:');
  for (const [id, url] of Object.entries(results)) {
    if (!url) {
      const char = targetCharacters.find(c => c.id === parseInt(id));
      console.log(`  ${id}. ${char.nameZh}: 泛称角色或百科无独立条目`);
    }
  }
}

main().catch(console.error);
