const fs = require('fs');
const path = require('path');

const target_svg = `<svg viewBox="0 0 100 100">
                <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
                <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
              </svg>`;

const target_svg2 = `<svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px' }}>
              <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
              <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
          </svg>`;

const replacement = `<img src="/logo.png" alt="Ralvo Logo" style={{ height: '32px', width: 'auto' }} />`;

function normalize(s) {
    return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

const dir = path.join(__dirname, 'src', 'pages', 'auth');
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        const filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf-8');
        let norm_content = normalize(content);
        let norm_target = normalize(target_svg);
        let norm_target2 = normalize(target_svg2);

        if (norm_content.includes(norm_target) || norm_content.includes(norm_target2)) {
            let new_content = norm_content.replace(norm_target, replacement).replace(norm_target2, replacement);
            fs.writeFileSync(filepath, new_content, 'utf-8');
            console.log(`Updated ${filepath}`);
        }
    }
});
