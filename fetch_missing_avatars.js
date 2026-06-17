/**
 * 获取柯南百科中26个缺图角色的头像URL
 * 访问各角色的独立页面，从HTML中提取头像图片URL
 */

const https = require('https');
const fs = require('fs');

// 26个缺图角色列表
const missingCharacters = [
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
  { id: 99, name: '中森青子' },
  { id: 100, name: '黑羽快斗' },
  { id: 114, name: '新出义辉' },
  { id: 116, name: '小仓老板' },
  { id: 117, name: '玉木老板' },
  { id: 118, name: '金子老板' },
  { id: 121, name: '黑羽快斗' },
  { id: 123, name: '寺井黄之助' },
  { id: 134, name: '阿笠博士家的宠物' },
  { id: 135, name: '暗夜男爵' }
];

/**
 * 发送HTTP GET请求获取页面内容
 * @param {string} url - 请求的URL
 * @returns {Promise<string>} - 页面HTML内容
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
      // 处理重定向
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

/**
 * 从HTML中提取头像图片URL
 * 优先匹配 aka.doubaocdn.com 的图片
 * @param {string} html - 页面HTML内容
 * @returns {string|null} - 图片URL或null
 */
function extractAvatarUrl(html) {
  // 方法1：直接查找 aka.doubaocdn.com 的图片URL
  const doubaocdnRegex = /https:\/\/aka\.doubaocdn\.com\/s\/[a-zA-Z0-9]+/g;
  const matches = html.match(doubaocdnRegex);

  if (matches && matches.length > 0) {
    // 返回第一个匹配到的URL（通常是最主要的头像）
    return matches[0];
  }

  // 方法2：查找 img 标签中的 src 属性（备用方案）
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const src = imgMatch[1];
    // 排除图标、logo等非头像图片
    if (src.includes('conanpedia') || src.includes('avatar') || src.includes('character')) {
      return src;
    }
  }

  return null;
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数：获取所有缺图角色的头像
 */
async function main() {
  console.log('开始获取26个缺图角色的头像URL...\n');
  const results = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingCharacters.length; i++) {
    const char = missingCharacters[i];
    const encodedName = encodeURIComponent(char.name);
    const url = `https://www.conanpedia.com/${encodedName}`;

    process.stdout.write(`[${i + 1}/${missingCharacters.length}] 获取 ${char.name} (id:${char.id})...`);

    try {
      const html = await fetchUrl(url);
      const avatarUrl = extractAvatarUrl(html);

      if (avatarUrl) {
        results[char.id] = avatarUrl;
        console.log(`✓ 成功: ${avatarUrl}`);
        successCount++;
      } else {
        results[char.id] = '';
        console.log(`✗ 未找到图片`);
        failCount++;
      }
    } catch (error) {
      results[char.id] = '';
      console.log(`✗ 错误: ${error.message}`);
      failCount++;
    }

    // 避免请求过快，添加延迟
    if (i < missingCharacters.length - 1) {
      await sleep(800);
    }
  }

  // 输出最终结果
  console.log('\n========== 获取完成 ==========');
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);
  console.log('\nJSON映射表:');
  console.log(JSON.stringify(results, null, 2));

  // 保存到文件
  fs.writeFileSync(
    'd:/Gcodeprojects/KeNan/missing_avatars_result.json',
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('\n结果已保存到 missing_avatars_result.json');
}

main().catch(console.error);
