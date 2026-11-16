import type { Language } from "./language";

type TranslationTable = Record<string, string>;

const oromo: TranslationTable = {
  Home: "Mana",
  Courses: "Koorsii",
  Mentorship: "Gorsaa",
  Mentors: "Gorsitoota",
  About: "Waa'ee",
  Awareness: "Hubannoo",
  Contact: "Nu qunnamaa",
  Enroll: "Galmaa'i",
  "Primary navigation": "Navigeeshinii jalqabaa",
  "Footer navigation": "Navigeeshinii jalaa",
  "Learn • Secure • Innovate": "Baradhu • Eegi • Kalaqi",
  "Learn • Secure • Innovate ": "Baradhu • Eegi • Kalaqi ",
  "Explore Courses": "Koorsii qoradhu",
  "Discover Our Mission": "Kaayyoo keenya baru",
  "Welcome to": "Baga nagaan dhuftan",
  "A growing cybersecurity community, built for what comes next. Learn through practical courses, expert mentorship, and responsible hands-on practice.":
    "Hawaasa nageenya saayibarii guddachaa jiru. Koorsii hojii irra ooluu, gorsa ogeessotaa fi shaakala itti gaafatamummaa qabuun baradhaa.",
  "A hooded hacker using a laptop in a green digital room":
    "Hakerii hoodii uffatee kutaa dijitaalaa magariisaa keessatti laaptoppii fayyadamu",
  "More than a course. A community.": "Koorsii qofa miti. Hawaasa.",
  "Practical cybersecurity courses": "Koorsii nageenya saayibarii hojii irra ooluu",
  "Build real foundations through approachable, hands-on learning paths.":
    "Karaa barnootaa salphaa fi shaakala qabuun bu'uura cimaa ijaaraa.",
  "Mentorship and guidance": "Gorsa fi qajeelfama",
  "Learn with support from experienced practitioners and instructors.":
    "Ogeessotaa fi barsiisota muuxannoo qaban waliin baradhaa.",
  "A community that learns together": "Hawaasa waliin baratu",
  "Share ideas, practice responsibly, and grow alongside other learners.":
    "Yaada wal jijjiiraa, itti gaafatamummaan shaakalaa, barattoota biroo waliin guddadhaa.",
  "Security with purpose": "Nageenya kaayyoo qabu",
  "Build the skills and mindset to help make digital spaces safer.":
    "Iddoowwan dijitaalaa nageenya akka qabaatan dandeettii fi ilaalcha ijaaraa.",
  "Our mission": "Kaayyoo keenya",
  "Build skilled cybersecurity professionals.":
    "Ogeessota nageenya saayibarii dandeettii qaban ijaaruu.",
  "We go beyond the tools. Spark Security helps people grow practical skills, make responsible choices, and contribute to a safer digital world.":
    "Meeshaalee qofa bira darbu. Spark Security dandeettii hojii irra ooluu guddisuu, murtii itti gaafatamummaa qabu kennuu fi addunyaa dijitaalaa nageenya qabu ijaaruuf nama gargaara.",
  "About Spark Security": "Waa'ee Spark Security",
  "Education & training": "Barnootaa fi leenjii",
  "Learn at your own pace.": "Saffisa mataa keetiin baradhu.",
  "Mentorship & guidance": "Gorsa fi qajeelfama",
  "Grow with the community.": "Hawaasa waliin guddadhu.",
  "Responsible practice": "Shaakala itti gaafatamummaa qabu",
  "Build skills the right way.": "Karaa sirrii dandeettii ijaari.",
  "A simple, guided route from first principles to confident practice.":
    "Bu'uura irraa kaasee hanga shaakala ofitti amanamummaatti karaa salphaa fi qajeelfama qabu.",
  "Start exploring": "Qorachuu jalqabi",
  "A path for every curious mind.": "Nama fedhii qabu hundaaf karaa barnootaa.",
  "Short, focused courses to help you build real understanding.":
    "Hubannoo dhugaa akka ijaarrattuuf koorsii gabaabaa fi xiyyeeffannoo qabu.",
  "See all courses": "Koorsii hunda ilaali",
  "Skills covered": "Dandeettiilee hammataman",
  "Course details": "Bal'ina koorsii",
  sessions: "leenjii",
  labs: "shaakala laaboraatorii",
  "View course": "Koorsii ilaali",
  "Knowledge is your first defense": "Beekumsi eegumsa kee isa jalqabaati",
  "A safer digital world starts with awareness.":
    "Addunyaan dijitaalaa nageenya qabu hubannoo irraa jalqaba.",
  "Explore practical guidance for spotting risks and protecting yourself online.":
    "Balaa adda baasuufi of toora interneetii irratti eeguuf gorsa hojii irra ooluu qoradhu.",
  "Visit awareness center": "Giddugala hubannoo daawwadhu",
  "Learn to secure, not to harm. All techniques must be used legally and only on systems you own or have explicit authorization to test.":
    "Miidhuuf osoo hin taane eeguuf baradhu. Mala hunda seeraan, sirna kan kee ta'e ykn hayyama ifa ta'e qabdu irratti qofa fayyadami.",
  "Good questions": "Gaaffilee gaarii",
  "Frequently asked.": "Gaaffilee yeroo baay'ee gaafataman.",
  "Do I need prior security experience?": "Muuxannoo nageenyaa duraanii nan barbaadaa?",
  "No. The learning path starts with core concepts and introduces technical material step by step.":
    "Lakki. Karaan barnootaa yaad-rimeewwan bu'uuraa irraa jalqaba; mata-duree teeknikaas tarkaanfiidhaan dhiyeessa.",
  "Are the practical exercises safe?": "Shaakala hojii irra ooluu nageenya qabaa?",
  "Exercises are designed for controlled learning environments. Only test systems you own or have explicit permission to assess.":
    "Shaakala kanaaf naannoo barnootaa to'atame qophaa'eera. Sirna kan kee ta'e ykn hayyama ifa ta'e qabdu qofa qoradhu.",
  "What do I need to get started?": "Jalqabuuf maal na barbaachisa?",
  "A computer, an internet connection, and curiosity are enough to begin with the introductory material.":
    "Kompiitara, interneetii fi fedhiin barachuu mata-duree jalqabaa irratti eegaluuf ni ga'u.",
  "Can I learn at my own pace?": "Saffisa mataa kootiin barachuu nan danda'aa?",
  "Yes. Work through the lessons and practice activities at a pace that suits your schedule.":
    "Eeyyee. Sagantaa kee wajjin walsimsiisuun barnootaa fi shaakala hordofi.",
  "Together for a": "Waliin taanee",
  "more secure digital world.": "addunyaa dijitaalaa nageenya qabu ijaarra.",
  "Get Started": "Jalqabi",
  "Join a community that learns, builds, and protects.":
    "Hawaasa baratu, ijaaru fi eegu waliin makami.",
  "About Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.":
    "Spark Security dhaabbata barnoota nageenya saayibarii fi tajaajila nageenyaa kennu yoo ta'u, dandeettii hojii irra ooluu guddisuu fi dhaabbileen nageenya dijitaalaa isaanii akka cimsan gargaara.",
  Education: "Barnoota",
  "Structured cybersecurity courses and practical learning.":
    "Koorsii nageenya saayibarii sirna qabu fi barnoota hojii irra ooluu.",
  Community: "Hawaasa",
  "Mentors, instructors, collaboration, and knowledge sharing.":
    "Gorsitoota, barsiisota, tumsa fi beekumsa wal jijjiiruu.",
  "Security services": "Tajaajila nageenyaa",
  "Authorized penetration testing, vulnerability assessments, and security consulting.":
    "Qorannoo seenuu hayyamame, madaallii hanqina nageenyaa fi gorsa nageenyaa.",
  "Our approach": "Mala keenya",
  "We teach through hands-on exercises in controlled labs, with instructor feedback. All security testing is performed only with proper authorization.":
    "Shaakala hojii irra ooluu laaboraatorii to'atame keessatti barsiisota irraa yaada argachuun barsiisna. Qorannoon nageenyaa hayyama sirrii qofa irratti raawwatama.",
  "Explore courses": "Koorsii qoradhu",
  "contact us": "nu qunnamaa",
  "Mentors and instructors": "Gorsitoota fi barsiisota",
  "Learn from practitioners who guide you through the labs and give feedback.":
    "Ogeessota laaboraatorii keessatti si qajeelchanii yaada kennan irraa baradhu.",
  "Mentor profiles are coming soon": "Ibsi gorsitootaa dhiheenyatti ni dhufa",
  "Real photos and biographies will appear here once they are published. Want to teach?":
    "Suuraawwan fi seenaaleen gorsitootaa yeroo maxxanfaman asitti mul'atu. Barsiisuu barbaaddaa?",
  "Get in touch": "Nu qunnamaa",
  "Contact us": "Nu qunnamaa",
  "Questions about courses, enrollment, or a security assessment? Send a message.":
    "Waa'ee koorsii, galmee ykn madaallii nageenyaa gaaffii qabdaa? Ergaa nuuf ergi.",
  Name: "Maqaa",
  Email: "Imeelii",
  Message: "Ergaa",
  "Enter your name.": "Maqaa kee galchi.",
  "Enter a valid email address.": "Teessoo imeelii sirrii galchi.",
  "Write at least 10 characters.": "Yoo xiqqaate qubee 10 barreessi.",
  "Send message": "Ergaa ergi",
  "Messaging is not set up yet. Add the contact email in src/data/siteConfig.ts.":
    "Ergaan ammaaf hin qophoofne. Imeelii qunnamtii src/data/siteConfig.ts keessatti dabali.",
  "Your email app should open with the message ready to send.":
    "Appiin imeelii kee ergaa erguuf qophaa'e bani.",
  "Other ways to reach us": "Karaa biraa nu qunnamuu",
  "Contact channels will be listed here.": "Karaaleen qunnamtii asitti tarreeffamu.",
  "Security testing is performed only with proper written authorization.":
    "Qorannoon nageenyaa hayyama barreeffamaa sirrii qofaan raawwatama.",
  "Join a cohort": "Garee barattootaa waliin makami",
  "Enroll in a course": "Koorsii irratti galmaa'i",
  "Reserve your place by completing payment and sending us your receipt.":
    "Kaffaltii raawwachuun nagahee nuuf erguudhaan bakka kee mirkaneessi.",
  "Courses are temporarily unavailable. Please try again later.":
    "Koorsiin yeroo ammaa hin argamu. Maaloo booda irra deebi'ii yaali.",
  "Loading course...": "Koorsii fe'aa jira...",
  "Course temporarily unavailable": "Koorsiin yeroo ammaa hin argamu",
  "We could not load this course right now. Please try again later.":
    "Amma koorsii kana fe'uu hin dandeenye. Maaloo booda irra deebi'ii yaali.",
  "Course not found": "Koorsiin hin argamne",
  "Browse courses": "Koorsii sakatta'i",
  "Top threats to watch for": "Balaawwan gurguddoo of eeggannoo barbaadan",
  "Most common risks": "Balaawwan yeroo baay'ee mul'atan",
  "View details": "Bal'ina ilaali",
  "Close threat details": "Bal'ina balaa cufi",
  "Red flags": "Mallattoolee akeekkachiisaa",
  "What to do": "Maal gochuu qabda",
  "Myth vs fact": "Yaada dogoggoraa fi dhugaa",
  "Straight answers": "Deebii ifa ta'e",
  Myth: "Yaada dogoggoraa",
  Fact: "Dhugaa",
  "Close myth and fact": "Yaada dogoggoraa fi dhugaa cufi",
  "Your next steps": "Tarkaanfiiwwan itti aanan",
  "How to enroll": "Akkaataa galmee",
  Pay: "Kaffali",
  "Submit your receipt": "Nagahee kee ergi",
  "Get your Telegram invite": "Affeerraa Telegram kee fudhadhu",
  "Payment instructions": "Qajeelfama kaffaltii",
  "Bank transfer": "Kaffaltii baankii",
  "Mobile money": "Maallaqa bilbilaa",
  "Full name": "Maqaa guutuu",
  Phone: "Bilbila",
  "Telegram username": "Maqaa fayyadamaa Telegram",
  Course: "Koorsii",
  "Choose a course": "Koorsii filadhu",
  "Payment receipt": "Nagahee kaffaltii",
  "Upload file": "Faayilii olkaa'i",
  "Paste link": "Geessituu maxxansi",
  "Submit enrollment": "Galmee ergi",
};

