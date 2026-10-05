const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vocabulary = require('./models/Vocabulary');
const Grammar = require('./models/Grammar');
const Quiz = require('./models/Quiz');
const News = require('./models/News');
const ITCourse = require('./models/ITCourse');
const { TECH_NEWS_DATA, IT_COURSES_DATA } = require('./js/data');

dotenv.config();

const INITIAL_VOCABULARY = [
  { id:1, word:"Enthusiastic", phonetic:"/ɪnˌθjuːziˈæstɪk/", pos:"adj", meaning:"Nhiệt tình, hăng hái", example:"She is enthusiastic about learning English.", exampleVi:"Cô ấy rất nhiệt tình học tiếng Anh.", category:"daily", level:"B1", image:"" },
  { id:2, word:"Accomplish", phonetic:"/əˈkʌmplɪʃ/", pos:"v", meaning:"Hoàn thành, đạt được", example:"We accomplished our goal.", exampleVi:"Chúng tôi đã đạt được mục tiêu.", category:"daily", level:"B2", image:"" },
  { id:3, word:"Resilient", phonetic:"/rɪˈzɪliənt/", pos:"adj", meaning:"Kiên cường, bền bỉ", example:"She remained resilient despite the difficulties.", exampleVi:"Cô ấy vẫn kiên cường dù gặp khó khăn.", category:"daily", level:"B2", image:"" },
  { id:4, word:"Grateful", phonetic:"/ˈɡreɪtfʊl/", pos:"adj", meaning:"Biết ơn", example:"I'm grateful for your help.", exampleVi:"Tôi biết ơn sự giúp đỡ của bạn.", category:"daily", level:"A2", image:"" },
  { id:5, word:"Opportunity", phonetic:"/ˌɒpəˈtjuːnɪti/", pos:"n", meaning:"Cơ hội", example:"This is a great opportunity.", exampleVi:"Đây là một cơ hội tuyệt vời.", category:"daily", level:"B1", image:"" },
  { id:6, word:"Challenge", phonetic:"/ˈtʃælɪndʒ/", pos:"n", meaning:"Thử thách", example:"Every challenge makes us stronger.", exampleVi:"Mỗi thử thách làm chúng ta mạnh mẽ hơn.", category:"daily", level:"A2", image:"" },
  { id:7, word:"Negotiate", phonetic:"/nɪˈɡəʊʃieɪt/", pos:"v", meaning:"Đàm phán, thương lượng", example:"We need to negotiate the contract.", exampleVi:"Chúng ta cần đàm phán hợp đồng.", category:"business", level:"B2", image:"" },
  { id:8, word:"Revenue", phonetic:"/ˈrevənjuː/", pos:"n", meaning:"Doanh thu", example:"The company's revenue increased by 20%.", exampleVi:"Doanh thu của công ty tăng 20%.", category:"business", level:"B2", image:"" },
  { id:9, word:"Stakeholder", phonetic:"/ˈsteɪkˌhəʊldər/", pos:"n", meaning:"Các bên liên quan", example:"We must inform all stakeholders.", exampleVi:"Chúng ta phải thông báo cho tất cả các bên liên quan.", category:"business", level:"C1", image:"" },
  { id:10, word:"Entrepreneur", phonetic:"/ˌɒntrəprəˈnɜːr/", pos:"n", meaning:"Doanh nhân, nhà khởi nghiệp", example:"He is a successful entrepreneur.", exampleVi:"Anh ấy là một doanh nhân thành công.", category:"business", level:"B2", image:"" },
  { id:11, word:"Itinerary", phonetic:"/aɪˈtɪnərəri/", pos:"n", meaning:"Lịch trình chuyến đi", example:"Please review the travel itinerary.", exampleVi:"Vui lòng xem lịch trình chuyến đi.", category:"travel", level:"B1", image:"" },
  { id:12, word:"Destination", phonetic:"/ˌdestɪˈneɪʃn/", pos:"n", meaning:"Điểm đến", example:"Paris is our next destination.", exampleVi:"Paris là điểm đến tiếp theo của chúng tôi.", category:"travel", level:"A2", image:"" },
  { id:13, word:"Accommodation", phonetic:"/əˌkɒməˈdeɪʃn/", pos:"n", meaning:"Chỗ ở, chỗ lưu trú", example:"We booked luxury accommodation.", exampleVi:"Chúng tôi đã đặt chỗ ở sang trọng.", category:"travel", level:"B1", image:"" },
  { id:14, word:"Souvenir", phonetic:"/ˌsuːvəˈnɪər/", pos:"n", meaning:"Quà lưu niệm", example:"I bought a souvenir from Japan.", exampleVi:"Tôi mua một món quà lưu niệm từ Nhật Bản.", category:"travel", level:"A2", image:"" },
  { id:15, word:"Hypothesis", phonetic:"/haɪˈpɒθɪsɪs/", pos:"n", meaning:"Giả thuyết", example:"The scientist tested her hypothesis.", exampleVi:"Nhà khoa học đã kiểm tra giả thuyết của mình.", category:"academic", level:"C1", image:"" },
  { id:16, word:"Analyze", phonetic:"/ˈænəlaɪz/", pos:"v", meaning:"Phân tích", example:"We need to analyze the data.", exampleVi:"Chúng ta cần phân tích dữ liệu.", category:"academic", level:"B2", image:"" },
  { id:17, word:"Phenomenon", phonetic:"/fɪˈnɒmɪnən/", pos:"n", meaning:"Hiện tượng", example:"This is a rare natural phenomenon.", exampleVi:"Đây là hiện tượng tự nhiên hiếm gặp.", category:"academic", level:"C1", image:"" },
  { id:18, word:"Methodology", phonetic:"/ˌmeθəˈdɒlədʒi/", pos:"n", meaning:"Phương pháp luận", example:"The research methodology was rigorous.", exampleVi:"Phương pháp luận nghiên cứu rất chặt chẽ.", category:"academic", level:"C1", image:"" },
  { id:19, word:"Bite the bullet", phonetic:"/baɪt ðə ˈbʊlɪt/", pos:"idiom", meaning:"Cắn răng chịu đựng, chấp nhận điều khó chịu", example:"Just bite the bullet and tell him the truth.", exampleVi:"Cứ cắn răng mà nói thật với anh ấy đi.", category:"idiom", level:"B2", image:"" },
  { id:20, word:"Break the ice", phonetic:"/breɪk ðə aɪs/", pos:"idiom", meaning:"Phá vỡ sự im lặng, làm quen", example:"He told a joke to break the ice.", exampleVi:"Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng.", category:"idiom", level:"B1", image:"" },
  { id:21, word:"Hit the nail", phonetic:"/hɪt ðə neɪl/", pos:"idiom", meaning:"Nói/làm đúng vào trọng tâm", example:"You hit the nail on the head!", exampleVi:"Bạn nói đúng vào trọng tâm rồi!", category:"idiom", level:"B1", image:"" },
  { id:22, word:"Under the weather", phonetic:"/ˈʌndər ðə ˈweðər/", pos:"idiom", meaning:"Không khỏe, ốm nhẹ", example:"I'm feeling a bit under the weather today.", exampleVi:"Hôm nay tôi cảm thấy hơi không khỏe.", category:"idiom", level:"A2", image:"" }
];

