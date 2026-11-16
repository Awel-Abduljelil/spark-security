const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const etb = (n) => Number(n || 0).toLocaleString('en-US') + ' ETB';
const when = (t) => t ? new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const dlg = $('#dlg');
function toast(m, bad) { const t = $('#toast'); t.textContent = m; t.className = 'show' + (bad ? ' err' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = ''), 3200); }
async function api(path, o = {}) {
  const init = { method: o.method || 'GET', headers: { 'X-Requested-With': 'spark' }, credentials: 'same-origin' };
  if (o.body instanceof FormData) init.body = o.body; else if (o.body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(o.body); }
  const r = await fetch('/api/admin' + path, init);
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { login(); throw new Error('Session expired'); }
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}
const act = async (fn, ok) => { try { const r = await fn(); if (ok) toast(ok); return r; } catch (e) { if (e.message !== 'Session expired') toast(e.message, true); } };

// ---------- shell ----------
const PAGES = { dashboard: 'Dashboard', enrollments: 'Enrollments', courses: 'Courses', mentors: 'Mentors', faqs: 'FAQs', payments: 'Payment methods', messages: 'Messages', content: 'Website content', security: 'Security', audit: 'Audit log' };
function login() {
  $('#app').innerHTML = `<div class="login"><a class="logo"><i></i>Spark Security</a><h1 style="margin-top:20px;font-size:1.6rem">Admin sign in</h1><form id="lf" novalidate>
<div class="fg"><label for="em">Email</label><input id="em" type="email" autocomplete="username"></div><div class="fg"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password"></div>
<div class="fg" id="cw" hidden><label for="cd">Authentication code</label><input id="cd" inputmode="numeric" autocomplete="one-time-code"></div><div class="err" id="le"></div><button class="btn btn-p" type="submit">Sign in</button></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault(); $('#le').textContent = '';
    try { await api('/login', { method: 'POST', body: { email: $('#em').value, password: $('#pw').value, code: $('#cd').value } }); boot(); }
    catch (er) { $('#le').textContent = er.message; if (/code/i.test(er.message)) $('#cw').hidden = false; }
  };
}
async function boot() {
  let me; try { me = await api('/me'); } catch { return login(); }
  $('#app').innerHTML = `<div class="shell"><nav class="side-nav"><a class="logo"><i></i>Spark Admin</a>${Object.entries(PAGES).map(([k, v]) => `<a href="#${k}" data-p="${k}">${v}<span id="n-${k}"></span></a>`).join('')}<div class="sp"></div><p class="muted" style="padding:0 8px">${esc(me.email)}</p><button id="out">Sign out</button></nav><main class="main" id="main"></main></div>`;
  $('#out').onclick = async () => { await act(() => api('/logout', { method: 'POST' })); login(); };
  window.onhashchange = render; render();
}
async function render() {
  const p = PAGES[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard';
  document.querySelectorAll('.side-nav a[data-p]').forEach((a) => a.classList.toggle('on', a.dataset.p === p));
  $('#main').innerHTML = '<p class="muted">Loading...</p>';
  await act(() => views[p]($('#main')));
}
const head = (t, extra = '') => `<div class="top"><h1>${t}</h1><div>${extra}</div></div>`;
const tbl = (cols, rows, empty = 'Nothing here yet.') => rows.length ? `<div class="tw"><table><thead><tr>${cols.map((c) => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<div class="empty"><p>${empty}</p></div>`;
const pill = (s) => `<span class="st ${esc(s)}">${esc(s)}</span>`;

// ---------- generic form + CRUD ----------
function formHTML(fields, v) {
  return fields.map((f) => {
    const val = Array.isArray(v[f.k]) ? v[f.k].join('\n') : v[f.k] ?? f.def ?? '';
    const cls = `fg${f.full ? ' full' : ''}`;
    if (f.t === 'check') return `<label class="chk ${f.full ? 'full' : ''}"><input type="checkbox" name="${f.k}" ${val ? 'checked' : ''}><span>${f.l}</span></label>`;
    if (f.t === 'select') return `<div class="${cls}"><label>${f.l}</label><select name="${f.k}">${f.o.map((o) => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
    if (f.t === 'area') return `<div class="${cls}"><label>${f.l}</label><textarea name="${f.k}" rows="${f.rows || 4}">${esc(val)}</textarea>${f.h ? `<small class="muted">${f.h}</small>` : ''}</div>`;
    if (f.t === 'image') return `<div class="${cls}"><label>${f.l}</label><input name="${f.k}" value="${esc(val)}" placeholder="https://... or upload"><input type="file" data-up="${f.k}" accept="image/jpeg,image/png,image/webp"></div>`;
    return `<div class="${cls}"><label>${f.l}</label><input name="${f.k}" type="${f.t || 'text'}" value="${esc(val)}" ${f.min != null ? `min="${f.min}"` : ''}></div>`;
  }).join('');
}
function readForm(form) {
  const o = {};
  form.querySelectorAll('[name]').forEach((el) => (o[el.name] = el.type === 'checkbox' ? el.checked : el.value));
  return o;
}
function wireUploads(form) {
  form.querySelectorAll('[data-up]').forEach((inp) => (inp.onchange = async () => {
    const fd = new FormData(); fd.set('file', inp.files[0]);
    const r = await act(() => api('/upload', { method: 'POST', body: fd }), 'Image uploaded');
    if (r) form.querySelector(`[name=${inp.dataset.up}]`).value = r.url;
  }));
}
function editor(title, fields, v, onSave) {
  dlg.innerHTML = `<h2>${title}</h2><form id="ef" class="fgrid" style="margin-top:14px">${formHTML(fields, v)}<div class="row2 full"><button type="button" class="b" id="cx">Cancel</button><button class="b p" type="submit">Save</button></div></form>`;
  wireUploads(dlg); dlg.showModal();
  $('#cx').onclick = () => dlg.close();
  $('#ef').onsubmit = async (e) => { e.preventDefault(); const r = await act(() => onSave(readForm(e.target)), 'Saved'); if (r) { dlg.close(); render(); } };
}
function crudView(title, ep, fields, cols, blank = {}) {
  return async (el) => {
    const rows = await api(ep);
    el.innerHTML = head(title, '<button class="b p" id="new">Add new</button>') + tbl([...cols, ['', (r) => `<button class="b" data-e="${r.id}">Edit</button> <button class="b d" data-d="${r.id}">Delete</button>`]], rows);
    $('#new').onclick = () => editor('Add ' + title.toLowerCase(), fields, blank, (b) => api(ep, { method: 'POST', body: b }));
    el.querySelectorAll('[data-e]').forEach((b) => (b.onclick = () => { const r = rows.find((x) => x.id == b.dataset.e); editor('Edit', fields, r, (body) => api(`${ep}/${r.id}`, { method: 'PUT', body })); }));
    el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = async () => { if (confirm('Delete this item? This cannot be undone.') && await act(() => api(`${ep}/${b.dataset.d}`, { method: 'DELETE' }), 'Deleted')) render(); }));
  };
}
const yn = (v) => `<span class="st ${v ? 'on' : 'off'}">${v ? 'yes' : 'no'}</span>`;