const amharic: TranslationTable = {
  Home: "መነሻ",
  Courses: "ኮርሶች",
  Mentorship: "አማክር",
  Mentors: "አማካሪዎች",
  About: "ስለ እኛ",
  Awareness: "ግንዛቤ",
  Contact: "ያግኙን",
  Enroll: "ይመዝገቡ",
  "Primary navigation": "ዋና ማውጫ",
  "Footer navigation": "የግርጌ ማውጫ",
  "Learn • Secure • Innovate": "ተማር • ጠብቅ • ፍጠር",
  "Learn • Secure • Innovate ": "ተማር • ጠብቅ • ፍጠር ",
  "Explore Courses": "ኮርሶችን ይመልከቱ",
  "Discover Our Mission": "ተልዕኮአችንን ይወቁ",
  "Welcome to": "እንኳን ወደ",
  "A growing cybersecurity community, built for what comes next. Learn through practical courses, expert mentorship, and responsible hands-on practice.":
    "ለወደፊቱ የተዘጋጀ እያደገ ያለ የሳይበር ደህንነት ማህበረሰብ። በተግባራዊ ኮርሶች፣ በባለሙያ መመሪያ እና በኃላፊነት የተሞላ ልምምድ ይማሩ።",
  "A hooded hacker using a laptop in a green digital room":
    "ኮፍያ የለበሰ ጠላፊ በአረንጓዴ ዲጂታል ክፍል ውስጥ ላፕቶፕ ሲጠቀም",
  "More than a course. A community.": "ከኮርስ በላይ። ማህበረሰብ።",
  "Practical cybersecurity courses": "ተግባራዊ የሳይበር ደህንነት ኮርሶች",
  "Build real foundations through approachable, hands-on learning paths.":
    "በተግባር የሚያስተምሩ ቀላል የትምህርት መንገዶች ጠንካራ መሠረት ይገንቡ።",
  "Mentorship and guidance": "አማክርና መመሪያ",
  "Learn with support from experienced practitioners and instructors.":
    "ልምድ ካላቸው ባለሙያዎችና አስተማሪዎች ድጋፍ ጋር ይማሩ።",
  "A community that learns together": "አብሮ የሚማር ማህበረሰብ",
  "Share ideas, practice responsibly, and grow alongside other learners.":
    "ሐሳቦችን ይለዋወጡ፣ በኃላፊነት ይለማመዱ እና ከሌሎች ተማሪዎች ጋር ያድጉ።",
  "Security with purpose": "ዓላማ ያለው ደህንነት",
  "Build the skills and mindset to help make digital spaces safer.":
    "ዲጂታል አካባቢዎችን ደህንነታቸው የተጠበቀ ለማድረግ ክህሎትና አስተሳሰብ ይገንቡ።",
  "Our mission": "ተልዕኮአችን",
  "Build skilled cybersecurity professionals.": "ብቁ የሳይበር ደህንነት ባለሙያዎችን ማፍራት።",
  "We go beyond the tools. Spark Security helps people grow practical skills, make responsible choices, and contribute to a safer digital world.":
    "ከመሣሪያዎች በላይ እንሄዳለን። Spark Security ተግባራዊ ክህሎቶችን ለማዳበር፣ ኃላፊነት ያለው ውሳኔ ለመወሰን እና ደህንነቱ የተጠበቀ ዲጂታል ዓለም ለመገንባት ይረዳል።",
  "About Spark Security": "ስለ Spark Security",
  "Education & training": "ትምህርትና ሥልጠና",
  "Learn at your own pace.": "በራስዎ ፍጥነት ይማሩ።",
  "Mentorship & guidance": "አማክርና መመሪያ",
  "Grow with the community.": "ከማህበረሰቡ ጋር ያድጉ።",
  "Responsible practice": "ኃላፊነት ያለው ልምምድ",
  "Build skills the right way.": "ክህሎቶችን በትክክለኛው መንገድ ይገንቡ።",
  "A simple, guided route from first principles to confident practice.":
    "ከመሠረታዊ ጽንሰ-ሐሳቦች እስከ በራስ መተማመን ያለው ልምምድ የሚወስድ ቀላል መንገድ።",
  "Start exploring": "ማሰስ ይጀምሩ",
  "A path for every curious mind.": "ለሁሉም ጉጉ አእምሮ የትምህርት መንገድ።",
  "Short, focused courses to help you build real understanding.":
    "እውነተኛ ግንዛቤ እንዲገነቡ የሚያግዙ አጭርና ትኩረት ያላቸው ኮርሶች።",
  "See all courses": "ሁሉንም ኮርሶች ይመልከቱ",
  "Skills covered": "የተካተቱ ክህሎቶች",
  "Course details": "የኮርስ ዝርዝር",
  sessions: "ክፍለ ጊዜዎች",
  labs: "ላቦራቶሪዎች",
  "View course": "ኮርሱን ይመልከቱ",
  "Knowledge is your first defense": "እውቀት የመጀመሪያ መከላከያዎ ነው",
  "A safer digital world starts with awareness.": "ደህንነቱ የተጠበቀ ዲጂታል ዓለም በግንዛቤ ይጀምራል።",
  "Explore practical guidance for spotting risks and protecting yourself online.":
    "አደጋዎችን ለመለየትና በመስመር ላይ ራስዎን ለመጠበቅ ተግባራዊ መመሪያ ይመልከቱ።",
  "Visit awareness center": "የግንዛቤ ማዕከሉን ይጎብኙ",
  "Learn to secure, not to harm. All techniques must be used legally and only on systems you own or have explicit authorization to test.":
    "ለመጉዳት ሳይሆን ለመጠበቅ ይማሩ። ሁሉንም ዘዴዎች በሕጋዊ መንገድና በራስዎ ሥርዓት ወይም ግልጽ ፈቃድ ባለው ሥርዓት ላይ ብቻ ይጠቀሙ።",
  "Good questions": "ጥሩ ጥያቄዎች",
  "Frequently asked.": "ብዙ ጊዜ የሚጠየቁ ጥያቄዎች።",
  "Do I need prior security experience?": "ቀድሞ የደህንነት ልምድ ያስፈልገኛል?",
  "No. The learning path starts with core concepts and introduces technical material step by step.":
    "አያስፈልግም። የትምህርት መንገዱ በመሠረታዊ ጽንሰ-ሐሳቦች ይጀምራል እና ቴክኒካዊ ይዘትን በደረጃ ያስተዋውቃል።",
  "Are the practical exercises safe?": "ተግባራዊ ልምምዶቹ ደህንነታቸው የተጠበቀ ነው?",
  "Exercises are designed for controlled learning environments. Only test systems you own or have explicit permission to assess.":
    "ልምምዶቹ ለቁጥጥር የተደረገበት የትምህርት አካባቢ ተዘጋጅተዋል። የራስዎን ሥርዓት ወይም ግልጽ ፈቃድ ያለዎትን ብቻ ይፈትሹ።",
  "What do I need to get started?": "ለመጀመር ምን ያስፈልገኛል?",
  "A computer, an internet connection, and curiosity are enough to begin with the introductory material.":
    "ኮምፒውተር፣ የኢንተርኔት ግንኙነትና የመማር ፍላጎት በመግቢያ ትምህርቶች ለመጀመር በቂ ናቸው።",
  "Can I learn at my own pace?": "በራሴ ፍጥነት መማር እችላለሁ?",
  "Yes. Work through the lessons and practice activities at a pace that suits your schedule.":
    "አዎ። ከመርሃ ግብርዎ ጋር በሚስማማ ፍጥነት ትምህርቶቹንና ልምምዶቹን ይከታተሉ።",
  "Together for a": "አብረን",
  "more secure digital world.": "ደህንነቱ የተጠበቀ ዲጂታል ዓለም እንገንባ።",
  "Get Started": "ይጀምሩ",
  "Join a community that learns, builds, and protects.":
    "የሚማር፣ የሚገነባና የሚጠብቅ ማህበረሰብ ይቀላቀሉ።",
  "About Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.":
    "Spark Security ተግባራዊ የሳይበር ደህንነት ክህሎቶችን ለማዳበርና ድርጅቶች ዲጂታል ደህንነታቸውን እንዲያሻሽሉ ለመርዳት የሚሠራ የትምህርትና የደህንነት አገልግሎት ድርጅት ነው።",
  Education: "ትምህርት",
  "Structured cybersecurity courses and practical learning.":
    "የተደራጁ የሳይበር ደህንነት ኮርሶችና ተግባራዊ ትምህርት።",
  Community: "ማህበረሰብ",
  "Mentors, instructors, collaboration, and knowledge sharing.":
    "አማካሪዎች፣ አስተማሪዎች፣ ትብብርና የእውቀት ልውውጥ።",
  "Security services": "የደህንነት አገልግሎቶች",
  "Authorized penetration testing, vulnerability assessments, and security consulting.":
    "ፈቃድ ያለው የመግባት ሙከራ፣ የተጋላጭነት ግምገማና የደህንነት ምክር።",
  "Our approach": "አቀራረባችን",
  "We teach through hands-on exercises in controlled labs, with instructor feedback. All security testing is performed only with proper authorization.":
    "በቁጥጥር የተደረገባቸው ላቦራቶሪዎች ውስጥ በተግባር እና በአስተማሪ ግብረመልስ እናስተምራለን። ሁሉም የደህንነት ሙከራዎች ተገቢ ፈቃድ ሲኖር ብቻ ይከናወናሉ።",
  "Explore courses": "ኮርሶችን ይመልከቱ",
  "contact us": "ያግኙን",
  "Mentors and instructors": "አማካሪዎችና አስተማሪዎች",
  "Learn from practitioners who guide you through the labs and give feedback.":
    "በላቦራቶሪዎች የሚመሩዎትና ግብረመልስ ከሚሰጡ ባለሙያዎች ይማሩ።",
  "Mentor profiles are coming soon": "የአማካሪዎች መገለጫ በቅርቡ ይቀርባል",
  "Real photos and biographies will appear here once they are published. Want to teach?":
    "ፎቶዎችና የሕይወት ታሪኮች ሲታተሙ እዚህ ይታያሉ። ማስተማር ይፈልጋሉ?",
  "Get in touch": "ያግኙን",
  "Contact us": "ያግኙን",
  "Questions about courses, enrollment, or a security assessment? Send a message.":
    "ስለ ኮርሶች፣ ምዝገባ ወይም የደህንነት ግምገማ ጥያቄ አለዎት? መልዕክት ይላኩ።",
  Name: "ስም",
  Email: "ኢሜይል",
  Message: "መልዕክት",
  "Enter your name.": "ስምዎን ያስገቡ።",
  "Enter a valid email address.": "ትክክለኛ የኢሜይል አድራሻ ያስገቡ።",
  "Write at least 10 characters.": "ቢያንስ 10 ቁምፊዎችን ይጻፉ።",
  "Send message": "መልዕክት ይላኩ",
  "Messaging is not set up yet. Add the contact email in src/data/siteConfig.ts.":
    "የመልዕክት አገልግሎቱ ገና አልተዘጋጀም። የእውቂያ ኢሜይሉን src/data/siteConfig.ts ውስጥ ያክሉ።",
  "Your email app should open with the message ready to send.":
    "የኢሜይል መተግበሪያዎ መልዕክቱ ተዘጋጅቶ መክፈት አለበት።",
  "Other ways to reach us": "እኛን ለማግኘት ሌሎች መንገዶች",
  "Contact channels will be listed here.": "የእውቂያ መንገዶች እዚህ ይዘረዘራሉ።",
  "Security testing is performed only with proper written authorization.":
    "የደህንነት ሙከራ ተገቢ የጽሑፍ ፈቃድ ሲኖር ብቻ ይከናወናል።",
  "Join a cohort": "የተማሪ ቡድን ይቀላቀሉ",
  "Enroll in a course": "ለኮርስ ይመዝገቡ",
  "Reserve your place by completing payment and sending us your receipt.":
    "ክፍያዎን በመፈጸምና ደረሰኝዎን በመላክ ቦታዎን ያስይዙ።",
  "Courses are temporarily unavailable. Please try again later.":
    "ኮርሶች ለጊዜው አይገኙም። እባክዎ በኋላ እንደገና ይሞክሩ።",
  "Loading course...": "ኮርሱ በመጫን ላይ...",
  "Course temporarily unavailable": "ኮርሱ ለጊዜው አይገኝም",
  "We could not load this course right now. Please try again later.":
    "ይህን ኮርስ አሁን መጫን አልቻልንም። እባክዎ በኋላ ይሞክሩ።",
  "Course not found": "ኮርሱ አልተገኘም",
  "Browse courses": "ኮርሶችን ያስሱ",
  "Top threats to watch for": "ሊጠነቀቁ የሚገባቸው ዋና አደጋዎች",
  "Most common risks": "የተለመዱ አደጋዎች",
  "View details": "ዝርዝሩን ይመልከቱ",
  "Close threat details": "የአደጋ ዝርዝሩን ዝጋ",
  "Red flags": "የማስጠንቀቂያ ምልክቶች",
  "What to do": "ምን ማድረግ እንዳለብዎ",
  "Myth vs fact": "አፈ ታሪክ እና እውነታ",
  "Straight answers": "ግልጽ መልሶች",
  Myth: "አፈ ታሪክ",
  Fact: "እውነታ",
  "Close myth and fact": "አፈ ታሪክና እውነታውን ዝጋ",
  "Your next steps": "ቀጣይ እርምጃዎች",
  "How to enroll": "እንዴት መመዝገብ እንደሚቻል",
  Pay: "ይክፈሉ",
  "Submit your receipt": "ደረሰኝዎን ያስገቡ",
  "Get your Telegram invite": "የTelegram ግብዣዎን ያግኙ",
  "Payment instructions": "የክፍያ መመሪያዎች",
  "Bank transfer": "የባንክ ማስተላለፍ",
  "Mobile money": "የሞባይል ገንዘብ",
  "Full name": "ሙሉ ስም",
  Phone: "ስልክ",
  "Telegram username": "የTelegram የተጠቃሚ ስም",
  Course: "ኮርስ",
  "Choose a course": "ኮርስ ይምረጡ",
  "Payment receipt": "የክፍያ ደረሰኝ",
  "Upload file": "ፋይል ይጫኑ",
  "Paste link": "ሊንኩን ይለጥፉ",
  "Submit enrollment": "ምዝገባውን ያስገቡ",
};

