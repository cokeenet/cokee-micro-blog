const fs = require('fs');

const d = { "tertiary": "#c8a0f0", "tertiary-fixed": "#e8d0ff", "on-surface-variant": "#a0b4c4", "on-primary-fixed": "#001f2e", "tertiary-fixed-dim": "#c8a0f0", "surface-container-highest": "#202c42", "on-tertiary-fixed-variant": "#4d2a73", "secondary-fixed-dim": "#88b4cc", "surface-tint": "#7dd3fc", "surface-container": "#141c2e", "on-error-container": "#ffb3b3", "outline-variant": "#2a3a48", "outline": "#4a6070", "on-tertiary-container": "#e8d0ff", "inverse-on-surface": "#0a0e1a", "primary-fixed": "#c8eaff", "surface-container-low": "#0a1121", "secondary-container": "#183244", "primary": "#7dd3fc", "secondary": "#88b4cc", "inverse-surface": "#dbecfc", "onError": "#690005", "on-secondary-container": "#cde5ff", "surface": "#0a1121", "surface-variant": "#2a3a48", "error": "#ffb4ab", "on-secondary-fixed-variant": "#26485d", "on-secondary": "#00344b", "tertiary-container": "#4d2a73", "on-tertiary": "#330053", "on-primary-container": "#c8eaff", "on-background": "#dbecfc", "error-container": "#93000a", "secondary-fixed": "#cde5ff", "on-primary": "#00344d", "surface-container-high": "#1a2438", "background": "#0a0e1a", "primary-container": "#004b6f", "on-error": "#690005", "primary-fixed-dim": "#7dd3fc", "surface-container-lowest": "#060914", "on-surface": "#dbecfc", "inverse-primary": "#006493" };

let c = ":root {\n";
for (let k of Object.keys(d)) {
    let v = d[k];
    if(k==='background') v='#f1f5f9';
    else if(k==='surface') v='#ffffff';
    else if(k==='surface-container') v='#f8fafc';
    else if(k==='surface-container-lowest') v='#ffffff';
    else if(k==='surface-container-low') v='#f8fafc';
    else if(k==='surface-container-high') v='#e2e8f0';
    else if(k==='surface-container-highest') v='#cbd5e1';
    else if(k==='on-surface' || k==='on-background') v='#0f172a';
    else if(k==='on-surface-variant') v='#475569';
    else if(k==='primary') v='#0ea5e9';
    else if(k==='primary-container') v='#bae6fd';
    else if(k==='on-primary') v='#ffffff';
    else if(k==='outline') v='#94a3b8';
    else if(k==='outline-variant') v='#cbd5e1';
    c += "  --color-" + k + ": " + v + ";\n";
}
c += "}\n\n.dark {\n";
for (let k of Object.keys(d)) {
    c += "  --color-" + k + ": " + d[k] + ";\n";
}
c += "}\n\n";

fs.writeFileSync('generated_css_vars.txt', c);

let tw = "";
for (let k of Object.keys(d)) {
    tw += "        '" + k + "': 'var(--color-" + k + ")',\n";
}
fs.writeFileSync('generated_tw_colors.txt', tw);

console.log("Done");
