const BPC_DATA = [
  {
    section: "Section 379",
    title: "Theft",
    description: "Dishonestly taking movable property out of another person's possession without consent.",
    keywords: ["theft", "stolen", "চুরি", "bike stolen", "mobile stolen"]
  },
  {
    section: "Section 380",
    title: "Theft in Dwelling House",
    description: "Theft committed in any building, tent, or vessel used as a human dwelling or custody of property.",
    keywords: ["house theft", "home theft", "dwelling", "বাসা থেকে চুরি"]
  },
  {
    section: "Section 392",
    title: "Robbery",
    description: "Committing theft or extortion with violence, threat, or fear of instant harm.",
    keywords: ["robbery", "snatching", "mugging", "ছিনতাই"]
  },
  {
    section: "Section 302",
    title: "Murder",
    description: "Punishment for murder where death is caused with requisite intent.",
    keywords: ["murder", "killed", "হত্যা", "dead body"]
  },
  {
    section: "Section 304",
    title: "Culpable Homicide Not Amounting to Murder",
    description: "Punishment for causing death in circumstances not amounting to murder.",
    keywords: ["homicide", "caused death", "দায়িত্বহীনতায় মৃত্যু"]
  },
  {
    section: "Section 323",
    title: "Voluntarily Causing Hurt",
    description: "Punishment for intentionally causing bodily pain, disease, or infirmity.",
    keywords: ["hurt", "injury", "beating", "মারধর"]
  },
  {
    section: "Section 324",
    title: "Hurt by Dangerous Weapons",
    description: "Causing hurt by dangerous weapons or means.",
    keywords: ["knife attack", "weapon injury", "ধারালো অস্ত্র"]
  },
  {
    section: "Section 325",
    title: "Grievous Hurt",
    description: "Punishment for voluntarily causing grievous hurt.",
    keywords: ["serious injury", "grievous", "গুরুতর জখম"]
  },
  {
    section: "Section 354",
    title: "Assault or Criminal Force to Woman",
    description: "Assault or criminal force to woman with intent to outrage modesty.",
    keywords: ["harassment", "woman assaulted", "শ্লীলতাহানি", "eve teasing"]
  },
  {
    section: "Section 354A",
    title: "Sexual Harassment",
    description: "Acts amounting to sexual harassment including unwelcome physical contact or advances.",
    keywords: ["sexual harassment", "unwanted touch", "যৌন হয়রানি"]
  },
  {
    section: "Section 506",
    title: "Criminal Intimidation",
    description: "Threatening another with injury to person, reputation, or property.",
    keywords: ["threat", "threatened with knife", "ভয়ভীতি", "হুমকি"]
  },
  {
    section: "Section 420",
    title: "Cheating and Dishonestly Inducing Delivery of Property",
    description: "Cheating that dishonestly induces the victim to deliver property.",
    keywords: ["fraud", "scam", "cheating", "প্রতারণা"]
  },
  {
    section: "Section 406",
    title: "Criminal Breach of Trust",
    description: "Dishonest misappropriation or conversion of entrusted property.",
    keywords: ["breach of trust", "entrusted money", "আমানত ভঙ্গ"]
  },
  {
    section: "Section 279",
    title: "Rash Driving on Public Way",
    description: "Driving rashly or negligently endangering human life on a public way.",
    keywords: ["road accident", "rash driving", "বাস দুর্ঘটনা", "hit and run"]
  },
  {
    section: "Section 304A",
    title: "Causing Death by Negligence",
    description: "Causing death by any rash or negligent act not amounting to culpable homicide.",
    keywords: ["death by negligence", "negligent driving", "অবহেলাজনিত মৃত্যু"]
  },
  {
    section: "Section 365",
    title: "Kidnapping or Abduction with Intent to Secretly and Wrongfully Confine",
    description: "Kidnapping/abduction with intent to confine the person wrongfully.",
    keywords: ["kidnapped", "abduction", "missing child", "অপহরণ"]
  },
  {
    section: "Section 366",
    title: "Kidnapping or Abducting Woman",
    description: "Kidnapping or abducting a woman for illicit purpose or forced marriage.",
    keywords: ["abducting woman", "forced marriage", "মেয়ে অপহরণ"]
  },
  {
    section: "Section 509",
    title: "Word, Gesture or Act Intended to Insult Modesty of a Woman",
    description: "Uttering words, making sounds/gestures, or exhibiting objects intended to insult a woman's modesty.",
    keywords: ["insulted woman", "verbal harassment", "টিজিং", "অশালীন মন্তব্য"]
  },
  {
    section: "Section 411",
    title: "Dishonestly Receiving Stolen Property",
    description: "Receiving or retaining stolen property knowing or having reason to believe it is stolen.",
    keywords: ["receiving stolen goods", "stolen phone recovered", "চোরাই মাল"]
  },
  {
    section: "Section 427",
    title: "Mischief Causing Damage",
    description: "Committing mischief and causing loss or damage to property.",
    keywords: ["vandalism", "property damage", "ভাঙচুর"]
  },
  {
    section: "Section 447",
    title: "Criminal Trespass",
    description: "Entering property with intent to commit an offense or intimidate, insult, or annoy.",
    keywords: ["trespass", "unauthorized entry", "অবৈধ প্রবেশ"]
  },
  {
    section: "Section 448",
    title: "House Trespass",
    description: "Criminal trespass by entering into a building used as a dwelling.",
    keywords: ["house trespass", "home intrusion", "বাড়িতে ঢোকা"]
  },
  {
    section: "Section 500",
    title: "Defamation",
    description: "Making or publishing imputation harming another's reputation.",
    keywords: ["defamation", "false allegation", "মানহানি"]
  },
  {
    section: "Section 34",
    title: "Acts Done by Several Persons in Furtherance of Common Intention",
    description: "Joint liability where criminal act is done by several persons with common intention.",
    keywords: ["multiple accused", "group attack", "সম্মিলিত উদ্দেশ্য"]
  },
  {
    section: "Section 120B",
    title: "Criminal Conspiracy",
    description: "Agreement between two or more persons to commit an illegal act.",
    keywords: ["conspiracy", "planned crime", "ষড়যন্ত্র"]
  },
  {
    section: "Nari O Shishu Nirjatan Daman Ain 2000, Section 9",
    title: "Causing Injury to Woman",
    description: "Punishment for causing bodily injury to a woman in contexts covered by the special law.",
    keywords: ["violence against woman", "নারী নির্যাতন", "injury to woman"]
  },
  {
    section: "Nari O Shishu Nirjatan Daman Ain 2000, Section 10",
    title: "Sexual Oppression / Molestation",
    description: "Punishment for sexual oppression, molestation, and related offenses against women.",
    keywords: ["molestation", "sexual assault", "নারীর শ্লীলতাহানি"]
  },
  {
    section: "Nari O Shishu Nirjatan Daman Ain 2000, Section 11",
    title: "Harassment Related to Dowry",
    description: "Harassment, injury, or death related to dowry demands.",
    keywords: ["dowry", "যৌতুক", "dowry harassment"]
  }
];
