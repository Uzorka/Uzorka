// Bible Explained — seed data. KJV text (public domain).
// Ported from the design handoff's be-data.js and given explicit types.

export type Book = { name: string; chapters: number };

/** A named term with its plain-language meaning. */
export type WordGloss = { word: string; meaning: string };
/** A person or place with a short description. */
export type NamedThing = { name: string; desc: string };
/** A cross-reference: a verse ref and why it relates. */
export type RelatedVerse = { ref: string; why: string };

/** Per-verse study content. Minor verses carry only `s` + `lesson`. */
export type VerseStudy = {
  /** Simple meaning (Standard level). */
  s: string;
  ctx?: string;
  words?: WordGloss[];
  people?: NamedThing[];
  places?: NamedThing[];
  lesson?: string;
  apply?: string;
  reflect?: string;
  rel?: RelatedVerse[];
};

export type ChapterSummary = {
  theme: string;
  message: string;
  events: string[];
  people: string[];
  places: string[];
  lessons: string[];
  promises: string[];
  reflect: string[];
  prayer: string;
};

export type QuizQuestion = {
  /** Question text. */
  q: string;
  /** Options. */
  o: string[];
  /** Index of the correct option. */
  a: number;
  /** Explanation shown after answering. */
  e: string;
};

export type VerseOfDay = { ref: string; text: string; s: string; reflect: string };

