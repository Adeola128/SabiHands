import os
import glob

# The exact SVG to replace
target_svg = '''<svg viewBox="0 0 100 100">
                <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
                <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
              </svg>'''

target_svg2 = '''<svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px' }}>
              <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
              <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
          </svg>'''

replacement = "<img src=\"/logo.png\" alt=\"Ralvo Logo\" style={{ height: '32px', width: 'auto' }} />"

# Normalize newlines
def normalize(s):
    return s.replace('\r\n', '\n').replace('\r', '\n')

for filepath in glob.glob('src/pages/auth/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try replacing normalized versions
    norm_content = normalize(content)
    norm_target = normalize(target_svg)
    norm_target2 = normalize(target_svg2)

    if norm_target in norm_content or norm_target2 in norm_content:
        new_content = norm_content.replace(norm_target, replacement).replace(norm_target2, replacement)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')
