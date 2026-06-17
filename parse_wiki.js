const fs = require('fs');
const path = require('path');

// section编号到章节标题的映射
const sectionTitles = {
  2: "主要角色", 3: "工藤家", 4: "妃法律事务所", 5: "波洛咖啡厅",
  6: "伊吕波寿司店", 7: "黑衣组织", 8: "FBI（美国联邦调查局）",
  9: "CIA（美国中央情报局）", 10: "MI6（英国军事情报六局）",
  11: "警视厅刑事部高层", 12: "警视厅刑事部搜查一课",
  13: "警视厅刑事部搜查二课", 14: "警视厅刑事部搜查三课",
  15: "警视厅刑事部鉴识课", 16: "警视厅交通部",
  17: "警视厅公安部", 18: "警察厅", 19: "检察厅",
  20: "大阪府警", 21: "京都府警", 22: "长野县警",
  23: "群马县警", 24: "静冈县警", 25: "神奈川县警",
  26: "北海道警", 27: "警视厅警察学校", 28: "帝丹高中",
  29: "杯户高中", 30: "江古田高中", 31: "京都泉心高中",
  32: "帝丹小学", 33: "铃木财团", 34: "新出医院",
  35: "小仓拉面店", 36: "玉木书店", 37: "金子珠宝店",
  38: "将棋手", 39: "足球运动员", 40: "魔术师",
  41: "艺人", 42: "知名人士", 43: "亲属与友人",
  44: "宠物", 45: "虚构角色"
};

const allCharacters = [];

for (let i = 2; i <= 45; i++) {
  const filePath = path.join(__dirname, 'wiki_sections', `section_${i}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING: Section ${i}`);
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const wikitext = json.parse?.wikitext?.['*'] || '';

  if (!wikitext) {
    console.log(`EMPTY: Section ${i}`);
    continue;
  }

  const sectionTitle = sectionTitles[i];

  // 解析 {{角色|...}} 模板
  // 格式: {{角色|图片|中文名|日文汉字|日文假名|罗马音|声优|描述}}
  // 注意：模板可能跨行，需要处理换行
  const regex = /\{\{角色\s*\|([\s\S]*?)\}\}/g;
  let match;
  let count = 0;

  while ((match = regex.exec(wikitext)) !== null) {
    const content = match[1];
    const parts = content.split('|');

    if (parts.length >= 3) {
      let nameZh = parts[1].trim();
      let nameJa = parts[2].trim();

      // 清理wiki标记
      nameZh = nameZh.replace(/\[\[.*?\|/, '').replace(/\]\]/g, '').replace(/\[\[/g, '').replace(/\{\{.*?\}\}/g, '');
      nameJa = nameJa.replace(/\[\[.*?\|/, '').replace(/\]\]/g, '').replace(/\[\[/g, '').replace(/\{\{.*?\}\}/g, '');

      allCharacters.push({
        sectionIndex: i,
        sectionTitle,
        nameZh,
        nameJa
      });
      count++;
    }
  }

  console.log(`Section ${i} (${sectionTitle}): ${count} characters`);
}

// 保存结果
fs.writeFileSync(
  path.join(__dirname, 'wiki_parsed_characters.json'),
  JSON.stringify(allCharacters, null, 2),
  'utf8'
);

console.log(`\nTotal characters parsed: ${allCharacters.length}`);
console.log('Results saved to wiki_parsed_characters.json');
