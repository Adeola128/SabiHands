const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// The directories to lazy load
const lazyDirs = [
  './layouts/DashboardLayout',
  './layouts/AdminLayout',
  './pages/volunteer/',
  './pages/organization/',
  './pages/admin/',
  './components/SupportChatWidget',
  './components/DashboardRedirect',
  './pages/Notifications',
  './pages/Messages'
];

// Find imports matching the directories
const importRegex = /^import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"];$/gm;
let newContent = content;
let match;
let lazyImports = [];

while ((match = importRegex.exec(content)) !== null) {
  const [fullMatch, componentName, importPath] = match;
  
  if (lazyDirs.some(dir => importPath.startsWith(dir))) {
    lazyImports.push({ fullMatch, componentName, importPath });
  }
}

// Replace static imports with lazy imports
lazyImports.forEach(({ fullMatch, componentName, importPath }) => {
  newContent = newContent.replace(
    fullMatch, 
    `const ${componentName} = React.lazy(() => import('${importPath}'));`
  );
});

// Add Suspense around the Dashboard and Admin routes
// Actually, it's easier to just wrap all routes in a single Suspense in the BrowserRouter
newContent = newContent.replace(
  '<Routes>',
  '<React.Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>}>\n        <Routes>'
);

newContent = newContent.replace(
  '</Routes>',
  '</Routes>\n        </React.Suspense>'
);

// Wrap SupportChatWidget in Suspense as well since it's lazy loaded
newContent = newContent.replace(
  '<SupportChatWidget />',
  '<React.Suspense fallback={null}><SupportChatWidget /></React.Suspense>'
);

fs.writeFileSync(appTsxPath, newContent);
console.log('App.tsx refactored for code splitting.');
