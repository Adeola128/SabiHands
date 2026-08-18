const fs = require('fs');
const path = require('path');

const replacement = `<img src="/logo.png" alt="Ralvo Logo" style={{ height: '32px', width: 'auto' }} />`;

const dir = path.join(__dirname, 'src', 'pages', 'auth');
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        const filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf-8');
        
        // Regex to match the svg
        const regex1 = /<svg viewBox="0 0 100 100">[\s\S]*?<path d="M60 15 A35 35 0 1 0 60 85"[\s\S]*?<\/svg>/g;
        const regex2 = /<svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px' }}>[\s\S]*?<path d="M60 15 A35 35 0 1 0 60 85"[\s\S]*?<\/svg>/g;

        let changed = false;
        if (regex1.test(content)) {
            content = content.replace(regex1, replacement);
            changed = true;
        }
        if (regex2.test(content)) {
            content = content.replace(regex2, replacement);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filepath, content, 'utf-8');
            console.log(`Updated ${filepath}`);
        }
    }
});