const oromoExtra: TranslationTable = {
  "Spark Security": "Spark Security",
  "All rights reserved.": "Mirgi hundi seeraan eegama.",
  "Select language": "Afaan filadhu",
  "Online safety basics": "Bu'uura nageenya toora interneetii",
  "Stay safe online": "Toora interneetii irratti of eegi",
  "Simple habits that help you recognize scams, protect your accounts, and stay calm when something feels wrong.":
    "Amaloonni salphaan gowwoomsaa adda baasuuf, herrega kee eeguuf, fi yeroo rakkoon mul'atu tasgabbaa'uuf si gargaaru.",
  "Free for everyone": "Nama hundaaf bilisaa",
  "Awareness page sections": "Kutaa fuula hubannoo",
  Threats: "Balaa",
  Checklist: "Tarree qorannoo",
  "Red flags": "Mallattoolee akeekkachiisaa",
  Recovery: "Furmaata",
  Myths: "Yaada dogoggoraa",
  FAQ: "Gaaffilee",
  "Start today": "Har'a jalqabi",
  "Quick checklist": "Tarree qorannoo gabaabaa",
  "Scam signs": "Mallattoolee gowwoomsaa",
  "How to spot a scam": "Gowwoomsaa akkamitti adda baasta",
  "If something went wrong": "Yoo rakkoon mudate",
  "What to do next": "Itti aansuun maal gochuu qabda",
  "Want to go deeper?": "Dabalataan barachuu barbaaddaa?",
  "Build your digital safety habits with guided learning.":
    "Barnoota qajeelfama qabuun amala nageenya dijitaalaa ijaari.",
  "The beginner course is a simple, structured way to understand online risks and respond with calm, practical steps.":
    "Koorsiin jalqabaa balaa toora interneetii hubachuuf fi tarkaanfii hojii irra ooluu tasgabbiidhaan fudhachuuf karaa salphaa fi sirna qabuudha.",
  "Take the beginner course": "Koorsii jalqabaa fudhadhu",
  "Browse all courses": "Koorsii hunda sakatta'i",
  "View fact": "Dhugaa ilaali",
  "Close myth and fact": "Yaada dogoggoraa fi dhugaa cufi",
  "A growing cybersecurity community, built for what comes next. Learn through practical courses, expert mentorship, and responsible hands-on practice.":
    "Hawaasa nageenya saayibarii guddachaa jiru. Koorsii hojii irra ooluu, gorsa ogeessotaa fi shaakala itti gaafatamummaa qabuun baradhaa.",
  "A path for every curious mind.": "Karaa nama fedhii qabu hundaaf.",
  "Choose your path": "Karaa kee filadhu",
  "Start with the foundations or explore a topic that interests you.":
    "Bu'uura irraa jalqabi ykn mata-duree si hawwatu qoradhu.",
  "Learn the concepts": "Yaad-rimeewwan baradhu",
  "Follow concise lessons built to make technical ideas approachable.":
    "Yaad-rimeewwan teeknikaa hubachuuf barnoota gabaabaa hordofi.",
  "Practice responsibly": "Itti gaafatamummaan shaakali",
  "Reinforce your knowledge in guided, authorized lab environments.":
    "Naannoo laaboraatorii hayyamame keessatti beekumsa kee cimsadhu.",
  "Keep progressing": "Itti fufi",
  "Build on your skills and develop a security-first mindset.":
    "Dandeettii kee guddisi; ilaalcha nageenya dursa kennu horadhu.",
  "Beginner-friendly learning paths": "Karaa barnootaa jalqabaaf mijatu",
  "Practice in controlled labs": "Laaboraatorii to'atame keessatti shaakali",
  "Ethics at the core of every lesson": "Naamusa bu'uura barnoota hundaati",
  "Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.":
    "Spark Security dhaabbata barnoota nageenya saayibarii fi tajaajila nageenyaa kennu yoo ta'u, dandeettii hojii irra ooluu guddisuu fi dhaabbileen nageenya dijitaalaa isaanii akka cimsan gargaara.",
  or: "ykn",
  "Order summary": "Cuunfaa ajaja",
  Starts: "Jalqaba",
  "Seats left": "Bakka hafe",
  Total: "Waliigala",
  "Choose a course below to see your cohort summary.":
    "Cuunfaa garee barattootaa ilaaluuf koorsii armaan gadii filadhu.",
  "Registration received": "Galmeen fudhatameera",
  "Registration received. We'll verify your payment and send your Telegram invite within 24 hours.":
    "Galmeen fudhatameera. Kaffaltii kee mirkaneessinee sa'aatii 24 keessatti affeerraa Telegram siif ergina.",
  "Your details": "Odeeffannoo kee",
  "This cohort is full. Choose another course to continue.":
    "Gareen kun guuteera. Itti fufuuf koorsii biraa filadhu.",
  "Cohort details are temporarily unavailable. Please try again later.":
    "Odeeffannoon garee yeroo ammaa hin argamu. Maaloo booda irra deebi'ii yaali.",
  "Enter your first and last name using letters only, separated by a space":
    "Maqaa fi maqaa akaakuu qubee qofa fayyadamuun, gidduu isaanii bakka duwwaa kaa'uun galchi",
  "Enter a Telegram username starting with @ (5–32 characters).":
    "Maqaa fayyadamaa Telegram @ jalqabamu (qubee 5–32) galchi.",
  "Choose receipt type": "Gosa nagahee filadhu",
  "Receipt file (image or PDF, up to 5 MB)": "Faayilii nagahee (suuraa ykn PDF, hanga 5 MB)",
  "Accepted formats: image or PDF. Maximum size: 5 MB.":
    "Faayilii fudhatamu: suuraa ykn PDF. Guddinni ol'aanaan 5 MB.",
  "Choose an image or PDF receipt.": "Nagahee suuraa ykn PDF filadhu.",
  "The receipt file must be 5 MB or smaller.": "Faayiliin nagahee 5 MB ykn isaa gadi ta'uu qaba.",
  "Receipt link": "Geessituu nagahee",
  "Make sure the receipt link can be viewed by our team.":
    "Geessituun nagahee garee keenyaaf banamuu isaa mirkaneessi.",
  "I agree to use what I learn only for legal, authorized purposes":
    "Waan baradhe seeraan fi hayyama qabuuf qofa akka fayyadamu nan walii gala.",
  "Submitting...": "Ergaa jira...",
  "Registration closed": "Galmeen cufameera",
  "Loading...": "Fe'aa jira...",
  Unavailable: "Hin argamu",
  "Not scheduled": "Sagantaan hin baane",
  "Price unavailable": "Gatiin hin argamu",
  Bank: "Baankii",
  "Account name": "Maqaa herregaa",
  "Account number": "Lakkoofsa herregaa",
  "Mobile money number": "Lakkoofsa maallaqa bilbilaa",
  "The transfer reference should include your phone number so we can match your payment.":
    "Kaffaltii kee adda baasuuf lakkoofsi bilbilaa kee wabii kaffaltii keessatti haa dabalamu.",
  "Something went wrong. Please check your connection and try again.":
    "Rakkoon uumameera. Maaloo walqunnamtii kee ilaaliitii irra deebi'ii yaali.",
  "That file is too large. Maximum size is 5 MB.":
    "Faayiliin kun baay'ee guddaadha. Guddinni ol'aanaan 5 MB.",
  "Too many attempts. Please try again later.":
    "Yaaliin baay'ee ta'eera. Maaloo booda irra deebi'ii yaali.",
  "Too many registration attempts. Please wait 5 minutes before trying again.":
    "Galmeessuuf yaaliin baay'een taasifameera. Maaloo daqiiqaa 5 eeggadhuutii irra deebi'ii yaali.",
  "Your Telegram invitation has been sent. Check Telegram to join the private group.":
    "Affeerraan Telegram siif ergameera. Garee dhuunfaa seenuuf Telegram kee ilaali.",
  "Learn at your own pace.": "Saffisa mataa keetiin baradhu.",
  "The file must be 5 MB or smaller.": "Faayiliin 5 MB ykn isaa gadi ta'uu qaba.",
};

