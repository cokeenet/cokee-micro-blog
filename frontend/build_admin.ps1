$code = Get-Content -Raw -Encoding utf8 e:\WorkProjects\Cokee.MicroBlog\frontend\src\admin_jsx.txt
if ($code -match '(?sm)<body[^>]*>(.*?)</body>') {
    $bodyContent = $matches[1]

    $bodyContent = $bodyContent.Replace("stroke-width", "strokeWidth")
    $bodyContent = $bodyContent.Replace("stroke-linecap", "strokeLinecap")
    $bodyContent = $bodyContent.Replace("stroke-linejoin", "strokeLinejoin")
    $bodyContent = $bodyContent.Replace("fill-rule", "fillRule")
    $bodyContent = $bodyContent.Replace("clip-rule", "clipRule")
    $bodyContent = $bodyContent.Replace("xmlns:xlink", "xmlnsXlink")
    $bodyContent = $bodyContent.Replace("class=", "className=")
    $bodyContent = $bodyContent.Replace("onclick", "onClick")
    
    $component = "import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
" + $bodyContent + "
    </div>
  );
}"
    
    Set-Content -Path e:\WorkProjects\Cokee.MicroBlog\frontend\src\pages\AdminDashboard.tsx -Value $component -Encoding UTF8
    "Wrote AdminDashboard.tsx"
} else {
    "Failed to find body"
}
