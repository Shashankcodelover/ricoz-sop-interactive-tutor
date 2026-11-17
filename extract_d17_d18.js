const fs = require('fs');
const text = fs.readFileSync('phase_3_and_4.txt', 'utf8');

const regex = /Task ID: TEC-D(17|18)[\s\S]*?(?=Task ID:|2\.[0-9]+\.[0-9]+\s+[A-Z\s]+|DAY\s+[0-9]+)/g;
let m;
while ((m = regex.exec(text)) !== null) {
  console.log('=== TEC TASK ===');
  console.log(m[0].substring(0, 1500));
}

