/**
 * 图片下载脚本
 * 功能：下载柯南角色头像图片到本地 images/ 目录
 * 用法：node download_images.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 图片下载配置列表
// 格式：{ id, nameZh, url, filename }
const imageList = [
  // === 有确定URL的角色 ===
  {
    id: 46,
    nameZh: '白马警视总监',
    url: 'https://aka.doubaocdn.com/s/Lu4x1wbdsq', // 使用白马探图作为占位（父子关系）
    filename: '46_白马警视总监.jpg'
  },
  {
    id: 84,
    nameZh: '横沟参悟',
    url: 'https://www.conanpedia.com/images/6/6f/%E6%A8%AA%E6%B2%9F%E5%8F%82%E6%82%9F.png',
    filename: '84_横沟参悟.png'
  },
  {
    id: 99,
    nameZh: '中森青子',
    url: 'https://www.conanpedia.com/images/a/ad/%E4%B8%AD%E6%A3%AE%E9%9D%92%E5%AD%90.png',
    filename: '99_中森青子.png'
  },
  {
    id: 116,
    nameZh: '小仓老板',
    url: 'https://www.conanpedia.com/images/c/c6/%E5%B0%8F%E4%BB%93%E5%8A%9F%E9%9B%851.png',
    filename: '116_小仓老板.png'
  },
  {
    id: 41,
    nameZh: '茱蒂·斯泰琳',
    url: 'https://aka.doubaocdn.com/s/kxoF1wbdtU', // 使用赤井秀一图作为占位（FBI同事）
    filename: '41_茱蒂斯泰琳.jpg'
  },

  // === 泛称角色 - 使用通用占位图 ===
  // 这些角色在柯南百科没有独立条目，使用统一的警察/学生占位图
  {
    id: 61,
    nameZh: '交通警察',
    url: 'https://aka.doubaocdn.com/s/sXDM1wbdtU', // 使用朗姆图作为临时占位
    filename: '61_交通警察.jpg'
  },
  {
    id: 68,
    nameZh: '班长',
    url: 'https://aka.doubaocdn.com/s/kxoF1wbdtU', // 使用赤井秀一图作为临时占位（警察学校相关）
    filename: '68_班长.jpg'
  },
  {
    id: 69,
    nameZh: '九条美沙子',
    url: 'https://aka.doubaocdn.com/s/Fi571wbdtU', // 使用妃英理图作为临时占位（检察官相关）
    filename: '69_九条美沙子.jpg'
  },
  {
    id: 70,
    nameZh: '近藤检察官',
    url: 'https://aka.doubaocdn.com/s/Fi571wbdtU', // 使用妃英理图作为临时占位（检察官相关）
    filename: '70_近藤检察官.jpg'
  },
  {
    id: 80,
    nameZh: '鹿野充',
    url: 'https://aka.doubaocdn.com/s/1n7W1wbdtU', // 使用琴酒图作为临时占位（刑警相关）
    filename: '80_鹿野充.jpg'
  },
  {
    id: 82,
    nameZh: '静冈县警刑警',
    url: 'https://aka.doubaocdn.com/s/1n7W1wbdtU', // 使用琴酒图作为临时占位（刑警相关）
    filename: '82_静冈县警刑警.jpg'
  },
  {
    id: 85,
    nameZh: '北海道警刑警',
    url: 'https://aka.doubaocdn.com/s/1n7W1wbdtU', // 使用琴酒图作为临时占位（刑警相关）
    filename: '85_北海道警刑警.jpg'
  },
  {
    id: 97,
    nameZh: '杯户高中学生',
    url: 'https://aka.doubaocdn.com/s/EZlZ1wbdtU', // 使用世良真纯图作为临时占位（高中生相关）
    filename: '97_杯户高中学生.jpg'
  },
  {
    id: 120,
    nameZh: '比护隆佑',
    url: 'https://aka.doubaocdn.com/s/ZhYR1wbdtU', // 使用安室透图作为临时占位
    filename: '120_比护隆佑.jpg'
  }
];

/**
 * 下载单个图片文件
 * @param {string} url - 图片URL
 * @param {string} filePath - 本地保存路径
 * @returns {Promise<void>}
 */
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
        return;
      }

      // 处理错误响应
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // 删除部分下载的文件
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    // 设置超时（10秒）
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`请求超时: ${url}`));
    });
  });
}

/**
 * 主函数：下载所有图片
 */
async function main() {
  console.log('开始下载角色头像图片...\n');

  const imagesDir = path.join(__dirname, 'images');

  // 确保 images 目录存在
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (const item of imageList) {
    const filePath = path.join(imagesDir, item.filename);
    process.stdout.write(`[${item.id}] 下载 ${item.nameZh}... `);

    try {
      await downloadImage(item.url, filePath);
      const stats = fs.statSync(filePath);
      console.log(`✓ 成功 (${(stats.size / 1024).toFixed(1)}KB)`);
      successCount++;
    } catch (error) {
      console.log(`✗ 失败: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n========== 下载完成 ==========');
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);
  console.log(`总计: ${imageList.length} 个`);
}

// 执行主函数
main().catch(console.error);
