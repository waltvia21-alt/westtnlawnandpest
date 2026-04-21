const fs = require('fs');
const path = require('path');

const CSS = `
  <style>
    /* ── Page Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(26px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      to { left: 150%; }
    }

    /* Hero entrance */
    .hero__kicker, .hero__eyebrow { animation: fadeUp .55s ease both .10s; }
    .hero__h1     { animation: fadeUp .65s ease both .22s; }
    .hero__sub    { animation: fadeUp .60s ease both .40s; }
    .hero__btns, .hero__actions   { animation: fadeUp .60s ease both .56s; }
    .hero__proof  { animation: fadeUp .50s ease both .72s; }
    .hero__card   { animation: fadeUp .70s ease both .30s; }

    /* Card hover lift */
    .svc-card, .service-card { transition: transform .25s ease, box-shadow .25s ease; }
    .plan-card   { transition: transform .25s ease, box-shadow .25s ease; }
    .area-card   { transition: transform .22s ease, box-shadow .22s ease; }
    .review-card { transition: transform .22s ease, box-shadow .22s ease; }
    .svc-card:hover, .service-card:hover, .plan-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,.11); }
    .area-card:hover, .review-card:hover                   { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,.09); }

    /* Gold button shine sweep */
    .btn-gold { position: relative; overflow: hidden; }
    .btn-gold::after {
      content: ''; position: absolute;
      top: 0; left: -100%; width: 55%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
      pointer-events: none;
    }
    .btn-gold:hover::after { animation: shimmer .55s ease forwards; }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .hero__kicker, .hero__eyebrow, .hero__h1, .hero__sub,
      .hero__btns, .hero__actions, .hero__proof, .hero__card { animation: none !important; }
      .btn-gold::after { display: none; }
      .svc-card, .service-card, .plan-card, .area-card, .review-card { transition: none !important; }
    }
  </style>
</head>`;

const JS = `
<script>
(function(){
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      obs.unobserve(e.target);
      e.target.addEventListener('transitionend', function() {
        this.style.transition = '';
        this.style.opacity = '';
        this.style.transform = '';
      }, { once: true });
    });
  }, { threshold: 0.1 });

  ['.services__grid','.services-grid','.plans__grid','.plans2__grid',
   '.process__steps','.reviews__grid','.areas__grid','.why__features',
   '.service-cards','.cards__grid','.features__grid'].forEach(function(sel) {
    var p = document.querySelector(sel);
    if (!p) return;
    p.querySelectorAll(':scope > *').forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity .55s ease '+(i*.12).toFixed(2)+'s, transform .55s ease '+(i*.12).toFixed(2)+'s';
      obs.observe(el);
    });
  });

  document.querySelectorAll('.section-eyebrow,.section-title,.rule,.section-body--center,.guarantee__content,.why__img-wrap').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .40s ease, transform .40s ease';
    obs.observe(el);
  });

  document.querySelectorAll('.trustbar__item,.trust-item').forEach(function(el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .45s ease '+(i*.09).toFixed(2)+'s, transform .45s ease '+(i*.09).toFixed(2)+'s';
    obs.observe(el);
  });
})();
</script>
</body>`;

const skip = ['index.html', 'account.html'];
const skipPattern = /logo-preview/;

function getFiles(dir) {
  const results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...getFiles(full));
    } else if (f.endsWith('.html') && !skip.includes(f) && !skipPattern.test(f)) {
      results.push(full);
    }
  });
  return results;
}

const base = __dirname;
const files = getFiles(base);
let updated = 0;

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // Skip if already has our animations
  if (html.includes('@keyframes shimmer')) {
    console.log('SKIP (already has animations):', path.relative(base, file));
    return;
  }

  // Insert CSS before </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', CSS);
  }

  // Insert JS before </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', JS);
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('UPDATED:', path.relative(base, file));
  updated++;
});

console.log(`\nDone — ${updated} files updated.`);