const INITIAL_GRAMMAR = [
  {
    title: "Thì Hiện tại đơn (Present Simple)",
    icon: "fas fa-circle-dot",
    color: "#6366f1",
    formula: "S + V(s/es) + O",
    description: "Diễn tả thói quen, sự thật hiển nhiên, lịch trình cố định.",
    uses: [
      "Thói quen, hành động lặp đi lặp lại: She reads every morning.",
      "Sự thật hiển nhiên: The sun rises in the east.",
      "Lịch trình cố định: The train leaves at 8 AM."
    ],
    examples: [
      { en: "He works at a bank.", vi: "Anh ấy làm việc ở ngân hàng." },
      { en: "They don't like coffee.", vi: "Họ không thích cà phê." },
      { en: "Does she speak French?", vi: "Cô ấy có nói tiếng Pháp không?" }
    ],
    signals: ["always", "usually", "often", "sometimes", "every day/week/month"]
  },
  {
    title: "Thì Hiện tại tiếp diễn (Present Continuous)",
    icon: "fas fa-circle-dot",
    color: "#8b5cf6",
    formula: "S + am/is/are + V-ing + O",
    description: "Diễn tả hành động đang xảy ra tại thời điểm nói hoặc trong tương lai gần.",
    uses: [
      "Đang xảy ra lúc nói: She is studying right now.",
      "Tạm thời: He is working in London this month.",
      "Kế hoạch tương lai: We are meeting tomorrow."
    ],
    examples: [
      { en: "I am learning English.", vi: "Tôi đang học tiếng Anh." },
      { en: "They are not watching TV.", vi: "Họ không đang xem TV." },
      { en: "Is she cooking dinner?", vi: "Cô ấy có đang nấu ăn không?" }
    ],
    signals: ["now", "right now", "at the moment", "currently", "this week"]
  },
  {
    title: "Thì Quá khứ đơn (Past Simple)",
    icon: "fas fa-circle-dot",
    color: "#ec4899",
    formula: "S + V-ed / V2 + O",
    description: "Diễn tả hành động đã hoàn thành trong quá khứ tại một thời điểm cụ thể.",
    uses: [
      "Hành động đã xảy ra và kết thúc: She visited Paris last year.",
      "Chuỗi hành động trong quá khứ: He woke up, ate breakfast and left.",
      "Thói quen trong quá khứ: They played chess every Sunday."
    ],
    examples: [
      { en: "I watched a movie yesterday.", vi: "Tôi đã xem phim hôm qua." },
      { en: "She didn't go to school.", vi: "Cô ấy đã không đến trường." },
      { en: "Did you eat lunch?", vi: "Bạn có ăn trưa không?" }
    ],
    signals: ["yesterday", "last year/week", "ago", "in 2020", "when I was young"]
  },
  {
    title: "Thì Tương lai đơn (Future Simple)",
    icon: "fas fa-circle-dot",
    color: "#10b981",
    formula: "S + will + V (bare) + O",
    description: "Diễn tả dự đoán, quyết định tức thời, lời hứa trong tương lai.",
    uses: [
      "Dự đoán: It will rain tomorrow.",
      "Quyết định tức thời: I'll help you with that.",
      "Lời hứa: I will always love you."
    ],
    examples: [
      { en: "She will call you later.", vi: "Cô ấy sẽ gọi cho bạn sau." },
      { en: "We won't be late.", vi: "Chúng tôi sẽ không đến muộn." },
      { en: "Will they come to the party?", vi: "Họ sẽ đến tiệc không?" }
    ],
    signals: ["tomorrow", "next week/year", "soon", "I think"]
  },
  {
    title: "Câu điều kiện (Conditionals)",
    icon: "fas fa-circle-dot",
    color: "#f59e0b",
    formula: "If + clause, main clause",
    description: "Diễn tả điều kiện và kết quả có thể hoặc giả định.",
    uses: [
      "Loại 0 – Sự thật: If you heat water, it boils.",
      "Loại 1 – Có thể xảy ra: If it rains, I will stay home.",
      "Loại 2 – Giả định: If I were rich, I would travel.",
      "Loại 3 – Tiếc nuối: If I had studied, I would have passed."
    ],
    examples: [
      { en: "If you study hard, you will succeed.", vi: "Nếu bạn học chăm chỉ, bạn sẽ thành công." },
      { en: "If I were you, I would apologize.", vi: "Nếu tôi là bạn, tôi sẽ xin lỗi." },
      { en: "If she had come, we would have celebrated.", vi: "Nếu cô ấy đến, chúng ta đã tổ chức ăn mừng." }
    ],
    signals: ["if", "unless", "provided that", "as long as"]
  },
  {
    title: "Mệnh đề quan hệ (Relative Clauses)",
    icon: "fas fa-circle-dot",
    color: "#06b6d4",
    formula: "Noun + who/which/that/where/when + clause",
    description: "Cung cấp thêm thông tin về danh từ đứng trước.",
    uses: [
      "WHO – người: The man who called is my father.",
      "WHICH – vật: The book which I read was great.",
      "WHERE – nơi chốn: The city where I was born is beautiful.",
      "WHEN – thời gian: The day when we met was special."
    ],
    examples: [
      { en: "The girl who sings is my sister.", vi: "Cô gái đang hát là chị tôi." },
      { en: "This is the movie that won the Oscar.", vi: "Đây là bộ phim đã thắng giải Oscar." },
      { en: "The park where we played is gone.", vi: "Công viên nơi chúng tôi chơi đã biến mất." }
    ],
    signals: ["who", "whom", "which", "that", "where", "when", "whose"]
  }
];

