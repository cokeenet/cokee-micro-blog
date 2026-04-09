const fs = require('fs');
let code = fs.readFileSync('./src/admin_jsx.txt', 'utf8');

const regexMap = {
    'class=': 'className=',
    'stroke-width=': 'strokeWidth=',
    'stroke-linecap=': 'strokeLinecap=',
    'stroke-linejoin=': 'strokeLinejoin=',
    'fill-rule=': 'fillRule=',
    'clip-rule=': 'clipRule=',
    'xmlns:xlink=': 'xmlnsXlink=',
    'onclick=': 'onClick=',
    'for=': 'htmlFor='
};

let body = code;
const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
    body = bodyMatch[1];
}

for (const [k, v] of Object.entries(regexMap)) {
    body = body.split(k).join(v);
}

// Convert unclosed tags (basic regex)
body = body.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
body = body.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
body = body.replace(/<br>/g, '<br/>');
body = body.replace(/<hr>/g, '<hr/>');

const component = `import React from 'react';
import { Link } from 'react-router-dom';
// import { useTheme } from '../hooks/useTheme'; // TODO: Implement

export default function AdminDashboard() {
  // const { theme, toggleTheme } = useTheme();
  return (
    <>
      ${body}
    </>
  );
}`;

fs.writeFileSync('./src/pages/AdminDashboard.tsx', component, 'utf8');
console.log('AdminDashboard.tsx created successfully.');
