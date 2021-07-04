const fs = require('fs');
const path = require('path');
const Px2Rem = require('../dist/px2rem-loader').default;
const text = fs.readFileSync(path.resolve(__dirname, './text.css'), 'utf-8');

const ins = new Px2Rem();
debugger;
const res = ins.generateRem(text);

console.log(res);
