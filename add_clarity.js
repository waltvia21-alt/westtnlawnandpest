const fs = require('fs');
const path = require('path');

const CLARITY = `  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wjkb2uo0gd");
  </script>
</head>`;

function getHtml(dir) {
  const out = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...getHtml(full));
    else if (f.endsWith('.html') && !/logo-preview/.test(f)) out.push(full);
  });
  return out;
}

let updated = 0;
getHtml(__dirname).forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('clarity.ms/tag')) {
    console.log('SKIP (already has Clarity):', path.relative(__dirname, file));
    return;
  }
  if (!html.includes('</head>')) return;
  html = html.replace('</head>', CLARITY);
  fs.writeFileSync(file, html);
  console.log('UPDATED:', path.relative(__dirname, file));
  updated++;
});
console.log(`\nDone — ${updated} files updated.`);
