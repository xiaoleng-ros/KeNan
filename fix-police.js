const fs = require('fs');
let content = fs.readFileSync('js/data.js', 'utf8');

const mapping = {
  40: ['police_tokyo', '警视厅'],
  41: ['police_tokyo', '警视厅'],
  42: ['police_tokyo', '警视厅'],
  43: ['police_tokyo', '警视厅'],
  44: ['police_tokyo', '警视厅'],
  45: ['police_tokyo', '警视厅'],
  46: ['police_tokyo', '警视厅'],
  47: ['police_shizuoka', '静冈县警'],
  48: ['police_shizuoka', '静冈县警'],
  49: ['police_gunma', '群马县警'],
  50: ['police_tokyo', '警视厅'],
  51: ['police_tokyo', '警视厅'],
  52: ['police_tokyo', '警视厅'],
  53: ['police_tokyo', '警视厅'],
  54: ['police_tokyo', '警视厅'],
  55: ['police_tokyo', '警视厅'],
  56: ['police_tokyo', '警视厅'],
  57: ['police_tokyo', '警视厅'],
  58: ['police_tokyo', '警视厅'],
  59: ['police_osaka', '大阪府警'],
  60: ['police_osaka', '大阪府警'],
  61: ['police_osaka', '大阪府警'],
  62: ['police_nagano', '长野县警'],
  63: ['police_nagano', '长野县警'],
  64: ['police_nagano', '长野县警'],
  65: ['police_kyoto', '京都府警'],
  66: ['police_tokyo', '警视厅'],
};

Object.entries(mapping).forEach(([id, [fKey, fLabel]]) => {
  // Replace faction and factionKey for each id
  const regex = new RegExp(
    '(id: ' + id + ',[\\s\\S]*?faction: ")各地警察(",\\s*factionKey: ")police(")'
  );
  content = content.replace(regex, '$1' + fLabel + '$2' + fKey + '$3');
});

fs.writeFileSync('js/data.js', content);
console.log('Done');
