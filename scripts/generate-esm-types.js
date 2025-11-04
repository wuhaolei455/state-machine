const fs = require('fs');
const path = require('path');

const esmTypeFile = path.join(__dirname, '../dist/index.esm.d.ts');
const content = `export * from "./index";\n`;

fs.writeFileSync(esmTypeFile, content, 'utf-8');
console.log('Generated dist/index.esm.d.ts');