const amharicExtra: TranslationTable = {
  "Spark Security": "Spark Security",
  "All rights reserved.": "መብቶች በሙሉ የተጠበቁ ናቸው።",
  "Select language": "ቋንቋ ይምረጡ",
  "Online safety basics": "የመስመር ላይ ደህንነት መሠረቶች",
  "Stay safe online": "በመስመር ላይ ደህንነትዎን ይጠብቁ",
  "Simple habits that help you recognize scams, protect your accounts, and stay calm when something feels wrong.":
    "ማጭበርበሮችን ለመለየት፣ መለያዎችዎን ለመጠበቅ እና ችግር ሲኖር ተረጋግተው ለመቆየት የሚረዱ ቀላል ልምዶች።",
  "Free for everyone": "ለሁሉም ነፃ",
  "Awareness page sections": "የግንዛቤ ገጽ ክፍሎች",
  Threats: "አደጋዎች",
  Checklist: "የማረጋገጫ ዝርዝር",
  "Red flags": "የማስጠንቀቂያ ምልክቶች",
  Recovery: "መልሶ ማግኘት",
  Myths: "አፈ ታሪኮች",
  FAQ: "ተደጋጋሚ ጥያቄዎች",
  "Start today": "ዛሬ ይጀምሩ",
  "Quick checklist": "ፈጣን የማረጋገጫ ዝርዝር",
  "Scam signs": "የማጭበርበር ምልክቶች",
  "How to spot a scam": "ማጭበርበርን እንዴት መለየት ይቻላል",
  "If something went wrong": "የሆነ ነገር ከተሳሳተ",
  "What to do next": "ቀጥሎ ምን ማድረግ እንዳለብዎ",
  "Want to go deeper?": "በጥልቀት መማር ይፈልጋሉ?",
  "Build your digital safety habits with guided learning.":
    "በተመራ ትምህርት የዲጂታል ደህንነት ልምዶችዎን ይገንቡ።",
  "The beginner course is a simple, structured way to understand online risks and respond with calm, practical steps.":
    "የጀማሪዎች ኮርስ የመስመር ላይ አደጋዎችን ለመረዳትና በተግባራዊ እርምጃዎች ለመመለስ ቀላልና የተደራጀ መንገድ ነው።",
  "Take the beginner course": "የጀማሪዎችን ኮርስ ይውሰዱ",
  "Browse all courses": "ሁሉንም ኮርሶች ያስሱ",
  "View fact": "እውነታውን ይመልከቱ",
  "Close myth and fact": "አፈ ታሪክና እውነታውን ዝጋ",
  "Choose your path": "መንገድዎን ይምረጡ",
  "Start with the foundations or explore a topic that interests you.":
    "ከመሠረታዊ ነገሮች ይጀምሩ ወይም የሚያስደስትዎትን ርዕስ ያስሱ።",
  "Learn the concepts": "ጽንሰ-ሐሳቦቹን ይማሩ",
  "Follow concise lessons built to make technical ideas approachable.":
    "ቴክኒካዊ ሐሳቦችን ተደራሽ የሚያደርጉ አጭር ትምህርቶችን ይከታተሉ።",
  "Practice responsibly": "በኃላፊነት ይለማመዱ",
  "Reinforce your knowledge in guided, authorized lab environments.":
    "በተመሩና ፈቃድ ባላቸው የላቦራቶሪ አካባቢዎች እውቀትዎን ያጠናክሩ።",
  "Keep progressing": "እድገትዎን ይቀጥሉ",
  "Build on your skills and develop a security-first mindset.":
    "በክህሎቶችዎ ላይ ይገንቡና ደህንነትን ቅድሚያ የሚሰጥ አስተሳሰብ ያዳብሩ።",
  "Beginner-friendly learning paths": "ለጀማሪዎች ተስማሚ የትምህርት መንገዶች",
  "Practice in controlled labs": "በቁጥጥር ላቦራቶሪዎች ይለማመዱ",
  "Ethics at the core of every lesson": "ሥነ ምግባር የእያንዳንዱ ትምህርት መሠረት ነው",
  "Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.":
    "Spark Security ተግባራዊ የሳይበር ደህንነት ክህሎቶችን ለማዳበርና ድርጅቶች ዲጂታል ደህንነታቸውን እንዲያሻሽሉ ለመርዳት የሚሠራ የትምህርትና የደህንነት አገልግሎት ድርጅት ነው።",
  or: "ወይም",
  "Order summary": "የትዕዛዝ ማጠቃለያ",
  Starts: "የሚጀምርበት",
  "Seats left": "የቀሩ ቦታዎች",
  Total: "ጠቅላላ",
  "Choose a course below to see your cohort summary.":
    "የቡድን ማጠቃለያውን ለማየት ከታች ኮርስ ይምረጡ።",
  "Registration received": "ምዝገባው ተቀብለናል",
  "Registration received. We'll verify your payment and send your Telegram invite within 24 hours.":
    "ምዝገባው ተቀብለናል። ክፍያዎን አረጋግጠን በ24 ሰዓት ውስጥ የTelegram ግብዣ እንልካለን።",
  "Your details": "የእርስዎ ዝርዝሮች",
  "This cohort is full. Choose another course to continue.":
    "ይህ ቡድን ሞልቷል። ለመቀጠል ሌላ ኮርስ ይምረጡ።",
  "Cohort details are temporarily unavailable. Please try again later.":
    "የቡድኑ ዝርዝሮች ለጊዜው አይገኙም። እባክዎ በኋላ ይሞክሩ።",
  "Enter your first and last name using letters only, separated by a space":
    "የመጀመሪያና የአባት ስምዎን ፊደሎችን ብቻ በመጠቀም በክፍተት ለይተው ያስገቡ",
  "Enter a Telegram username starting with @ (5–32 characters).":
    "@ የሚጀምር የTelegram የተጠቃሚ ስም ያስገቡ (5–32 ቁምፊዎች)።",
  "Choose receipt type": "የደረሰኝ አይነት ይምረጡ",
  "Receipt file (image or PDF, up to 5 MB)": "የደረሰኝ ፋይል (ምስል ወይም PDF፣ እስከ 5 MB)",
  "Accepted formats: image or PDF. Maximum size: 5 MB.":
    "የሚቀበሉ ቅርጸቶች፦ ምስል ወይም PDF። ከፍተኛ መጠን፦ 5 MB።",
  "Choose an image or PDF receipt.": "የምስል ወይም PDF ደረሰኝ ይምረጡ።",
  "The receipt file must be 5 MB or smaller.": "የደረሰኙ ፋይል 5 MB ወይም ከዚያ ያነሰ መሆን አለበት።",
  "Receipt link": "የደረሰኝ ሊንክ",
  "Make sure the receipt link can be viewed by our team.":
    "የደረሰኙ ሊንክ በቡድናችን ሊታይ እንደሚችል ያረጋግጡ።",
  "I agree to use what I learn only for legal, authorized purposes":
    "የምማረውን ለሕጋዊና ፈቃድ ላላቸው ዓላማዎች ብቻ ለመጠቀም እስማማለሁ።",
  "Submitting...": "በማስገባት ላይ...",
  "Registration closed": "ምዝገባው ተዘግቷል",
  "Loading...": "በመጫን ላይ...",
  Unavailable: "አይገኝም",
  "Not scheduled": "በጊዜ ሰሌዳ ላይ አልተያዘም",
  "Price unavailable": "ዋጋው አይገኝም",
  Bank: "ባንክ",
  "Account name": "የሂሳብ ስም",
  "Account number": "የሂሳብ ቁጥር",
  "Mobile money number": "የሞባይል ገንዘብ ቁጥር",
  "The transfer reference should include your phone number so we can match your payment.":
    "ክፍያዎን ለማዛመድ የስልክ ቁጥርዎን በማስተላለፊያ ማጣቀሻው ውስጥ ያካትቱ።",
  "Something went wrong. Please check your connection and try again.":
    "ችግር ተፈጥሯል። እባክዎ ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።",
  "That file is too large. Maximum size is 5 MB.":
    "ያ ፋይል በጣም ትልቅ ነው። ከፍተኛው መጠን 5 MB ነው።",
  "Too many attempts. Please try again later.":
    "ብዙ ጊዜ ሞክረዋል። እባክዎ በኋላ እንደገና ይሞክሩ።",
  "Too many registration attempts. Please wait 5 minutes before trying again.":
    "ብዙ የምዝገባ ሙከራዎች ተደርገዋል። እባክዎ 5 ደቂቃ ይጠብቁና እንደገና ይሞክሩ።",
  "Your Telegram invitation has been sent. Check Telegram to join the private group.":
    "የቴሌግራም ግብዣዎ ተልኳል። የግል ቡድኑን ለመቀላቀል ቴሌግራምዎን ይመልከቱ።",
  "Learn at your own pace.": "በራስዎ ፍጥነት ይማሩ።",
};