const courseFields = [
  { k: 'title', l: 'Title' }, { k: 'slug', l: 'Slug (URL)' },
  { k: 'status', l: 'Status', t: 'select', o: ['draft', 'published', 'archived'] }, { k: 'level', l: 'Level', t: 'select', o: ['Beginner', 'Intermediate', 'Advanced'] },
  { k: 'short', l: 'Short description', full: 1 }, { k: 'description', l: 'Full description', t: 'area', rows: 6, full: 1 },
  { k: 'cover', l: 'Cover image', t: 'image', full: 1 },
  { k: 'price', l: 'Original price (ETB)', t: 'number', min: 0 }, { k: 'discount', l: 'Discount price (ETB, optional)', t: 'number', min: 0 },
  { k: 'duration', l: 'Duration' }, { k: 'format', l: 'Delivery format' }, { k: 'instructor', l: 'Instructor' }, { k: 'schedule', l: 'Schedule' },
  { k: 'seats', l: 'Max students (optional)', t: 'number', min: 1 }, { k: 'deadline', l: 'Enrollment deadline', t: 'date' },
  { k: 'enrollment_open', l: 'Enrollment open', t: 'check', def: 1, full: 1 },
  { k: 'objectives', l: 'Learning objectives', t: 'area', h: 'One per line', full: 1 }, { k: 'topics', l: 'Curriculum / topics', t: 'area', h: 'One per line', full: 1 },
  { k: 'prereqs', l: 'Prerequisites', t: 'area', h: 'One per line', full: 1 }, { k: 'audience', l: 'Target audience', t: 'area', h: 'One per line', full: 1 },
];
const views = {
  async dashboard(el) {
    const d = await api('/dashboard');
    const S = (n, l) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`;
    el.innerHTML = head('Dashboard') + `<div class="stats">${S(d.published, 'Published courses')}${S(d.drafts, 'Draft courses')}${S(d.total, 'Applications')}${S(d.pending, 'Pending')}${S(d.approved, 'Approved')}${S(d.rejected, 'Rejected')}${S(etb(d.revenue), 'Verified revenue')}${S(d.unread, 'Unread messages')}</div><h2 style="margin-bottom:12px">Recent activity</h2>` +
      tbl([['When', (r) => when(r.created_at)], ['Admin', (r) => esc(r.email)], ['Action', (r) => esc(r.action)], ['Detail', (r) => esc(r.entity || r.detail || '')]], d.activity);
  },
  async enrollments(el) {
    const st = { status: '', q: '', course: '', page: 1 };
    const courses = await api('/courses');
    const load = async () => {
      const d = await api('/enrollments?' + new URLSearchParams(st));
      $('#etb').innerHTML = tbl([['Ref', (r) => `<span class="mono" style="font-family:var(--mf)">${esc(r.ref)}</span>`], ['Student', (r) => `${esc(r.full_name)}<br><span class="muted">@${esc(r.username)} · TG @${esc(r.telegram)}</span>`], ['Phone', (r) => esc(r.phone)], ['Course', (r) => esc(r.course)], ['Amount', (r) => etb(r.amount)], ['Applied', (r) => when(r.created_at)], ['Status', (r) => pill(r.status)], ['', (r) => `<button class="b" data-v="${r.id}">Review</button>`]], d.items, 'No applications match.') +
        `<div class="tools" style="margin-top:14px;align-items:center"><button class="b" id="pv" ${d.page <= 1 ? 'disabled' : ''}>Previous</button><span class="muted">Page ${d.page} of ${d.pages} · ${d.total} total</span><button class="b" id="nx" ${d.page >= d.pages ? 'disabled' : ''}>Next</button></div>`;
      $('#pv').onclick = () => { st.page--; load(); }; $('#nx').onclick = () => { st.page++; load(); };
      el.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => review(b.dataset.v, load)));
    };
    el.innerHTML = head('Enrollments') + `<div class="tools"><input id="q" placeholder="Search name, phone, ref, username"><select id="fs"><option value="">All statuses</option><option>pending</option><option>approved</option><option>rejected</option></select><select id="fc"><option value="">All courses</option>${courses.map((c) => `<option value="${esc(c.slug)}">${esc(c.title)}</option>`).join('')}</select></div><div id="etb"></div>`;
    let t; $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; st.page = 1; load(); }, 300); };
    $('#fs').onchange = (e) => { st.status = e.target.value; st.page = 1; load(); }; $('#fc').onchange = (e) => { st.course = e.target.value; st.page = 1; load(); };
    await load();
  },
  courses: crudView('Courses', '/courses', courseFields, [['Title', (r) => `<b>${esc(r.title)}</b><br><span class="muted">/${esc(r.slug)}</span>`], ['Status', (r) => pill(r.status)], ['Price', (r) => r.discount ? `<s class="muted">${etb(r.price)}</s> ${etb(r.discount)}` : etb(r.price)], ['Enrollment', (r) => yn(r.enrollment_open)]], { status: 'draft', level: 'Beginner', enrollment_open: 1 }),
  mentors: crudView('Mentors', '/mentors', [
    { k: 'name', l: 'Full name' }, { k: 'role', l: 'Professional role' }, { k: 'bio', l: 'Biography', t: 'area', full: 1 }, { k: 'photo', l: 'Photo', t: 'image', full: 1 },
    { k: 'specialties', l: 'Specialties', t: 'area', h: 'One per line', full: 1 }, { k: 'achievements', l: 'Verified experience and achievements', t: 'area', h: 'One per line. Real achievements only.', full: 1 },
    { k: 'linkedin', l: 'LinkedIn URL' }, { k: 'github', l: 'GitHub URL' }, { k: 'sort', l: 'Order', t: 'number' }, { k: 'published', l: 'Published', t: 'check' }],
    [['Name', (r) => `<b>${esc(r.name)}</b><br><span class="muted">${esc(r.role)}</span>`], ['Published', (r) => yn(r.published)], ['Order', (r) => r.sort ?? 0]],
    { sort: 0, published: 0, specialties: [], achievements: [] }),
  faqs: crudView('FAQs', '/faqs', [{ k: 'question', l: 'Question', full: 1 }, { k: 'answer', l: 'Answer', t: 'area', full: 1 }, { k: 'sort', l: 'Order (lower first)', t: 'number' }, { k: 'published', l: 'Published', t: 'check', def: 1 }],
    [['Question', (r) => esc(r.question)], ['Published', (r) => yn(r.published)], ['Order', (r) => r.sort ?? 0]], { published: 1 }),
  payments: crudView('Payment methods', '/payment-methods', [{ k: 'type', l: 'Method (e.g. Bank transfer, Mobile money)' }, { k: 'bank', l: 'Bank name (optional)' }, { k: 'holder', l: 'Account holder' }, { k: 'number', l: 'Account or phone number' }, { k: 'notes', l: 'Notes', full: 1 }, { k: 'sort', l: 'Order', t: 'number' }, { k: 'active', l: 'Shown to students', t: 'check', def: 1 }],
    [['Method', (r) => `<b>${esc(r.type)}</b>${r.bank ? `<br><span class="muted">${esc(r.bank)}</span>` : ''}`], ['Holder', (r) => esc(r.holder)], ['Number', (r) => esc(r.number)], ['Active', (r) => yn(r.active)]], { active: 1 }),
  async messages(el) {
    const m = await api('/messages');
    el.innerHTML = head('Messages') + (m.map((x) => `<div class="msg ${x.read ? '' : 'unread'}"><b>${esc(x.name)}</b> <a href="mailto:${esc(x.email)}">${esc(x.email)}</a> <span class="muted">${when(x.created_at)}</span><p style="white-space:pre-wrap;margin:8px 0">${esc(x.body)}</p>${x.read ? '' : `<button class="b" data-r="${x.id}">Mark read</button> `}<button class="b d" data-x="${x.id}">Delete</button></div>`).join('') || '<div class="empty"><p>No messages yet.</p></div>');
    el.querySelectorAll('[data-r]').forEach((b) => (b.onclick = async () => { await act(() => api(`/messages/${b.dataset.r}/read`, { method: 'PUT' })); render(); }));
    el.querySelectorAll('[data-x]').forEach((b) => (b.onclick = async () => { if (confirm('Delete message?')) { await act(() => api(`/messages/${b.dataset.x}`, { method: 'DELETE' })); render(); } }));
  },
  async content(el) {
    const s = await api('/settings');
    const F = (k, l, t = '') => ({ k, l, t, full: 1 });
    const fields = [F('hero_title', 'Hero headline'), F('hero_text', 'Hero description', 'area'), F('about_text', 'About section', 'area'), F('mission', 'Mission statement', 'area'), F('cta_title', 'Final call-to-action title'), F('cta_text', 'Final call-to-action text', 'area'),
      F('contact_email', 'Contact email'), F('contact_phone', 'Contact phone'), F('telegram', 'Telegram username'), F('linkedin', 'LinkedIn URL'), F('github', 'GitHub URL'), F('youtube', 'YouTube URL'), F('footer_text', 'Footer text'),
      F('payment_reference', 'Payment reference instruction (shown on the enrollment page)', 'area'), F('group_instructions', 'Default private-group instructions (shown only to approved students)', 'area')];
    el.innerHTML = head('Website content') + `<form id="cf" class="fgrid">${formHTML(fields, s)}<div class="row2 full"><button class="b p">Save changes</button></div></form>`;
    $('#cf').onsubmit = async (e) => { e.preventDefault(); await act(() => api('/settings', { method: 'PUT', body: readForm(e.target) }), 'Saved. Changes are live.'); };
  },
  async security(el) {
    const me = await api('/me');
    el.innerHTML = head('Security') + `<div class="sec"><section><h2>Change password</h2><form id="pf" class="form" style="margin-top:12px"><div class="fg"><label>Current password</label><input name="current" type="password" autocomplete="current-password"></div><div class="fg"><label>New password</label><input name="next" type="password" autocomplete="new-password"></div><div class="fg"><label>Confirm new password</label><input name="confirm" type="password" autocomplete="new-password"></div><p class="muted">At least 10 characters with upper case, lower case, and a number. Other sessions are signed out after a change.</p><button class="b p">Update password</button></form></section>
<section><h2>Two-factor authentication</h2><p class="muted" style="margin:8px 0">Status: <b>${me.totp ? 'enabled' : 'off'}</b>. Use any authenticator app (Google Authenticator, Authy, 1Password).</p><div id="tf">${me.totp ? '<div class="fg"><label>Confirm with password to disable</label><input id="dp" type="password"></div><button class="b d" id="td" style="margin-top:10px">Disable 2FA</button>' : '<button class="b p" id="ts">Set up 2FA</button>'}</div></section></div>`;
    $('#pf').onsubmit = async (e) => { e.preventDefault(); if (await act(() => api('/password', { method: 'POST', body: readForm(e.target) }), 'Password updated')) e.target.reset(); };
    if ($('#ts')) $('#ts').onclick = async () => {
      const r = await act(() => api('/2fa/setup', { method: 'POST' })); if (!r) return;
      $('#tf').innerHTML = `<p class="muted">Add this key to your authenticator app, then enter the 6-digit code.</p><p class="mono" style="font-family:var(--mf);color:var(--brand);word-break:break-all;margin:10px 0">${esc(r.secret)}</p><p class="muted" style="word-break:break-all">${esc(r.uri)}</p><div class="fg" style="margin-top:10px"><label>Code</label><input id="tc" inputmode="numeric"></div><button class="b p" id="te" style="margin-top:10px">Enable</button>`;
      $('#te').onclick = async () => { if (await act(() => api('/2fa/enable', { method: 'POST', body: { code: $('#tc').value } }), '2FA enabled')) render(); };
    };
    if ($('#td')) $('#td').onclick = async () => { if (await act(() => api('/2fa/disable', { method: 'POST', body: { password: $('#dp').value } }), '2FA disabled')) render(); };
  },
  async audit(el) {
    const a = await api('/audit');
    el.innerHTML = head('Audit log') + tbl([['When', (r) => when(r.created_at)], ['Admin', (r) => esc(r.email)], ['Action', (r) => esc(r.action)], ['Entity', (r) => esc(r.entity || '')], ['Detail', (r) => esc(r.detail || '')], ['IP', (r) => esc(r.ip)]], a);
  },
};

async function review(id, done) {
  const e = await act(() => api('/enrollments/' + id)); if (!e) return;
  dlg.innerHTML = `<h2>${esc(e.full_name)} ${pill(e.status)}</h2><dl class="kv"><dt>Reference</dt><dd>${esc(e.ref)}</dd><dt>Course</dt><dd>${esc(e.course)}</dd><dt>Amount due</dt><dd>${etb(e.amount)}</dd><dt>Username</dt><dd>@${esc(e.username)}</dd><dt>Phone</dt><dd>${esc(e.phone)}</dd><dt>Telegram</dt><dd>@${esc(e.telegram)}</dd><dt>Applied</dt><dd>${when(e.created_at)}</dd>${e.reject_reason ? `<dt>Rejected for</dt><dd>${esc(e.reject_reason)}</dd>` : ''}</dl>
<h3 style="font-size:1rem">Payment receipt</h3><div id="rc" class="muted">${e.receipt_type === 'link' ? `<a href="${esc(e.receipt_link)}" target="_blank" rel="noopener noreferrer">${esc(e.receipt_link)}</a> <span class="muted">(external link, open with care)</span>` : 'Loading...'}</div>
<div class="fg" style="margin-top:16px"><label>Internal note</label><textarea id="nt" rows="2">${esc(e.admin_note)}</textarea></div><button class="b" id="sn" style="margin-top:8px">Save note</button>
${e.status === 'pending' ? `<div class="fg" style="margin-top:16px"><label>Access note for the student (shown after approval, e.g. private group link)</label><input id="an" placeholder="Leave blank to use the default instructions"></div>` : ''}
${e.history.length ? `<h3 style="font-size:1rem;margin-top:16px">History</h3><ul class="muted">${e.history.map((h) => `<li>${when(h.created_at)}: ${esc(h.action)} by ${esc(h.email)}${h.detail ? ` (${esc(h.detail)})` : ''}</li>`).join('')}</ul>` : ''}
<div class="row2"><button class="b" id="cl">Close</button>${e.status === 'pending' ? '<button class="b d" id="rjb">Reject and permanently delete</button><button class="b p" id="apb">Approve payment</button>' : ''}</div>`;
  dlg.showModal();
  if (e.receipt_type === 'upload') {
    fetch(`/api/admin/enrollments/${id}/receipt`, { credentials: 'same-origin' }).then(async (r) => {
      if (!r.ok) return ($('#rc').textContent = 'Receipt file not available.');
      const b = await r.blob(), u = URL.createObjectURL(b);
      $('#rc').innerHTML = b.type === 'application/pdf' ? `<a href="${u}" target="_blank" rel="noopener">Open PDF receipt</a>` : `<img class="rimg" src="${u}" alt="Payment receipt">`;
    });
  }
  $('#cl').onclick = () => { dlg.close(); done(); };
  $('#sn').onclick = () => act(() => api(`/enrollments/${id}/note`, { method: 'PUT', body: { note: $('#nt').value } }), 'Note saved');
  const decide = async (decision) => { if (await act(() => api(`/enrollments/${id}/decision`, { method: 'POST', body: { decision, accessNote: $('#an')?.value } }), decision === 'approve' ? 'Payment approved' : 'Application rejected and permanently deleted')) { dlg.close(); done(); } };
  if ($('#apb')) { $('#apb').onclick = () => confirm('Approve this payment? Confirm you verified the receipt.') && decide('approve'); $('#rjb').onclick = () => confirm(`Reject ${e.full_name} and permanently delete this application and its uploaded receipt? This cannot be undone.`) && decide('reject'); }
}
boot();
