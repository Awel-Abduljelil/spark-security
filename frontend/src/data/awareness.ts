import type { Faq } from "../types/faq";
import type { Threat } from "../types/awareness";

export const threats: Threat[] = [
  {
    slug: "phishing",
    title: "Phishing messages and fake links",
    summary:
      "A scammer pretends to be a trusted sender and asks you to click a link or log in quickly.",
    example:
      "A message looks like it came from your bank and says your account is blocked, asking you to click a link to 'fix' it.",
    redFlags: [
      "It creates urgency or fear.",
      "The sender asks you to log in from a link you did not expect.",
      "The message uses poor grammar or odd wording.",
    ],
    whatToDo: [
      "Open the official app or website yourself instead of tapping a link in the message.",
      "Check the sender name and contact details before replying.",
      "If unsure, ignore it and confirm through the official channel.",
    ],
  },
  {
    slug: "telegram-social-media",
    title: "Telegram and social media scams",
    summary:
      "Scammers pose as admin staff, friends, or business contacts and ask for money or account access.",
    example:
      "A Telegram account pretending to be your group admin asks members to send payment for a 'new fee' or to share a code.",
    redFlags: [
      "The account name looks almost the same as a real one.",
      "The person asks you to act fast and keeps changing the story.",
      "They ask for payment, OTP codes, or private information.",
    ],
    whatToDo: [
      "Verify the identity of the person through a trusted contact method.",
      "Do not share private codes or login details in chat.",
      "Report the account and warn your group or contacts.",
    ],
  },
  {
    slug: "mobile-money-fraud",
    title: "Mobile money fraud",
    summary:
      "Attackers may ask you to approve a payment, receive a fake refund, or help with a 'cancelled transfer'.",
    example:
      "You receive a fake Telebirr or bank SMS saying you were paid too much and must send part of it back immediately.",
    redFlags: [
      "The message asks you to send money back before checking.",
      "It sounds like a refund, prize, or reward is being processed.",
      "The sender insists on secrecy or asks you to keep it private.",
    ],
    whatToDo: [
      "Stop and contact your bank or mobile money provider using their official number or app.",
      "Do not send money or code numbers to anyone who contacted you unexpectedly.",
      "Check transaction history for unusual charges right away.",
    ],
  },
  {
    slug: "job-scholarship-offers",
    title: "Fake job and scholarship offers",
    summary:
      "Scammers promise jobs, internships, or scholarships and ask for a payment before you start.",
    example:
      "A message says you were selected for a scholarship and only need to pay a 'processing fee' to receive it.",
    redFlags: [
      "They ask for money before you have a real interview or offer.",
      "The email or chat does not match a real organization.",
      "They promise quick approval with no proper documents or process.",
    ],
    whatToDo: [
      "Ask for a real company or school contact and check their official website.",
      "Never pay a fee for a job or scholarship without proper verification.",
      "Look for official email addresses, documents, and a public contact method.",
    ],
  },
  {
    slug: "weak-passwords",
    title: "Weak and reused passwords",
    summary:
      "If one account is weak, a scammer may use it to get into your email, banking app, or social media.",
    example:
      "A reused password from one app is used again on a work or school account, making it easier for attackers to take over more than one account.",
    redFlags: [
      "The same password is used across multiple apps.",
      "A password is short, personal, or easy to guess.",
      "You keep resetting your password after login issues.",
    ],
    whatToDo: [
      "Use a password manager to create unique passwords for each account.",
      "Turn on two-step verification where available.",
      "Change any reused passwords that are still in use.",
    ],
  },
  {
    slug: "account-takeover",
    title: "Account takeover",
    summary:
      "Once attackers get access to an email or social account, they can impersonate you or reset other accounts.",
    example:
      "A scammer gets into your email and uses it to send fake messages to friends asking for money or asking them to click a link.",
    redFlags: [
      "You get alerts for logins you did not make.",
      "Your contacts receive strange messages from your account.",
      "You suddenly cannot log in or your password was changed without your action.",
    ],
    whatToDo: [
      "Log out of all sessions and change your password right away.",
      "Check the account recovery email and security settings.",
      "Tell your contacts that your account may have been compromised.",
    ],
  },
  {
    slug: "malware-and-apks",
    title: "Malware, cracked apps, and unknown APKs",
    summary:
      "Unknown apps and modified files can give attackers access to messages, contacts, and money apps.",
    example:
      "An APK or cracked app promises a free version of a popular app but installs software that steals information from your phone.",
    redFlags: [
      "The app comes from a random website or unofficial source.",
      "It asks for unnecessary permissions or access.",
      "Your phone slows down or shows pop-ups after installation.",
    ],
    whatToDo: [
      "Only install apps from official stores and verified sources.",
      "Remove unknown apps and check device permissions.",
      "Update your apps and phone operating system regularly.",
    ],
  },
  {
    slug: "public-wifi-sim-swap",
    title: "Public Wi-Fi and SIM swap",
    summary:
      "Open networks and account recovery tricks can leave you exposed to scammers or identity theft.",
    example:
      "Someone calls, says they are from the telecom operator, and convinces you to move your number to a new SIM while you are on public Wi-Fi.",
    redFlags: [
      "A caller asks you to share a one-time code or SIM activation status.",
      "The network is public and you are asked to log in to a site that does not look official.",
      "You receive an unexpected change in your mobile signal or account status.",
    ],
    whatToDo: [
      "Avoid logging into sensitive accounts on public Wi-Fi unless needed.",
      "Never share OTP codes with a caller or message.",
      "Contact your telecom provider if you suspect your SIM was changed or your account was altered.",
    ],
  },
];