const oromoPublicUi: TranslationTable = {
  "Close navigation menu": "Maalimoo navigeeshinii cufi",
  "Open navigation menu": "Maalimoo navigeeshinii bani",
  "Breadcrumb": "Karaa fuulaa",
  "Next cohort": "Gareen barattootaa itti aanu",
  "Checking availability...": "Argamuu isaa mirkaneessaa jira...",
  "Enrollment unavailable": "Galmeen hin argamu",
  "Our learning principles": "Qajeeltoowwan barnoota keenyaa",
  "seats left": "bakka hafe",
  "How it runs": "Akkaataa itti raawwatamu",
  Platform: "Waltajjii",
  Schedule: "Sagantaa",
  "Start date": "Guyyaa jalqabaa",
  Duration: "Yeroo turtii",
  Language: "Afaan",
  "Cohorts per year": "Gareewwan waggaatti",
  "12-week syllabus": "Sagantaa barnootaa torban 12",
  Week: "Torban",
  "Who it’s for": "Eenyuf akka ta'e",
  "Who it’s for and requirements": "Eenyuf akka ta'e fi ulaagaalee",
  "Perfect if you...": "Siif mijata yoo...",
  Requirements: "Ulaagaalee",
  "Enroll in this cohort": "Garee barattootaa kana keessatti galmaa'i",
  "Cohort enrollment": "Galmee garee barattootaa",
  "Cohort full": "Gareen barattootaa guuteera",
  "Enroll now": "Amma galmaa'i",
  Instructors: "Barsiisota",
  "What you’ll learn": "Waan barattu",
  "Loading related courses...": "Koorsii walqabatan fe'aa jira...",
  "Related courses are temporarily unavailable.":
    "Koorsiin walqabatan yeroo ammaa hin argaman.",
  "Related courses": "Koorsii walqabatan",
  "Phishing messages and fake links": "Ergaawwan phishing fi geessituu sobaa",
  "A scammer pretends to be a trusted sender and asks you to click a link or log in quickly.":
    "Gowwoomsaan tokko nama amanamaa fakkaatee geessituu akka cuqaastu ykn saffisaan akka seentu si gaafata.",
  "A message looks like it came from your bank and says your account is blocked, asking you to click a link to 'fix' it.":
    "Ergaan tokko baankii kee irraa fakkaata; herregni kee cufamuu isaa himuun, sirreessuuf geessituu akka cuqaastu gaafata.",
  "It creates urgency or fear.": "Ariifachiisa ykn sodaa uuma.",
  "The sender asks you to log in from a link you did not expect.":
    "Ergaan sun geessituu ati hin eegne irraa akka seentu si gaafata.",
  "The message uses poor grammar or odd wording.":
    "Ergaan sun seerluga dogoggoraa ykn jechoota hin baramne fayyadama.",
  "Open the official app or website yourself instead of tapping a link in the message.":
    "Geessituu ergaa keessa jiru cuqaasuu mannaa appii ykn marsariitii sirrii ofii keetii bani.",
  "Check the sender name and contact details before replying.":
    "Deebii kennuu kee dura maqaa ergaa fi odeeffannoo qunnamtii ilaali.",
  "If unsure, ignore it and confirm through the official channel.":
    "Yoo shakkite, dhiisiitii karaa sirrii ta'een mirkaneeffadhu.",
  "Telegram and social media scams": "Gowwoomsaa Telegram fi miidiyaa hawaasaa",
  "Scammers pose as admin staff, friends, or business contacts and ask for money or account access.":
    "Gowwoomsitoonni hojjettoota bulchiinsaa, hiriyoota ykn quunnamtoota hojii fakkaatanii maallaqa ykn seensa herregaa gaafatu.",
  "A Telegram account pretending to be your group admin asks members to send payment for a 'new fee' or to share a code.":
    "Herregni Telegram bulchaa garee kee fakkaatu miseensonni kaffaltii 'haaraa' akka ergan ykn koodii akka qoodan gaafata.",
  "The account name looks almost the same as a real one.":
    "Maqaan herregaa maqaa dhugaa wajjin baay'ee wal fakkaata.",
  "The person asks you to act fast and keeps changing the story.":
    "Namichi sun saffisaan akka hojjettu gaafata; seenaa isaa yeroo baay'ee jijjiira.",
  "They ask for payment, OTP codes, or private information.":
    "Kaffaltii, koodii OTP ykn odeeffannoo dhuunfaa si gaafatu.",
  "Verify the identity of the person through a trusted contact method.":
    "Karaa qunnamtii amanamaa ta'een eenyummaa nama sanaa mirkaneeffadhu.",
  "Do not share private codes or login details in chat.":
    "Koodii dhuunfaa ykn odeeffannoo seensaa chaatii keessatti hin qoodin.",
  "Report the account and warn your group or contacts.":
    "Herrega sana gabaasi; garee ykn quunnamtoota kee akeekkachiisi.",
  "Mobile money fraud": "Gowwoomsaa maallaqa bilbilaa",
  "Attackers may ask you to approve a payment, receive a fake refund, or help with a 'cancelled transfer'.":
    "Namoonni gowwoomsan kaffaltii akka mirkaneessitu, deebii maallaqaa sobaa akka fudhattu ykn 'dabarsa haqame' irratti akka gargaaru si gaafachuu danda'u.",
  "You receive a fake Telebirr or bank SMS saying you were paid too much and must send part of it back immediately.":
    "Telebirr ykn baankii irraa ergaa sobaa argatta; kaffaltii baay'ee argatte, keessaa muraasa battalumatti deebisuu qabda jedha.",
  "The message asks you to send money back before checking.":
    "Ergaan sun osoo hin mirkaneessin maallaqa akka deebistu gaafata.",
  "It sounds like a refund, prize, or reward is being processed.":
    "Deebiin kaffaltii, badhaasni ykn kennaan tokko raawwatamaa jira jedha.",
  "The sender insists on secrecy or asks you to keep it private.":
    "Ergaan sun iccitii akka eegdu ykn nama biraatti akka hin himne si gaafata.",
  "Stop and contact your bank or mobile money provider using their official number or app.":
    "Dhaabiitii lakkoofsa ykn appii sirrii fayyadamuun baankii ykn tajaajila maallaqa bilbilaa kee qunnami.",
  "Do not send money or code numbers to anyone who contacted you unexpectedly.":
    "Nama tasa si qunnameef maallaqa ykn lakkoofsa koodii hin erginaa.",
  "Check transaction history for unusual charges right away.":
    "Galmee kaffaltii kee battalumatti ilaali; kaffaltii hin baramne barbaadi.",
  "Fake job and scholarship offers": "Carraa hojii fi barnootaa sobaa",
  "Scammers promise jobs, internships, or scholarships and ask for a payment before you start.":
    "Gowwoomsitoonni hojii, leenjii hojii ykn carraa barnootaa waadaa galanii jalqabuu kee dura kaffaltii gaafatu.",
  "A message says you were selected for a scholarship and only need to pay a 'processing fee' to receive it.":
    "Ergaan tokko carraa barnootaaf filatamuu kee hima; fudhachuuf 'kaffaltii qopheessuu' qofa kaffaluu qabda jedha.",
  "They ask for money before you have a real interview or offer.":
    "Osoo gaafannoo hojii dhugaa ykn dhiyeessii hin argatin maallaqa si gaafatu.",
  "The email or chat does not match a real organization.":
    "Imeelii ykn chaatiin dhaabbata dhugaa wajjin hin walsimu.",
  "They promise quick approval with no proper documents or process.":
    "Sanada ykn adeemsa sirrii malee ariitiidhaan akka fudhatamtu waadaa galan.",
  "Ask for a real company or school contact and check their official website.":
    "Qunnamtii dhaabbata ykn mana barumsaa dhugaa gaafadhu; marsariitii isaanii sirrii ilaali.",
  "Never pay a fee for a job or scholarship without proper verification.":
    "Osoo sirriitti hin mirkaneessin hojii ykn carraa barnootaaf kaffaltii hin kaffalin.",
  "Look for official email addresses, documents, and a public contact method.":
    "Teessoo imeelii sirrii, sanadoota, fi karaa qunnamtii uummataaf ifa ta'e barbaadi.",
  "Weak and reused passwords": "Jecha iccitii laafaa fi irra deebi'amee fayyadamu",
  "If one account is weak, a scammer may use it to get into your email, banking app, or social media.":
    "Yoo herregni tokko laafaa ta'e, gowwoomsaan imeelii, appii baankii ykn miidiyaa hawaasaa kee seenuuf itti fayyadamuu danda'a.",
  "A reused password from one app is used again on a work or school account, making it easier for attackers to take over more than one account.":
    "Jecha iccitii appii tokko keessatti fayyadamte herrega hojii ykn mana barumsaa irratti irra deebi'uun, namoonni miidhaa geessisan herrega hedduu akka qabatan salphisa.",
  "The same password is used across multiple apps.":
    "Appii hedduu irratti jechi iccitii tokko fayyadama.",
  "A password is short, personal, or easy to guess.":
    "Jechi iccitii gabaabaa, dhuunfaa ykn tilmaamuuf salphaa dha.",
  "You keep resetting your password after login issues.":
    "Rakkoo seensaa booda jecha iccitii kee irra deddeebitee haaromsita.",
  "Use a password manager to create unique passwords for each account.":
    "Herrega hundaaf jecha iccitii addaa uumuuf bulchaa jecha iccitii fayyadami.",
  "Turn on two-step verification where available.":
    "Bakka jiru hundatti mirkaneessa tarkaanfii lamaa hojii irra oolchi.",
  "Change any reused passwords that are still in use.":
    "Jechoota iccitii irra deebi'anii amma iyyuu fayyadaman jijjiiri.",
  "Account takeover": "Herrega to'annoo jala oolchuu",
  "Once attackers get access to an email or social account, they can impersonate you or reset other accounts.":
    "Namoonni miidhaa geessisan yeroo imeelii ykn herrega miidiyaa hawaasaa seenu, si fakkaachuu ykn herrega biraa haaromsuu danda'u.",
  "A scammer gets into your email and uses it to send fake messages to friends asking for money or asking them to click a link.":
    "Gowwoomsaan tokko imeelii kee seenee hiriyoota kee irraa maallaqa gaafachuuf ykn geessituu akka cuqaasan gaafachuuf ergaa sobaa erga.",
  "You get alerts for logins you did not make.":
    "Seensa ati hin gooneef akeekkachiisa argatta.",
  "Your contacts receive strange messages from your account.":
    "Quunnamtoonni kee herrega kee irraa ergaa nama ajaa'ibu argatu.",
  "You suddenly cannot log in or your password was changed without your action.":
    "Tasuma seenuu dadhabda ykn jechi iccitii kee osoo ati hin jijjiirin jijjiirama.",
  "Log out of all sessions and change your password right away.":
    "Seensa hundarraa ba'iitii jecha iccitii kee battalumatti jijjiiri.",
  "Check the account recovery email and security settings.":
    "Imeelii deebisanii argachuu fi qindaa'ina nageenyaa herregaa kee ilaali.",
  "Tell your contacts that your account may have been compromised.":
    "Herregni kee miidhamuu akka danda'u quunnamtoota keetti himi.",
  "Malware, cracked apps, and unknown APKs": "Malware, appii caccabfame fi APK hin beekamne",
  "Unknown apps and modified files can give attackers access to messages, contacts, and money apps.":
    "Appii hin beekamne fi faayiloonni fooyya'an namoota miidhaa geessisaniif ergaa, quunnamtoota fi appii maallaqaa akka argatan gochuu danda'u.",
  "An APK or cracked app promises a free version of a popular app but installs software that steals information from your phone.":
    "APK ykn appiin caccabfame appii beekamaa bilisaan kennina jedha; garuu sooftiweerii odeeffannoo bilbila kee hatu fe'a.",
  "The app comes from a random website or unofficial source.":
    "Appiin sun marsariitii hin beekamne ykn madda sirrii hin taane irraa dhufa.",
  "It asks for unnecessary permissions or access.":
    "Hayyama ykn seensa hin barbaachifne gaafata.",
  "Your phone slows down or shows pop-ups after installation.":
    "Erga fe'amee booda bilbilli kee suuta jedha ykn foddaa ofumaan banamu agarsiisa.",
  "Only install apps from official stores and verified sources.":
    "Appii kuusaa sirrii fi madda mirkanaa'e irraa qofa fe'i.",
  "Remove unknown apps and check device permissions.":
    "Appii hin beekamne haqi; hayyama meeshaa kee ilaali.",
  "Update your apps and phone operating system regularly.":
    "Appii fi sirna bilbila kee yeroo yeroon haaromsi.",
  "Public Wi-Fi and SIM swap": "Wi-Fi uummataa fi SIM jijjiiruu",
  "Open networks and account recovery tricks can leave you exposed to scammers or identity theft.":
    "Neetworkiin banaa fi mala deebisanii herrega argachuu gowwoomsitoota ykn hatuu eenyummaa saaxiluu danda'u.",
  "Someone calls, says they are from the telecom operator, and convinces you to move your number to a new SIM while you are on public Wi-Fi.":
    "Namni tokko bilbilee hojjetaa telekoomii ta'uu isaa hima; Wi-Fi uummataa irratti yeroo jirtu lakkoofsa kee SIM haaraatti akka dabarsitu si amansiisa.",
  "A caller asks you to share a one-time code or SIM activation status.":
    "Namni bilbilu koodii yeroo tokkoo ykn haala hojii SIM akka qooddu si gaafata.",
  "The network is public and you are asked to log in to a site that does not look official.":
    "Neetworkiin uummataaf banaa dha; marsariitii sirrii hin fakkaanne irratti akka seentu si gaafatu.",
  "You receive an unexpected change in your mobile signal or account status.":
    "Mallattoo bilbilaa ykn haala herregaa kee irratti jijjiirama hin eegne argita.",
  "Avoid logging into sensitive accounts on public Wi-Fi unless needed.":
    "Yoo dirqama hin taane Wi-Fi uummataa irratti herrega iccitii hin seenin.",
  "Never share OTP codes with a caller or message.":
    "Koodii OTP nama bilbilu ykn ergaa waliin gonkumaa hin qoodin.",
  "Contact your telecom provider if you suspect your SIM was changed or your account was altered.":
    "SIM kee jijjiiramuu ykn herregni kee jijjiiramuu yoo shakkite tajaajila telekoomii kee qunnami.",
  "Use two-step verification on your important accounts.":
    "Herrega barbaachisaa kee irratti mirkaneessa tarkaanfii lamaa fayyadami.",
  "Keep a password manager and use unique passwords for each account.":
    "Bulchaa jecha iccitii fayyadami; herrega hundaaf jecha iccitii addaa qabadhu.",
  "Update your phone, apps, and browser as soon as new versions arrive.":
    "Bilbila, appii fi browzarii kee yeroo fooyya'iinsi haaraan dhufu haaromsi.",
  "Never share a one-time password or OTP code with anyone.":
    "Jecha iccitii yeroo tokkoo ykn koodii OTP nama kamiifuu hin qoodin.",
  "Check the full website address before entering your username or password.":
    "Maqaa fayyadamaa ykn jecha iccitii galchuu kee dura teessoo marsariitii guutuu ilaali.",
  "Do not click links in unexpected SMS, chat, or email messages.":
    "Ergaa SMS, chaatii ykn imeelii hin eegne keessaa geessituu hin cuqaasin.",
  "Verify a request by calling or messaging the real business or person.":
    "Dhaabbata ykn nama dhugaa bilbiluudhaan ykn ergaa erguudhaan gaaffii mirkaneeffadhu.",
  "Keep your phone contacts and bank details in a trusted, known place.":
    "Quunnamtoota bilbilaa fi odeeffannoo baankii kee bakka amanamaa fi beekamaa keessa kaa'i.",
  "Be careful with public Wi-Fi and avoid sensitive logins on shared networks.":
    "Wi-Fi uummataaf banaa irratti of eeggadhu; neetworkii waliinii irratti herrega iccitii hin seenin.",
  "If a deal looks too good to be true, treat it as suspicious.":
    "Dhiyeessiin tokko dhugaa ta'uu hin fakkaatu yoo ta'e, akka shakkisiisaatti ilaali.",
  "Urgent payment or action": "Kaffaltii ykn gocha ariifachiisaa",
  "The sender says you must move money or confirm a payment immediately.":
    "Ergaan maallaqa akka dabarsitu ykn kaffaltii battalumatti akka mirkaneessitu si hima.",
  "Too good to be true": "Dhugaa ta'uuf baay'ee gaarii",
  "A job, prize, or scholarship sounds unusually easy or generous.":
    "Hojii, badhaasa ykn carraan barnootaa baay'ee salphaa ykn arjummaa guddaa qabu fakkaata.",
  "Unexpected link": "Geessituu hin eegamne",
  "A message tells you to click a link instead of using the official app or website.":
    "Ergaan appii ykn marsariitii sirrii fayyadamuu mannaa geessituu akka cuqaastu si hima.",
  "Requests for codes": "Gaaffii koodii",
  "Someone asks for your OTP, PIN, or login code, even if they claim to be a helper.":
    "Namni tokko gargaaraa ta'uu isaa yoo himellee OTP, PIN ykn koodii seensaa kee si gaafata.",
  "Mismatched sender": "Ergaa fi maqaa ergaa wal hin simne",
  "The sender name is close to a real one but not quite the same.":
    "Maqaan ergaa maqaa dhugaa wajjin wal fakkaata, garuu guutumaan guutuutti tokko miti.",
  "Pressure and secrecy": "Dhiibbaa fi iccitii",
  "The message says to keep it quiet and not ask others for help.":
    "Ergaan sun callisuu fi namoota biroo gargaarsa gaafachuu akka dhiistu si hima.",
  "Pause contact: stop replying to the sender and do not send any more codes or payment.":
    "Qunnamtii dhaabi: ergaa sanaaf deebii kennuu dhiisi; koodii ykn kaffaltii dabalataa hin erginaa.",
  "Secure your accounts: change passwords, sign out from other devices, and turn on two-step verification.":
    "Herrega kee eegi: jechoota iccitii jijjiiri, meeshaalee biroo irraa ba'i, mirkaneessa tarkaanfii lamaa bansi.",
  "Contact your bank or mobile money provider: ask them to review the account and freeze or flag unusual activity.":
    "Baankii ykn tajaajila maallaqa bilbilaa kee qunnami: herrega akka ilaalanii sochii hin baramne dhaaban ykn mallatteessan gaafadhu.",
  "Check your phone: remove suspicious apps, review permissions, and update your software.":
    "Bilbila kee ilaali: appii shakkisiisaa haqi, hayyama ilaali, sooftiweerii haaromsi.",
  "Report it: tell the relevant authorities and warn your family, coworkers, or business contacts if needed.":
    "Gabaasi: qaamolee dhimmi ilaallatuuf himi; yoo barbaachise maatii, hojjettoota waliin, ykn quunnamtoota hojii akeekkachiisi.",
  "Contact your bank or mobile money provider and the relevant authorities as soon as possible. Keep screenshots, messages, and transaction details to help with the report.":
    "Baankii ykn tajaajila maallaqa bilbilaa fi qaamolee dhimmi ilaallatu saffisaan qunnami. Gabaasaaf suuraa iskiriinii, ergaa fi odeeffannoo kaffaltii kuusi.",
  "If a message looks official, it is safe.": "Ergaan tokko sirrii fakkaata yoo ta'e nageenya qaba.",
  "Scammers often copy logos, names, and wording very closely. Always verify using a trusted channel before acting.":
    "Gowwoomsitoonni asxaa, maqaa fi jechoota baay'ee fakkeessuu danda'u. Osoo hin tarkaanfatin karaa amanamaa ta'een yeroo hunda mirkaneeffadhu.",
  "Only people who click big links get scammed.":
    "Namoonni geessituu guddaa cuqaasan qofti gowwoomfamu.",
  "Scammers also use fake WhatsApp, Telegram, SMS, calls, and social media messages that do not require a large click.":
    "Gowwoomsitoonni WhatsApp, Telegram, SMS, bilbila fi ergaa miidiyaa hawaasaa sobaa, cuqaasuu guddaa hin barbaadne, ni fayyadamu.",
  "If I share an OTP once, it is not a big problem.":
    "Yoo OTP yeroo tokko qoodadhe rakkoo guddaa miti.",
  "A one-time code is meant to show identity. Sharing it can let someone access your account.":
    "Koodiin yeroo tokkoo eenyummaa mirkaneessuuf ta'a. Qooduun isaa nama biraa herrega kee akka seenu gochuu danda'a.",
  "A fake job or scholarship offer is harmless if I do not pay anything.":
    "Yoo homaa hin kaffalle dhiyeessiin hojii ykn barnootaa sobaa miidhaa hin qabu.",
  "Even without a payment, a scam can still try to collect your personal information or trick you into giving access to accounts.":
    "Kaffaltii malee illee gowwoomsaan odeeffannoo dhuunfaa kee sassaabuu ykn seensa herregaa akka kennitu si gowwoomsuu danda'a.",
  "Using only one strong password is enough for everything.":
    "Waan hundaaf jecha iccitii cimaa tokko fayyadamuun ni ga'a.",
  "A strong password helps, but using a unique password for each important account is much safer.":
    "Jechi iccitii cimaa ni gargaara; garuu herrega barbaachisaa hundaaf jecha iccitii addaa fayyadamuun baay'ee nageenya qaba.",
  "What should I do if I receive a payment or refund message that I did not expect?":
    "Yoo ergaa kaffaltii ykn deebii kaffaltii hin eegne argadhe maal gochuu qaba?",
  "Stop. Do not click any link or send money back. Open your official banking or mobile money app yourself, or contact the provider using a trusted number or app. Confirm the transaction there before doing anything else.":
    "Dhaabi. Geessituu hin cuqaasin; maallaqa hin deebisin. Appii baankii ykn maallaqa bilbilaa sirrii ofii kee bani, ykn lakkoofsa ykn appii amanamaa fayyadamuun tajaajila sana qunnami. Waan biraa gochuu kee dura kaffaltii achitti mirkaneeffadhu.",
  "How can I tell if a message is really from my bank or a service I use?":
    "Ergaan baankii koo ykn tajaajila ani fayyadamu irraa dhufuu isaa akkamittan beeka?",
  "Check the sender name, compare it with previous messages, and use the official app or website directly. Real companies usually do not ask you to share one-time codes or passwords in chat.":
    "Maqaa ergaa ilaali, ergaa duraanii wajjin walbira qabi, appii ykn marsariitii sirrii kallattiin fayyadami. Dhaabbileen dhugaa yeroo baay'ee koodii yeroo tokkoo ykn jecha iccitii chaatii keessatti akka qooddu hin gaafatan.",
  "Is a public Wi‑Fi network safe to use for my bank app?":
    "Appii baankii kootiif Wi-Fi uummataa fayyadamuun nageenya qabaa?",
  "Public Wi‑Fi is convenient, but it is never the safest option for banking or private accounts. If you must use it, avoid logging into sensitive accounts and use a trusted connection when possible.":
    "Wi-Fi uummataa mijataa dha, garuu baankii ykn herrega dhuunfaaf filannoo nageenya qabu miti. Yoo fayyadamuun dirqama ta'e, herrega iccitii hin seenin; yeroo danda'ametti qunnamtii amanamaa fayyadami.",
  "Do I need a password manager?": "Bulchaa jecha iccitii na barbaachisaa?",
  "Yes, if you have more than a few online accounts. A password manager helps you keep unique passwords without memorizing them all, which reduces the risk of one compromised account affecting others.":
    "Eeyyee, yoo herrega toora interneetii muraasa ol qabaatte. Bulchaan jecha iccitii hundaa yaadachuu malee jechoota adda addaa qabachuuf si gargaara; kunis herregni tokko miidhamuun kanneen biroo akka hin miine hir'isa.",
  "What if my account was already taken over?": "Yoo herregni koo duraan to'annoo jala oole maal gochuu qaba?",
  "Change the password immediately, sign out of other devices if possible, and check your email or app security settings. Then contact your bank, telecom provider, or the relevant service and report the incident.":
    "Jechi iccitii battalumatti jijjiiri; yoo danda'ame meeshaalee biroo irraa ba'i; qindaa'ina nageenyaa imeelii ykn appii ilaali. Sana booda baankii, tajaajila telekoomii ykn tajaajila dhimmi ilaallatu qunnamiitii rakkoo sana gabaasi.",
  "How do payment and receipt verification work?": "Kaffaltii fi nagahee akkamitti mirkaneessu?",
  "Pay using the instructions provided for your cohort, then submit the receipt with your enrollment. The team checks the receipt before confirming your place.":
    "Qajeelfama garee barattootaa keetiif kennameen kaffali; sana booda yeroo galmaa'uu nagahee ergi. Gareen keenya bakka kee osoo hin mirkaneessin dura nagahee ilaala.",
  "How long does receipt verification take?": "Mirkaneessi nagahee yeroo hammamii fudhata?",
  "Verification is usually completed within [CONFIRM POLICY] after your receipt is received.":
    "Nagaheen kee erga nu gahee booda mirkaneessi yeroo baay'ee [CONFIRM POLICY] keessatti xumurama.",
  "How do Telegram invites and Zoom sessions work?": "Affeerraan Telegram fi leenjii Zoom akkamitti hojjetu?",
  "After verification, the team shares cohort access details, including the Telegram group and Zoom session information. [CONFIRM POLICY]":
    "Mirkaneessa booda gareen odeeffannoo seensa garee barattootaa, Telegram fi leenjii Zoom siif qooda. [CONFIRM POLICY]",
  "What if I miss a session?": "Yoo leenjii tokko irraa hafee maal ta'a?",
  "Contact the cohort team for guidance on missed sessions and any available catch-up materials. [CONFIRM POLICY]":
    "Leenjii irraa hafte fi meeshaalee bakka bu'anii barachuuf jiran ilaalchisee qajeelfama argachuuf garee barattootaa qunnami. [CONFIRM POLICY]",
  "Will I receive a certificate?": "Ragaa xumuraa nan argadhaa?",
  "Certificate availability and completion requirements depend on the academy's current policy. [CONFIRM POLICY]":
    "Ragaan xumuraa jiraachuu fi ulaagaaleen xumuraa imaammata ammaa akademichaa irratti hundaa'u. [CONFIRM POLICY]",
  "Who should I contact if I need help?": "Yoo gargaarsa na barbaachise eenyu qunnamuu qaba?",
  "Reply through the official academy contact channel used for your enrollment and include your course and cohort details. [CONFIRM POLICY]":
    "Karaa qunnamtii sirrii akademichi galmee kee irratti fayyadameen deebii kenni; odeeffannoo koorsii fi garee barattootaa kee dabaladhu. [CONFIRM POLICY]",
  "Can I get a refund?": "Maallaqa deebifamuu argachuu nan danda'aa?",
  "Refund eligibility and timing depend on the academy's current refund policy. Please confirm the policy with the academy before paying. [CONFIRM POLICY]":
    "Ulaagaan fi yeroo maallaqa deebisanii kaffaluu imaammata ammaa akademichaa irratti hundaa'a. Osoo hin kaffalin imaammata akademichaa mirkaneeffadhu. [CONFIRM POLICY]",
};

