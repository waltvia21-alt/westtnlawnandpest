import os, re, glob

BASE = r'C:\Users\User\Claude Code website'

# Files using services/ prefix (root + locations)
root_files = glob.glob(os.path.join(BASE, '*.html'))
location_files = glob.glob(os.path.join(BASE, 'locations', '*.html'))
service_files = glob.glob(os.path.join(BASE, 'services', '*.html'))

def update_root(content):
    # Remove flea/mole/armyworm from Lawn Services dropdown
    content = re.sub(
        r'\s*<li><a href="services/flea-tick-control\.html">Flea &amp; Tick Control</a></li>\s*'
        r'<li><a href="services/mole-control\.html">Mole Control</a></li>\s*'
        r'<li><a href="services/armyworm-control\.html">Armyworm Control</a></li>',
        '', content
    )
    # Add items to Pest Control dropdown after Perimeter Pest Control
    content = content.replace(
        '<li><a href="services/perimeter-pest-control.html">Perimeter Pest Control</a></li>',
        '<li><a href="services/perimeter-pest-control.html">Perimeter Pest Control</a></li>\n'
        '            <li><a href="services/flea-tick-control.html">Flea &amp; Tick Control</a></li>\n'
        '            <li><a href="services/mole-control.html">Mole Control</a></li>\n'
        '            <li><a href="services/armyworm-control.html">Armyworm Control</a></li>\n'
        '            <li><a href="services/mosquito-control.html">Mosquito Control</a></li>'
    )
    return content

def update_service(content):
    # Remove flea/mole/armyworm from Lawn Services dropdown
    content = re.sub(
        r'\s*<li><a href="flea-tick-control\.html">Flea &amp; Tick Control</a></li>\s*'
        r'<li><a href="mole-control\.html">Mole Control</a></li>\s*'
        r'<li><a href="armyworm-control\.html">Armyworm Control</a></li>',
        '', content
    )
    # Add items to Pest Control dropdown after Perimeter Pest Control
    content = content.replace(
        '<li><a href="perimeter-pest-control.html">Perimeter Pest Control</a></li>',
        '<li><a href="perimeter-pest-control.html">Perimeter Pest Control</a></li>\n'
        '            <li><a href="flea-tick-control.html">Flea &amp; Tick Control</a></li>\n'
        '            <li><a href="mole-control.html">Mole Control</a></li>\n'
        '            <li><a href="armyworm-control.html">Armyworm Control</a></li>\n'
        '            <li><a href="mosquito-control.html">Mosquito Control</a></li>'
    )
    return content

for f in root_files + location_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    updated = update_root(content)
    if updated != content:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(updated)
        print(f'Updated: {f}')
    else:
        print(f'No change: {f}')

for f in service_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    updated = update_service(content)
    if updated != content:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(updated)
        print(f'Updated: {f}')
    else:
        print(f'No change: {f}')

print('Done.')
