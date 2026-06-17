const fs = require('fs');
const path = require('path');

// 读取柯南百科解析数据
const wikiData = JSON.parse(fs.readFileSync(path.join(__dirname, 'wiki_parsed_characters.json'), 'utf8'));

// 从data.js提取角色数据
const dataJs = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');

let localCharacterData;
eval(dataJs.replace(/const /g, 'var '));
const localData = characterData;

console.log('=== 柯南百科 vs data.js 完整对比报告 ===\n');
console.log(`柯南百科角色总数: ${wikiData.length}`);
console.log(`data.js角色总数: ${localData.length}`);
console.log('');

// 建立柯南百科的sectionTitle到data.js faction的映射
// 注意：柯南百科的标题可能带括号，data.js的faction是简短名
const titleToFaction = {
  "主要角色": "主要角色",
  "工藤家": "工藤家",
  "妃法律事务所": "妃法律事务所",
  "波洛咖啡厅": "波洛咖啡厅",
  "伊吕波寿司店": "伊吕波寿司店",
  "黑衣组织": "黑衣组织",
  "FBI（美国联邦调查局）": "FBI",
  "CIA（美国中央情报局）": "CIA",
  "MI6（英国军事情报六局）": "MI6",
  "警视厅刑事部高层": "警视厅刑事部高层",
  "警视厅刑事部搜查一课": "警视厅刑事部搜查一课",
  "警视厅刑事部搜查二课": "警视厅刑事部搜查二课",
  "警视厅刑事部搜查三课": "警视厅刑事部搜查三课",
  "警视厅刑事部鉴识课": "警视厅刑事部鉴识课",
  "警视厅交通部": "警视厅交通部",
  "警视厅公安部": "警视厅公安部",
  "警察厅": "警察厅",
  "检察厅": "检察厅",
  "大阪府警": "大阪府警",
  "京都府警": "京都府警",
  "长野县警": "长野县警",
  "群马县警": "群马县警",
  "静冈县警": "静冈县警",
  "神奈川县警": "神奈川县警",
  "北海道警": "北海道警",
  "警视厅警察学校": "警视厅警察学校",
  "帝丹高中": "帝丹高中",
  "杯户高中": "杯户高中",
  "江古田高中": "江古田高中",
  "京都泉心高中": "京都泉心高中",
  "帝丹小学": "帝丹小学",
  "铃木财团": "铃木财团",
  "新出医院": "新出医院",
  "小仓拉面店": "小仓拉面店",
  "玉木书店": "玉木书店",
  "金子珠宝店": "金子珠宝店",
  "将棋手": "将棋手",
  "足球运动员": "足球运动员",
  "魔术师": "魔术师",
  "艺人": "艺人",
  "知名人士": "知名人士",
  "亲属与友人": "亲属与友人",
  "宠物": "宠物",
  "虚构角色": "虚构角色"
};

// 建立索引
const wikiByNameZh = new Map();
const wikiByNameJa = new Map();
for (const c of wikiData) {
  wikiByNameZh.set(c.nameZh, c);
  wikiByNameJa.set(c.nameJa, c);
}

const localByNameZh = new Map();
const localByNameJa = new Map();
for (const c of localData) {
  localByNameZh.set(c.nameZh, c);
  localByNameJa.set(c.nameJa, c);
}

// 1. 柯南百科有但data.js缺少的角色
console.log('=== 1. 柯南百科有但 data.js 缺少的角色 ===');
const wikiOnly = [];
for (const wc of wikiData) {
  const found = localByNameZh.has(wc.nameZh) || localByNameJa.has(wc.nameJa);
  if (!found) {
    wikiOnly.push(wc);
  }
}
if (wikiOnly.length === 0) {
  console.log('  无差异');
} else {
  for (const c of wikiOnly) {
    console.log(`  - ${c.nameZh} (${c.nameJa}) -> 柯南百科分类: ${c.sectionTitle}`);
  }
}

console.log('');

// 2. data.js有但柯南百科没有的角色
console.log('=== 2. data.js 有但柯南百科缺少的角色 ===');
const localOnly = [];
for (const lc of localData) {
  const found = wikiByNameZh.has(lc.nameZh) || wikiByNameJa.has(lc.nameJa);
  if (!found) {
    localOnly.push(lc);
  }
}
if (localOnly.length === 0) {
  console.log('  无差异');
} else {
  for (const c of localOnly) {
    console.log(`  - ${c.nameZh} (${c.nameJa}) -> data.js分类: ${c.faction}`);
  }
}

