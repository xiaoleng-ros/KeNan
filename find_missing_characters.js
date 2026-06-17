/**
 * 查找未匹配到的14个角色的可能名称
 * 输出所有160个角色的完整列表，方便手动查找
 */

const https = require('https');
const fs = require('fs');

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

async function main() {
  console.log('获取主角色页面的完整角色列表...\n');

  const mainPageUrl = 'https://www.conanpedia.com/api.php?action=parse&page=名侦探柯南角色&prop=wikitext&format=json';

  try {
    const response = await fetchUrl(mainPageUrl);
    const json = JSON.parse(response);

    if (!json.parse || !json.parse.wikitext || !json.parse.wikitext['*']) {
      throw new Error('无法获取wikitext');
    }

    const wikitext = json.parse.wikitext['*'];

    // 解析所有角色模板
    const characterRegex = /\{\{角色\s*\|([\s\S]*?)\}\}/g;
    const allCharacters = [];

    let match;
    while ((match = characterRegex.exec(wikitext)) !== null) {
      const content = match[1];
      const parts = content.split('|').map(p => p.trim());

      if (parts.length >= 2) {
        allCharacters.push({
          image: parts[0],
          nameZh: parts[1],
          nameJa: parts[2] || ''
        });
      }
    }

    // 未匹配到的角色
    const missingIds = [46, 61, 68, 69, 70, 80, 82, 85, 97, 114, 116, 117, 118, 134];
    const missingNames = [
      '白马警视总监', '交通警察', '班长', '九条美沙子', '近藤检察官',
      '鹿野充', '静冈县警刑警', '北海道警刑警', '杯户高中学生',
      '新出义辉', '小仓老板', '玉木老板', '金子老板', '阿笠博士家的宠物'
    ];

    console.log('========== 未匹配到的角色搜索 ==========\n');

    for (let i = 0; i < missingNames.length; i++) {
      const targetName = missingNames[i];
      const targetId = missingIds[i];

      console.log(`[${targetId}] 目标: ${targetName}`);

      // 精确匹配
      const exactMatch = allCharacters.filter(c => c.nameZh === targetName);
      if (exactMatch.length > 0) {
        console.log(`  ✓ 精确匹配到 ${exactMatch.length} 个:`);
        exactMatch.forEach(c => console.log(`     - ${c.image} | ${c.nameZh}`));
      } else {
        console.log('  ✗ 无精确匹配');

        // 模糊匹配（包含目标名字的角色）
        const fuzzyMatches = allCharacters.filter(c =>
          c.nameZh.includes(targetName) || targetName.includes(c.nameZh)
        );
        if (fuzzyMatches.length > 0) {
          console.log(`  ? 可能的模糊匹配 (${fuzzyMatches.length} 个):`);
          fuzzyMatches.forEach(c => console.log(`     - ${c.image} | ${c.nameZh}`));
        }
      }

      // 显示包含相关关键词的所有角色
      const keywords = targetName.replace(/（.*?）/g, '').split(/[,，、]/);
      console.log('  相关关键词搜索:');
      keywords.slice(0, 2).forEach(keyword => {
        if (keyword.length >= 2) {
          const related = allCharacters.filter(c =>
            c.nameZh.includes(keyword) && c.nameZh !== targetName
          );
          if (related.length > 0 && related.length <= 5) {
            console.log(`     "${keyword}" -> ${related.map(c => c.nameZh).join(', ')}`);
          } else if (related.length > 5) {
            console.log(`     "${keyword}" -> 找到${related.length}个结果(太多)`);
          }
        }
      });

      console.log('');
    }

    // 保存完整列表供参考
    fs.writeFileSync(
      'd:/Gcodeprojects/KeNan/all_characters_list.json',
      JSON.stringify(allCharacters, null, 2),
      'utf8'
    );
    console.log('\n完整角色列表已保存到 all_characters_list.json');

  } catch (error) {
    console.error(`错误: ${error.message}`);
  }
}

main().catch(console.error);
