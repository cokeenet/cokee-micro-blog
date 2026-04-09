const fs = require('fs');
let code = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

// Insert useTheme hook import
code = code.replace("import { Link, useLocation } from 'react-router';", "import { Link, useLocation } from 'react-router';\nimport { useTheme } from '../hooks/useTheme';");

// Inside component: `const { theme, toggleTheme } = useTheme();`
code = code.replace("  const location = useLocation();", "  const location = useLocation();\n  const { theme, toggleTheme } = useTheme();");

// Insert the Dark/Light mode button next to the user profile box at the bottom.
const toggleButton = `
          <button 
            onClick={toggleTheme}
            className=\"w-full flex items-center justify-center gap-2 mb-4 bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline py-2 rounded-full font-regular text-sm active:scale-95 transition-all\"
          >
            <span className=\"material-symbols-outlined text-lg\">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'ÇÐ»»°×ÖçÄ£Ê½' : 'ÇÐ»»ºÚÒ¹Ä£Ê½'}</span>
          </button>
`;

code = code.replace("          <div className=\"mt-auto flex items-center gap-3", toggleButton + "          <div className=\"mt-auto flex items-center gap-3");

fs.writeFileSync('src/layouts/AppLayout.tsx', code, 'utf8');
console.log("AppLayout updated");
