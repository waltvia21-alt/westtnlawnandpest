const fs = require('fs');
const path = require('path');
const BASE = 'C:\\Users\\User\\Claude Code website';

const serviceFiles = fs.readdirSync(path.join(BASE, 'services'))
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(BASE, 'services', f));

serviceFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const before = content;

  // Remove inline style background-image from hero__bg divs
  content = content.replace(
    /(<div class="hero__bg"[^>]*?)\s*style="background-image:url\('[^']*'\);?"\s*/g,
    '$1 '
  );

  // Replace CSS hero__bg rules that include a background-image with just position/inset
  content = content.replace(
    /\.hero__bg \{ position: absolute; inset: 0; background-image: url\('[^']*'\); background-size: cover; background-position: center; \}/g,
    '.hero__bg { position: absolute; inset: 0; background: var(--pine); }'
  );

  // Also handle weed-control style (multi-line CSS block)
  content = content.replace(
    /\.hero__bg \{\s*position: absolute; inset: 0;\s*background-image: url\('[^']*'\);\s*background-size: cover; background-position: center;\s*\}/g,
    '.hero__bg { position: absolute; inset: 0; background: var(--pine); }'
  );

  // Replace remaining CSS hero__bg with just background-size/position (no image set in CSS)
  content = content.replace(
    /\.hero__bg \{ position: absolute; inset: 0; background-size: cover; background-position: center; \}/g,
    '.hero__bg { position: absolute; inset: 0; background: var(--pine); }'
  );

  if (content !== before) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', path.basename(f));
  } else {
    console.log('No change:', path.basename(f));
  }
});
console.log('Done.');
