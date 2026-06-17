/**
 * Conanpedia 图片下载脚本
 * 功能：从 data.js 提取所有 conanpedia.com 的头像 URL 并下载到本地 images/ 目录
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ==================== 配置项 ====================
const DATA_JS_PATH = path.join(__dirname, 'js', 'data.js');  // data.js 文件路径
const IMAGES_DIR = path.join(__dirname, 'images');            // 图片保存目录
const CONANPEDIA_DOMAIN = 'www.conanpedia.com';              // 目标域名

// ==================== 主函数 ====================
async function main() {
  console.log('=== Conanpedia 图片下载工具 ===\n');

  // Step 1: 确保 images 目录存在
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`✓ 创建目录: ${IMAGES_DIR}`);
  }

  // Step 2: 读取并解析 data.js，提取 conanpedia.com 的 URL
  console.log('正在读取 data.js...');
  const dataContent = fs.readFileSync(DATA_JS_PATH, 'utf-8');

  // 使用正则提取所有 avatar 中包含 conanpedia.com 的 URL
  const urlPattern = /avatar:\s*"(https:\/\/www\.conanpedia\.com\/[^"]+)"/g;
  const urls = [];
  let match;

  while ((match = urlPattern.exec(dataContent)) !== null) {
    urls.push(match[1]);
  }

  console.log(`✓ 找到 ${urls.length} 个 conanpedia.com 图片 URL\n`);

  if (urls.length === 0) {
    console.log('没有找到需要下载的图片');
    return;
  }

  // Step 3: 去重（同一个 URL 可能出现多次）
  const uniqueUrls = [...new Set(urls)];
  console.log(`去重后共 ${uniqueUrls.length} 个唯一 URL\n`);

  // Step 4: 下载每个图片
  const results = {
    success: [],
    fail: []
  };

  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    const fileName = getFileNameFromUrl(url);
    const filePath = path.join(IMAGES_DIR, fileName);

    console.log(`[${i + 1}/${uniqueUrls.length}] 下载: ${fileName}`);

    try {
      await downloadImage(url, filePath);
      results.success.push({ url, fileName });
      console.log(`  ✓ 成功`);
    } catch (error) {
      results.fail.push({ url, fileName, error: error.message });
      console.log(`  ✗ 失败: ${error.message}`);
    }

    // 添加小延迟，避免请求过快
    await sleep(100);
  }

  // Step 5: 输出统计结果
  console.log('\n=== 下载统计 ===');
  console.log(`成功: ${results.success.length} 个`);
  console.log(`失败: ${results.fail.length} 个`);

  if (results.fail.length > 0) {
    console.log('\n失败列表:');
    results.fail.forEach(item => {
      console.log(`  - ${item.fileName}: ${item.error}`);
    });
  }

  // Step 6: 生成 URL 到本地路径的映射（用于后续更新 data.js）
  const mapping = {};
  results.success.forEach(item => {
    mapping[item.url] = `images/${item.fileName}`;
  });

  // 保存映射到 JSON 文件，方便后续使用
  const mappingPath = path.join(__dirname, 'url_mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`\n✓ URL 映射已保存到: url_mapping.json`);
}

/**
 * 从 URL 中提取文件名（URL解码后）
 * @param {string} url - 完整的图片 URL
 * @returns {string} 解码后的文件名
 */
function getFileNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // 获取路径的最后一部分作为文件名
    const encodedFileName = pathname.split('/').pop();
    // URL 解码（处理中文等特殊字符）
    const decodedFileName = decodeURIComponent(encodedFileName);
    return decodedFileName;
  } catch (error) {
    // 如果解析失败，使用时间戳作为文件名
    return `image_${Date.now()}.png`;
  }
}

/**
 * 下载图片并保存到本地
 * @param {string} url - 图片 URL
 * @param {string} filePath - 本地保存路径
 * @returns {Promise<void>}
 */
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.conanpedia.com/',
        'Accept-Encoding': 'identity',  // 不使用压缩，方便处理
        'Connection': 'keep-alive'
      }
    };

    const request = protocol.get(url, options, (response) => {
      // 处理重定向（301、302 等）
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
        return;
      }

      // 检查响应状态码
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP 状态码: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(filePath, buffer);
        resolve();
      });
      response.on('error', (error) => reject(error));
    });

    request.on('error', (error) => reject(error));
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('请求超时（30秒）'));
    });
  });
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 执行主函数 ====================
main().catch(console.error);
