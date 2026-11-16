const $ = (i) => document.getElementById(i);
const esc = (s) => { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; };
const etb = (n) => Number(n).toLocaleString('en-US') + ' ETB';
const AREAS = [['Cybersecurity fundamentals', 'Core concepts, threats, and defensive thinking.'], ['Linux and networking', 'The command line, protocols, and traffic.'], ['Web application security', 'How web apps break and how to fix them.'], ['Ethical hacking', 'Authorized offensive techniques.'], ['Penetration testing', 'Scoping, testing, and reporting.'], ['Vulnerability assessment', 'Finding and prioritizing weaknesses.'], ['Digital forensics', 'Evidence, logs, and investigation.'], ['Security tools and methods', 'Practical tooling and repeatable process.']];
const SVCS = [['Web application penetration testing', 'Authorized testing of your web apps.'], ['Network penetration testing', 'Assess internal and external network exposure.'], ['Vulnerability assessment', 'Identify and prioritize weaknesses.'], ['Security auditing', 'Review controls against good practice.'], ['Security consulting', 'Practical guidance for your team.']];
const card = (a) => `<div class="card"><h3>${esc(a[0])}</h3><p>${esc(a[1])}</p></div>`;
let SITE = { settings: {}, courses: [], mentors: [], faqs: [] };

async function api(path, opt) {
  const r = await fetch('/api' + path, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { fields: j.fields });
  return j;
}
const priceHTML = (c) => c.discount ? `<s>${etb(c.price)}</s><b>${etb(c.discount)}</b><span class="badge">${Math.round((1 - c.discount / c.price) * 100)}% off</span>` : `<b>${etb(c.price)}</b>`;
const status = (c) => c.open ? '<span class="pill open">Open for enrollment</span>' : '<span class="pill closed">Enrollment closed</span>';
const cover = (c) => `<div class="cover">${c.cover ? `<img src="${esc(c.cover)}" alt="" loading="lazy">` : '&gt;_'}</div>`;
const li = (a) => a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Not specified.</p>';