const amharicPublicUi: TranslationTable = {
  "Close navigation menu": "የማውጫ ምናሌውን ዝጋ",
  "Open navigation menu": "የማውጫ ምናሌውን ክፈት",
  Breadcrumb: "የገጽ መንገድ",
  "Next cohort": "ቀጣይ ቡድን",
  "Checking availability...": "መገኘቱን በማረጋገጥ ላይ...",
  "Enrollment unavailable": "ምዝገባ አይገኝም",
  "Our learning principles": "የትምህርት መርሆዎቻችን",
  "seats left": "ቀሪ ቦታዎች",
  "How it runs": "እንዴት እንደሚካሄድ",
  Platform: "መድረክ",
  Schedule: "የጊዜ ሰሌዳ",
  "Start date": "የመጀመሪያ ቀን",
  Duration: "ቆይታ",
  Language: "ቋንቋ",
  "Cohorts per year": "በዓመት የቡድን ብዛት",
  "12-week syllabus": "የ12 ሳምንት የትምህርት ዕቅድ",
  Week: "ሳምንት",
  "Who it’s for": "ለማን እንደሚሆን",
  "Who it’s for and requirements": "ለማን እንደሚሆንና መስፈርቶቹ",
  "Perfect if you...": "ይህ ለእርስዎ ተስማሚ ነው ከሆነ...",
  Requirements: "መስፈርቶች",
  "Enroll in this cohort": "በዚህ ቡድን ይመዝገቡ",
  "Cohort enrollment": "የቡድን ምዝገባ",
  "Cohort full": "ቡድኑ ሞልቷል",
  "Enroll now": "አሁን ይመዝገቡ",
  Instructors: "አስተማሪዎች",
  "What you’ll learn": "የሚማሩት",
  "Loading related courses...": "ተዛማጅ ኮርሶችን በመጫን ላይ...",
  "Related courses are temporarily unavailable.": "ተዛማጅ ኮርሶች ለጊዜው አይገኙም።",
  "Related courses": "ተዛማጅ ኮርሶች",
  "Phishing messages and fake links": "የማስገር መልዕክቶችና የሐሰት አገናኞች",
  "A scammer pretends to be a trusted sender and asks you to click a link or log in quickly.":
    "አጭበርባሪ የታመነ ላኪ መስሎ አገናኝ እንዲጫኑ ወይም በፍጥነት እንዲገቡ ይጠይቃል።",
  "A message looks like it came from your bank and says your account is blocked, asking you to click a link to 'fix' it.":
    "መልዕክቱ ከባንክዎ የመጣ ይመስላል፤ ሂሳብዎ ታግዷል ብሎ 'ለማስተካከል' አገናኝ እንዲጫኑ ይጠይቃል።",
  "It creates urgency or fear.": "አስቸኳይነት ወይም ፍርሃት ይፈጥራል።",
  "The sender asks you to log in from a link you did not expect.":
    "ላኪው ከማይጠብቁት አገናኝ እንዲገቡ ይጠይቃል።",
  "The message uses poor grammar or odd wording.": "መልዕክቱ የተሳሳተ ሰዋሰው ወይም ያልተለመዱ ቃላት ይጠቀማል።",
  "Open the official app or website yourself instead of tapping a link in the message.":
    "በመልዕክቱ ያለውን አገናኝ ከመጫን ይልቅ ኦፊሴላዊውን መተግበሪያ ወይም ድረ-ገጽ እራስዎ ይክፈቱ።",
  "Check the sender name and contact details before replying.":
    "ከመመለስዎ በፊት የላኪውን ስምና የመገኛ መረጃ ያረጋግጡ።",
  "If unsure, ignore it and confirm through the official channel.":
    "እርግጠኛ ካልሆኑ ችላ ይበሉትና በኦፊሴላዊ መንገድ ያረጋግጡ።",
  "Telegram and social media scams": "የTelegramና የማህበራዊ ሚዲያ ማጭበርበሮች",
  "Scammers pose as admin staff, friends, or business contacts and ask for money or account access.":
    "አጭበርባሪዎች አስተዳዳሪዎች፣ ጓደኞች ወይም የሥራ ተገናኞች መስለው ገንዘብ ወይም የሂሳብ መዳረሻ ይጠይቃሉ።",
  "A Telegram account pretending to be your group admin asks members to send payment for a 'new fee' or to share a code.":
    "የቡድንዎ አስተዳዳሪ መስሎ የሚታይ የTelegram ሂሳብ አባላትን ለ'አዲስ ክፍያ' ገንዘብ እንዲልኩ ወይም ኮድ እንዲያጋሩ ይጠይቃል።",
  "The account name looks almost the same as a real one.": "የሂሳቡ ስም ከእውነተኛው ጋር በጣም ይመሳሰላል።",
  "The person asks you to act fast and keeps changing the story.":
    "ሰውየው በፍጥነት እንዲያደርጉ ይጠይቃል እና ታሪኩን ይቀያይራል።",
  "They ask for payment, OTP codes, or private information.": "ክፍያ፣ OTP ኮዶች ወይም የግል መረጃ ይጠይቃሉ።",
  "Verify the identity of the person through a trusted contact method.":
    "በታመነ የመገናኛ ዘዴ የሰውየውን ማንነት ያረጋግጡ።",
  "Do not share private codes or login details in chat.": "የግል ኮዶችን ወይም የመግቢያ ዝርዝሮችን በቻት አያጋሩ።",
  "Report the account and warn your group or contacts.": "ሂሳቡን ሪፖርት ያድርጉና ቡድንዎን ወይም ተገናኞችዎን ያስጠነቅቁ።",
  "Mobile money fraud": "የሞባይል ገንዘብ ማጭበርበር",
  "Attackers may ask you to approve a payment, receive a fake refund, or help with a 'cancelled transfer'.":
    "አጥቂዎች ክፍያን እንዲያጸድቁ፣ የሐሰት ተመላሽ እንዲቀበሉ ወይም 'የተሰረዘ ማስተላለፍ'ን እንዲያግዙ ሊጠይቁ ይችላሉ።",
  "You receive a fake Telebirr or bank SMS saying you were paid too much and must send part of it back immediately.":
    "ከTelebirr ወይም ከባንክ የመጣ የሐሰት SMS ከልክ በላይ ተከፍሎዎታልና ከፊሉን ወዲያውኑ ይመልሱ ይላል።",
  "The message asks you to send money back before checking.": "መልዕክቱ ከማረጋገጥዎ በፊት ገንዘብ እንዲመልሱ ይጠይቃል።",
  "It sounds like a refund, prize, or reward is being processed.": "ተመላሽ፣ ሽልማት ወይም ስጦታ እየተዘጋጀ እንዳለ ይነግራል።",
  "The sender insists on secrecy or asks you to keep it private.": "ላኪው ምስጢር እንዲጠብቁ ወይም ለሌሎች እንዳይነግሩ ይጠይቃል።",
  "Stop and contact your bank or mobile money provider using their official number or app.":
    "ያቁሙና የባንክዎን ወይም የሞባይል ገንዘብ አቅራቢዎን በኦፊሴላዊ ቁጥር ወይም መተግበሪያ ያነጋግሩ።",
  "Do not send money or code numbers to anyone who contacted you unexpectedly.":
    "ባልጠበቁት መንገድ ለደወለዎት ወይም ለጻፈልዎት ሰው ገንዘብ ወይም ኮድ አይላኩ።",
  "Check transaction history for unusual charges right away.": "ያልተለመዱ ክፍያዎችን ለመፈለግ የግብይት ታሪክዎን ወዲያውኑ ይመልከቱ።",
  "Fake job and scholarship offers": "የሐሰት የሥራና የትምህርት ዕድሎች",
  "Scammers promise jobs, internships, or scholarships and ask for a payment before you start.":
    "አጭበርባሪዎች ሥራ፣ ልምምድ ወይም የትምህርት ዕድል ቃል ገብተው ከመጀመርዎ በፊት ክፍያ ይጠይቃሉ።",
  "A message says you were selected for a scholarship and only need to pay a 'processing fee' to receive it.":
    "መልዕክቱ ለትምህርት ዕድል ተመርጠዋልና ለመቀበል 'የማስኬጃ ክፍያ' ብቻ ይክፈሉ ይላል።",
  "They ask for money before you have a real interview or offer.": "እውነተኛ ቃለ መጠይቅ ወይም ቅጥር ሳይኖር ገንዘብ ይጠይቃሉ።",
  "The email or chat does not match a real organization.": "ኢሜይሉ ወይም ቻቱ ከእውነተኛ ድርጅት ጋር አይዛመድም።",
  "They promise quick approval with no proper documents or process.": "ተገቢ ሰነድ ወይም ሂደት ሳይኖር ፈጣን ማጽደቅ ቃል ይገባሉ።",
  "Ask for a real company or school contact and check their official website.":
    "የእውነተኛ ኩባንያ ወይም ትምህርት ቤት መገኛ ይጠይቁና ኦፊሴላዊ ድረ-ገጻቸውን ይመልከቱ።",
  "Never pay a fee for a job or scholarship without proper verification.":
    "በትክክል ሳያረጋግጡ ለሥራ ወይም ለትምህርት ዕድል ክፍያ ፈጽሞ አይክፈሉ።",
  "Look for official email addresses, documents, and a public contact method.":
    "ኦፊሴላዊ የኢሜይል አድራሻዎችን፣ ሰነዶችንና ለሕዝብ የተከፈተ መገኛ ይፈልጉ።",
  "Weak and reused passwords": "ደካማና በድጋሚ የሚጠቀሙባቸው የይለፍ ቃላት",
  "If one account is weak, a scammer may use it to get into your email, banking app, or social media.":
    "አንድ ሂሳብ ደካማ ከሆነ አጭበርባሪ ወደ ኢሜይልዎ፣ የባንክ መተግበሪያዎ ወይም ማህበራዊ ሚዲያዎ ለመግባት ሊጠቀምበት ይችላል።",
  "A reused password from one app is used again on a work or school account, making it easier for attackers to take over more than one account.":
    "ከአንድ መተግበሪያ የተወሰደ የይለፍ ቃል በሥራ ወይም በትምህርት ሂሳብ ላይ መድገሙ አጥቂዎች ከአንድ በላይ ሂሳብ እንዲቆጣጠሩ ያቀላል።",
  "The same password is used across multiple apps.": "በብዙ መተግበሪያዎች ላይ አንድ የይለፍ ቃል ይጠቀማሉ።",
  "A password is short, personal, or easy to guess.": "የይለፍ ቃሉ አጭር፣ የግል ወይም በቀላሉ የሚገመት ነው።",
  "You keep resetting your password after login issues.": "ከመግቢያ ችግሮች በኋላ የይለፍ ቃልዎን ደጋግመው ያድሳሉ።",
  "Use a password manager to create unique passwords for each account.":
    "ለእያንዳንዱ ሂሳብ ልዩ የይለፍ ቃል ለመፍጠር የይለፍ ቃል አስተዳዳሪ ይጠቀሙ።",
  "Turn on two-step verification where available.": "በሚገኝበት ቦታ የሁለት-ደረጃ ማረጋገጫን ያብሩ።",
  "Change any reused passwords that are still in use.": "አሁንም የሚጠቀሙባቸውን የተደጋገሙ የይለፍ ቃላት ይቀይሩ።",
  "Account takeover": "የሂሳብ ቁጥጥር መውሰድ",
  "Once attackers get access to an email or social account, they can impersonate you or reset other accounts.":
    "አጥቂዎች ወደ ኢሜይል ወይም ማህበራዊ ሚዲያ ሂሳብ ከገቡ እርስዎን መምሰል ወይም ሌሎች ሂሳቦችን ማደስ ይችላሉ።",
  "A scammer gets into your email and uses it to send fake messages to friends asking for money or asking them to click a link.":
    "አጭበርባሪ ወደ ኢሜይልዎ ገብቶ ገንዘብ የሚጠይቁ ወይም አገናኝ እንዲጫኑ የሚጠይቁ የሐሰት መልዕክቶችን ለጓደኞችዎ ይልካል።",
  "You get alerts for logins you did not make.": "እርስዎ ላልገቡባቸው መግቢያዎች ማስጠንቀቂያ ይደርስዎታል።",
  "Your contacts receive strange messages from your account.": "ተገናኞችዎ ከሂሳብዎ ያልተለመዱ መልዕክቶች ይቀበላሉ።",
  "You suddenly cannot log in or your password was changed without your action.":
    "በድንገት መግባት አይችሉም ወይም እርስዎ ሳይቀይሩት የይለፍ ቃልዎ ተቀይሯል።",
  "Log out of all sessions and change your password right away.": "ከሁሉም ክፍለ ጊዜዎች ይውጡና የይለፍ ቃልዎን ወዲያውኑ ይቀይሩ።",
  "Check the account recovery email and security settings.": "የሂሳብ መመለሻ ኢሜይልና የደህንነት ቅንብሮችን ይመልከቱ።",
  "Tell your contacts that your account may have been compromised.":
    "ሂሳብዎ ሊጠለፍ እንደቻለ ለተገናኞችዎ ይንገሩ።",
  "Malware, cracked apps, and unknown APKs": "ማልዌር፣ የተሰነጠቁ መተግበሪያዎችና ያልታወቁ APKዎች",
  "Unknown apps and modified files can give attackers access to messages, contacts, and money apps.":
    "ያልታወቁ መተግበሪያዎችና የተቀየሩ ፋይሎች ለአጥቂዎች ወደ መልዕክቶች፣ ተገናኞችና የገንዘብ መተግበሪያዎች መዳረሻ ሊሰጡ ይችላሉ።",
  "An APK or cracked app promises a free version of a popular app but installs software that steals information from your phone.":
    "APK ወይም የተሰነጠቀ መተግበሪያ የታዋቂ መተግበሪያ ነፃ ስሪት እንደሚሰጥ ቃል ገብቶ ከስልክዎ መረጃ የሚሰርቅ ሶፍትዌር ይጭናል።",
  "The app comes from a random website or unofficial source.": "መተግበሪያው ከዘፈቀደ ድረ-ገጽ ወይም ኦፊሴላዊ ካልሆነ ምንጭ መጥቷል።",
  "It asks for unnecessary permissions or access.": "አላስፈላጊ ፈቃዶችን ወይም መዳረሻን ይጠይቃል።",
  "Your phone slows down or shows pop-ups after installation.": "ከተጫነ በኋላ ስልክዎ ይዘገያል ወይም ብቅ ባይ መልዕክቶችን ያሳያል።",
  "Only install apps from official stores and verified sources.": "መተግበሪያዎችን ከኦፊሴላዊ መደብሮችና ከተረጋገጡ ምንጮች ብቻ ይጫኑ።",
  "Remove unknown apps and check device permissions.": "ያልታወቁ መተግበሪያዎችን ያስወግዱና የመሣሪያውን ፈቃዶች ይመልከቱ።",
  "Update your apps and phone operating system regularly.": "መተግበሪያዎችዎንና የስልክዎን ስርዓት በየጊዜው ያዘምኑ።",
  "Public Wi-Fi and SIM swap": "የሕዝብ Wi-Fiና SIM መቀየር",
  "Open networks and account recovery tricks can leave you exposed to scammers or identity theft.":
    "ክፍት ኔትወርኮችና የሂሳብ መመለሻ ዘዴዎች ለአጭበርባሪዎች ወይም ለማንነት ስርቆት ሊያጋልጡዎት ይችላሉ።",
  "Someone calls, says they are from the telecom operator, and convinces you to move your number to a new SIM while you are on public Wi-Fi.":
    "አንድ ሰው ከቴሌኮም እንደሆነ ደውሎ በሕዝብ Wi-Fi ላይ ሳሉ ቁጥርዎን ወደ አዲስ SIM እንዲያዛውሩ ያሳምንዎታል።",
  "A caller asks you to share a one-time code or SIM activation status.":
    "ደዋዩ የአንድ ጊዜ ኮድ ወይም የSIM ማስነሻ ሁኔታ እንዲያጋሩ ይጠይቃል።",
  "The network is public and you are asked to log in to a site that does not look official.":
    "ኔትወርኩ የሕዝብ ነው እና ኦፊሴላዊ የማይመስል ጣቢያ እንዲገቡ ይጠይቃሉ።",
  "You receive an unexpected change in your mobile signal or account status.":
    "በሞባይል ምልክትዎ ወይም በሂሳብ ሁኔታዎ ላይ ያልጠበቁት ለውጥ ያጋጥምዎታል።",
  "Avoid logging into sensitive accounts on public Wi-Fi unless needed.":
    "ካላስፈለገ በሕዝብ Wi-Fi ላይ ወደ ሚስጥራዊ ሂሳቦች ከመግባት ይቆጠቡ።",
  "Never share OTP codes with a caller or message.": "የOTP ኮዶችን ለደዋይ ወይም ለመልዕክት ፈጽሞ አያጋሩ።",
  "Contact your telecom provider if you suspect your SIM was changed or your account was altered.":
    "SIMዎ እንደተቀየረ ወይም ሂሳብዎ እንደተለወጠ ከጠረጠሩ የቴሌኮም አቅራቢዎን ያነጋግሩ።",
  "Use two-step verification on your important accounts.": "በአስፈላጊ ሂሳቦችዎ ላይ ባለ ሁለት ደረጃ ማረጋገጫን ይጠቀሙ።",
  "Keep a password manager and use unique passwords for each account.":
    "የይለፍ ቃል አስተዳዳሪ ይጠቀሙና ለእያንዳንዱ ሂሳብ ልዩ የይለፍ ቃል ይጠቀሙ።",
  "Update your phone, apps, and browser as soon as new versions arrive.":
    "አዳዲስ ስሪቶች ሲወጡ ስልክዎን፣ መተግበሪያዎችንና አሳሹን ያዘምኑ።",
  "Never share a one-time password or OTP code with anyone.": "የአንድ ጊዜ የይለፍ ቃል ወይም OTP ኮድ ለማንም አያጋሩ።",
  "Check the full website address before entering your username or password.":
    "የተጠቃሚ ስምዎን ወይም የይለፍ ቃልዎን ከማስገባትዎ በፊት ሙሉውን የድረ-ገጽ አድራሻ ይመልከቱ።",
  "Do not click links in unexpected SMS, chat, or email messages.":
    "ባልጠበቁት SMS፣ ቻት ወይም ኢሜይል መልዕክቶች ውስጥ ያሉ አገናኞችን አይጫኑ።",
  "Verify a request by calling or messaging the real business or person.":
    "እውነተኛውን ድርጅት ወይም ሰው በመደወል ወይም በመልዕክት ጥያቄውን ያረጋግጡ።",
  "Keep your phone contacts and bank details in a trusted, known place.":
    "የስልክ ተገናኞችዎንና የባንክ ዝርዝሮችዎን በታመነና በሚታወቅ ቦታ ያስቀምጡ።",
  "Be careful with public Wi-Fi and avoid sensitive logins on shared networks.":
    "በሕዝብ Wi-Fi ላይ ይጠንቀቁና በጋራ ኔትወርኮች ላይ ወደ ሚስጥራዊ ሂሳቦች ከመግባት ይቆጠቡ።",
  "If a deal looks too good to be true, treat it as suspicious.":
    "አንድ ቅናሽ እውነት ለመሆን በጣም ጥሩ ከሚመስል፣ እንደ አጠራጣሪ ይውሰዱት።",
  "Urgent payment or action": "አስቸኳይ ክፍያ ወይም እርምጃ",
  "The sender says you must move money or confirm a payment immediately.":
    "ላኪው ገንዘብ ማስተላለፍ ወይም ክፍያን ወዲያውኑ ማረጋገጥ እንዳለብዎ ይነግርዎታል።",
  "Too good to be true": "እውነት ለመሆን በጣም ጥሩ",
  "A job, prize, or scholarship sounds unusually easy or generous.":
    "ሥራ፣ ሽልማት ወይም የትምህርት ዕድል ያልተለመደ ቀላል ወይም ለጋስ ይመስላል።",
  "Unexpected link": "ያልተጠበቀ አገናኝ",
  "A message tells you to click a link instead of using the official app or website.":
    "መልዕክቱ ኦፊሴላዊውን መተግበሪያ ወይም ድረ-ገጽ ከመጠቀም ይልቅ አገናኝ እንዲጫኑ ይነግርዎታል።",
  "Requests for codes": "የኮድ ጥያቄዎች",
  "Someone asks for your OTP, PIN, or login code, even if they claim to be a helper.":
    "ረዳት ነኝ ቢሉም አንድ ሰው OTP፣ PIN ወይም የመግቢያ ኮድዎን ይጠይቃል።",
  "Mismatched sender": "የማይዛመድ ላኪ",
  "The sender name is close to a real one but not quite the same.":
    "የላኪው ስም ከእውነተኛው ጋር ይመሳሰላል ግን ሙሉ በሙሉ አንድ አይደለም።",
  "Pressure and secrecy": "ጫናና ምስጢር",
  "The message says to keep it quiet and not ask others for help.":
    "መልዕክቱ ዝም እንዲሉና ከሌሎች እርዳታ እንዳይጠይቁ ይነግርዎታል።",
  "Pause contact: stop replying to the sender and do not send any more codes or payment.":
    "ግንኙነቱን ያቁሙ፦ ለላኪው መመለስ ያቁሙና ተጨማሪ ኮዶች ወይም ክፍያ አይላኩ።",
  "Secure your accounts: change passwords, sign out from other devices, and turn on two-step verification.":
    "ሂሳቦችዎን ይጠብቁ፦ የይለፍ ቃላትን ይቀይሩ፣ ከሌሎች መሣሪያዎች ይውጡና የሁለት-ደረጃ ማረጋገጫን ያብሩ።",
  "Contact your bank or mobile money provider: ask them to review the account and freeze or flag unusual activity.":
    "ባንክዎን ወይም የሞባይል ገንዘብ አቅራቢዎን ያነጋግሩ፦ ሂሳቡን እንዲመረምሩና ያልተለመደ እንቅስቃሴን እንዲያግዱ ወይም ምልክት እንዲያደርጉ ይጠይቁ።",
  "Check your phone: remove suspicious apps, review permissions, and update your software.":
    "ስልክዎን ይመልከቱ፦ አጠራጣሪ መተግበሪያዎችን ያስወግዱ፣ ፈቃዶችን ይመርምሩና ሶፍትዌሩን ያዘምኑ።",
  "Report it: tell the relevant authorities and warn your family, coworkers, or business contacts if needed.":
    "ሪፖርት ያድርጉ፦ ለሚመለከታቸው ባለሥልጣናት ይንገሩና ካስፈለገ ቤተሰብዎን፣ የሥራ ባልደረቦችዎን ወይም የንግድ ተገናኞችዎን ያስጠነቅቁ።",
  "Contact your bank or mobile money provider and the relevant authorities as soon as possible. Keep screenshots, messages, and transaction details to help with the report.":
    "ባንክዎን ወይም የሞባይል ገንዘብ አቅራቢዎንና ተዛማጅ ባለሥልጣናትን በተቻለ ፍጥነት ያነጋግሩ። ሪፖርቱን ለማገዝ የማያ ገጽ ቅጂዎችን፣ መልዕክቶችንና የግብይት ዝርዝሮችን ያስቀምጡ።",
  "If a message looks official, it is safe.": "መልዕክት ኦፊሴላዊ ከመሰለ ደህንነቱ የተጠበቀ ነው።",
  "Scammers often copy logos, names, and wording very closely. Always verify using a trusted channel before acting.":
    "አጭበርባሪዎች አርማዎችን፣ ስሞችንና አገላለጾችን በጣም ይኮርጃሉ። ከመወሰንዎ በፊት በታመነ መንገድ ሁልጊዜ ያረጋግጡ።",
  "Only people who click big links get scammed.": "ትልቅ አገናኝ የሚጫኑ ሰዎች ብቻ ይጭበረበራሉ።",
  "Scammers also use fake WhatsApp, Telegram, SMS, calls, and social media messages that do not require a large click.":
    "አጭበርባሪዎች ትልቅ ጠቅታ የማይፈልጉ የሐሰት WhatsApp፣ Telegram፣ SMS፣ ጥሪዎችንና የማህበራዊ ሚዲያ መልዕክቶችንም ይጠቀማሉ።",
  "If I share an OTP once, it is not a big problem.": "አንድ ጊዜ OTP ብጋራ ትልቅ ችግር አይደለም።",
  "A one-time code is meant to show identity. Sharing it can let someone access your account.":
    "የአንድ ጊዜ ኮድ ማንነትን ለማረጋገጥ ነው። ካጋሩት ሌላ ሰው ወደ ሂሳብዎ ሊገባ ይችላል።",
  "A fake job or scholarship offer is harmless if I do not pay anything.":
    "ምንም ካልከፈልኩ የሐሰት ሥራ ወይም የትምህርት ዕድል ጉዳት የለውም።",
  "Even without a payment, a scam can still try to collect your personal information or trick you into giving access to accounts.":
    "ክፍያ ባይኖርም ማጭበርበር የግል መረጃዎን ለመሰብሰብ ወይም የሂሳብ መዳረሻ እንዲሰጡ ለማታለል ሊሞክር ይችላል።",
  "Using only one strong password is enough for everything.": "ለሁሉም ነገር አንድ ጠንካራ የይለፍ ቃል መጠቀም በቂ ነው።",
  "A strong password helps, but using a unique password for each important account is much safer.":
    "ጠንካራ የይለፍ ቃል ይረዳል፤ ለእያንዳንዱ አስፈላጊ ሂሳብ የተለየ ቃል መጠቀም ግን የበለጠ ደህንነት አለው።",
  "What should I do if I receive a payment or refund message that I did not expect?":
    "ያልጠበቅኩት የክፍያ ወይም የተመላሽ ገንዘብ መልዕክት ከደረሰኝ ምን ላድርግ?",
  "Stop. Do not click any link or send money back. Open your official banking or mobile money app yourself, or contact the provider using a trusted number or app. Confirm the transaction there before doing anything else.":
    "ያቁሙ። ማንኛውንም አገናኝ አይጫኑ ወይም ገንዘብ አይመልሱ። ኦፊሴላዊውን የባንክ ወይም የሞባይል ገንዘብ መተግበሪያ እራስዎ ይክፈቱ ወይም አቅራቢውን በታመነ ቁጥር ወይም መተግበሪያ ያነጋግሩ። ሌላ ነገር ከማድረግዎ በፊት ግብይቱን እዚያ ያረጋግጡ።",
  "How can I tell if a message is really from my bank or a service I use?":
    "መልዕክት ከባንክዬ ወይም ከምጠቀምበት አገልግሎት መሆኑን እንዴት ልለይ?",
  "Check the sender name, compare it with previous messages, and use the official app or website directly. Real companies usually do not ask you to share one-time codes or passwords in chat.":
    "የላኪውን ስም ይመልከቱ፣ ከቀድሞ መልዕክቶች ጋር ያወዳድሩና ኦፊሴላዊውን መተግበሪያ ወይም ድረ-ገጽ በቀጥታ ይጠቀሙ። እውነተኛ ኩባንያዎች በቻት የአንድ ጊዜ ኮዶችን ወይም የይለፍ ቃላትን እንዲያጋሩ ብዙ ጊዜ አይጠይቁም።",
  "Is a public Wi‑Fi network safe to use for my bank app?":
    "ለባንክ መተግበሪያዬ የሕዝብ Wi-Fi ኔትወርክ መጠቀም ደህንነቱ የተጠበቀ ነው?",
  "Public Wi‑Fi is convenient, but it is never the safest option for banking or private accounts. If you must use it, avoid logging into sensitive accounts and use a trusted connection when possible.":
    "የሕዝብ Wi-Fi ምቹ ቢሆንም ለባንክ ወይም ለግል ሂሳቦች በጣም ደህንነቱ የተጠበቀ አማራጭ አይደለም። መጠቀም ካለብዎ ወደ ሚስጥራዊ ሂሳቦች ከመግባት ይቆጠቡና ከተቻለ የታመነ ግንኙነት ይጠቀሙ።",
  "Do I need a password manager?": "የይለፍ ቃል አስተዳዳሪ ያስፈልገኛል?",
  "Yes, if you have more than a few online accounts. A password manager helps you keep unique passwords without memorizing them all, which reduces the risk of one compromised account affecting others.":
    "አዎ፣ ከጥቂት በላይ የመስመር ላይ ሂሳቦች ካሉዎት። የይለፍ ቃል አስተዳዳሪ ሁሉንም ሳያስታውሱ የተለያዩ የይለፍ ቃላትን እንዲይዙ ይረዳዎታል፤ ይህም አንድ የተጠለፈ ሂሳብ ሌሎቹን የመጉዳት አደጋ ይቀንሳል።",
  "What if my account was already taken over?": "ሂሳቤ ቀድሞውኑ ቁጥጥር ስር ከዋለስ?",
  "Change the password immediately, sign out of other devices if possible, and check your email or app security settings. Then contact your bank, telecom provider, or the relevant service and report the incident.":
    "የይለፍ ቃሉን ወዲያውኑ ይቀይሩ፣ ከተቻለ ከሌሎች መሣሪያዎች ይውጡና የኢሜይልዎን ወይም የመተግበሪያዎን የደህንነት ቅንብሮች ይመልከቱ። ከዚያ ባንክዎን፣ የቴሌኮም አቅራቢዎን ወይም ተዛማጁን አገልግሎት ያነጋግሩና ክስተቱን ሪፖርት ያድርጉ።",
  "How do payment and receipt verification work?": "የክፍያና ደረሰኝ ማረጋገጫ እንዴት ይሰራል?",
  "Pay using the instructions provided for your cohort, then submit the receipt with your enrollment. The team checks the receipt before confirming your place.":
    "ለቡድንዎ በተሰጡት መመሪያዎች መሠረት ይክፈሉ፣ ከዚያ ሲመዘገቡ ደረሰኙን ያስገቡ። ቡድኑ ቦታዎን ከማረጋገጡ በፊት ደረሰኙን ይመረምራል።",
  "How long does receipt verification take?": "ደረሰኝን ለማረጋገጥ ምን ያህል ጊዜ ይወስዳል?",
  "Verification is usually completed within [CONFIRM POLICY] after your receipt is received.":
    "ደረሰኝዎ ከደረሰ በኋላ ማረጋገጫው ብዙ ጊዜ በ[CONFIRM POLICY] ውስጥ ይጠናቀቃል።",
  "How do Telegram invites and Zoom sessions work?": "የTelegram ግብዣዎችና የZoom ክፍለ ጊዜዎች እንዴት ይሰራሉ?",
  "After verification, the team shares cohort access details, including the Telegram group and Zoom session information. [CONFIRM POLICY]":
    "ከማረጋገጫው በኋላ ቡድኑ የTelegram ቡድንና የZoom ክፍለ ጊዜ መረጃን ጨምሮ የቡድኑን መዳረሻ ዝርዝሮች ያጋራል። [CONFIRM POLICY]",
  "What if I miss a session?": "ክፍለ ጊዜ ካመለጠኝ ምን ይሆናል?",
  "Contact the cohort team for guidance on missed sessions and any available catch-up materials. [CONFIRM POLICY]":
    "ስለ ያመለጡ ክፍለ ጊዜዎችና ሊገኙ ስለሚችሉ ተጨማሪ ትምህርቶች መመሪያ ለማግኘት የቡድኑን አባላት ያነጋግሩ። [CONFIRM POLICY]",
  "Will I receive a certificate?": "የምስክር ወረቀት አገኛለሁ?",
  "Certificate availability and completion requirements depend on the academy's current policy. [CONFIRM POLICY]":
    "የምስክር ወረቀት መገኘትና የማጠናቀቂያ መስፈርቶች በአካዳሚው የአሁኑ ፖሊሲ ላይ ይመሰረታሉ። [CONFIRM POLICY]",
  "Who should I contact if I need help?": "እርዳታ ካስፈለገኝ ማንን ማነጋገር አለብኝ?",
  "Reply through the official academy contact channel used for your enrollment and include your course and cohort details. [CONFIRM POLICY]":
    "ለምዝገባዎ የተጠቀሙትን የአካዳሚውን ኦፊሴላዊ የመገናኛ መንገድ በመጠቀም ይመልሱና የኮርስዎንና የቡድንዎን ዝርዝሮች ያካትቱ። [CONFIRM POLICY]",
  "Can I get a refund?": "ገንዘቤን ተመላሽ ማግኘት እችላለሁ?",
  "Refund eligibility and timing depend on the academy's current refund policy. Please confirm the policy with the academy before paying. [CONFIRM POLICY]":
    "የተመላሽ ገንዘብ ብቁነትና ጊዜ በአካዳሚው የአሁኑ የተመላሽ ፖሊሲ ላይ ይመሰረታሉ። ከመክፈልዎ በፊት ፖሊሲውን ከአካዳሚው ጋር ያረጋግጡ። [CONFIRM POLICY]",
};

export const translations: Record<Exclude<Language, "en">, TranslationTable> = {
  om: { ...oromo, ...oromoExtra, ...oromoPublicUi },
  am: { ...amharic, ...amharicExtra, ...amharicPublicUi },
};
