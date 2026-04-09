const fs = require('fs');

let config = fs.readFileSync('tailwind.config.js', 'utf8');
let generatedTW = fs.readFileSync('generated_tw_colors.txt', 'utf8');

let newConfig = config.replace(
  /colors: \{[\s\S]*?\},/m,
  "colors: {\n" + generatedTW + "      },"
);

fs.writeFileSync('tailwind.config.js', newConfig);
console.log("tailwind updated");
