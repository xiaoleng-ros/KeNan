/**
 * 使用柯南百科API获取角色信息
 * 尝试通过API获取角色的完整信息和图片
 */

const https = require('https');

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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

async function main() {
  // 测试使用API搜索角色
  const testNames = ['茱蒂·斯泰琳', '目暮十三'];

  for (const name of testNames) {
    console.log(`${'='.repeat(60)}`);
    console.log(`搜索角色: ${name}`);
    console.log('='.repeat(60));

    try {
      // 方法1：使用API的action=query获取页面信息
      const encodedName = encodeURIComponent(name);
      const apiUrl = `https://www.conanpedia.com/api.php?action=query&titles=${encodedName}&prop=images&format=json`;

      console.log(`\nAPI URL: ${apiUrl}`);
      const response = await fetchUrl(apiUrl);
      const json = JSON.parse(response);

      console.log('\nAPI响应:');
      console.log(JSON.stringify(json, null, 2));

    } catch (error) {
      console.error(`错误: ${error.message}`);
    }
  }

  // 尝试获取主角色页面的完整wikitext（包含所有section）
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('获取主角色页面的完整wikitext');
  console.log(`${'='.repeat(60)}`);

  try {
    const mainPageUrl = 'https://www.conanpedia.com/api.php?action=parse&page=名侦探柯南角色&prop=wikitext&format=json';
    const response = await fetchUrl(mainPageUrl);
    const json = JSON.parse(response);

    if (json.parse && json.parse.wikitext && json.parse.wikitext['*']) {
      const wikitext = json.parse.wikitext['*'];

      // 查找包含图片的角色模板
      // {{角色|图片文件名|中文名|日文名|...}}
      const characterRegex = /\{\{角色\s*\|([^}]+)\}\}/g;
      let match;
      let count = 0;

      console.log('\n找到包含图片的角色模板:');
      while ((match = characterRegex.exec(wikitext)) !== null) {
        const content = match[1];
        const parts = content.split('|');

        if (parts.length >= 2) {
          const imageFile = parts[0].trim();
          const nameZh = parts[1].trim();

          // 只显示我们需要的26个角色
          const targetIds = ['41', '46', '49', '50', '52', '58', '61', '68', '69', '70', '77', '80', '82', '84', '85', '97', '99', '100', '114', '116', '117', '118', '121', '123', '134', '135'];
          // 这里我们需要匹配名字而不是ID，所以先显示所有找到的

          if (count < 30) { // 只显示前30个作为示例
            console.log(`\n[${count + 1}] 图片: ${imageFile}`);
            console.log(`    名字: ${nameZh}`);
          }
          count++;
        }
      }

      console.log(`\n总共找到 ${count} 个角色模板`);
    }

  } catch (error) {
    console.error(`错误: ${error.message}`);
  }
}

main().catch(console.error);