function renderHome() {
  const s = SITE.settings;
  $('h-title').textContent = s.hero_title; $('h-text').textContent = s.hero_text;
  $('a-text').textContent = s.about_text; $('a-mission').textContent = s.mission;
  $('cta-t').textContent = s.cta_title; $('cta-p').textContent = s.cta_text; $('f-text').textContent = s.footer_text;
  $('yr').textContent = new Date().getFullYear();
  $('areas').innerHTML = AREAS.map(card).join(''); $('svcs').innerHTML = SVCS.map(card).join('');
  $('faqs').innerHTML = SITE.faqs.map((f) => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');
  $('clist').innerHTML = SITE.courses.length ? SITE.courses.map((c) => `<article class="card course">${cover(c)}<div class="cbody"><div class="meta">${status(c)}<span class="pill">${esc(c.level)}</span>${c.duration ? `<span class="pill">${esc(c.duration)}</span>` : ''}</div><h3>${esc(c.title)}</h3><p>${esc(c.short)}</p>${c.instructor ? `<p style="font-size:.85rem">Instructor: ${esc(c.instructor)}</p>` : ''}<div class="price">${priceHTML(c)}</div><div class="row"><a class="btn btn-o" href="#course-${esc(c.slug)}">View details</a>${c.open ? `<a class="btn btn-p" href="#enroll-${esc(c.slug)}">Enroll now</a>` : ''}</div></div></article>`).join('')
    : '<div class="empty" style="grid-column:1/-1"><h3>No courses published yet</h3><p>New courses will appear here as soon as they are published.</p></div>';
  $('mlist').innerHTML = SITE.mentors.length ? SITE.mentors.map((m) => `<article class="card mcard">${m.photo ? `<img class="mphoto" src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : ''}<div class="cbody"><h3>${esc(m.name)}</h3><p style="color:var(--brand)">${esc(m.role)}</p><p>${esc(m.bio)}</p><div class="meta">${m.specialties.map((x) => `<span class="pill open">${esc(x)}</span>`).join('')}</div>${m.achievements.length ? li(m.achievements) : ''}<div class="soc">${m.linkedin ? `<a href="${esc(m.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}${m.github ? `<a href="${esc(m.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}</div></div></article>`).join('')
    : '<div class="empty" style="grid-column:1/-1"><h3>Mentor profiles are on the way</h3><p>Real photos and biographies will appear here once an administrator publishes them.</p></div>';
  const links = [['Telegram', s.telegram && 'https://t.me/' + s.telegram.replace(/^@/, '')], ['LinkedIn', s.linkedin], ['GitHub', s.github], ['YouTube', s.youtube]].filter((x) => x[1] && /^https:\/\//.test(x[1]));
  $('f-soc').innerHTML = links.map((l) => `<a href="${esc(l[1])}" target="_blank" rel="noopener noreferrer">${l[0]}</a>`).join('');
  $('f-contact').innerHTML = [s.contact_email && `<a href="mailto:${esc(s.contact_email)}">${esc(s.contact_email)}</a>`, s.contact_phone && `<a href="tel:${esc(s.contact_phone)}">${esc(s.contact_phone)}</a>`, '<a href="#contact">Send a message</a>'].filter(Boolean).join('');
}

function showCourse(c) {
  $('course-body').innerHTML = `<a class="crumb" href="#courses">Back to courses</a><div class="detail"><div>${cover(c).replace('class="cover"', 'class="cover" style="border:1px solid var(--bd);border-radius:14px;margin-bottom:24px"')}<h1 style="font-size:clamp(2rem,4.5vw,3rem)">${esc(c.title)}</h1><p style="margin-top:12px">${esc(c.short)}</p><h3>About this course</h3><p style="white-space:pre-line">${esc(c.description)}</p><h3>Learning objectives</h3>${li(c.objectives)}<h3>Curriculum</h3>${li(c.topics)}<h3>Prerequisites</h3>${li(c.prereqs)}<h3>Who it’s for</h3>${li(c.audience)}</div>
<aside class="card side"><div class="meta">${status(c)}</div><div class="price" style="margin:14px 0">${priceHTML(c)}</div><p style="font-size:.9rem">${c.duration ? `Duration: ${esc(c.duration)}<br>` : ''}Level: ${esc(c.level)}<br>${c.format ? `Format: ${esc(c.format)}<br>` : ''}${c.instructor ? `Instructor: ${esc(c.instructor)}<br>` : ''}${c.schedule ? `Schedule: ${esc(c.schedule)}<br>` : ''}${c.deadline ? `Enroll by: ${esc(c.deadline)}<br>` : ''}${c.seatsLeft !== null ? `Seats left: ${c.seatsLeft}` : ''}</p>
<div style="margin-top:18px">${c.open ? `<a class="btn btn-p" style="width:100%" href="#enroll-${esc(c.slug)}">Enroll in this course</a>` : '<span class="btn btn-o" style="width:100%;opacity:.5">Enrollment closed</span>'}</div></aside></div>`;
}

async function showEnroll(c) {
  if (!c.open) { $('enroll-body').innerHTML = `<a class="crumb" href="#course-${esc(c.slug)}">Back to course</a><div class="empty"><h3>Enrollment is closed for this course</h3><p>Check back soon or choose another course.</p></div>`; return; }
  let pay = { methods: [], reference: '' };
  try { pay = await api('/payment-methods'); } catch { /* shown empty */ }
  const fld = (id, l, t, extra = '') => `<div class="fg"><label for="${id}">${l}</label><input id="${id}" type="${t}" autocomplete="off" ${extra}><div class="err" id="e-${id}"></div></div>`;
  $('enroll-body').innerHTML = `<a class="crumb" href="#course-${esc(c.slug)}">Back to course</a><h2>Enroll in ${esc(c.title)}</h2><div class="price" style="margin-bottom:24px">${priceHTML(c)}</div>
<form class="form" id="f" novalidate>${fld('fullName', 'Full name', 'text')}${fld('username', 'Username', 'text')}${fld('phone', 'Phone number', 'tel', 'placeholder="09XX XXX XXX"')}${fld('telegram', 'Telegram username', 'text', 'placeholder="@username"')}
<div class="pay"><strong>Payment instructions</strong><p style="margin-top:6px">Pay <strong style="color:var(--tx)">${etb(c.amount)}</strong> using one of these methods, then upload your receipt.</p>
<div class="pm">${pay.methods.map((m) => `<div><b>${esc(m.type)}</b>${m.bank ? `<br>Bank: ${esc(m.bank)}` : ''}${m.holder ? `<br>Account name: ${esc(m.holder)}` : ''}${m.number ? `<br>Number: <span class="mono" style="font-family:var(--mf);color:var(--brand)">${esc(m.number)}</span>` : ''}${m.notes ? `<br>${esc(m.notes)}` : ''}</div>`).join('') || '<div>Payment details are not available yet. Please contact us.</div>'}</div>
<p style="margin-top:10px">${esc(pay.reference)}</p></div>
<fieldset style="border:0;display:grid;gap:10px"><legend class="fg" style="font-weight:600;font-size:.9rem;margin-bottom:6px">Payment receipt</legend>
<div class="seg"><label><input type="radio" name="rt" value="upload" checked><span>Upload file</span></label><label><input type="radio" name="rt" value="link"><span>Paste link</span></label></div>
<div class="fg" id="r-up"><label for="receipt">Image or PDF, up to 5 MB</label><input id="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"></div>
<div class="fg" id="r-ln" hidden><label for="receiptLink">Receipt link (https)</label><input id="receiptLink" type="url" placeholder="https://..."></div><div class="err" id="e-receipt"></div></fieldset>
<label class="chk"><input type="checkbox" id="consent"><span>I agree to the privacy policy and consent to Spark Security processing my details for enrollment.</span></label><div class="err" id="e-consent"></div>
<div id="fmsg" role="alert"></div><button class="btn btn-p" id="sub" type="submit">Submit application</button></form>`;
  document.querySelectorAll('input[name=rt]').forEach((x) => x.addEventListener('change', () => { const up = document.querySelector('input[name=rt]:checked').value === 'upload'; $('r-up').hidden = !up; $('r-ln').hidden = up; }));
  $('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.err').forEach((x) => (x.textContent = '')); $('fmsg').innerHTML = '';
    const rt = document.querySelector('input[name=rt]:checked').value, fd = new FormData();
    fd.set('courseSlug', c.slug); ['fullName', 'username', 'phone', 'telegram'].forEach((k) => fd.set(k, $(k).value));
    fd.set('consent', $('consent').checked); fd.set('receiptType', rt);
    if (rt === 'upload') { const f = $('receipt').files[0]; if (f) fd.set('receipt', f); } else fd.set('receiptLink', $('receiptLink').value);
    $('sub').disabled = true;
    try {
      const d = await api('/enroll', { method: 'POST', body: fd });
      $('enroll-body').innerHTML = `<h2>Your enrollment application has been submitted</h2><p class="lead">Your payment receipt is waiting for verification by the Spark Security administration team. Once it is approved, check your status for private group instructions.</p><div class="card" style="max-width:560px"><p>Reference number (save it)</p><div class="ref">${esc(d.ref)}</div><p>Course: <strong style="color:var(--tx)">${esc(d.course)}</strong><br>Amount: ${etb(d.amount)}<br>Submitted: ${new Date(d.createdAt).toLocaleDateString('en-GB')}</p><div style="margin-top:14px"><span class="status-p">Pending</span></div></div><div class="row" style="margin-top:24px"><a class="btn btn-p" href="#status">Check status</a><a class="btn btn-o" href="#courses">Back to courses</a></div>`;
    } catch (er) {
      for (const [k, v] of Object.entries(er.fields || {})) { const el = $('e-' + k); if (el) el.textContent = v; }
      $('fmsg').innerHTML = `<div class="alert">${esc(er.message)}</div>`; $('sub').disabled = false;
    }
  });
}

function showStatus() {
  $('status-body').innerHTML = `<a class="crumb" href="#courses">Back to courses</a><h2>Check enrollment status</h2><p class="lead">Enter your reference number and the phone number you registered with.</p><form class="form" id="sf" novalidate>
<div class="fg"><label for="sref">Reference number</label><input id="sref" placeholder="SPK-XXXXXXXXXX" autocomplete="off"></div><div class="fg"><label for="sph">Phone number</label><input id="sph" type="tel" autocomplete="off"></div>
<div id="sres" role="status"></div><button class="btn btn-p" type="submit">Check status</button></form>`;
  $('sf').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const d = await api('/enroll/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: $('sref').value, phone: $('sph').value }) });
      const badge = { pending: '<span class="status-p">Pending verification</span>', approved: '<span class="status-p" style="background:rgba(57,255,20,.1);color:var(--brand)">Approved</span>', rejected: '<span class="status-p" style="background:rgba(255,65,65,.12);color:#FF5555">Rejected</span>' }[d.status];
      $('sres').innerHTML = `<div class="card"><p>${esc(d.course)} · ${etb(d.amount)}</p><div style="margin:10px 0">${badge}</div>${d.status === 'approved' ? `<div class="good">${esc(d.instructions)}</div>` : ''}${d.status === 'rejected' ? `<div class="alert">Reason: ${esc(d.reason)}. You can submit a new application with a corrected receipt.</div>` : ''}${d.status === 'pending' ? '<p>An administrator is verifying your payment. Check back later.</p>' : ''}</div>`;
    } catch (er) { $('sres').innerHTML = `<div class="alert">${esc(er.message)}</div>`; }
  });
}