export const checklist = [
  "Use two-step verification on your important accounts.",
  "Keep a password manager and use unique passwords for each account.",
  "Update your phone, apps, and browser as soon as new versions arrive.",
  "Never share a one-time password or OTP code with anyone.",
  "Check the full website address before entering your username or password.",
  "Do not click links in unexpected SMS, chat, or email messages.",
  "Verify a request by calling or messaging the real business or person.",
  "Keep your phone contacts and bank details in a trusted, known place.",
  "Be careful with public Wi-Fi and avoid sensitive logins on shared networks.",
  "If a deal looks too good to be true, treat it as suspicious.",
];

export const redFlags = [
  { title: "Urgent payment or action", line: "The sender says you must move money or confirm a payment immediately." },
  { title: "Too good to be true", line: "A job, prize, or scholarship sounds unusually easy or generous." },
  { title: "Unexpected link", line: "A message tells you to click a link instead of using the official app or website." },
  { title: "Requests for codes", line: "Someone asks for your OTP, PIN, or login code, even if they claim to be a helper." },
  { title: "Mismatched sender", line: "The sender name is close to a real one but not quite the same." },
  { title: "Pressure and secrecy", line: "The message says to keep it quiet and not ask others for help." },
];

export const recoverySteps = [
  "Pause contact: stop replying to the sender and do not send any more codes or payment.",
  "Secure your accounts: change passwords, sign out from other devices, and turn on two-step verification.",
  "Contact your bank or mobile money provider: ask them to review the account and freeze or flag unusual activity.",
  "Check your phone: remove suspicious apps, review permissions, and update your software.",
  "Report it: tell the relevant authorities and warn your family, coworkers, or business contacts if needed.",
];

export const myths = [
  {
    myth: "If a message looks official, it is safe.",
    fact: "Scammers often copy logos, names, and wording very closely. Always verify using a trusted channel before acting.",
  },
  {
    myth: "Only people who click big links get scammed.",
    fact: "Scammers also use fake WhatsApp, Telegram, SMS, calls, and social media messages that do not require a large click.",
  },
  {
    myth: "If I share an OTP once, it is not a big problem.",
    fact: "A one-time code is meant to show identity. Sharing it can let someone access your account.",
  },
  {
    myth: "A fake job or scholarship offer is harmless if I do not pay anything.",
    fact: "Even without a payment, a scam can still try to collect your personal information or trick you into giving access to accounts.",
  },
  {
    myth: "Using only one strong password is enough for everything.",
    fact: "A strong password helps, but using a unique password for each important account is much safer.",
  },
];

export const faqs: Faq[] = [
  {
    q: "What should I do if I receive a payment or refund message that I did not expect?",
    a: "Stop. Do not click any link or send money back. Open your official banking or mobile money app yourself, or contact the provider using a trusted number or app. Confirm the transaction there before doing anything else.",
  },
  {
    q: "How can I tell if a message is really from my bank or a service I use?",
    a: "Check the sender name, compare it with previous messages, and use the official app or website directly. Real companies usually do not ask you to share one-time codes or passwords in chat.",
  },
  {
    q: "Is a public Wi‑Fi network safe to use for my bank app?",
    a: "Public Wi‑Fi is convenient, but it is never the safest option for banking or private accounts. If you must use it, avoid logging into sensitive accounts and use a trusted connection when possible.",
  },
  {
    q: "Do I need a password manager?",
    a: "Yes, if you have more than a few online accounts. A password manager helps you keep unique passwords without memorizing them all, which reduces the risk of one compromised account affecting others.",
  },
  {
    q: "What if my account was already taken over?",
    a: "Change the password immediately, sign out of other devices if possible, and check your email or app security settings. Then contact your bank, telecom provider, or the relevant service and report the incident.",
  },
];
