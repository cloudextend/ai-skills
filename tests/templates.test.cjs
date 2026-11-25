const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../plugins/extendinsights-netsuite/skills/xavi-report-builder');
const read = name => fs.readFileSync(path.join(root, 'references', name), 'utf8');
function block(file, marker) {
  const blocks = [...read(file).matchAll(/```javascript\n([\s\S]*?)```/g)].map(m => m[1]);
  const result = blocks.find(b => b.includes(marker));
  assert.ok(result, `Missing runnable example: ${file} ${marker}`);
  return result;
}
const index = s => [...s].reduce((n,c) => n*26+c.charCodeAt(0)-64,0);
const letter = n => {let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;};
function capture() {
  const cells = new Map();
  return { cells, sheet: {getRange(address) {
    const m = address.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
    assert.ok(m, address);
    return {set formulas(rows) {
      const width = index(m[3]||m[1])-index(m[1])+1;
      const height = +(m[4]||m[2])-+m[2]+1;
      assert.equal(rows.length,height,address);
      rows.forEach((row,y) => {assert.equal(row.length,width,address);row.forEach((f,x) =>
        cells.set(`${letter(index(m[1])+x)}${+m[2]+y}`,f));});
    }};
  }}};
}
function run(code, extra={}) {const c=capture();vm.runInNewContext(code,{sheet:c.sheet,includePriorYear:true,...extra});return c.cells;}
function evaluateDate(formula, inputs) {
  let text = formula.slice(1);
  for (const [cell,value] of Object.entries(inputs)) text=text.replaceAll(cell,String(value));
  return vm.runInNewContext(text,{DATE:(y,m,d)=>new Date(Date.UTC(y,m-1,d))});
}
const iso = d => d.toISOString().slice(0,10);

