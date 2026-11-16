import crypto from 'node:crypto';
import { db, ensureInitialCohorts } from './db.js';
import { hash } from './security.js';

export const DEFAULT_SETTINGS = {
  hero_title: 'Build Your Cybersecurity Skills. Secure the Digital Future.',
  hero_text: 'Learn cybersecurity through practical training, expert mentorship, hands-on exercises, and real-world security knowledge.',
  about_text: 'Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.',
  mission: 'Learn, practice, and grow with a community committed to building a more secure digital world.',
  cta_title: 'Your Cybersecurity Journey Starts Here.',
  cta_text: 'Learn, practice, and grow with a community committed to building a more secure digital world.',
  contact_email: '', contact_phone: '', telegram: '', linkedin: '', github: '', youtube: '',
  footer_text: 'Cybersecurity education and authorized security services.',
  payment_reference: 'Include your phone number in the transfer reference so we can match your payment.',
  group_instructions: 'You will be contacted on Telegram with your private group invitation.',
};
const FAQS = [
  ['What is Spark Security?', 'A cybersecurity education and security services organization focused on practical skills.'],
  ['Who can join the courses?', 'Anyone who meets the prerequisites listed on the course page.'],
  ['Do I need previous cybersecurity knowledge?', 'Not for beginner courses. Each course page lists its prerequisites.'],
  ['How do I enroll in a course?', 'Open a course, choose Enroll, fill in the form, and upload your payment receipt.'],
  ['How do I make payment?', 'Pay by bank transfer or mobile money using the instructions shown on the enrollment page, then upload your receipt.'],
  ['How long does enrollment approval take?', 'An administrator verifies each payment manually. Your status stays Pending until then.'],
  ['How do I access the private learning group?', 'After approval, check your enrollment status for the private group instructions.'],
  ['Are courses practical or theoretical?', 'Practical. Courses include hands-on exercises and feedback.'],
  ['Will I receive mentorship?', 'Courses are instructor-led. Details are on each course page.'],
  ['Will I receive a certificate?', 'Only where a course states that one is offered.'],
  ['Can I enroll in multiple courses?', 'Yes. Submit a separate enrollment for each course.'],
  ['How can I contact Spark Security?', 'Use the contact form or the channels listed in the footer.'],
];

export function seed() {
  const set = db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)');
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) set.run(k, v);

  if (!db.prepare('SELECT 1 FROM admins').get()) {
    const email = (process.env.ADMIN_EMAIL || 'admin@sparksecurity.local').toLowerCase();
    const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url') + 'aA1';
    db.prepare('INSERT INTO admins(email,pass_hash) VALUES(?,?)').run(email, hash(pw));
    console.log(`\n  First admin created.\n  Email:    ${email}\n  Password: ${process.env.ADMIN_PASSWORD ? '(from ADMIN_PASSWORD)' : pw}\n  Change it in Admin > Security after signing in.\n`);
  }
  if (!db.prepare('SELECT 1 FROM faqs').get()) FAQS.forEach(([q, a], i) => db.prepare('INSERT INTO faqs(question,answer,sort) VALUES(?,?,?)').run(q, a, i));
  if (!db.prepare('SELECT 1 FROM payment_methods').get()) {
    db.prepare('INSERT INTO payment_methods(type,bank,holder,number,sort) VALUES(?,?,?,?,?)').run('Bank transfer', 'Placeholder Bank', 'Account holder name', '0000000000', 0);
    db.prepare('INSERT INTO payment_methods(type,holder,number,sort) VALUES(?,?,?,?)').run('Mobile money', 'Account holder name', '09XX XXX XXX', 1);
  }
  if (!db.prepare('SELECT 1 FROM courses').get()) {
    const ins = db.prepare('INSERT INTO courses(slug,title,short,description,level,duration,format,instructor,price,discount,seats,status,objectives,topics,prereqs,audience,language) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    ins.run('web-penetration-testing', 'Web Penetration Testing', 'Find and exploit common web vulnerabilities in a safe lab, then write a professional report.',
      'A hands-on course covering how web applications are attacked and defended. Sample content: edit or replace it in Admin > Courses.', 'Intermediate', '8 weeks',
      'Online, private group with live sessions', 'To be announced', 3000, 2200, 30, 'draft',
      JSON.stringify(['Map the attack surface of a web application', 'Test for injection, broken access control, and authentication flaws', 'Document findings with clear remediation advice']),
      JSON.stringify(['HTTP and web architecture', 'Recon and enumeration', 'OWASP Top 10 in practice', 'Reporting']),
      JSON.stringify(['Basic Linux and networking', 'Comfort with the command line']), JSON.stringify(['Students and junior developers moving into security']), 'en');
    ins.run('cybersecurity-fundamentals', 'Cybersecurity Fundamentals', 'A practical starting point: threats, networks, Linux, and defensive habits.',
      'Sample content: edit or replace it in Admin > Courses.', 'Beginner', '6 weeks', 'Online, private group', 'To be announced', 1500, null, null, 'draft',
      JSON.stringify(['Explain core security concepts', 'Use the Linux terminal confidently']), JSON.stringify(['Threat landscape', 'Networking basics', 'Linux essentials']),
      JSON.stringify(['None']), JSON.stringify(['Anyone new to cybersecurity']), 'en');
  }
  ensureInitialCohorts();
}