const INITIAL_QUIZ = [
  // Vocabulary
  { category: "vocabulary", q: "What does 'Resilient' mean?", options: ["Kiên cường", "Tự phụ", "Lo lắng", "Nhút nhát"], answer: 0 },
  { category: "vocabulary", q: "Choose the word that means 'Biết ơn':", options: ["Grateful", "Angry", "Joyful", "Sad"], answer: 0 },
  { category: "vocabulary", q: "'Opportunity' có nghĩa là gì?", options: ["Khó khăn", "Cơ hội", "Thử thách", "Thành công"], answer: 1 },
  { category: "vocabulary", q: "What is the meaning of 'Accomplish'?", options: ["Thất bại", "Bỏ cuộc", "Hoàn thành", "Trì hoãn"], answer: 2 },
  { category: "vocabulary", q: "Từ nào có nghĩa là 'Đàm phán'?", options: ["Celebrate", "Negotiate", "Participate", "Communicate"], answer: 1 },
  { category: "vocabulary", q: "'Revenue' means:", options: ["Lợi nhuận", "Chi phí", "Doanh thu", "Đầu tư"], answer: 2 },
  { category: "vocabulary", q: "Which word means 'Lịch trình chuyến đi'?", options: ["Destination", "Souvenir", "Itinerary", "Accommodation"], answer: 2 },
  { category: "vocabulary", q: "What does 'Hypothesis' mean?", options: ["Kết luận", "Giả thuyết", "Bằng chứng", "Phân tích"], answer: 1 },
  { category: "vocabulary", q: "'Break the ice' means:", options: ["Phá vỡ đồ vật", "Làm mát", "Phá vỡ sự im lặng", "Bắt đầu"], answer: 2 },
  { category: "vocabulary", q: "Which phrase means 'Không khỏe'?", options: ["Hit the nail", "Bite the bullet", "Under the weather", "Break the ice"], answer: 2 },

  // Grammar
  { category: "grammar", q: "She _____ to school every day.", options: ["go", "goes", "going", "went"], answer: 1 },
  { category: "grammar", q: "They _____ TV right now.", options: ["watch", "watches", "are watching", "watched"], answer: 2 },
  { category: "grammar", q: "I _____ a movie yesterday.", options: ["watch", "watches", "watched", "am watching"], answer: 2 },
  { category: "grammar", q: "If it rains, I _____ stay home.", options: ["will", "would", "am", "was"], answer: 0 },
  { category: "grammar", q: "The girl _____ sings is my sister.", options: ["which", "where", "who", "when"], answer: 2 },
  { category: "grammar", q: "She _____ (not) like coffee.", options: ["don't", "doesn't", "isn't", "wasn't"], answer: 1 },
  { category: "grammar", q: "We _____ dinner at 8 PM tomorrow.", options: ["have", "are having", "had", "were having"], answer: 1 },
  { category: "grammar", q: "If I _____ rich, I would travel.", options: ["am", "was", "were", "will be"], answer: 2 },
  { category: "grammar", q: "This is the book _____ I read.", options: ["who", "where", "when", "that"], answer: 3 },
  { category: "grammar", q: "The sun _____ in the east.", options: ["rises", "is rising", "rose", "will rise"], answer: 0 },

  // Listening
  { category: "listening", q: "Listen: 'S-E-R-E-N-D-I-P-I-T-Y'. What word is spelled?", options: ["Serendipity", "Sensitivity", "Serenity", "Solidarity"], answer: 0, audio: "Serendipity" },
  { category: "listening", q: "Listen: 'R-E-S-I-L-I-E-N-T'. What word is spelled?", options: ["Resilient", "Reliant", "Recipient", "Resident"], answer: 0, audio: "Resilient" },
  { category: "listening", q: "Listen: 'E-N-T-H-U-S-I-A-S-T-I-C'. What word?", options: ["Enthusiastic", "Enthusiast", "Enthusiastically", "Enthusiasm"], answer: 0, audio: "Enthusiastic" },
  { category: "listening", q: "Listen: 'H-Y-P-O-T-H-E-S-I-S'. Choose the correct word:", options: ["Hypothesis", "Hypotenuse", "Hypnosis", "Hypothesis"], answer: 0, audio: "Hypothesis" },
  { category: "listening", q: "Listen: 'N-E-G-O-T-I-A-T-E'. What is the word?", options: ["Navigate", "Negotiate", "Narrate", "Nominate"], answer: 1, audio: "Negotiate" },

  // Mixed
  { category: "mixed", q: "What does 'Enthusiastic' mean?", options: ["Bi quan", "Nhiệt tình", "Lười biếng", "Bối rối"], answer: 1 },
  { category: "mixed", q: "She _____ (currently) learning English.", options: ["study", "studies", "is studying", "studied"], answer: 2 },
  { category: "mixed", q: "'Bite the bullet' means:", options: ["Cắn đạn", "Chịu đựng khó khăn", "Bắn súng", "Sợ hãi"], answer: 1 },
  { category: "mixed", q: "If she had come, we _____ celebrated.", options: ["will have", "would have", "had", "have"], answer: 1 },
  { category: "mixed", q: "What does 'Entrepreneur' mean?", options: ["Nhân viên", "Doanh nhân", "Giám đốc", "Kỹ sư"], answer: 1 }
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cd_english';
  console.log(`Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);

  const vocabCount = await Vocabulary.countDocuments();
  if (vocabCount === 0) {
    console.log('🌱 Seeding Vocabulary...');
    await Vocabulary.insertMany(INITIAL_VOCABULARY);
    console.log(`✅ Seeded ${INITIAL_VOCABULARY.length} vocabulary items.`);
  } else {
    console.log(`ℹ️ Vocabulary collection already has ${vocabCount} items. Skipping.`);
  }

  const grammarCount = await Grammar.countDocuments();
  if (grammarCount === 0) {
    console.log('🌱 Seeding Grammar...');
    await Grammar.insertMany(INITIAL_GRAMMAR);
    console.log(`✅ Seeded ${INITIAL_GRAMMAR.length} grammar lessons.`);
  } else {
    console.log(`ℹ️ Grammar collection already has ${grammarCount} items. Skipping.`);
  }

  const quizCount = await Quiz.countDocuments();
  if (quizCount === 0) {
    console.log('🌱 Seeding Quiz...');
    await Quiz.insertMany(INITIAL_QUIZ);
    console.log(`✅ Seeded ${INITIAL_QUIZ.length} quiz questions.`);
  } else {
    console.log(`ℹ️ Quiz collection already has ${quizCount} questions. Skipping.`);
  }

  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    console.log('🌱 Seeding Tech News...');
    await News.insertMany(TECH_NEWS_DATA);
    console.log(`✅ Seeded ${TECH_NEWS_DATA.length} IT tech news articles.`);
  } else {
    console.log(`ℹ️ News collection already has ${newsCount} articles. Skipping.`);
  }

  const itCourseCount = await ITCourse.countDocuments();
  if (itCourseCount === 0) {
    console.log('🌱 Seeding IT Courses...');
    await ITCourse.insertMany(IT_COURSES_DATA);
    console.log(`✅ Seeded ${IT_COURSES_DATA.length} IT courses & lessons.`);
  } else {
    console.log(`ℹ️ ITCourse collection already has ${itCourseCount} courses. Skipping.`);
  }

  console.log('🎉 Seeding process completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
