const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
let vars = fs.readFileSync('generated_css_vars.txt', 'utf8');

let newCss = css.replace('@tailwind utilities;', "@tailwind utilities;\n\n@layer base {\n" + vars + "\n}\n");

fs.writeFileSync('src/index.css', newCss);
console.log("css updated");