test('all fiscal starts generate twelve consecutive months, including leap years', () => {
  const cells=run(block('_conventions.md','const months'));
  for (const year of [2023,2024,2025]) for(let start=1;start<=12;start++) {
    for(let m=0;m<12;m++) for(const [row,y] of [[3,year],[4,year-2]]) {
      const actual=evaluateDate(cells.get(`${letter(4+m)}${row}`),{'$B$2':year,'$B$11':year-2,'$B$9':start});
      assert.equal(iso(actual),iso(new Date(Date.UTC(y,start-1+m,1))));
    }
  }
});
test('quarter boundaries partition the same fiscal year without gaps or overlaps', () => {
  const cells=run(block('_conventions.md','const quarterStarts'));
  for(let start=1;start<=12;start++) for(let q=0;q<4;q++) for(const [sr,er,y] of [[8,9,2025],[10,11,2022]]) {
    const inputs={'$B$2':2025,'$B$11':2022,'$B$9':start};
    assert.equal(iso(evaluateDate(cells.get(`${letter(4+q)}${sr}`),inputs)),iso(new Date(Date.UTC(y,start-1+3*q,1))));
    assert.equal(iso(evaluateDate(cells.get(`${letter(4+q)}${er}`),inputs)),iso(new Date(Date.UTC(y,start+1+3*q,1))));
  }
});
test('summary whole-fill covers every revenue and expense month with shared scope', () => {
  const helpers=run(block('_conventions.md','const months'));
  const cells=run(block('templates-income-statement.md','const liveRows'));
  for(const row of [31,32,35,38,41]) for(let m=0;m<12;m++) {
    const f=cells.get(`${letter(m+3)}${row}`);
    assert.ok(f, `Missing ${letter(m+3)}${row}`);
    assert.ok(f.includes('$B$3,$B$4,$B$5,$B$6,$B$8'));
    const h=`${letter(m+4)}3`;assert.ok(helpers.has(h));
    assert.ok(f.includes(`$${letter(m+4)}$3,$${letter(m+4)}$3`));
  }
  for(const addr of helpers.keys()) assert.ok(!cells.has(addr), `Helper overwritten: ${addr}`);
});
test('summary arithmetic includes other income once and subtracts other expense', () => {
  const cells=run(block('templates-income-statement.md','const liveRows'));
  const values={C31:100,C32:7,C35:30,C38:20,C41:5};
  for(const row of [33,36,39,42]) {
    const f=cells.get(`C${row}`).slice(1).replace(/[A-Z]+\d+/g,c=>{assert.ok(c in values);return String(values[c]);});
    values[`C${row}`]=vm.runInNewContext(f);
  }
  assert.equal(values.C36,70);assert.equal(values.C39,50);assert.equal(values.C42,52);
});
test('budget column maps contain no overlap and reserve all periods before FY', () => {
  for(const quarterly of [false,true]) {
    const code=block('templates-budget.md','const colLetter');
    const blocks=vm.runInNewContext(code+'\nblocks',{isQuarterly:quarterly});
    assert.equal(blocks.length,quarterly?5:13);
    const cols=blocks.flatMap(b=>Object.values(b));assert.equal(new Set(cols).size,cols.length);
    assert.equal(blocks.at(-1).actual,quarterly?'S':'AY');assert.equal(blocks.at(-1).percent,quarterly?'V':'BB');
    assert.equal(index(blocks.at(-1).actual),3+(quarterly?4:12)*4);
  }
});
test('budget calls select all months once with account, book and category slots intact', () => {
  const code=block('templates-budget.md','const budgetFormula');
  for(let q=0;q<4;q++) {
    const formula=vm.runInNewContext(code+`\nbudgetFormula(37,[${3*q},${3*q+1},${3*q+2}])`);
    const calls=[...formula.matchAll(/XAVI\.BUDGET\(([^)]+)\)/g)];assert.equal(calls.length,3);
    calls.forEach((m,i)=>{const a=m[1].split(',');assert.equal(a.length,9);assert.equal(a[0],'$A37');
      assert.equal(a[1],`$${letter(4+3*q+i)}$3`);assert.equal(a[1],a[2]);
      assert.equal(a.slice(3).join(','),'$B$3,$B$4,$B$5,$B$6,$B$8,$B$7');});
  }
});
test('as-of fiscal start never lies after as-of or more than eleven months before it', () => {
  const formula=read('_conventions.md').match(/\| E14 \|[^\n]+`(=[^`]+)`/)[1];
  for(const year of [2024,2025]) for(let month=1;month<=12;month++) for(let start=1;start<=12;start++) {
    const f=formula.slice(1).replaceAll('$B$12','asOf').replaceAll('$B$9','start');
    const d=vm.runInNewContext(f,{asOf:new Date(Date.UTC(year,month-1,1)),start,
      YEAR:d=>d.getUTCFullYear(),MONTH:d=>d.getUTCMonth()+1,IF:(c,a,b)=>c?a:b,DATE:(y,m,d)=>new Date(Date.UTC(y,m-1,d))});
    const delta=(year-d.getUTCFullYear())*12+month-1-d.getUTCMonth();
    assert.ok(delta>=0 && delta<12);assert.equal(d.getUTCMonth()+1,start);
  }
});
test('balance-sheet equity example carries identical filter/book scope', () => {
  const lines=read('templates-balance-sheet.md').split('\n').filter(l=>/^C5[3-6]: =/.test(l));
  assert.equal(lines.length,4);
  const calls=lines.flatMap(l=>[...l.matchAll(/XAVI\.[A-Z]+\(([^)]+)\)/g)]);
  assert.equal(calls.length,5);
  for(const c of calls) assert.ok(c[1].endsWith('$B$3,$B$4,$B$5,$B$6,$B$8'));
});
test('every packaged local Markdown link resolves', () => {
  for(const f of fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.md'))) {
    const source=path.join(root,f);const text=fs.readFileSync(source,'utf8');
    for(const m of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(m[1]))continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(source),m[1].split('#')[0])),`${f}: ${m[1]}`);
    }
  }
});

test('single-year examples do not write comparison helpers', () => {
  const monthly=run(block('_conventions.md','const months'),{includePriorYear:false});
  const quarters=run(block('_conventions.md','const quarterStarts'),{includePriorYear:false});
  assert.equal(monthly.has('D4'),false);assert.equal(monthly.has('D6'),false);
  assert.equal(quarters.has('D10'),false);assert.equal(quarters.has('D11'),false);
  assert.ok(monthly.has('D3'));assert.ok(quarters.has('D8'));
});