// The first 39 books are the Old Testament; the remainder the New Testament.
export const BOOKS: Book[] = (
  [
    ["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36],
    ["Deuteronomy", 34], ["Joshua", 24], ["Judges", 21], ["Ruth", 4],
    ["1 Samuel", 31], ["2 Samuel", 24], ["1 Kings", 22], ["2 Kings", 25],
    ["1 Chronicles", 29], ["2 Chronicles", 36], ["Ezra", 10], ["Nehemiah", 13],
    ["Esther", 10], ["Job", 42], ["Psalms", 150], ["Proverbs", 31],
    ["Ecclesiastes", 12], ["Song of Solomon", 8], ["Isaiah", 66], ["Jeremiah", 52],
    ["Lamentations", 5], ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14],
    ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4], ["Micah", 7],
    ["Nahum", 3], ["Habakkuk", 3], ["Zephaniah", 3], ["Haggai", 2],
    ["Zechariah", 14], ["Malachi", 4],
    ["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21], ["Acts", 28],
    ["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6],
    ["Ephesians", 6], ["Philippians", 4], ["Colossians", 4], ["1 Thessalonians", 5],
    ["2 Thessalonians", 3], ["1 Timothy", 6], ["2 Timothy", 4], ["Titus", 3],
    ["Philemon", 1], ["Hebrews", 13], ["James", 5], ["1 Peter", 5], ["2 Peter", 3],
    ["1 John", 5], ["2 John", 1], ["3 John", 1], ["Jude", 1], ["Revelation", 22],
  ] as [string, number][]
).map(([name, chapters]) => ({ name, chapters }));

/** Index in BOOKS at which the New Testament begins. */
export const OT_COUNT = 39;

export const JOHN1: string[] = [
  "In the beginning was the Word, and the Word was with God, and the Word was God.",
  "The same was in the beginning with God.",
  "All things were made by him; and without him was not any thing made that was made.",
  "In him was life; and the life was the light of men.",
  "And the light shineth in darkness; and the darkness comprehended it not.",
  "There was a man sent from God, whose name was John.",
  "The same came for a witness, to bear witness of the Light, that all men through him might believe.",
  "He was not that Light, but was sent to bear witness of that Light.",
  "That was the true Light, which lighteth every man that cometh into the world.",
  "He was in the world, and the world was made by him, and the world knew him not.",
  "He came unto his own, and his own received him not.",
  "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:",
  "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.",
  "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
  "John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.",
  "And of his fulness have all we received, and grace for grace.",
  "For the law was given by Moses, but grace and truth came by Jesus Christ.",
  "No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him.",
  "And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art thou?",
  "And he confessed, and denied not; but confessed, I am not the Christ.",
  "And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that prophet? And he answered, No.",
  "Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of thyself?",
  "He said, I am the voice of one crying in the wilderness, Make straight the way of the Lord, as said the prophet Esaias.",
  "And they which were sent were of the Pharisees.",
  "And they asked him, and said unto him, Why baptizest thou then, if thou be not that Christ, nor Elias, neither that prophet?",
  "John answered them, saying, I baptize with water: but there standeth one among you, whom ye know not;",
  "He it is, who coming after me is preferred before me, whose shoe's latchet I am not worthy to unloose.",
  "These things were done in Bethabara beyond Jordan, where John was baptizing.",
  "The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the world.",
  "This is he of whom I said, After me cometh a man which is preferred before me: for he was before me.",
  "And I knew him not: but that he should be made manifest to Israel, therefore am I come baptizing with water.",
  "And John bare record, saying, I saw the Spirit descending from heaven like a dove, and it abode upon him.",
  "And I knew him not: but he that sent me to baptize with water, the same said unto me, Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy Ghost.",
  "And I saw, and bare record that this is the Son of God.",
  "Again the next day after John stood, and two of his disciples;",
  "And looking upon Jesus as he walked, he saith, Behold the Lamb of God!",
  "And the two disciples heard him speak, and they followed Jesus.",
  "Then Jesus turned, and saw them following, and saith unto them, What seek ye? They said unto him, Rabbi, (which is to say, being interpreted, Master,) where dwellest thou?",
  "He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the tenth hour.",
  "One of the two which heard John speak, and followed him, was Andrew, Simon Peter's brother.",
  "He first findeth his own brother Simon, and saith unto him, We have found the Messias, which is, being interpreted, the Christ.",
  "And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A stone.",
  "The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow me.",
  "Now Philip was of Bethsaida, the city of Andrew and Peter.",
  "Philip findeth Nathanael, and saith unto him, We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of Joseph.",
  "And Nathanael said unto him, Can there any good thing come out of Nazareth? And Philip said unto him, Come and see.",
  "Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no guile!",
  "Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw thee.",
  "Nathanael answered and saith unto him, Rabbi, thou art the Son of God; thou art the King of Israel.",
  "Jesus answered and said unto him, Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than these.",
  "And he saith unto him, Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of man.",
];

// Per-verse explanations (Standard level).
export const EX: Record<number, VerseStudy> = {
  1: {
    s: "John begins his Gospel before creation itself. “The Word” is a title for Jesus. Three claims are made: the Word already existed in the beginning, the Word was with God, and the Word was God.",
    ctx: "John deliberately echoes the opening of Genesis (“In the beginning…”) to show that the story of Jesus is part of the story of creation itself. His Gospel was written so that readers would believe Jesus is the Son of God.",
    words: [
      { word: "Word", meaning: "From the Greek logos — God’s self-expression; here, a title for Jesus." },
      { word: "In the beginning", meaning: "Before anything was created; eternity past." },
    ],
    lesson: "Jesus did not begin at Bethlehem. He is eternal and fully divine.",
    apply: "When you think about Jesus, think bigger than a historical teacher — John presents him as God himself.",
    reflect: "What difference does it make that Jesus existed before creation?",
    rel: [
      { ref: "Genesis 1:1", why: "The verse John is echoing" },
      { ref: "Colossians 1:16-17", why: "All things created through Christ" },
      { ref: "Revelation 19:13", why: "Jesus called ‘The Word of God’" },
    ],
  },
  2: {
    s: "John repeats the point for emphasis: the Word (Jesus) was with God from the very beginning — not created later.",
    lesson: "Jesus’ relationship with God the Father is eternal.",
  },
  3: {
    s: "Everything that exists was made through the Word. Nothing in creation came into being without him.",
    words: [{ word: "Made by him", meaning: "Created through him; he was the agent of creation." }],
    lesson: "Jesus is the Creator, not part of creation.",
    rel: [{ ref: "Hebrews 1:2", why: "God made the worlds through the Son" }],
  },
  4: {
    s: "The Word is the source of life, and that life gives light — truth, goodness, and hope — to humanity.",
    words: [{ word: "Light", meaning: "A picture of truth and goodness that shows the way, as light does in darkness." }],
    lesson: "Real life and real understanding come from Jesus.",
  },
  5: {
    s: "The light keeps shining in the darkness, and the darkness has never been able to put it out or fully understand it.",
    words: [{ word: "Comprehended", meaning: "Grasped — the word can mean both ‘understood’ and ‘overcame’." }],
    lesson: "Evil and ignorance cannot extinguish God’s truth.",
    reflect: "Where do you most need light to shine into darkness right now?",
  },
  6: {
    s: "The story turns to a man named John — known as John the Baptist — whom God sent with a special task.",
    ctx: "This John is not the author of the Gospel. He was a prophet who prepared people for Jesus.",
    people: [{ name: "John the Baptist", desc: "A prophet sent to prepare Israel for the Messiah." }],
    lesson: "God sends people to point others to him.",
  },
  7: {
    s: "John’s job was to be a witness — to tell people about the Light so that everyone might believe.",
    words: [{ word: "Witness", meaning: "Someone who tells what they have seen and knows to be true." }],
    lesson: "A witness points away from himself and toward Jesus.",
  },
  8: {
    s: "John the Baptist was important, but he was not the Light himself. His role was to point to the Light.",
    lesson: "Even great servants of God are messengers, not the message.",
  },
  9: {
    s: "Jesus is the true Light — the genuine one — whose coming into the world brings light to every person.",
    lesson: "Jesus’ light is offered to all people, not one nation only.",
  },
  10: {
    s: "Jesus entered the very world he had made, yet the world did not recognise him.",
    lesson: "It is possible to live surrounded by God’s work and still not know him.",
  },
  11: {
    s: "Jesus came to his own people, Israel, and most of them rejected him.",
    ctx: "Israel had waited centuries for the Messiah, yet many did not receive Jesus when he came.",
    lesson: "Familiarity with religion is not the same as receiving Christ.",
  },
  12: {
    s: "Here is the turning point: everyone who receives Jesus — who believes in his name — is given the right to become a child of God.",
    words: [
      { word: "Received him", meaning: "Welcomed and trusted him personally." },
      { word: "Power", meaning: "Authority or right — not physical strength." },
      { word: "Sons of God", meaning: "Children of God; members of God’s family." },
    ],
    lesson: "Becoming God’s child is a gift received by faith, not earned.",
    apply: "God’s family is open to anyone who trusts Jesus — including you.",
    reflect: "What does it mean to you to be called a child of God?",
    rel: [
      { ref: "Galatians 3:26", why: "Children of God by faith" },
      { ref: "Romans 8:16", why: "The Spirit confirms we are God’s children" },
    ],
  },
  13: {
    s: "This new birth does not come from ancestry, human desire, or anyone’s decision but God’s. It is a spiritual birth from God himself.",
    words: [{ word: "Born of God", meaning: "Given new spiritual life by God — what Jesus later calls being ‘born again’." }],
    lesson: "Salvation is God’s work from start to finish.",
    rel: [{ ref: "John 3:3", why: "Ye must be born again" }],
  },
  14: {
    s: "The eternal Word became a real human being and lived among us. People saw his glory — the glory of God’s one and only Son — full of grace and truth.",
    ctx: "“Dwelt among us” literally means “pitched his tent,” recalling the tabernacle where God’s presence lived with Israel in the wilderness.",
    words: [
      { word: "Made flesh", meaning: "Became fully human — the incarnation." },
      { word: "Only begotten", meaning: "Unique; one of a kind." },
      { word: "Grace", meaning: "God’s undeserved kindness." },
    ],
    lesson: "In Jesus, God came near — truly God and truly human.",
    apply: "God is not distant. He entered human life, with its hunger, tiredness, and pain.",
    reflect: "How does it change your view of God to know he became human?",
    rel: [
      { ref: "Philippians 2:6-8", why: "Christ humbled himself" },
      { ref: "Hebrews 4:15", why: "A high priest who understands us" },
    ],
  },
  15: {
    s: "John the Baptist testified that Jesus, though coming after him in time, outranks him — because Jesus existed before him.",
    lesson: "Jesus’ eternal nature places him above every prophet.",
  },
  16: {
    s: "From the fullness of Jesus, believers keep receiving blessing — “grace for grace,” one wave of grace after another.",
    lesson: "God’s grace is not a one-time gift but a continuing supply.",
  },
  17: {
    s: "The law came through Moses and showed what God requires. Grace and truth came through Jesus Christ, who provides what the law could not.",
    people: [{ name: "Moses", desc: "The prophet through whom God gave Israel the law." }],
    lesson: "The law diagnoses; Jesus heals.",
    rel: [{ ref: "Romans 8:3-4", why: "What the law could not do, God did" }],
  },
  18: {
    s: "No human has ever seen God directly. But the Son, who shares the closest possible relationship with the Father, has made him known.",
    words: [{ word: "Declared", meaning: "Explained, made known — Jesus is the ‘exegesis’ of God." }],
    lesson: "If you want to know what God is like, look at Jesus.",
    rel: [{ ref: "Colossians 1:15", why: "The image of the invisible God" }],
  },
  19: {
    s: "Religious leaders in Jerusalem sent priests and Levites to question John the Baptist about who he claimed to be.",
    ctx: "John’s preaching was drawing crowds, so the authorities investigated him.",
    lesson: "A genuine ministry invites honest questions.",
  },
  20: {
    s: "John answered plainly and honestly: “I am not the Christ.” He refused to take an honour that was not his.",
    words: [{ word: "The Christ", meaning: "The Messiah — God’s promised, anointed King." }],
    lesson: "Humility means telling the truth about who you are — and who you are not.",
  },
  21: {
    s: "They pressed him: was he Elijah returned, or the promised Prophet? John said no to both.",
    words: [
      { word: "Elias", meaning: "Elijah — many expected him to return before the Messiah." },
      { word: "That prophet", meaning: "The prophet like Moses promised in Deuteronomy 18:15." },
    ],
    lesson: "John would not let people fit him into their expectations.",
  },
  22: {
    s: "The messengers needed an answer to bring back: “Who are you? What do you say about yourself?”",
    lesson: "Everyone must eventually answer for their own identity and calling.",
  },
  23: {
    s: "John identified himself using Isaiah’s prophecy: a voice in the wilderness calling people to prepare the way for the Lord.",
    ctx: "He quotes Isaiah 40:3, written some 700 years earlier.",
    words: [{ word: "Esaias", meaning: "The Greek form of Isaiah." }],
    lesson: "John defined himself by his mission, not his status.",
    rel: [{ ref: "Isaiah 40:3", why: "The prophecy John quotes" }],
  },
  24: {
    s: "The questioners had been sent by the Pharisees, a strict religious group concerned with correct practice.",
    people: [{ name: "Pharisees", desc: "A devout Jewish group known for careful law-keeping." }],
    lesson: "Religious credentials made them curious — but not yet believing.",
  },
  25: {
    s: "They asked why John baptized at all if he was not the Christ, Elijah, or the Prophet.",
    words: [{ word: "Baptize", meaning: "To wash ceremonially in water as a sign of cleansing and repentance." }],
    lesson: "They questioned his authority rather than hearing his message.",
  },
  26: {
    s: "John answered that he only baptizes with water — and that someone far greater was already standing among them, unrecognised.",
    lesson: "Jesus can be present and still go unnoticed.",
  },
  27: {
    s: "John said he was unworthy even to untie the sandal strap of the one coming after him — the task of the lowest servant.",
    words: [{ word: "Shoe’s latchet", meaning: "Sandal strap — untying it was a slave’s job." }],
    lesson: "The greatest prophet counted himself beneath the lowest service to Christ.",
  },
  28: {
    s: "These events happened at Bethabara, east of the Jordan River, where John was baptizing.",
    places: [
      { name: "Bethabara", desc: "A crossing point on the east bank of the Jordan River." },
      { name: "Jordan", desc: "The main river of Israel, rich in biblical history." },
    ],
    lesson: "God’s great story unfolds in real, ordinary places.",
  },
  29: {
    s: "The next day John saw Jesus approaching and announced: “Behold the Lamb of God, which taketh away the sin of the world.”",
    ctx: "Lambs were sacrificed daily in the temple, and at Passover, as offerings for sin. John declares Jesus the final, true sacrifice.",
    words: [{ word: "Lamb of God", meaning: "The sacrifice God himself provides to deal with sin." }],
    lesson: "Jesus came to remove sin — not just to teach about it.",
    apply: "Whatever guilt you carry, this verse says Jesus came to take it away.",
    reflect: "What would it mean to let the Lamb of God carry your sin?",
    rel: [
      { ref: "Isaiah 53:7", why: "Led as a lamb to the slaughter" },
      { ref: "Exodus 12", why: "The Passover lamb" },
      { ref: "Revelation 5:12", why: "Worthy is the Lamb" },
    ],
  },
  30: {
    s: "John repeated his testimony: the one coming after him outranks him because he existed before him.",
    lesson: "True witness bears repeating.",
  },
  31: {
    s: "John admitted he had not known who the Messiah was; his baptizing ministry existed so that the Messiah would be revealed to Israel.",
    lesson: "God gives us roles whose full purpose we only see later.",
  },
  32: {
    s: "John testified that he saw the Spirit come down from heaven like a dove and remain on Jesus.",
    words: [{ word: "Like a dove", meaning: "A gentle, visible form marking the Spirit’s arrival." }],
    lesson: "The Father publicly marked Jesus out by the Spirit.",
  },
  33: {
    s: "God had given John a sign in advance: the one on whom the Spirit descends and remains is the one who baptizes with the Holy Ghost.",
    words: [{ word: "Holy Ghost", meaning: "The Holy Spirit — God’s own presence and power." }],
    lesson: "Jesus gives more than water can symbolise — God’s own Spirit.",
  },
  34: {
    s: "Having seen the sign fulfilled, John gave his verdict plainly: “This is the Son of God.”",
    lesson: "Evidence led to testimony. John saw, then spoke.",
  },
  35: {
    s: "The next day John was standing with two of his disciples — students who had attached themselves to his teaching.",
    lesson: "John kept pointing forward even with his own followers present.",
  },
  36: {
    s: "Watching Jesus walk by, John repeated his announcement: “Behold the Lamb of God!”",
    lesson: "John’s message never changed: look at Jesus.",
  },
  37: {
    s: "The two disciples heard John’s words and left him to follow Jesus — exactly what John wanted.",
    lesson: "A faithful teacher is glad when students move on to Christ.",
  },
  38: {
    s: "Jesus turned and asked them, “What seek ye?” They asked where he was staying, wanting time with him.",
    words: [{ word: "Rabbi", meaning: "‘Master’ or ‘Teacher’ — a title of respect." }],
    lesson: "Jesus’ first recorded words in this Gospel are a question worth answering: what are you seeking?",
    reflect: "If Jesus asked you ‘What are you seeking?’, what would you honestly say?",
  },
  39: {
    s: "Jesus invited them: “Come and see.” They spent the rest of the day with him, from about four in the afternoon.",
    words: [{ word: "The tenth hour", meaning: "About 4 p.m., counting from sunrise." }],
    lesson: "Jesus invites investigation — faith begins with ‘come and see’.",
  },
  40: {
    s: "One of the two was Andrew, the brother of Simon Peter.",
    people: [{ name: "Andrew", desc: "A fisherman, first a disciple of John the Baptist, then of Jesus." }],
    lesson: "Andrew’s quiet decision would ripple outward.",
  },
  41: {
    s: "Andrew’s first act was to find his brother Simon and tell him: “We have found the Messias” — the Christ.",
    words: [{ word: "Messias", meaning: "Hebrew for ‘Anointed One’; ‘Christ’ is the Greek equivalent." }],
    lesson: "Real discovery leads naturally to sharing.",
    apply: "Like Andrew, start with the people closest to you.",
    reflect: "Who is the ‘Simon’ you could bring to Jesus?",
  },
  42: {
    s: "Andrew brought Simon to Jesus. Jesus looked at him and gave him a new name: Cephas — Peter, “a stone.”",
    people: [{ name: "Simon Peter", desc: "A fisherman who became a leading apostle." }],
    words: [{ word: "Cephas", meaning: "Aramaic for ‘rock’; ‘Peter’ is the Greek form." }],
    lesson: "Jesus sees not only who you are, but who you will become.",
    rel: [{ ref: "Matthew 16:18", why: "Upon this rock I will build my church" }],
  },
  43: {
    s: "The next day Jesus decided to go to Galilee. He found Philip and gave a simple call: “Follow me.”",
    places: [{ name: "Galilee", desc: "The northern region of Israel where Jesus grew up and ministered." }],
    people: [{ name: "Philip", desc: "A disciple from Bethsaida, called directly by Jesus." }],
    lesson: "Some are brought by friends; some Jesus finds himself.",
  },
  44: {
    s: "Philip came from Bethsaida, the same fishing town as Andrew and Peter.",
    places: [{ name: "Bethsaida", desc: "A fishing village on the Sea of Galilee." }],
    lesson: "God often works through networks of neighbours and friends.",
  },
  45: {
    s: "Philip found Nathanael and told him they had found the one Moses and the prophets wrote about: Jesus of Nazareth.",
    people: [{ name: "Nathanael", desc: "An honest Israelite, likely also called Bartholomew." }],
    lesson: "The whole Old Testament pointed forward to Jesus.",
  },
  46: {
    s: "Nathanael was skeptical: “Can any good thing come out of Nazareth?” Philip did not argue — he simply said, “Come and see.”",
    places: [{ name: "Nazareth", desc: "A small, unimportant town in Galilee with a poor reputation." }],
    lesson: "The best answer to honest doubt is an invitation, not an argument.",
    apply: "You do not need to win debates — invite people to look at Jesus for themselves.",
  },
  47: {
    s: "Jesus saw Nathanael coming and praised him as a true Israelite without deceit.",
    words: [{ word: "Guile", meaning: "Deceit or trickery." }],
    lesson: "Jesus values honesty — even honest skepticism.",
  },
  48: {
    s: "Nathanael asked how Jesus knew him. Jesus replied that he had seen him under the fig tree before Philip ever called him.",
    words: [{ word: "Under the fig tree", meaning: "A common place for private prayer and study." }],
    lesson: "Jesus sees us before we ever see him.",
  },
  49: {
    s: "Stunned, Nathanael declared: “Rabbi, thou art the Son of God; thou art the King of Israel.”",
    lesson: "Honest inquiry, met by Jesus, becomes bold faith.",
  },
  50: {
    s: "Jesus told him: you believe because I saw you under the fig tree? You will see far greater things than these.",
    lesson: "First faith is a doorway, not a destination.",
  },
  51: {
    s: "Jesus promised his disciples they would see heaven opened and angels ascending and descending on the Son of man — Jesus himself as the bridge between heaven and earth.",
    ctx: "This recalls Jacob’s dream of a ladder between heaven and earth (Genesis 28:12). Jesus claims to be that ladder.",
    words: [
      { word: "Verily, verily", meaning: "‘Truly, truly’ — a solemn guarantee of truth." },
      { word: "Son of man", meaning: "Jesus’ favourite title for himself, from Daniel 7:13." },
    ],
    lesson: "Jesus is the true connection between God and humanity.",
    reflect: "Jesus is the meeting point of heaven and earth. How does that shape the way you pray?",
    rel: [
      { ref: "Genesis 28:12", why: "Jacob’s ladder" },
      { ref: "Daniel 7:13", why: "One like the Son of man" },
      { ref: "1 Timothy 2:5", why: "One mediator between God and men" },
    ],
  },
};

export const SUMMARY: ChapterSummary = {
  theme:
    "Jesus is the eternal Word of God who became human so that people could know God and become his children.",
  message:
    "John 1 introduces Jesus as God himself — Creator, Light, and Lamb — and shows the first people who recognised and followed him.",
  events: [
    "The Word revealed as eternal God and Creator (v.1–5)",
    "John the Baptist’s witness and questioning (v.6–8, 19–28)",
    "The Word becomes flesh (v.14)",
    "“Behold the Lamb of God” (v.29–34)",
    "The first disciples follow Jesus (v.35–51)",
  ],
  people: [
    "Jesus (the Word)", "John the Baptist", "Andrew", "Simon Peter", "Philip",
    "Nathanael", "Moses (mentioned)", "Isaiah (quoted)",
  ],
  places: ["Bethabara, beyond Jordan", "Galilee", "Bethsaida", "Nazareth"],
  lessons: [
    "Jesus is fully God and existed before creation.",
    "Becoming God’s child is a gift received by believing in Jesus.",
    "In Jesus, God became human and lived among us.",
    "Jesus is the Lamb of God who takes away sin.",
    "Faith spreads through simple invitations: ‘Come and see.’",
  ],
  promises: [
    "Everyone who receives Jesus is given the right to become a child of God (v.12).",
    "Those who follow will ‘see greater things’ (v.50).",
  ],
  reflect: [
    "Which title of Jesus in this chapter means the most to you — Word, Light, Lamb, or Son of God — and why?",
    "Who could you invite to ‘come and see’ this week?",
  ],
  prayer:
    "Father, thank you for sending your Son, the Word made flesh. Open my eyes to see his light, and help me receive him and live as your child. Amen.",
};

export const QUIZ: QuizQuestion[] = [
  {
    q: "According to verse 1, what was “in the beginning”?",
    o: ["The Law", "The Word", "The Temple", "The Covenant"],
    a: 1,
    e: "“In the beginning was the Word, and the Word was with God, and the Word was God.” (v.1)",
  },
  {
    q: "Who was “sent from God” to bear witness of the Light?",
    o: ["Moses", "Elijah", "John the Baptist", "Isaiah"],
    a: 2,
    e: "“There was a man sent from God, whose name was John.” (v.6)",
  },
  {
    q: "What did John call Jesus when he saw him coming?",
    o: ["The King of Israel", "The Lamb of God", "The Good Shepherd", "The Son of David"],
    a: 1,
    e: "“Behold the Lamb of God, which taketh away the sin of the world.” (v.29)",
  },
  {
    q: "What new name did Jesus give Simon?",
    o: ["Cephas", "Barnabas", "Boanerges", "Israel"],
    a: 0,
    e: "“Thou shalt be called Cephas, which is by interpretation, A stone.” (v.42)",
  },
  {
    q: "Where did Jesus say he saw Nathanael before Philip called him?",
    o: ["By the Jordan River", "In the synagogue", "Under the fig tree", "On the mountain"],
    a: 2,
    e: "“Before that Philip called thee, when thou wast under the fig tree, I saw thee.” (v.48)",
  },
];

export const VOTD: VerseOfDay = {
  ref: "John 3:16",
  text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
  s: "God loves every person deeply. Because of this love, he gave his Son so that anyone who believes in him receives life with God that never ends.",
  reflect: "What does this verse teach you about how God sees you?",
};

export const TOPICS: string[] = [
  "Faith", "Prayer", "Love", "Forgiveness", "Salvation", "Hope", "Wisdom",
  "Fear & Anxiety", "Grace", "Purpose",
];

/** Total verses in the seeded chapter (John 1). */
export const VERSE_COUNT = JOHN1.length;
