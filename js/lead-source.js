/*
 * Lead source tracking — shared by every form that sends leads to the CRM.
 *
 * 1. Adds a "How did you hear about us?" dropdown to forms marked with
 *    data-lead-source (or wires up one already in the markup, named "Heard About Us").
 *    "Other" reveals a text box; "Door hanger"/"Mailer" reveal a campaign-code box.
 * 2. Remembers how the visitor arrived (ad tags like utm_source, Google/Facebook
 *    ad click IDs, the referring site, and the first page they landed on).
 * 3. LeadSource.note(form) returns all of that as text to append to the CRM message.
 * 4. LeadSource.trackLead(form) sends a "generate_lead" event to Google Analytics.
 *
 * Form markup options:
 *   <form data-lead-source>          inputs inserted before the submit button
 *   <form data-lead-source="group">  same, each wrapped in <div class="form-group"> with a visible label
 *   <span data-lead-source-slot hidden></span> inside the form puts the inputs there instead
 */
(function () {
  'use strict';

  var OPTIONS = [
    'Friend or family referral',
    'Neighbor uses you',
    'Google search',
    'Google Maps',
    'Facebook',
    'Nextdoor',
    'Yelp',
    'Yard sign',
    'Saw your truck/trailer',
    'Door hanger',
    'Mailer',
    'Returning customer',
    'Other'
  ];
  var PRINT = ['Door hanger', 'Mailer'];
  var STORE_KEY = 'wtlp_lead_attr';
  var MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

  /* ---------- Attribution (how the visitor arrived) ---------- */

  var params = new URLSearchParams(location.search);
  var urlCode = (params.get('code') || '').slice(0, 40).toUpperCase();

  function readStored() {
    try {
      var v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (v && Date.now() - v.t < MAX_AGE_MS) return v;
    } catch (e) {}
    return null;
  }

  function externalReferrer() {
    try {
      if (!document.referrer) return '';
      var r = new URL(document.referrer);
      if (r.hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) return '';
      return r.hostname.replace(/^www\./, '');
    } catch (e) { return ''; }
  }

  var attr = (function () {
    var fromUrl = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
      var v = params.get(k);
      if (v) fromUrl[k] = v.slice(0, 100);
    });
    if (params.get('gclid') || params.get('gbraid') || params.get('wbraid')) fromUrl.google_ad = true;
    if (params.get('fbclid')) fromUrl.facebook_click = true;

    var stored = readStored();
    var hasCampaign = Object.keys(fromUrl).length > 0;
    // A new tagged visit replaces what we had; otherwise keep the first visit we saw.
    if (stored && !hasCampaign) return stored;

    var a = fromUrl;
    a.referrer = externalReferrer();
    a.landing = location.pathname;
    a.t = Date.now();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(a)); } catch (e) {}
    return a;
  })();

  /* ---------- Dropdown ---------- */

  function el(tag, props) {
    var e = document.createElement(tag);
    for (var k in props) {
      if (k === 'style') e.style.cssText = props[k];
      else e[k] = props[k];
    }
    return e;
  }

  function visuallyHidden(label) {
    label.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    return label;
  }

  var uid = 0;
  function build(form, grouped) {
    var anchor = form.querySelector('[data-lead-source-slot]') ||
      form.querySelector('button[type="submit"], input[type="submit"]');
    var n = ++uid;

    function add(control, labelText) {
      control.id = control.id || 'lead-src-' + n + '-' + control.name.replace(/\W+/g, '-').toLowerCase();
      var label = el('label', { htmlFor: control.id, textContent: labelText });
      var node;
      if (grouped) {
        node = el('div', { className: 'form-group' });
        node.appendChild(label);
        node.appendChild(control);
      } else {
        node = document.createDocumentFragment();
        node.appendChild(visuallyHidden(label));
        node.appendChild(control);
      }
      // The slot may sit inside a wrapper (e.g. a form step), not directly in the form
      if (anchor) anchor.parentNode.insertBefore(node, anchor);
      else form.appendChild(node);
      return grouped ? control.parentNode : control;
    }

    var select = el('select', { name: 'Heard About Us', required: true });
    select.appendChild(el('option', { value: '', textContent: 'How did you hear about us?', disabled: true, selected: true }));
    OPTIONS.forEach(function (o) { select.appendChild(el('option', { textContent: o })); });
    add(select, 'How did you hear about us?');
  }

  function ensureFollowUps(form) {
    var select = form.querySelector('[name="Heard About Us"]');
    var grouped = form.getAttribute('data-lead-source') === 'group';
    // A dropdown in the page markup with only a placeholder gets the shared option list
    if (select.tagName === 'SELECT' && select.options.length <= 1) {
      OPTIONS.forEach(function (o) { select.appendChild(el('option', { textContent: o })); });
    }
    // Insert follow-up boxes right after the dropdown (or its wrapper)
    var after = select.closest('.form-group, .field-group') || select;
    var wrapper = after !== select ? after : null; // copy its wrapper style (e.g. .field-group)

    function make(name, placeholder, labelText, extra) {
      var input = form.querySelector('[name="' + name + '"]');
      if (input) return input;
      input = el('input', { type: 'text', name: name, placeholder: placeholder, maxLength: extra.max });
      input.id = 'lead-src-' + (++uid);
      if (extra.upper) {
        input.setAttribute('autocapitalize', 'characters');
        input.addEventListener('input', function () {
          var p = input.selectionStart;
          input.value = input.value.toUpperCase();
          try { input.setSelectionRange(p, p); } catch (e) {}
        });
      }
      var label = el('label', { htmlFor: input.id, textContent: labelText });
      var wrap;
      if (grouped || wrapper) {
        wrap = el('div', { className: wrapper ? wrapper.className : 'form-group' });
        if (wrapper && wrapper.querySelector('.field-label')) label.className = 'field-label';
        wrap.appendChild(label);
        wrap.appendChild(input);
      } else {
        wrap = el('span', { style: 'display:contents' });
        wrap.appendChild(visuallyHidden(label));
        wrap.appendChild(input);
      }
      after.parentNode.insertBefore(wrap, after.nextSibling);
      after = wrap;
      return input;
    }

    var other = make('Heard About Us Other', 'Where did you hear about us?', 'Where did you hear about us?', { max: 200 });
    var code = make('Campaign Code', 'Code (optional)','Code on your door hanger or mailer (optional)', { max: 40, upper: true });
    if (urlCode && !code.value) code.value = urlCode;

    function boxOf(input) {
      var p = input.parentNode;
      return (p && p !== form && p.querySelectorAll('input,select,textarea').length === 1) ? p : input;
    }

    function show(input, on) {
      var box = boxOf(input);
      if (box.__shownDisplay === undefined) box.__shownDisplay = box.tagName === 'SPAN' ? 'contents' : '';
      box.style.display = on ? box.__shownDisplay : 'none';
    }

    function update() {
      var v = select.value;
      var isOther = v === 'Other';
      var isPrint = PRINT.indexOf(v) !== -1;
      show(other, isOther);
      other.required = isOther;
      show(code, isPrint);
      code.placeholder = (v === 'Mailer' ? 'Mailer' : 'Door hanger') + ' code (optional)';
    }
    select.addEventListener('change', update);
    update();
  }

  function mountAll() {
    Array.prototype.forEach.call(document.querySelectorAll('form'), function (form) {
      var has = form.querySelector('[name="Heard About Us"]');
      if (!has && !form.hasAttribute('data-lead-source')) return;
      if (form.__leadSource) return;
      form.__leadSource = true;
      if (!has) build(form, form.getAttribute('data-lead-source') === 'group');
      ensureFollowUps(form);
    });
  }

  /* ---------- Public helpers ---------- */

  function heardAbout(form) {
    var s = form.querySelector('[name="Heard About Us"]');
    if (!s || !s.value) return '';
    var v = s.value;
    var other = form.querySelector('[name="Heard About Us Other"]');
    var code = form.querySelector('[name="Campaign Code"]');
    if (v === 'Other' && other && other.value.trim()) v += ' (' + other.value.trim() + ')';
    if (PRINT.indexOf(s.value) !== -1 && code && code.value.trim()) v += ' (code: ' + code.value.trim().toUpperCase() + ')';
    return v;
  }

  // Dropdown answer -> the CRM's canonical lead-source label (westttn-crm
  // lib/leadSources.ts), so the Marketing page groups them without mapping.
  // Google Maps, Yelp, Mailer and Nextdoor already match CRM labels and are sent as-is;
  // the CRM keeps unknown labels as their own row.
  var CRM_SOURCE = {
    'Friend or family referral': 'Referral',
    'Neighbor uses you': 'Referral',
    'Google search': 'Google Search',
    'Facebook': 'Facebook / Instagram',
    'Yard sign': 'Yard Sign',
    'Saw your truck/trailer': 'Truck / Vehicle',
    'Door hanger': 'Door Hanger / Flyer',
    'Returning customer': 'Repeat Customer'
  };

  window.LeadSource = {
    /**
     * Value for the CRM's lead_source field. The visitor's own answer wins;
     * with no answer, an ad click ID stands in. Free text ("Other" details,
     * campaign codes) stays in the message via note().
     */
    source: function (form) {
      var s = form && form.querySelector('[name="Heard About Us"]');
      var v = s && s.value;
      if (v) return CRM_SOURCE[v] || v;
      if (attr.google_ad) return 'Google Ads';
      if (attr.facebook_click) return 'Facebook / Instagram';
      return undefined;
    },

    /** Text to append to the lead message. sep defaults to ' | '. */
    note: function (form, sep) {
      var parts = [];
      var h = heardAbout(form);
      if (h) parts.push('Heard about us: ' + h);
      var ad = [attr.utm_source, attr.utm_medium, attr.utm_campaign].filter(Boolean).join(' / ');
      if (attr.utm_term) ad += (ad ? ' / ' : '') + 'term: ' + attr.utm_term;
      if (attr.utm_content) ad += (ad ? ' / ' : '') + 'ad: ' + attr.utm_content;
      if (ad) parts.push('Campaign: ' + ad);
      if (attr.google_ad) parts.push('Clicked a Google ad');
      if (attr.facebook_click) parts.push('Clicked a Facebook link/ad');
      if (attr.referrer) parts.push('Came from: ' + attr.referrer);
      if (attr.landing) parts.push('First page: ' + attr.landing);
      parts.push('Form page: ' + location.pathname);
      return parts.join(sep || ' | ');
    },

    /** Shows the browser's message and returns false if the lead-source fields are incomplete. */
    check: function (form) {
      var fields = form.querySelectorAll('[name="Heard About Us"], [name="Heard About Us Other"]');
      for (var i = 0; i < fields.length; i++) {
        if (!fields[i].checkValidity()) { fields[i].reportValidity(); return false; }
      }
      return true;
    },

    /** Sends a generate_lead event to Google Analytics. */
    trackLead: function (form) {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            form_page: location.pathname,
            lead_source: (form && form.querySelector('[name="Heard About Us"]') || {}).value || '(none)',
            campaign: attr.utm_campaign || ''
          });
        }
      } catch (e) {}
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