function route() {
  const h = location.hash.slice(1), m = h.match(/^(course|enroll)-([a-z0-9-]+)$/);
  ['home', 'course', 'enroll', 'status'].forEach((v) => $('v-' + v).classList.remove('on'));
  $('links').classList.remove('open'); $('burger').setAttribute('aria-expanded', 'false');
  if (m) {
    const c = SITE.courses.find((x) => x.slug === m[2]);
    $('v-' + m[1]).classList.add('on');
    if (!c) { $('v-' + m[1]).firstElementChild.firstElementChild.innerHTML = '<a class="crumb" href="#courses">Back to courses</a><div class="empty"><h3>Course not found</h3></div>'; return; }
    m[1] === 'course' ? showCourse(c) : showEnroll(c); window.scrollTo(0, 0);
  } else if (h === 'status') { $('v-status').classList.add('on'); showStatus(); window.scrollTo(0, 0); }
  else { $('v-home').classList.add('on'); if (h && $(h)) setTimeout(() => $(h).scrollIntoView(), 0); }
}
$('burger').onclick = function () { const o = $('links').classList.toggle('open'); this.setAttribute('aria-expanded', o); };
$('cf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: $('cn').value, email: $('ce').value, message: $('cm').value, website: $('cw').value }) });
    $('cmsg').innerHTML = '<div class="good">Thanks. Your message was sent and we will reply by email.</div>'; $('cf').reset();
  } catch (er) { $('cmsg').innerHTML = `<div class="alert">${esc(er.message)}</div>`; }
});
window.addEventListener('hashchange', route);
api('/site').then((d) => { SITE = d; renderHome(); route(); }).catch(() => { $('clist').innerHTML = '<div class="alert" style="grid-column:1/-1">The site could not load. Please refresh.</div>'; });
