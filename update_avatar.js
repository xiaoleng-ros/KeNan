const fs = require('fs');
const path = 'd:/Gcodeprojects/KeNan/js/data.js';
let content = fs.readFileSync(path, 'utf8');

const mapping = {
  '15': 'https://aka.doubaocdn.com/s/YmMJ1wbc4x',
  '30': 'https://aka.doubaocdn.com/s/TE9o1wbc6K',
  '31': 'https://aka.doubaocdn.com/s/kdKB1wbc6K',
  '32': 'https://aka.doubaocdn.com/s/CMFA1wbc6K',
  '33': 'https://aka.doubaocdn.com/s/CWsI1wbc6K',
  '34': 'https://aka.doubaocdn.com/s/y21z1wbc6K',
  '35': 'https://aka.doubaocdn.com/s/pwLH1wbc6K',
  '36': 'https://aka.doubaocdn.com/s/ICkV1wbc6L',
  '37': 'https://aka.doubaocdn.com/s/4Rv51wbc6L',
  '38': 'https://aka.doubaocdn.com/s/clI51wbc6L',
  '39': 'https://aka.doubaocdn.com/s/PUFS1wbc6L',
  '40': 'https://aka.doubaocdn.com/s/dwSM1wbc6V',
  '42': 'https://aka.doubaocdn.com/s/1UgS1wbc6V',
  '43': 'https://aka.doubaocdn.com/s/nFEL1wbc6V',
  '44': 'https://aka.doubaocdn.com/s/bnMI1wbc6W',
  '45': 'https://aka.doubaocdn.com/s/YUVR1wbc6W',
  '47': 'https://aka.doubaocdn.com/s/dUHO1wbc6e',
  '48': 'https://aka.doubaocdn.com/s/8Wl21wbc6e',
  '51': 'https://aka.doubaocdn.com/s/fv0m1wbc78',
  '53': 'https://aka.doubaocdn.com/s/uqUX1wbc78',
  '54': 'https://aka.doubaocdn.com/s/1Vz81wbc79',
  '55': 'https://aka.doubaocdn.com/s/HfLm1wbc79',
  '56': 'https://aka.doubaocdn.com/s/0VkS1wbc7D',
  '57': 'https://aka.doubaocdn.com/s/LYgk1wbc7m',
  '59': 'https://aka.doubaocdn.com/s/W3lY1wbc7n',
  '60': 'https://aka.doubaocdn.com/s/TBrU1wbc7n',
  '62': 'https://aka.doubaocdn.com/s/Bqiy1wbc7n',
  '63': 'https://aka.doubaocdn.com/s/x1kt1wbc7n',
  '64': 'https://aka.doubaocdn.com/s/5r8H1wbc7n',
  '65': 'https://aka.doubaocdn.com/s/1v2N1wbc7o',
  '66': 'https://aka.doubaocdn.com/s/zCPV1wbc7o',
  '67': 'https://aka.doubaocdn.com/s/21IW1wbc7o',
  '71': 'https://aka.doubaocdn.com/s/ybZL1wbc8O',
  '72': 'https://aka.doubaocdn.com/s/Pawz1wbc8O',
  '73': 'https://aka.doubaocdn.com/s/C4I01wbc8P',
  '74': 'https://aka.doubaocdn.com/s/kMVD1wbc8U',
  '75': 'https://aka.doubaocdn.com/s/Pawz1wbc8O',
  '76': 'https://aka.doubaocdn.com/s/0VkS1wbc7D',
  '78': 'https://aka.doubaocdn.com/s/F2tb1wbc8P',
  '79': 'https://aka.doubaocdn.com/s/TBrU1wbc7n',
  '81': 'https://aka.doubaocdn.com/s/W3lY1wbc7n',
  '83': 'https://aka.doubaocdn.com/s/DqZ01wbc92',
  '86': 'https://aka.doubaocdn.com/s/5r8H1wbc7n',
  '87': 'https://aka.doubaocdn.com/s/zCPV1wbc7o',
  '88': 'https://aka.doubaocdn.com/s/21IW1wbc7o',
  '89': 'https://aka.doubaocdn.com/s/x1kt1wbc7n',
  '90': 'https://aka.doubaocdn.com/s/1v2N1wbc7o',
  '91': 'https://aka.doubaocdn.com/s/kHrj1wbcBC',
  '92': 'https://aka.doubaocdn.com/s/i8hU1wbZcA',
  '93': 'https://aka.doubaocdn.com/s/vspX1wbZcA',
  '94': 'https://aka.doubaocdn.com/s/V06S1wbc92',
  '95': 'https://aka.doubaocdn.com/s/bnMI1wbc6W',
  '96': 'https://aka.doubaocdn.com/s/fGKG1wbcBn',
  '98': 'https://aka.doubaocdn.com/s/xHhb1wbcAi',
  '101': 'https://aka.doubaocdn.com/s/wQbS1wbZcA',
  '102': 'https://aka.doubaocdn.com/s/tsCf1wbZcA',
  '103': 'https://aka.doubaocdn.com/s/L4Xb1wbZcA',
  '104': 'https://aka.doubaocdn.com/s/ECH31wbZcA',
  '105': 'https://aka.doubaocdn.com/s/4jZV1wbZcA',
  '106': 'https://aka.doubaocdn.com/s/5aDK1wbZcA',
  '107': 'https://aka.doubaocdn.com/s/cE0f1wbZcA',
  '108': 'https://aka.doubaocdn.com/s/7Ydx1wbc93',
  '109': 'https://aka.doubaocdn.com/s/lZKl1wbc93',
  '110': 'https://aka.doubaocdn.com/s/uOr81wbc93',
  '111': 'https://aka.doubaocdn.com/s/UULB1wbc93',
  '112': 'https://aka.doubaocdn.com/s/gx1q1wbc93',
  '113': 'https://aka.doubaocdn.com/s/cJn11wbc9f',
  '115': 'https://aka.doubaocdn.com/s/fGKG1wbcBn',
  '119': 'https://aka.doubaocdn.com/s/GjUA1wbc9f',
  '120': 'https://aka.doubaocdn.com/s/3cbS1wbc9g',
  '122': 'https://aka.doubaocdn.com/s/eaiw1wbc9g',
  '124': 'https://aka.doubaocdn.com/s/j2hj1wbc9g',
  '125': 'https://aka.doubaocdn.com/s/foki1wbZcA',
  '126': 'https://aka.doubaocdn.com/s/NySU1wbc9h',
  '127': 'https://aka.doubaocdn.com/s/nKhn1wbZcA',
  '128': 'https://aka.doubaocdn.com/s/uLoP1wbc9h',
  '129': 'https://aka.doubaocdn.com/s/1EdM1wbc9h',
  '130': 'https://aka.doubaocdn.com/s/fb0l1wbc9h',
  '131': 'https://aka.doubaocdn.com/s/mUeB1wbcBs',
  '132': 'https://aka.doubaocdn.com/s/gsQ01wbcBo',
  '133': 'https://aka.doubaocdn.com/s/TxLJ1wbcBo',
  '136': 'https://aka.doubaocdn.com/s/7FEp1wbcBo'
};

let count = 0;
for (const [id, url] of Object.entries(mapping)) {
  // 匹配 id: XX, 后面跟着的 avatar: "",
  const regex = new RegExp('(id: ' + id + ',[\\s\\S]*?avatar:) ""', 'g');
  const newContent = content.replace(regex, '$1 "' + url + '"');
  if (newContent !== content) {
    content = newContent;
    count++;
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('成功替换 ' + count + ' 个角色的 avatar 字段');