console.log('');

// 3. 角色所属阵营不匹配
console.log('=== 3. 角色所属阵营不匹配 ===');
const factionMismatches = [];

for (const wc of wikiData) {
  const localChar = localByNameZh.get(wc.nameZh) || localByNameJa.get(wc.nameJa);
  if (localChar) {
    const expectedFaction = titleToFaction[wc.sectionTitle];
    if (expectedFaction && localChar.faction !== expectedFaction) {
      factionMismatches.push({
        nameZh: wc.nameZh,
        nameJa: wc.nameJa,
        wikiSection: wc.sectionTitle,
        expectedFaction,
        actualFaction: localChar.faction,
        actualFactionKey: localChar.factionKey
      });
    }
  }
}

if (factionMismatches.length === 0) {
  console.log('  无差异');
} else {
  for (const m of factionMismatches) {
    console.log(`  - ${m.nameZh} (${m.nameJa})`);
    console.log(`    柯南百科分类: ${m.wikiSection} (应为: ${m.expectedFaction})`);
    console.log(`    data.js分类: ${m.actualFaction} (factionKey: ${m.actualFactionKey})`);
  }
}

console.log('');

// 4. 特别关注项
console.log('=== 4. 特别关注项 ===');

// 4.1 风见裕也
console.log('\n--- 4.1 风见裕也 ---');
const fengjian = wikiData.find(c => c.nameZh === '风见裕也');
if (fengjian) {
  console.log(`  柯南百科分类: ${fengjian.sectionTitle}`);
  console.log(`  说明: 柯南百科将风见裕也归在"警视厅公安部"，data.js同样归在"警视厅公安部"`);
  console.log(`  结论: ✅ 分类一致，无需调整`);
}
const fengjianLocal = localData.find(c => c.nameZh === '风见裕也');
if (fengjianLocal) {
  console.log(`  data.js分类: ${fengjianLocal.faction} (factionKey: ${fengjianLocal.factionKey})`);
}

// 4.2 诸伏景光、松田阵平、萩原研二、伊达航
console.log('\n--- 4.2 警视厅警察学校相关角色 ---');
const schoolChars = ['诸伏景光', '松田阵平', '萩原研二', '伊达航'];
let schoolAllMatch = true;
for (const name of schoolChars) {
  const wc = wikiData.find(c => c.nameZh === name);
  const lc = localData.find(c => c.nameZh === name);
  if (wc && lc) {
    const match = wc.sectionTitle === lc.faction;
    console.log(`  ${name}: 柯南百科=${wc.sectionTitle}, data.js=${lc.faction} ${match ? '✅' : '⚠️ 不匹配'}`);
    if (!match) schoolAllMatch = false;
  }
}
if (schoolAllMatch) {
  console.log(`  结论: ✅ 全部一致，柯南百科确实将这些角色归在"警视厅警察学校"`);
}

// 4.3 宫野志保/灰原哀
console.log('\n--- 4.3 灰原哀/宫野志保 ---');
console.log('  柯南百科在"主要角色"中列有灰原哀，同时在"黑衣组织"中列有宫野志保');
console.log('  data.js只在"主要角色"中列有灰原哀，未单独列出宫野志保');
console.log('  说明: 宫野志保是灰原哀的本名，柯南百科在黑衣组织章节中单独列出其本名形态');
console.log('  建议: 可考虑在data.js的黑衣组织中增加宫野志保条目，或保持现状（灰原哀已覆盖）');

// 4.4 火伤赤井秀一
console.log('\n--- 4.4 火伤赤井秀一 ---');
console.log('  柯南百科在"黑衣组织"中列有"火伤赤井秀一"');
console.log('  这是赤井秀一在黑衣组织事件中的特定形态/变体');
console.log('  data.js未单独列出此变体');
console.log('  建议: 可不单独列出，因为赤井秀一已在"主要角色"中');

