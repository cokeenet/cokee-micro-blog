const fs = require('fs');
let code = fs.readFileSync('e:/WorkProjects/Cokee.MicroBlog/frontend/src/App.tsx', 'utf8');

const regex = /export default function App\(\) \{\s*return \(\s*<AppLayout>\s*<Routes>\s*<Route path="\/" element=\{<Home \/>\} \/>\s*<\/Routes>\s*<\/AppLayout>\s*\);\s*\}/s;

const newCode = import AdminDashboard from './pages/AdminDashboard';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
};

if (regex.test(code)) {
    code = code.replace(regex, newCode);
    fs.writeFileSync('e:/WorkProjects/Cokee.MicroBlog/frontend/src/App.tsx', code, 'utf8');
    console.log('App.tsx updated.');
} else {
    console.error('Regex did not match.');
}
