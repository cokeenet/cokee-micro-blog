const fs = require('fs');

let main = fs.readFileSync('src/main.tsx', 'utf8');

// Ensure import exists
if (!main.includes('ThemeProvider')) {
    main = "import { ThemeProvider } from './hooks/useTheme';\n" + main;
    // Replace <App /> with <ThemeProvider><App /></ThemeProvider>
    main = main.replace('<App />', '<ThemeProvider>\n      <App />\n    </ThemeProvider>');
}

fs.writeFileSync('src/main.tsx', main);
console.log("main.tsx updated");