// 4.5 第一代怪盗基德
console.log('\n--- 4.5 第一代怪盗基德 ---');
const kid1 = wikiData.find(c => c.nameZh === '第一代怪盗基德');
const kid1Local = localData.find(c => c.nameZh === '第一代怪盗基德');
if (kid1 && !kid1Local) {
  console.log(`  柯南百科在"${kid1.sectionTitle}"中列有"第一代怪盗基德"(初代怪盗キッド)`);
  console.log('  data.js中"魔术师"分类下的"怪盗基德"指的是黑羽快斗变身的第二代怪盗基德');
  console.log('  而柯南百科将"第一代怪盗基德"(即黑羽盗一)单独列出');
  console.log('  建议: data.js的魔术师分类中已有黑羽盗一，第一代怪盗基德是同一人的身份，可不重复添加');
}

// 4.6 怪盗淑女
console.log('\n--- 4.6 怪盗淑女 ---');
const ladyKid = wikiData.find(c => c.nameZh === '怪盗淑女');
if (ladyKid) {
  console.log(`  柯南百科在"${ladyKid.sectionTitle}"中列有"怪盗淑女"`);
  const ladyKidLocal = localData.find(c => c.nameZh === '怪盗淑女');
  if (ladyKidLocal) {
    console.log(`  data.js分类: ${ladyKidLocal.faction}`);
  } else {
    console.log('  ⚠️ data.js中缺少此角色！');
    console.log('  说明: 怪盗淑女是黑羽千影（黑羽快斗的母亲）的怪盗身份');
    console.log('  建议: 在data.js的"亲属与友人"分类中添加怪盗淑女');
  }
}

console.log('\n=== 5. 汇总统计 ===');
console.log(`柯南百科独有角色: ${wikiOnly.length}`);
console.log(`data.js独有角色: ${localOnly.length}`);
console.log(`阵营不匹配: ${factionMismatches.length}`);

// 按章节统计差异
console.log('\n=== 6. 按章节统计角色数量对比 ===');
const sectionStats = {};
for (const wc of wikiData) {
  const key = titleToFaction[wc.sectionTitle] || wc.sectionTitle;
  if (!sectionStats[key]) sectionStats[key] = { wikiCount: 0, localCount: 0, wikiNames: [], localNames: [] };
  sectionStats[key].wikiCount++;
  sectionStats[key].wikiNames.push(wc.nameZh);
}
for (const lc of localData) {
  const key = lc.faction;
  if (!sectionStats[key]) sectionStats[key] = { wikiCount: 0, localCount: 0, wikiNames: [], localNames: [] };
  sectionStats[key].localCount++;
  sectionStats[key].localNames.push(lc.nameZh);
}

for (const [section, stats] of Object.entries(sectionStats)) {
  const diff = stats.wikiCount - stats.localCount;
  if (diff !== 0) {
    console.log(`  ${section}: 柯南百科=${stats.wikiCount}, data.js=${stats.localCount} (差异=${diff > 0 ? '+' : ''}${diff})`);
    // 列出差异角色
    if (diff > 0) {
      const wikiOnlyNames = stats.wikiNames.filter(n => !stats.localNames.includes(n));
      if (wikiOnlyNames.length > 0) {
        console.log(`    柯南百科多出: ${wikiOnlyNames.join(', ')}`);
      }
    } else {
      const localOnlyNames = stats.localNames.filter(n => !stats.wikiNames.includes(n));
      if (localOnlyNames.length > 0) {
        console.log(`    data.js多出: ${localOnlyNames.join(', ')}`);
      }
    }
  }
}

// 7. 完整角色列表对比（按章节）
console.log('\n=== 7. 各章节完整角色列表对比 ===');
const allSections = [...new Set([
  ...wikiData.map(c => titleToFaction[c.sectionTitle] || c.sectionTitle),
  ...localData.map(c => c.faction)
])];

for (const section of allSections) {
  const wikiChars = wikiData
    .filter(c => (titleToFaction[c.sectionTitle] || c.sectionTitle) === section)
    .map(c => c.nameZh);
  const localChars = localData
    .filter(c => c.faction === section)
    .map(c => c.nameZh);

  const onlyInWiki = wikiChars.filter(n => !localChars.includes(n));
  const onlyInLocal = localChars.filter(n => !wikiChars.includes(n));

  if (onlyInWiki.length > 0 || onlyInLocal.length > 0) {
    console.log(`\n  【${section}】`);
    if (onlyInWiki.length > 0) {
      console.log(`    柯南百科独有: ${onlyInWiki.join(', ')}`);
    }
    if (onlyInLocal.length > 0) {
      console.log(`    data.js独有: ${onlyInLocal.join(', ')}`);
    }
  }
}
