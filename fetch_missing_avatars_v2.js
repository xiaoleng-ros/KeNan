/**
 * 从柯南百科主角色页面提取26个缺图角色的头像
 * 通过API获取完整wikitext，解析角色模板中的图片文件名
 */

const https = require('https');
const fs = require('fs');

// 26个缺图角色的中文名字（与data.js中的nameZh对应）
const targetCharacters = [
  { id: 41, name: '茱蒂·斯泰琳' },
  { id: 46, name: '白马警视总监' },
  { id: 49, name: '目暮十三' },
  { id: 50, name: '高木涉' },
  { id: 52, name: '千叶和伸' },
  { id: 58, name: '中森青子' },
  { id: 61, name: '交通警察' },
  { id: 68, name: '班长' },
  { id: 69, name: '九条美沙子' },
  { id: 70, name: '近藤检察官' },
  { id: 77, name: '大和敢助' },
  { id: 80, name: '鹿野充' },
  { id: 82, name: '静冈县警刑警' },
  { id: 84, name: '横沟参悟' },
  { id: 85, name: '北海道警刑警' },
  { id: 97, name: '杯户高中学生' },
  { id: 99, name: '中森青子' },   // 注意：与id:58同名
  { id: 100, name: '黑羽快斗' },
  { id: 114, name: '新出义辉' },
  { id: 116, name: '小仓老板' },
  { id: 117, name: '玉木老板' },
  { id: 118, name: '金子老板' },
  { id: 121, name: '黑羽快斗' },  // 注意：与id:100同名
  { id: 123, name: '寺井黄之助' },
  { id: 134, name: '阿笠博士家的宠物' },
  { id: 135, name: '暗夜男爵' }
];

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
 * 使用柯南百科的图片URL格式
 */
async function getImageUrl(fileName) {
  if (!fileName) return null;

  // 移除文件扩展名
  const baseName = fileName.replace(/\.(png|jpg|jpeg|gif|svg)$/i, '');

  try {
    // 尝试通过API获取图片信息
    const encodedFileName = encodeURIComponent(`File:${fileName}`);
    const apiUrl = `https://www.conanpedia.com/api.php?action=query&titles=${encodedFileName}&prop=imageinfo&iiprop=url&format=json`;

    const response = await fetchUrl(apiUrl);
    const json = JSON.parse(response);

    // 查找图片URL
    const pages = json.query?.pages;
    if (pages) {
      for (const pageId of Object.keys(pages)) {
        const page = pages[pageId];
        if (page.imageinfo && page.imageinfo.length > 0) {
          const imageUrl = page.imageinfo[0].url;
          // 检查是否是 aka.doubaocdn.com 格式
          if (imageUrl.includes('aka.doubaocdn.com')) {
            return imageUrl;
          }
          // 如果不是，返回原始URL
          return imageUrl;
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
  console.log('开始从主角色页面提取26个缺图角色的头像...\n');

  // 步骤1：获取主角色的完整wikitext
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
  const allCharacters = []; // 存储所有找到的角色

  let match;
  while ((match = characterRegex.exec(wikitext)) !== null) {
    const content = match[1];
    const parts = content.split('|').map(p => p.trim());

    if (parts.length >= 2) {
      allCharacters.push({
        image: parts[0],     // 图片文件名
        nameZh: parts[1]     // 中文名字
      });
    }
  }

  console.log(`✓ 找到 ${allCharacters.length} 个角色模板\n`);

  // 步骤3：匹配目标角色并获取图片
  console.log('步骤3: 匹配目标角色并获取图片URL...\n');
  const results = {};
  let matchCount = 0;

  for (const target of targetCharacters) {
    process.stdout.write(`[${target.id}] ${target.name}...`);

    // 在所有角色中查找匹配的名字
    const found = allCharacters.filter(char => char.nameZh === target.name);

    if (found.length > 0) {
      // 找到了匹配的角色，使用第一个的图片
      const imageFile = found[0].image;
      console.log(`\n    找到图片文件: ${imageFile}`);

      // 获取图片URL
      await sleep(300); // 避免请求过快
      const imageUrl = await getImageUrl(imageFile);

      if (imageUrl) {
        results[target.id] = imageUrl;
        console.log(`    ✓ 图片URL: ${imageUrl}`);
        matchCount++;
      } else {
        results[target.id] = '';
        console.log('    ✗ 无法获取图片URL');
      }
    } else {
      results[target.id] = '';
      console.log(' ✗ 未找到该角色');
    }

    console.log('');
  }

  // 输出最终结果
  console.log('========== 获取完成 ==========');
  console.log(`成功匹配: ${matchCount}/${targetCharacters.length}\n`);
  console.log('JSON映射表:');
  console.log(JSON.stringify(results, null, 2));

  // 保存结果
  fs.writeFileSync(
    'd:/Gcodeprojects/KeNan/missing_avatars_result.json',
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('\n结果已保存到 missing_avatars_result.json');
}

main().catch(console.error);
