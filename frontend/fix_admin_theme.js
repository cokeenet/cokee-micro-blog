const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace("// import { useTheme } from '../hooks/useTheme';", "import { useTheme } from '../hooks/useTheme';");
code = code.replace("// const { theme, toggleTheme } = useTheme();", "const { theme, toggleTheme } = useTheme();");

// Replace top right nav button that might be a theme switcher. 
// "Wb_Sunny" is used for theme in the admin dashboard mockup! Let's match it.
code = code.replace(
  /<button className="hover:bg-green-400\/10 p-2 rounded-xl transition-colors">/g,
  '<button onClick={toggleTheme} className="hover:bg-green-400/10 p-2 rounded-xl transition-colors" title={theme === "light" ? "Switch to Dark" : "Switch to Light"}>'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code, 'utf8');
console.log("Admin theme fixed");
