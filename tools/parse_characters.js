/**
 * 解析「名侦探柯南角色」页 wikitext -> site/data/characters.json
 * 结构：==分组== 下由 {{角色|图片|中文名|日文名|假名|罗马音|声优|简介}} 组成
 */
const fs = require('fs');
const path = require('path');
const { plain, getWikitext, cleanCell } = require('./parse_wikitext_lib.js');

/** 解析 {{角色 ... }} 模板的参数 */
function parseCharTemplate(body) {
  const args = [];
  let buf = '';
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') { depth++; buf += two; i++; continue; }
    if (two === '}}' || two === ']]') { depth--; buf += two; i++; continue; }
    if (body[i] === '|' && depth === 0) { args.push(buf.trim()); buf = ''; continue; }
    buf += body[i];
  }
  args.push(buf.trim());
  // args[0] 是模板名
  return args.slice(1).map(a => plain(cleanCell(a)));
}

(async () => {
  const wt = await getWikitext('名侦探柯南角色');
  const out = [];

  // 逐段扫描：记录当前分组标题，收集其下的角色模板
  const lines = wt.split('\n');
  let group = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const h3 = line.match(/^===\s*(.+?)\s*===\s*$/);
    const h2 = line.match(/^==\s*(.+?)\s*==\s*$/);
    if (h2) { group = h2[1].trim(); }
    else if (h3) { group = h3[1].trim(); }

    if (line.includes('{{角色')) {
      // 收集到该模板结束（括号配平）
      let body = '';
      let depth = 0;
      let started = false;
      let j = i;
      for (; j < lines.length; j++) {
        const l = lines[j];
        for (let k = 0; k < l.length; k++) {
          const two = l.slice(k, k + 2);
          if (two === '{{') { depth++; started = true; body += '{{'; k++; continue; }
          if (two === '}}') {
            depth--;
            body += '}}'; k++;
            if (depth === 0) { j = k >= l.length ? j : j; }
            continue;
          }
          body += l[k];
        }
        if (depth === 0 && started) break;
        body += '\n';
      }
      const inner = body.replace(/^\{\{角色/, '').replace(/\}\}$/, '');
      const a = parseCharTemplate(inner);
      if (a.length >= 7 && a[1]) {
        out.push({
          group,
          image: a[0] || '',
          nameZh: a[1],
          nameJa: a[2] || '',
          kana: a[3] || '',
          roman: a[4] || '',
          voice: a[5] || '',
          desc: a[6] || '',
        });
      }
      i = j + 1;
      continue;
    }
    i++;
  }

  // 分组标题会带上 wiki 的 = 标记，统一清掉
for (const c of out) c.group = c.group.replace(/^=+/, '').replace(/=+$/, '');

  const dest = path.join(__dirname, '..', 'site', 'data', 'characters.json');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out));
  console.log('角色数 =', out.length);
  console.log('分组数 =', new Set(out.map(c => c.group)).size);
  console.log(JSON.stringify(out.slice(0, 2), null, 1));
})();