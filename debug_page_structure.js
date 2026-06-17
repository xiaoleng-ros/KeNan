/**
 * 调试脚本：查看柯南百科页面结构
 * 用于了解如何正确提取角色头像
 */

const https = require('https');

/**
 * 发送HTTP GET请求获取页面内容
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }

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
  // 测试几个不同的角色页面
  const testNames = ['茱蒂·斯泰琳', '目暮十三', '黑羽快斗'];

  for (const name of testNames) {
    const encodedName = encodeURIComponent(name);
    const url = `https://www.conanpedia.com/${encodedName}`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试角色: ${name}`);
    console.log(`URL: ${url}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const html = await fetchUrl(url);

      // 查找所有图片标签
      const imgRegex = /<img[^>]+>/gi;
      const images = html.match(imgRegex) || [];

      console.log(`\n找到 ${images.length} 个图片标签:`);
      images.slice(0, 10).forEach((img, idx) => {
        // 提取src和alt属性
        const srcMatch = img.match(/src=["']([^"']+)["']/i);
        const altMatch = img.match(/alt=["']([^"']*)["']/i);
        const classMatch = img.match(/class=["']([^"']*)["']/i);

        console.log(`\n[${idx + 1}] src: ${srcMatch ? srcMatch[1] : 'N/A'}`);
        if (altMatch) console.log(`    alt: ${altMatch[1]}`);
        if (classMatch) console.log(`    class: ${classMatch[1]}`);
      });

      // 查找 infobox 或角色信息框
      if (html.includes('infobox') || html.includes('角色信息')) {
        console.log('\n✓ 找到信息框(infobox)');
      }

      // 查找 aka.doubaocdn.com 的链接
      const doubaocdnMatches = html.match(/https:\/\/aka\.doubaocdn\.com\/s\/[a-zA-Z0-9]+/g);
      if (doubaocdnMatches) {
        console.log(`\n找到 ${doubaocdnMatches.length} 个 doubaocdn 链接:`);
        doubaocdnMatches.forEach((link, idx) => {
          console.log(`  ${idx + 1}. ${link}`);
        });
      }

    } catch (error) {
      console.error(`错误: ${error.message}`);
    }
  }
}

main().catch(console.error);
