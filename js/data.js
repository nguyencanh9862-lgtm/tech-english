// ===================================================================
// ENGLISH MASTER – DATA (data.js)
// ===================================================================

// --------- VOCABULARY DATA ---------
const VOCABULARY_DATA = [
  // Daily
  { id:1, word:"Enthusiastic", phonetic:"/ɪnˌθjuːziˈæstɪk/", pos:"adj", meaning:"Nhiệt tình, hăng hái", example:"She is enthusiastic about learning English.", exampleVi:"Cô ấy rất nhiệt tình học tiếng Anh.", category:"daily", level:"B1" },
  { id:2, word:"Accomplish", phonetic:"/əˈkʌmplɪʃ/", pos:"v", meaning:"Hoàn thành, đạt được", example:"We accomplished our goal.", exampleVi:"Chúng tôi đã đạt được mục tiêu.", category:"daily", level:"B2" },
  { id:3, word:"Resilient", phonetic:"/rɪˈzɪliənt/", pos:"adj", meaning:"Kiên cường, bền bỉ", example:"She remained resilient despite the difficulties.", exampleVi:"Cô ấy vẫn kiên cường dù gặp khó khăn.", category:"daily", level:"B2" },
  { id:4, word:"Grateful", phonetic:"/ˈɡreɪtfʊl/", pos:"adj", meaning:"Biết ơn", example:"I'm grateful for your help.", exampleVi:"Tôi biết ơn sự giúp đỡ của bạn.", category:"daily", level:"A2" },
  { id:5, word:"Opportunity", phonetic:"/ˌɒpəˈtjuːnɪti/", pos:"n", meaning:"Cơ hội", example:"This is a great opportunity.", exampleVi:"Đây là một cơ hội tuyệt vời.", category:"daily", level:"B1" },
  { id:6, word:"Challenge", phonetic:"/ˈtʃælɪndʒ/", pos:"n", meaning:"Thử thách", example:"Every challenge makes us stronger.", exampleVi:"Mỗi thử thách làm chúng ta mạnh mẽ hơn.", category:"daily", level:"A2" },
  // Business
  { id:7, word:"Negotiate", phonetic:"/nɪˈɡəʊʃieɪt/", pos:"v", meaning:"Đàm phán, thương lượng", example:"We need to negotiate the contract.", exampleVi:"Chúng ta cần đàm phán hợp đồng.", category:"business", level:"B2" },
  { id:8, word:"Revenue", phonetic:"/ˈrevənjuː/", pos:"n", meaning:"Doanh thu", example:"The company's revenue increased by 20%.", exampleVi:"Doanh thu của công ty tăng 20%.", category:"business", level:"B2" },
  { id:9, word:"Stakeholder", phonetic:"/ˈsteɪkˌhəʊldər/", pos:"n", meaning:"Các bên liên quan", example:"We must inform all stakeholders.", exampleVi:"Chúng ta phải thông báo cho tất cả các bên liên quan.", category:"business", level:"C1" },
  { id:10, word:"Entrepreneur", phonetic:"/ˌɒntrəprəˈnɜːr/", pos:"n", meaning:"Doanh nhân, nhà khởi nghiệp", example:"He is a successful entrepreneur.", exampleVi:"Anh ấy là một doanh nhân thành công.", category:"business", level:"B2" },
  // Travel
  { id:11, word:"Itinerary", phonetic:"/aɪˈtɪnərəri/", pos:"n", meaning:"Lịch trình chuyến đi", example:"Please review the travel itinerary.", exampleVi:"Vui lòng xem lịch trình chuyến đi.", category:"travel", level:"B1" },
  { id:12, word:"Destination", phonetic:"/ˌdestɪˈneɪʃn/", pos:"n", meaning:"Điểm đến", example:"Paris is our next destination.", exampleVi:"Paris là điểm đến tiếp theo của chúng tôi.", category:"travel", level:"A2" },
  { id:13, word:"Accommodation", phonetic:"/əˌkɒməˈdeɪʃn/", pos:"n", meaning:"Chỗ ở, chỗ lưu trú", example:"We booked luxury accommodation.", exampleVi:"Chúng tôi đã đặt chỗ ở sang trọng.", category:"travel", level:"B1" },
  { id:14, word:"Souvenir", phonetic:"/ˌsuːvəˈnɪər/", pos:"n", meaning:"Quà lưu niệm", example:"I bought a souvenir from Japan.", exampleVi:"Tôi mua một món quà lưu niệm từ Nhật Bản.", category:"travel", level:"A2" },
  // Academic
  { id:15, word:"Hypothesis", phonetic:"/haɪˈpɒθɪsɪs/", pos:"n", meaning:"Giả thuyết", example:"The scientist tested her hypothesis.", exampleVi:"Nhà khoa học đã kiểm tra giả thuyết của mình.", category:"academic", level:"C1" },
  { id:16, word:"Analyze", phonetic:"/ˈænəlaɪz/", pos:"v", meaning:"Phân tích", example:"We need to analyze the data.", exampleVi:"Chúng ta cần phân tích dữ liệu.", category:"academic", level:"B2" },
  { id:17, word:"Phenomenon", phonetic:"/fɪˈnɒmɪnən/", pos:"n", meaning:"Hiện tượng", example:"This is a rare natural phenomenon.", exampleVi:"Đây là hiện tượng tự nhiên hiếm gặp.", category:"academic", level:"C1" },
  { id:18, word:"Methodology", phonetic:"/ˌmeθəˈdɒlədʒi/", pos:"n", meaning:"Phương pháp luận", example:"The research methodology was rigorous.", exampleVi:"Phương pháp luận nghiên cứu rất chặt chẽ.", category:"academic", level:"C1" },
  // Idioms
  { id:19, word:"Bite the bullet", phonetic:"/baɪt ðə ˈbʊlɪt/", pos:"idiom", meaning:"Cắn răng chịu đựng, chấp nhận điều khó chịu", example:"Just bite the bullet and tell him the truth.", exampleVi:"Cứ cắn răng mà nói thật với anh ấy đi.", category:"idiom", level:"B2" },
  { id:20, word:"Break the ice", phonetic:"/breɪk ðə aɪs/", pos:"idiom", meaning:"Phá vỡ sự im lặng, làm quen", example:"He told a joke to break the ice.", exampleVi:"Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng.", category:"idiom", level:"B1" },
  { id:21, word:"Hit the nail", phonetic:"/hɪt ðə neɪl/", pos:"idiom", meaning:"Nói/làm đúng vào trọng tâm", example:"You hit the nail on the head!", exampleVi:"Bạn nói đúng vào trọng tâm rồi!", category:"idiom", level:"B1" },
  { id:22, word:"Under the weather", phonetic:"/ˈʌndər ðə ˈweðər/", pos:"idiom", meaning:"Không khỏe, ốm nhẹ", example:"I'm feeling a bit under the weather today.", exampleVi:"Hôm nay tôi cảm thấy hơi không khỏe.", category:"idiom", level:"A2" },
];

// --------- GRAMMAR DATA ---------
const GRAMMAR_LESSONS = [
  {
    title: "Thì Hiện tại đơn (Present Simple)",
    icon: "fas fa-circle-dot",
    color: "#6366f1",
    formula: "S + V(s/es) + O",
    description: "Diễn tả thói quen, sự thật hiển nhiên, lịch trình cố định.",
    uses: [
      "Thói quen, hành động lặp đi lặp lại: <em>She reads every morning.</em>",
      "Sự thật hiển nhiên: <em>The sun rises in the east.</em>",
      "Lịch trình cố định: <em>The train leaves at 8 AM.</em>"
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
      "Đang xảy ra lúc nói: <em>She is studying right now.</em>",
      "Tạm thời: <em>He is working in London this month.</em>",
      "Kế hoạch tương lai: <em>We are meeting tomorrow.</em>"
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
      "Hành động đã xảy ra và kết thúc: <em>She visited Paris last year.</em>",
      "Chuỗi hành động trong quá khứ: <em>He woke up, ate breakfast and left.</em>",
      "Thói quen trong quá khứ: <em>They played chess every Sunday.</em>"
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
      "Dự đoán: <em>It will rain tomorrow.</em>",
      "Quyết định tức thời: <em>I'll help you with that.</em>",
      "Lời hứa: <em>I will always love you.</em>"
    ],
    examples: [
      { en: "She will call you later.", vi: "Cô ấy sẽ gọi cho bạn sau." },
      { en: "We won't be late.", vi: "Chúng tôi sẽ không đến muộn." },
      { en: "Will they come to the party?", vi: "Họ sẽ đến tiệc không?" }
    ],
    signals: ["tomorrow", "next week/year", "in the future", "soon", "I think"]
  },
  {
    title: "Câu điều kiện (Conditionals)",
    icon: "fas fa-circle-dot",
    color: "#f59e0b",
    formula: "If + clause, main clause",
    description: "Diễn tả điều kiện và kết quả có thể hoặc giả định.",
    uses: [
      "Loại 0 – Sự thật: <em>If you heat water, it boils.</em>",
      "Loại 1 – Có thể xảy ra: <em>If it rains, I will stay home.</em>",
      "Loại 2 – Giả định: <em>If I were rich, I would travel.</em>",
      "Loại 3 – Tiếc nuối: <em>If I had studied, I would have passed.</em>"
    ],
    examples: [
      { en: "If you study hard, you will succeed.", vi: "Nếu bạn học chăm chỉ, bạn sẽ thành công." },
      { en: "If I were you, I would apologize.", vi: "Nếu tôi là bạn, tôi sẽ xin lỗi." },
      { en: "If she had come, we would have celebrated.", vi: "Nếu cô ấy đến, chúng ta đã tổ chức ăn mừng." }
    ],
    signals: ["if", "unless", "provided that", "as long as", "on condition that"]
  },
  {
    title: "Mệnh đề quan hệ (Relative Clauses)",
    icon: "fas fa-circle-dot",
    color: "#06b6d4",
    formula: "Noun + who/which/that/where/when + clause",
    description: "Cung cấp thêm thông tin về danh từ đứng trước.",
    uses: [
      "WHO – người: <em>The man who called is my father.</em>",
      "WHICH – vật: <em>The book which I read was great.</em>",
      "WHERE – nơi chốn: <em>The city where I was born is beautiful.</em>",
      "WHEN – thời gian: <em>The day when we met was special.</em>"
    ],
    examples: [
      { en: "The girl who sings is my sister.", vi: "Cô gái đang hát là chị tôi." },
      { en: "This is the movie that won the Oscar.", vi: "Đây là bộ phim đã thắng giải Oscar." },
      { en: "The park where we played is gone.", vi: "Công viên nơi chúng tôi chơi đã biến mất." }
    ],
    signals: ["who", "whom", "which", "that", "where", "when", "whose"]
  }
];

// --------- QUIZ DATA ---------
const QUIZ_DATA = {
  vocabulary: [
    { q: "What does 'Resilient' mean?", options: ["Kiên cường", "Tự phụ", "Lo lắng", "Nhút nhát"], answer: 0 },
    { q: "Choose the word that means 'Biết ơn':", options: ["Grateful", "Angry", "Joyful", "Sad"], answer: 0 },
    { q: "'Opportunity' có nghĩa là gì?", options: ["Khó khăn", "Cơ hội", "Thử thách", "Thành công"], answer: 1 },
    { q: "What is the meaning of 'Accomplish'?", options: ["Thất bại", "Bỏ cuộc", "Hoàn thành", "Trì hoãn"], answer: 2 },
    { q: "Từ nào có nghĩa là 'Đàm phán'?", options: ["Celebrate", "Negotiate", "Participate", "Communicate"], answer: 1 },
    { q: "'Revenue' means:", options: ["Lợi nhuận", "Chi phí", "Doanh thu", "Đầu tư"], answer: 2 },
    { q: "Which word means 'Lịch trình chuyến đi'?", options: ["Destination", "Souvenir", "Itinerary", "Accommodation"], answer: 2 },
    { q: "What does 'Hypothesis' mean?", options: ["Kết luận", "Giả thuyết", "Bằng chứng", "Phân tích"], answer: 1 },
    { q: "'Break the ice' means:", options: ["Phá vỡ đồ vật", "Làm mát", "Phá vỡ sự im lặng", "Bắt đầu"], answer: 2 },
    { q: "Which phrase means 'Không khỏe'?", options: ["Hit the nail", "Bite the bullet", "Under the weather", "Break the ice"], answer: 2 },
  ],
  grammar: [
    { q: "She _____ to school every day.", options: ["go", "goes", "going", "went"], answer: 1 },
    { q: "They _____ TV right now.", options: ["watch", "watches", "are watching", "watched"], answer: 2 },
    { q: "I _____ a movie yesterday.", options: ["watch", "watches", "watched", "am watching"], answer: 2 },
    { q: "If it rains, I _____ stay home.", options: ["will", "would", "am", "was"], answer: 0 },
    { q: "The girl _____ sings is my sister.", options: ["which", "where", "who", "when"], answer: 2 },
    { q: "She _____ (not) like coffee.", options: ["don't", "doesn't", "isn't", "wasn't"], answer: 1 },
    { q: "We _____ dinner at 8 PM tomorrow.", options: ["have", "are having", "had", "were having"], answer: 1 },
    { q: "If I _____ rich, I would travel.", options: ["am", "was", "were", "will be"], answer: 2 },
    { q: "This is the book _____ I read.", options: ["who", "where", "when", "that"], answer: 3 },
    { q: "The sun _____ in the east.", options: ["rises", "is rising", "rose", "will rise"], answer: 0 },
  ],
  listening: [
    { q: "Listen: 'S-E-R-E-N-D-I-P-I-T-Y'. What word is spelled?", options: ["Serendipity", "Sensitivity", "Serenity", "Solidarity"], answer: 0, audio: "Serendipity" },
    { q: "Listen: 'R-E-S-I-L-I-E-N-T'. What word is spelled?", options: ["Resilient", "Reliant", "Recipient", "Resident"], answer: 0, audio: "Resilient" },
    { q: "Listen: 'E-N-T-H-U-S-I-A-S-T-I-C'. What word?", options: ["Enthusiastic", "Enthusiast", "Enthusiastically", "Enthusiasm"], answer: 0, audio: "Enthusiastic" },
    { q: "Listen: 'H-Y-P-O-T-H-E-S-I-S'. Choose the correct word:", options: ["Hypothesis", "Hypotenuse", "Hypnosis", "Hypothesis"], answer: 0, audio: "Hypothesis" },
    { q: "Listen: 'N-E-G-O-T-I-A-T-E'. What is the word?", options: ["Navigate", "Negotiate", "Narrate", "Nominate"], answer: 1, audio: "Negotiate" },
    { q: "Listen: 'A-C-C-O-M-P-L-I-S-H'. What word?", options: ["Accomplish", "Accompany", "Accommodate", "Accumulate"], answer: 0, audio: "Accomplish" },
    { q: "Listen: 'G-R-A-T-E-F-U-L'. Spell it:", options: ["Grateful", "Greatful", "Gratefull", "Gratful"], answer: 0, audio: "Grateful" },
    { q: "Listen: 'O-P-P-O-R-T-U-N-I-T-Y'. What word?", options: ["Opportunity", "Opportunist", "Opportune", "Opportunism"], answer: 0, audio: "Opportunity" },
    { q: "Listen: 'D-E-S-T-I-N-A-T-I-O-N'. What word?", options: ["Destination", "Determination", "Declaration", "Designation"], answer: 0, audio: "Destination" },
    { q: "Listen: 'A-C-C-O-M-M-O-D-A-T-I-O-N'. What word?", options: ["Accommodation", "Accomplishment", "Accumulation", "Accountant"], answer: 0, audio: "Accommodation" },
  ],
  mixed: [
    { q: "What does 'Enthusiastic' mean?", options: ["Bi quan", "Nhiệt tình", "Lười biếng", "Bối rối"], answer: 1 },
    { q: "She _____ (currently) learning English.", options: ["study", "studies", "is studying", "studied"], answer: 2 },
    { q: "'Bite the bullet' means:", options: ["Cắn đạn", "Chịu đựng khó khăn", "Bắn súng", "Sợ hãi"], answer: 1 },
    { q: "If she had come, we _____ celebrated.", options: ["will have", "would have", "had", "have"], answer: 1 },
    { q: "What does 'Entrepreneur' mean?", options: ["Nhân viên", "Doanh nhân", "Giám đốc", "Kỹ sư"], answer: 1 },
    { q: "The city _____ I was born is beautiful.", options: ["which", "who", "where", "when"], answer: 2 },
    { q: "'Under the weather' means:", options: ["Ngoài trời", "Không khỏe", "Mưa bão", "Thời tiết xấu"], answer: 1 },
    { q: "Water _____ at 100°C. (fact)", options: ["boils", "is boiling", "boiled", "will boil"], answer: 0 },
    { q: "What does 'Phenomenon' mean?", options: ["Lý thuyết", "Hiện tượng", "Phương pháp", "Kết quả"], answer: 1 },
    { q: "He _____ (not) come to the party last night.", options: ["don't", "doesn't", "didn't", "isn't"], answer: 2 },
  ],
  it: [
    { q: "Trong phát triển phần mềm, thuật ngữ 'API' là viết tắt của cụm từ nào?", options: ["Application Programming Interface", "Advanced Program Integration", "Automated Process Interaction", "Applied Program Instruction"], answer: 0 },
    { q: "Trong JavaScript, từ khóa nào dùng để khai báo một hàm bất đồng bộ?", options: ["sync", "async", "await", "promise"], answer: 1 },
    { q: "Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO (Last In First Out)?", options: ["Queue", "Stack", "Array", "Linked List"], answer: 1 },
    { q: "Thuật ngữ 'Latency' trong mạng và hệ thống phân tán có nghĩa là gì?", options: ["Băng thông tối đa", "Độ trễ truyền tải dữ liệu", "Lỗi mất gói tin", "Tần số xung nhịp"], answer: 1 },
    { q: "Lệnh Git nào dùng để tạo nhánh mới và chuyển ngay sang nhánh đó?", options: ["git branch -m <name>", "git checkout -b <name>", "git merge <name>", "git push -u <name>"], answer: 1 },
    { q: "Trong RESTful API, phương thức HTTP nào thường dùng để cập nhật một phần tài nguyên?", options: ["GET", "POST", "PATCH", "DELETE"], answer: 2 },
    { q: "'Polymorphism' (Tính đa hình) là nguyên lý của phương pháp lập trình nào?", options: ["Lập trình hàm (FP)", "Lập trình hướng đối tượng (OOP)", "Lập trình tuần tự", "Lập trình logic"], answer: 1 },
    { q: "Độ phức tạp thời gian (Time Complexity) trung bình của thuật toán Binary Search là gì?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 2 },
    { q: "Trong kiến trúc Microservices, 'Containerization' gắn liền với công nghệ phổ biến nào?", options: ["Docker", "jQuery", "Apache HTTP", "Photoshop"], answer: 0 },
    { q: "Trong bảo mật web, 'SQL Injection' là loại tấn công khai thác lỗ hổng nào?", options: ["Tràn bộ nhớ đệm", "Chèn mã SQL độc hại vào câu truy vấn cơ sở dữ liệu", "Nghe lén gói tin WiFi", "Giả mạo địa chỉ IP"], answer: 1 }
  ]
};

// --------- BADGES ---------
const BADGES = [
  { id: "first_quiz", icon: "🎯", name: "First Try", desc: "Hoàn thành bài quiz đầu tiên", xpRequired: 10 },
  { id: "vocabulary_100", icon: "📚", name: "Bookworm", desc: "Học 100 từ vựng", xpRequired: 100 },
  { id: "streak_7", icon: "🔥", name: "On Fire", desc: "7 ngày học liên tiếp", xpRequired: 70 },
  { id: "perfect_score", icon: "⭐", name: "Perfect", desc: "Đạt 100% trong một bài quiz", xpRequired: 50 },
  { id: "speed_demon", icon: "⚡", name: "Speed Demon", desc: "Hoàn thành quiz dưới 60 giây", xpRequired: 30 },
  { id: "explorer", icon: "🌍", name: "Explorer", desc: "Học qua 5 chủ đề khác nhau", xpRequired: 80 },
  { id: "dev_master", icon: "💻", name: "Dev Prodigy", desc: "Hoàn thành bài học CNTT và chạy code thành công", xpRequired: 120 },
  { id: "tech_reader", icon: "📰", name: "Tech Insider", desc: "Đọc 3 bài viết tin tức công nghệ", xpRequired: 60 }
];

// ===================================================================
// DỮ LIỆU TIN TỨC CÔNG NGHỆ THÔNG TIN (TECH NEWS)
// ===================================================================
const TECH_NEWS_DATA = [
  {
    id: 1,
    title: "Kỷ nguyên AI Agents: Lập trình viên hợp tác cùng Trí tuệ Nhân tạo như thế nào?",
    slug: "ky-nguyen-ai-agents-lap-trinh-vien-2026",
    summary: "Sự trỗi dậy của các Autonomous AI Agents đang biến lập trình viên từ người viết từng dòng code thành các kiến trúc sư hệ thống và điều phối viên công nghệ.",
    category: "ai",
    categoryLabel: "Trí tuệ nhân tạo",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    readTime: "6 phút đọc",
    author: "Alex Đặng • AI Tech Lead",
    publishedAt: "05/10/2026",
    views: 1420,
    content: `
      <p>Trong năm 2026, chúng ta đang chứng kiến bước chuyển mình ngoạn mục của ngành công nghệ phần mềm: từ <strong>Generative AI</strong> đơn thuần trả lời câu hỏi sang <strong>Agentic AI</strong> — những hệ thống tác nhân trí tuệ nhân tạo có khả năng tự lập kế hoạch (planning), thực thi lệnh (tool use), viết kiểm thử (testing) và tự sửa lỗi (self-debugging).</p>
      
      <h4>1. Tác nhân tự trị (Autonomous Agents) hoạt động ra sao?</h4>
      <p>Khác với chatbot truyền thống chỉ phản hồi từng lượt, một AI Agent được trang bị bộ nhớ ngắn hạn và dài hạn, khả năng phân rã bài toán phức tạp thành các bước nhỏ và truy cập hệ điều hành để hoàn thành dự án hoàn chỉnh.</p>
      
      <h4>2. Thay đổi vai trò của Kỹ sư Phần mềm (Software Engineers)</h4>
      <p>Lập trình viên không còn phải mất hàng giờ viết những đoạn code boilerplate lặp đi lặp lại. Thay vào đó, kỹ năng quan trọng nhất hiện nay là <em>System Architecture</em> (Kiến trúc hệ thống), <em>Critical Thinking</em> (Tư duy phản biện) và khả năng giao tiếp tiếng Anh chính xác để mô tả yêu cầu cho AI.</p>
      
      <h4>3. Lời khuyên cho sinh viên và lập trình viên</h4>
      <p>Hãy học sâu các nguyên lý nền tảng: cấu trúc dữ liệu, giải thuật, giao thức mạng và mô hình bảo mật. Công cụ có thể thay đổi, nhưng nền tảng kỹ thuật và vốn từ vựng tiếng Anh chuyên ngành sẽ luôn là lợi thế cạnh tranh số một.</p>
    `,
    keyVocab: [
      { word: "Autonomous Agent", phonetic: "/ɔːˈtɒnəməs ˈeɪdʒənt/", meaning: "Tác nhân tự trị (hệ thống AI có khả năng tự hành động theo mục tiêu)", example: "The autonomous agent fixed the bug and opened a pull request." },
      { word: "Reasoning", phonetic: "/ˈriːzənɪŋ/", meaning: "Khả năng lập luận, suy luận logic", example: "Modern LLMs exhibit advanced multi-step reasoning capabilities." },
      { word: "Hallucination", phonetic: "/həˌluːsɪˈneɪʃn/", meaning: "Ảo giác AI (khi mô hình tạo ra thông tin sai lệch nhưng trông có vẻ thật)", example: "We use RAG techniques to reduce LLM hallucination." },
      { word: "Orchestration", phonetic: "/ˌɔːkɪˈstreɪʃn/", meaning: "Sự điều phối nhịp nhàng giữa nhiều hệ thống hoặc dịch vụ", example: "Microservices orchestration is vital in distributed computing." }
    ]
  },
  {
    id: 2,
    title: "Top xu hướng Lập trình Web 2026: TypeScript, React Server Components & Edge Computing",
    slug: "top-xu-huong-web-development-2026",
    summary: "Khám phá các tiêu chuẩn kiến trúc web hiện đại giúp trang web đạt tốc độ phản hồi tính bằng mili-giây và khả năng mở rộng không giới hạn.",
    category: "dev",
    categoryLabel: "Lập trình Web",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 phút đọc",
    author: "Minh Trần • Fullstack Architect",
    publishedAt: "04/10/2026",
    views: 980,
    content: `
      <p>Thế giới web front-end và back-end đang hội tụ mạnh mẽ hơn bao giờ hết. Những giới hạn cũ về Server-Side Rendering (SSR) và Client-Side Rendering (CSR) đã được xóa nhòa bởi kiến trúc lai (hybrid architecture).</p>
      
      <h4>1. TypeScript trở thành ngôn ngữ tiêu chuẩn bắt buộc</h4>
      <p>Hơn 90% dự án phần mềm doanh nghiệp hiện nay yêu cầu <em>Type Safety</em> (an toàn kiểu dữ liệu). TypeScript giúp phát hiện lỗi ngay trong lúc gõ code (compile-time) thay vì chờ đến khi người dùng gặp sự cố ngoài môi trường production.</p>
      
      <h4>2. React Server Components (RSC) và Tối ưu hóa tải trang</h4>
      <p>Bằng cách kết xuất các component tĩnh ngay trên máy chủ và chỉ gửi HTML siêu nhẹ về trình duyệt, người dùng có thể trải nghiệm trang web gần như tức thì mà không cần tải hàng megabyte mã JavaScript.</p>
      
      <h4>3. Điện toán biên (Edge Computing)</h4>
      <p>Dữ liệu và mã xử lý logic hiện được phân phối tới hàng ngàn máy chủ biên đặt sát cạnh vị trí địa lý của người dùng, mang lại <em>Latency</em> (độ trễ) cực thấp dưới 20ms trên toàn cầu.</p>
    `,
    keyVocab: [
      { word: "Type Safety", phonetic: "/taɪp ˈseɪfti/", meaning: "An toàn kiểu (cơ chế ngôn ngữ ngăn ngừa lỗi sai kiểu dữ liệu)", example: "TypeScript provides static type safety for large-scale codebases." },
      { word: "Edge Computing", phonetic: "/edʒ kəmˈpjuːtɪŋ/", meaning: "Điện toán biên (xử lý dữ liệu gần với người dùng cuối)", example: "Deploying API routes on the edge reduces user latency significantly." },
      { word: "Hydration", phonetic: "/haɪˈdreɪʃn/", meaning: "Quá trình gắn kết JavaScript tương tác vào HTML đã render sẵn từ server", example: "Selective hydration improves First Input Delay metrics." },
      { word: "Concurrency", phonetic: "/kənˈkʌrənsi/", meaning: "Tính đồng thời (xử lý nhiều tác vụ cùng thời điểm)", example: "Node.js uses an event loop to achieve high concurrency." }
    ]
  },
  {
    id: 3,
    title: "Bảo mật ứng dụng đám mây: Kiến trúc Zero Trust và phòng thủ chủ động",
    slug: "bao-mat-ung-dung-dam-may-zero-trust",
    summary: "Trước làn sóng tấn công mạng ngày càng tinh vi, triết lý 'Không bao giờ tin tưởng, luôn luôn xác thực' (Never Trust, Always Verify) đang trở thành tiêu chuẩn vàng.",
    category: "security",
    categoryLabel: "An ninh mạng",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    readTime: "7 phút đọc",
    author: "Hà Nguyễn • Security Lead",
    publishedAt: "03/10/2026",
    views: 1150,
    content: `
      <p>Mô hình an ninh truyền thống dựa trên tường lửa và ranh giới mạng nội bộ đã lỗi thời khi nhân sự làm việc từ xa (remote work) và hạ tầng phân tán trên đa đám mây (multi-cloud).</p>
      
      <h4>1. Nguyên lý cốt lõi của Zero Trust</h4>
      <p>Không một người dùng hay thiết bị nào — kể cả nằm bên trong mạng nội bộ — được mặc định tin cậy. Mọi yêu cầu truy cập tài nguyên (API, Database, File) đều phải trải qua quá trình <em>Authentication</em> (Xác thực danh tính) và <em>Authorization</em> (Cấp quyền tối thiểu) liên tục.</p>
      
      <h4>2. Phòng chống lỗ hổng OWASP Top 10</h4>
      <p>Các cuộc tấn công như SQL Injection, Cross-Site Scripting (XSS), và Broken Access Control vẫn diễn ra hàng ngày. Lập trình viên cần áp dụng nguyên tắc <em>Input Sanitization</em> (làm sạch dữ liệu đầu vào) và mã hóa mạnh ở cả trạng thái lưu trữ (data-at-rest) lẫn truyền tải (data-in-transit).</p>
    `,
    keyVocab: [
      { word: "Zero Trust", phonetic: "/ˈzɪərəʊ trʌst/", meaning: "Mô hình bảo mật 'Không tin tưởng bất kỳ ai, luôn luôn xác thực'", example: "The enterprise adopted a Zero Trust architecture across all VPNs." },
      { word: "Vulnerability", phonetic: "/ˌvʌlnərəˈbɪləti/", meaning: "Lỗ hổng bảo mật trong phần mềm hoặc hệ thống", example: "The security audit revealed a critical vulnerability in the payment gateway." },
      { word: "Payload", phonetic: "/ˈpeɪləʊd/", meaning: "Khối dữ liệu truyền tải thực sự hoặc đoạn mã khai thác độc hại", example: "The hacker injected a malicious script payload into the input form." },
      { word: "Sanitization", phonetic: "/ˌsænɪtaɪˈzeɪʃn/", meaning: "Quá trình làm sạch dữ liệu đầu vào để loại bỏ mã độc hại", example: "Always perform input sanitization before executing SQL queries." }
    ]
  },
  {
    id: 4,
    title: "Tại sao Tiếng Anh là kỹ năng sống còn giúp Kỹ sư CNTT phát triển sự nghiệp toàn cầu?",
    slug: "tai-sao-tieng-anh-la-ky-nang-song-con-cua-dev",
    summary: "Code chỉ là công cụ, tiếng Anh chính là chiếc cầu nối biến bạn từ một người thợ gõ code nội địa thành một kỹ sư phần mềm làm việc với mức lương quốc tế.",
    category: "career",
    categoryLabel: "Phát triển sự nghiệp",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    author: "Hoàng Lê • Tech Mentor & Author",
    publishedAt: "02/10/2026",
    views: 1890,
    content: `
      <p>Nhiều bạn trẻ bước vào ngành Công nghệ Thông tin tin rằng chỉ cần giỏi thuật toán hay thành thạo một ngôn ngữ lập trình là đủ. Nhưng thực tế tuyển dụng tại các công ty công nghệ đa quốc gia cho thấy điều ngược lại.</p>
      
      <h4>1. Toàn bộ tài liệu công nghệ tiên tiến nhất đều bằng tiếng Anh</h4>
      <p>Khi một thư viện mới ra đời, một bản cập nhật bảo mật khẩn cấp được phát hành, hoặc tài liệu chính thức của AWS, Google Cloud, Meta xuất hiện — 100% tài liệu gốc (Official Documentation) được viết bằng tiếng Anh. Chờ đợi bản dịch đồng nghĩa với việc bạn đã đi sau thế giới ít nhất 6 tháng đến 1 năm.</p>
      
      <h4>2. Giao tiếp trong các cuộc họp kỹ thuật (Daily Standup, Tech Specs)</h4>
      <p>Khả năng trình bày giải pháp kỹ thuật rõ ràng, viết <em>Pull Request description</em> chi tiết, thảo luận trong <em>Code Review</em> và tranh luận văn minh về kiến trúc phần mềm bằng tiếng Anh là thước đo quyết định xem bạn có thể thăng tiến lên cấp bậc Senior, Tech Lead hay Engineering Manager hay không.</p>
    `,
    keyVocab: [
      { word: "Code Review", phonetic: "/kəʊd rɪˈvjuː/", meaning: "Quá trình đồng nghiệp kiểm tra, đánh giá chất lượng mã nguồn", example: "Constructive code reviews help maintain codebase quality." },
      { word: "Technical Debt", phonetic: "/ˈteknɪkl det/", meaning: "Nợ kỹ thuật (chi phí phải trả sau này do chọn giải pháp tạm bợ)", example: "Refactoring legacy modules reduces technical debt." },
      { word: "Documentation", phonetic: "/ˌdɒkjumenˈteɪʃn/", meaning: "Tài liệu kỹ thuật hướng dẫn sử dụng và cài đặt phần mềm", example: "Good API documentation accelerates third-party integration." },
      { word: "Pull Request (PR)", phonetic: "/pʊl rɪˈkwest/", meaning: "Yêu cầu tích hợp nhánh code của lập trình viên vào mã nguồn chính", example: "Please review my pull request before the weekly release." }
    ]
  },
  {
    id: 5,
    title: "Điện toán đám mây Cloud-Native: Từ Docker Container đến Kubernetes và GitOps",
    slug: "dien-toan-dam-may-cloud-native-devops",
    summary: "Hiểu rõ cách các tập đoàn công nghệ lớn vận hành hàng triệu container với độ tin cậy 99.999% nhờ tự động hóa CI/CD và hạ tầng dạng mã (IaC).",
    category: "cloud",
    categoryLabel: "Cloud & DevOps",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    readTime: "6 phút đọc",
    author: "Quang Vũ • DevOps Architect",
    publishedAt: "01/10/2026",
    views: 820,
    content: `
      <p>Khái niệm <strong>Cloud-Native</strong> không chỉ đơn thuần là đưa ứng dụng lên máy chủ ảo trên đám mây, mà là cách chúng ta thiết kế hệ thống có khả năng tự phục hồi (self-healing), tự co giãn quy mô (auto-scaling) và triển khai liên tục mà không gián đoạn dịch vụ.</p>
      
      <h4>1. Sức mạnh của Đóng gói Container (Containerization)</h4>
      <p>Với Docker, khẩu hiệu kinh điển <em>"It works on my machine!"</em> đã trở thành quá khứ. Toàn bộ mã nguồn, runtime, thư viện phụ thuộc và biến môi trường được đóng gói thành một Docker image nhất quán từ máy lập trình viên cho tới môi trường Production.</p>
      
      <h4>2. Quản phối cụm với Kubernetes (K8s)</h4>
      <p>Kubernetes giải quyết bài toán quản lý hàng trăm container cùng lúc: tự động khởi động lại container bị lỗi, cân bằng tải (load balancing) và mở rộng tài nguyên dựa trên lưu lượng người dùng truy cập.</p>
    `,
    keyVocab: [
      { word: "Containerization", phonetic: "/kənˌteɪnəraɪˈzeɪʃn/", meaning: "Đóng gói ứng dụng và toàn bộ môi trường thực thi vào container", example: "Docker revolutionized software deployment through containerization." },
      { word: "Scalability", phonetic: "/ˌskeɪləˈbɪləti/", meaning: "Khả năng co giãn quy mô hệ thống khi tải tăng đột biến", example: "Horizontal scalability allows adding more server instances seamlessly." },
      { word: "High Availability", phonetic: "/haɪ əˌveɪləˈbɪləti/", meaning: "Độ sẵn sàng cao (hệ thống hoạt động liên tục không gián đoạn)", example: "Multi-region deployments guarantee 99.99% high availability." },
      { word: "CI/CD Pipeline", phonetic: "/ˌsiː aɪ ˌsiː ˈdiː ˈpaɪplaɪn/", meaning: "Quy trình tích hợp và triển khai mã nguồn tự động hóa", example: "The CI/CD pipeline runs unit tests before publishing Docker images." }
    ]
  },
  {
    id: 6,
    title: "Sự trỗi dậy của Chip AI NPU và Xu hướng Điện toán Cận biên (On-Device AI)",
    slug: "chip-ai-npu-dien-toan-can-bien",
    summary: "Khi các mô hình ngôn ngữ lớn (SLMs/LLMs) được tối ưu hóa để chạy trực tiếp trên smartphone và laptop mà không cần kết nối mạng.",
    category: "ai",
    categoryLabel: "Phần cứng & AI",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 phút đọc",
    author: "Đức Phạm • Hardware Analyst",
    publishedAt: "30/09/2026",
    views: 750,
    content: `
      <p>Thay vì phụ thuộc hoàn toàn vào các trung tâm dữ liệu đám mây khổng lồ tiêu tốn hàng gigawatt điện, các nhà sản xuất phần cứng đang đưa bộ xử lý thần kinh chuyên dụng (NPU - Neural Processing Unit) vào từng chiếc máy tính cá nhân và điện thoại di động.</p>
      
      <h4>1. Lợi ích vượt trội về quyền riêng tư và độ trễ</h4>
      <p>Dữ liệu nhạy cảm của người dùng (tài liệu nội bộ, giọng nói, hình ảnh) được xử lý ngay tại thiết bị cục bộ (On-Device), triệt tiêu hoàn toàn nguy cơ rò rỉ dữ liệu qua đường truyền internet và phản hồi gần như tức thì mà không cần mạng.</p>
      
      <h4>2. Cuộc đua tối ưu hóa mô hình ngôn ngữ nhỏ (Small Language Models - SLMs)</h4>
      <p>Các kỹ thuật nén mô hình như <em>Quantization</em> (lượng tử hóa 4-bit, 8-bit) và <em>Pruning</em> (cắt tỉa trọng số) cho phép các mô hình với 3-7 tỷ tham số chạy mượt mà trên phần cứng dân dụng với mức tiêu thụ pin cực thấp.</p>
    `,
    keyVocab: [
      { word: "NPU (Neural Processing Unit)", phonetic: "/ˈnjʊərəl ˈprəʊsesɪŋ ˈjuːnɪt/", meaning: "Bộ xử lý thần kinh chuyên dụng cho các tác vụ trí tuệ nhân tạo", example: "The laptop features an integrated NPU for real-time video effects." },
      { word: "Quantization", phonetic: "/ˌkwɒntaɪˈzeɪʃn/", meaning: "Kỹ thuật lượng tử hóa giảm kích thước trọng số của mô hình AI", example: "4-bit quantization allows running 8B parameter models on mobile devices." },
      { word: "Throughput", phonetic: "/ˈθruːpʊt/", meaning: "Thông lượng (khối lượng công việc xử lý được trong một đơn vị thời gian)", example: "The server achieved high throughput under heavy network traffic." },
      { word: "Bandwidth", phonetic: "/ˈbændwɪdθ/", meaning: "Băng thông (tốc độ truyền dữ liệu tối đa của đường truyền)", example: "High memory bandwidth is crucial for large AI model inference." }
    ]
  }
];

// ===================================================================
// DỮ LIỆU KHÓA HỌC & BÀI HỌC CÔNG NGHỆ THÔNG TIN (IT COURSES & LABS)
// ===================================================================
const IT_COURSES_DATA = [
  {
    id: 1,
    title: "Lập trình Web Frontend & UI Engineering",
    titleEn: "Modern Web Frontend & UI Engineering",
    category: "web",
    level: "Cơ bản - Nâng cao",
    icon: "fab fa-html5",
    color: "#6366f1",
    description: "Làm chủ HTML5 Semantic, CSS3 hiện đại (Flexbox & Grid), JavaScript ES6+ và tư duy xây dựng giao diện người dùng chuyên nghiệp.",
    topics: [
      {
        title: "HTML5 Semantic & SEO Optimization",
        enTerm: "Semantic HTML",
        viDesc: "Sử dụng các thẻ mang ý nghĩa ngữ nghĩa (header, main, nav, article, section) thay vì lạm dụng thẻ div vô nghĩa, giúp máy tìm kiếm hiểu cấu trúc trang và hỗ trợ người khiếm thị đọc màn hình.",
        enExplanation: "Semantic HTML reinforces the meaning of the information in webpages rather than merely defining its presentation.",
        codeSnippet: `<header class="site-header">
  <nav aria-label="Main Navigation">
    <ul><li><a href="#home">Home</a></li></ul>
  </nav>
</header>
<main>
  <article>
    <h1>Modern Semantic Web</h1>
    <p>Clean code improves accessibility and SEO.</p>
  </article>
</main>`,
        practicalTip: "Luôn dùng thẻ <button> cho hành động click và thẻ <a> cho chuyển trang để chuẩn Accessibility (a11y)."
      },
      {
        title: "CSS3 Flexbox & CSS Grid Masterclass",
        enTerm: "CSS Flexbox & CSS Grid",
        viDesc: "Hai công cụ bố cục mạnh mẽ nhất của web hiện đại. Flexbox tối ưu cho sắp xếp 1 chiều (theo dòng hoặc cột), Grid tối ưu cho hệ thống lưới 2 chiều phức tạp.",
        enExplanation: "Flexbox handles one-dimensional layouts, while CSS Grid is engineered for complex two-dimensional alignments.",
        codeSnippet: `/* Modern Responsive CSS Grid without media queries */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}`,
        practicalTip: "Sử dụng repeat(auto-fit, minmax(250px, 1fr)) để tạo lưới co giãn responsive tự động không cần viết @media query."
      },
      {
        title: "JavaScript ES6+: Async/Await & Fetch API",
        enTerm: "Asynchronous JavaScript",
        viDesc: "Xử lý các tác vụ bất đồng bộ như gọi API lấy dữ liệu mà không làm đơ giao diện người dùng, sử dụng cú pháp Promises và async/await thanh lịch.",
        enExplanation: "Async/await simplifies asynchronous code flow, allowing promises to be written in a synchronous-looking style.",
        codeSnippet: `async function fetchTechNews(category) {
  try {
    const res = await fetch(\`/api/news?category=\${category}\`);
    if (!res.ok) throw new Error('Network error: ' + res.status);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('Fetch failed:', err.message);
    return [];
  }
}`,
        practicalTip: "Luôn bọc lời gọi await trong khối try...catch để bắt lỗi kết nối mạng gracefully."
      }
    ],
    keyVocab: [
      { word: "Responsive Design", phonetic: "/rɪˈspɒnsɪv dɪˈzaɪn/", meaning: "Thiết kế web tương thích co giãn trên mọi kích thước màn hình", example: "The landing page adopts responsive design using mobile-first CSS." },
      { word: "DOM (Document Object Model)", phonetic: "/ˌdiː əʊ ˈem/", meaning: "Mô hình đối tượng tài liệu đại diện cho cấu trúc cây HTML trong trình duyệt", example: "JavaScript manipulates the DOM to render dynamic elements." },
      { word: "Event Listener", phonetic: "/ɪˈvent ˈlɪsənər/", meaning: "Hàm lắng nghe và xử lý sự kiện người dùng (click, keydown, scroll)", example: "Attach an event listener to the submit button to handle authentication." }
    ]
  },
  {
    id: 2,
    title: "Backend Development & RESTful API Architecture",
    titleEn: "Backend Development & RESTful APIs",
    category: "backend",
    level: "Trung cấp",
    icon: "fab fa-node-js",
    color: "#10b981",
    description: "Xây dựng máy chủ mạnh mẽ với Node.js, Express, thiết kế chuẩn kiến trúc RESTful API, xác thực JWT an toàn và kết nối cơ sở dữ liệu MongoDB/SQL.",
    topics: [
      {
        title: "Chuẩn thiết kế RESTful API chuyên nghiệp",
        enTerm: "RESTful API Standards",
        viDesc: "Quy chuẩn đặt tên endpoint bằng danh từ số nhiều, sử dụng đúng các động từ HTTP (GET, POST, PUT, PATCH, DELETE) và trả về HTTP Status Codes chuẩn.",
        enExplanation: "RESTful principles mandate stateless communication and standardized HTTP methods for resource manipulation.",
        codeSnippet: `// Chuẩn RESTful Endpoints:
// GET    /api/v1/courses      -> Lấy danh sách
// GET    /api/v1/courses/:id  -> Lấy chi tiết
// POST   /api/v1/courses      -> Tạo mới
// PUT    /api/v1/courses/:id  -> Cập nhật toàn bộ
// PATCH  /api/v1/courses/:id  -> Cập nhật một phần
// DELETE /api/v1/courses/:id  -> Xóa tài nguyên`,
        practicalTip: "Luôn trả về mã 201 Created khi tạo mới thành công, 400 Bad Request khi dữ liệu lỗi, và 404 Not Found khi không tìm thấy."
      },
      {
        title: "Middleware & Xác thực người dùng bằng JWT (JSON Web Tokens)",
        enTerm: "Authentication Middleware & JWT",
        viDesc: "Cơ chế bảo vệ API endpoint: kiểm tra token người dùng gửi lên qua header Authorization Bearer trước khi cho phép truy cập tài nguyên bảo mật.",
        enExplanation: "Middleware functions intercept HTTP requests to validate authentication credentials and manage session states.",
        codeSnippet: `const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}`,
        practicalTip: "Không lưu thông tin mật (như password) bên trong JWT payload vì token này có thể được giải mã base64 dễ dàng ở phía client."
      }
    ],
    keyVocab: [
      { word: "Endpoint", phonetic: "/ˈendpɔɪnt/", meaning: "Điểm cuối URL nơi API tiếp nhận và xử lý yêu cầu", example: "The auth endpoint accepts POST requests containing email and password." },
      { word: "Payload", phonetic: "/ˈpeɪləʊd/", meaning: "Phần dữ liệu cốt lõi được truyền tải trong HTTP body", example: "Ensure the JSON payload conforms to the data validation schema." },
      { word: "Middleware", phonetic: "/ˈmɪdlweər/", meaning: "Phần mềm trung gian chạy giữa request và response", example: "CORS and body-parser are standard Express middlewares." }
    ]
  },
  {
    id: 3,
    title: "Cấu trúc Dữ liệu & Giải thuật Thực chiến (DSA)",
    titleEn: "Data Structures & Algorithms in Practice",
    category: "dsa",
    level: "Trung cấp - Nâng cao",
    icon: "fas fa-diagram-project",
    color: "#f59e0b",
    description: "Rèn luyện tư duy lập trình đỉnh cao với Array, Hash Map, Linked List, Binary Tree và phân tích độ phức tạp thuật toán Big-O notation.",
    topics: [
      {
        title: "Độ phức tạp thuật toán (Big O Notation)",
        enTerm: "Time & Space Complexity",
        viDesc: "Thước đo đánh giá thời gian chạy và dung lượng bộ nhớ thuật toán tiêu thụ khi kích thước đầu vào N tăng lên vô cùng lớn.",
        enExplanation: "Big O notation mathematically describes the asymptotic behavior and worst-case performance of an algorithm.",
        codeSnippet: `// O(1) - Thời gian hằng số (truy cập phần tử theo key)
const getUser = (map, id) => map[id];

// O(log n) - Tìm kiếm nhị phân (Binary Search)
// O(n) - Duyệt qua mảng 1 lần
// O(n log n) - Thuật toán sắp xếp nhanh (QuickSort, MergeSort)
// O(n^2) - Vòng lặp lồng nhau (Nested loops)`,
        practicalTip: "Ưu tiên cấu trúc dữ liệu Hash Map (Object/Map trong JS) để có tốc độ tra cứu O(1) thay vì duyệt mảng O(n)."
      },
      {
        title: "Thuật toán Tìm kiếm Nhị phân (Binary Search)",
        enTerm: "Binary Search Algorithm",
        viDesc: "Tìm kiếm một phần tử trong mảng ĐÃ ĐƯỢC SẮP XẾP bằng cách chia đôi khoảng tìm kiếm ở mỗi bước, đạt tốc độ O(log n) cực nhanh.",
        enExplanation: "Binary search repeatedly divides the sorted search interval in half to locate the target key in logarithmic time.",
        codeSnippet: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid; // Tìm thấy
    if (arr[mid] < target) {
      left = mid + 1; // Tìm ở nửa phải
    } else {
      right = mid - 1; // Tìm ở nửa trái
    }
  }
  return -1; // Không tìm thấy
}
console.log(binarySearch([2, 5, 8, 12, 16, 23, 38], 16)); // Output: 4`,
        practicalTip: "Điều kiện tiên quyết để dùng Binary Search là mảng đầu vào phải luôn được sắp xếp theo thứ tự."
      }
    ],
    keyVocab: [
      { word: "Algorithm", phonetic: "/ˈælɡərɪðəm/", meaning: "Thuật toán (chuỗi các bước xác định để giải quyết một bài toán)", example: "The recommendation algorithm processes user behavior in real-time." },
      { word: "Recursion", phonetic: "/rɪˈkɜːʃn/", meaning: "Đệ quy (kỹ thuật hàm tự gọi lại chính nó với bài toán nhỏ hơn)", example: "The recursive function traverses the nested tree nodes." },
      { word: "Hash Table / Map", phonetic: "/hæʃ ˈteɪbl/", meaning: "Bảng băm (cấu trúc ánh xạ khóa-giá trị với tốc độ tra cứu O(1))", example: "Use a hash table to achieve instantaneous key lookups." }
    ]
  },
  {
    id: 4,
    title: "Git, GitHub & Quy trình Phối hợp Team Tech",
    titleEn: "Git Version Control & Team Collaboration",
    category: "devops",
    level: "Cơ bản - Nâng cao",
    icon: "fab fa-git-alt",
    color: "#ef4444",
    description: "Thành thạo công cụ kiểm soát phiên bản Git, làm việc nhóm qua GitHub, Pull Request, giải quyết xung đột Merge Conflicts và quy trình Git Flow.",
    topics: [
      {
        title: "Quy trình làm việc nhánh (Branching Workflow)",
        enTerm: "Git Branching Strategy",
        viDesc: "Không bao giờ commit trực tiếp lên nhánh main. Mỗi tính năng mới được phát triển trên nhánh riêng (feature branch) và kiểm duyệt trước khi gộp.",
        enExplanation: "Branching isolates ongoing feature development from production-ready codebases.",
        codeSnippet: `# 1. Cập nhật nhánh main mới nhất
git checkout main
git pull origin main

# 2. Tạo nhánh tính năng mới
git checkout -b feature/dark-light-mode

# 3. Commit công việc với thông điệp rõ ràng
git add .
git commit -m "feat(ui): implement dark and light theme toggle"

# 4. Đẩy nhánh lên GitHub để mở Pull Request
git push origin feature/dark-light-mode`,
        practicalTip: "Quy ước đặt tên commit: feat: thêm tính năng, fix: sửa lỗi, docs: tài liệu, refactor: tái cấu trúc code."
      }
    ],
    keyVocab: [
      { word: "Repository (Repo)", phonetic: "/rɪˈpɒzətri/", meaning: "Kho lưu trữ mã nguồn và toàn bộ lịch sử commit", example: "Clone the remote repository to your local development machine." },
      { word: "Merge Conflict", phonetic: "/mɜːdʒ ˈkɒnflɪkt/", meaning: "Xung đột xảy ra khi hai người cùng sửa một dòng code", example: "Resolve the merge conflict manually before merging the branch." },
      { word: "Staging Area", phonetic: "/ˈsteɪdʒɪŋ ˈeəriə/", meaning: "Vùng lưu tạm các file đã được git add để chuẩn bị commit", example: "Files must be moved to the staging area before committing." }
    ]
  },
  {
    id: 5,
    title: "Trí tuệ Nhân tạo (AI) & Kỹ nghệ Prompt",
    titleEn: "Artificial Intelligence & Prompt Engineering",
    category: "ai",
    level: "Cơ bản - Chuyên sâu",
    icon: "fas fa-brain",
    color: "#8b5cf6",
    description: "Làm chủ các mô hình ngôn ngữ lớn (LLMs), kỹ thuật viết Prompt tối ưu (Few-shot, CoT), tích hợp AI APIs và xây dựng ứng dụng thông minh.",
    topics: [
      {
        title: "Kỹ nghệ Prompt (Prompt Engineering)",
        enTerm: "Prompt Engineering Principles",
        viDesc: "Nghệ thuật xây dựng câu lệnh đầu vào để mô hình AI tạo ra kết quả chính xác, mạch lạc và đúng định dạng yêu cầu (JSON, Markdown).",
        enExplanation: "Prompt engineering guides LLMs to deliver accurate and contextually relevant outputs.",
        codeSnippet: `// Prompt Template chuyên nghiệp cho lập trình viên:
const systemInstruction = \`
You are an expert Senior Fullstack Engineer.
TASK: Analyze the provided JavaScript code for security vulnerabilities.
OUTPUT FORMAT: Return a valid JSON array of objects with keys:
- "issue": string
- "severity": "low" | "medium" | "high" | "critical"
- "fix": string
\`;`,
        practicalTip: "Cung cấp vai trò (Persona), bối cảnh cụ thể (Context), vài ví dụ minh họa (Few-shot examples) và định dạng đầu ra mong muốn."
      }
    ],
    keyVocab: [
      { word: "Prompt", phonetic: "/prɒmpt/", meaning: "Câu lệnh hoặc hướng dẫn đầu vào gửi tới mô hình AI", example: "Refining the prompt significantly improved code generation accuracy." },
      { word: "Token", phonetic: "/ˈtəʊkən/", meaning: "Đơn vị cơ bản mô hình AI dùng để xử lý văn bản (từ hoặc cụm ký tự)", example: "The context window allows processing up to 128,000 tokens." },
      { word: "Fine-tuning", phonetic: "/faɪn ˈtjuːnɪŋ/", meaning: "Kỹ thuật huấn luyện tinh chỉnh mô hình AI trên tập dữ liệu đặc thù", example: "We fine-tuned the model on medical textbooks for clinical precision." }
    ]
  },
  {
    id: 6,
    title: "An toàn Thông tin & An ninh Mạng Ứng dụng (Cybersecurity)",
    titleEn: "Web Application Cybersecurity & Security",
    category: "security",
    level: "Trung cấp - Nâng cao",
    icon: "fas fa-shield-halved",
    color: "#06b6d4",
    description: "Nhận diện và phòng chống các nguy cơ tấn công mạng phổ biến OWASP Top 10: XSS, SQL Injection, CSRF, mã hóa mật khẩu và thiết lập HTTPS.",
    topics: [
      {
        title: "Phòng chống SQL Injection & Cross-Site Scripting (XSS)",
        enTerm: "Preventing SQLi & XSS",
        viDesc: "Hai lỗ hổng kinh điển khiến kẻ tấn công có thể đánh cắp dữ liệu database hoặc chiếm đoạt phiên đăng nhập (session cookies) của người dùng.",
        enExplanation: "Parameterized queries prevent SQL injection, while output escaping and CSP mitigate XSS vulnerabilities.",
        codeSnippet: `// NGUY HIỂM: Ghép chuỗi trực tiếp -> Bị SQL Injection!
// "SELECT * FROM users WHERE email = '" + req.body.email + "'"

// AN TOÀN: Dùng Parameterized Query (Prepared Statement)
const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
const result = await db.query(query, [userEmail]);`,
        practicalTip: "Không bao giờ tin tưởng bất kỳ dữ liệu nào đến từ người dùng (Never trust user input)."
      }
    ],
    keyVocab: [
      { word: "Cross-Site Scripting (XSS)", phonetic: "/krɒs saɪt ˈskrɪptɪŋ/", meaning: "Lỗ hổng cho phép kẻ tấn công chèn mã JavaScript độc hại vào trang web", example: "Use Content Security Policy headers to mitigate XSS risks." },
      { word: "SQL Injection", phonetic: "/ˌes kjuː ˈel ɪnˈdʒekʃn/", meaning: "Lỗ hổng tấn công chèn lệnh SQL phi pháp vào câu truy vấn database", example: "Parameterized queries eliminate SQL injection vulnerabilities." },
      { word: "Encryption", phonetic: "/ɪnˈkrɪpʃn/", meaning: "Quá trình mã hóa dữ liệu thành chuỗi không thể đọc được nếu không có khóa giải mã", example: "End-to-end encryption secures private messaging." }
    ]
  }
];

// ===================================================================
// BỘ TỪ ĐIỂN THUẬT NGỮ CNTT (IT TERMINOLOGY DICTIONARY)
// ===================================================================
const IT_VOCABULARY_DATA = [
  { id: 101, word: "Algorithm", phonetic: "/ˈælɡərɪðəm/", pos: "n", meaning: "Thuật toán; quy trình từng bước rõ ràng để giải quyết vấn đề", example: "The search algorithm sorts millions of items in milliseconds.", exampleVi: "Thuật toán tìm kiếm sắp xếp hàng triệu mục trong vài mili-giây.", category: "dsa", level: "IT-B1" },
  { id: 102, word: "Asynchronous", phonetic: "/eɪˈsɪŋkrənəs/", pos: "adj", meaning: "Bất đồng bộ; các tác vụ chạy ngầm không chặn luồng chính", example: "JavaScript uses asynchronous operations to handle I/O tasks.", exampleVi: "JavaScript dùng các thao tác bất đồng bộ để xử lý tác vụ nhập xuất.", category: "web", level: "IT-B2" },
  { id: 103, word: "API", phonetic: "/ˌeɪ piː ˈaɪ/", pos: "n", meaning: "Giao diện lập trình ứng dụng; cầu nối trao đổi dữ liệu giữa các phần mềm", example: "Our backend exposes a REST API for the mobile application.", exampleVi: "Backend của chúng tôi cung cấp một REST API cho ứng dụng di động.", category: "backend", level: "IT-A2" },
  { id: 104, word: "Framework", phonetic: "/ˈfreɪmwɜːk/", pos: "n", meaning: "Bộ khung sườn kiến trúc phần mềm được xây dựng sẵn", example: "Express is a fast, minimalist web framework for Node.js.", exampleVi: "Express là một web framework nhanh và tối giản cho Node.js.", category: "dev", level: "IT-B1" },
  { id: 105, word: "Latency", phonetic: "/ˈleɪtənsi/", pos: "n", meaning: "Độ trễ thời gian truyền tải tín hiệu mạng", example: "Edge servers minimize network latency for global users.", exampleVi: "Các máy chủ biên giảm thiểu tối đa độ trễ mạng cho người dùng toàn cầu.", category: "cloud", level: "IT-B2" },
  { id: 106, word: "Polymorphism", phonetic: "/ˌpɒlɪˈmɔːfɪzəm/", pos: "n", meaning: "Tính đa hình trong lập trình hướng đối tượng (OOP)", example: "Polymorphism allows objects of different classes to be treated uniformly.", exampleVi: "Tính đa hình cho phép các đối tượng thuộc các lớp khác nhau được xử lý đồng nhất.", category: "dev", level: "IT-C1" },
  { id: 107, word: "Recursion", phonetic: "/rɪˈkɜːʃn/", pos: "n", meaning: "Đệ quy; kỹ thuật một hàm tự gọi lại chính nó", example: "We solved the tree traversal problem using recursion.", exampleVi: "Chúng tôi đã giải bài toán duyệt cây bằng đệ quy.", category: "dsa", level: "IT-B2" },
  { id: 108, word: "Deployment", phonetic: "/dɪˈplɔɪmənt/", pos: "n", meaning: "Quá trình triển khai phần mềm lên máy chủ đưa vào sử dụng", example: "Continuous deployment automates pushing code into production.", exampleVi: "Triển khai liên tục tự động hóa việc đưa code lên môi trường sản phẩm.", category: "devops", level: "IT-B1" },
  { id: 109, word: "Middleware", phonetic: "/ˈmɪdlweər/", pos: "n", meaning: "Phần mềm trung gian xử lý dữ liệu giữa request và response", example: "Authentication is handled through an Express middleware.", exampleVi: "Xác thực danh tính được xử lý thông qua một middleware của Express.", category: "backend", level: "IT-B2" },
  { id: 110, word: "Refactor", phonetic: "/ˌriːˈfæktər/", pos: "v", meaning: "Tái cấu trúc mã nguồn để tối ưu mà không đổi tính năng ngoài", example: "We need to refactor this function to improve its readability.", exampleVi: "Chúng ta cần tái cấu trúc hàm này để cải thiện khả năng đọc hiểu mã nguồn.", category: "dev", level: "IT-B2" },
  { id: 111, word: "Scalability", phonetic: "/ˌskeɪləˈbɪləti/", meaning: "Khả năng mở rộng quy mô hệ thống khi tải tăng", pos: "n", example: "Cloud architecture ensures seamless scalability under high traffic.", exampleVi: "Kiến trúc đám mây đảm bảo khả năng mở rộng mượt mà dưới lượng truy cập cao.", category: "cloud", level: "IT-B2" },
  { id: 112, word: "Authentication", phonetic: "/ɔːˌθentɪˈkeɪʃn/", pos: "n", meaning: "Xác thực danh tính (chứng minh bạn là ai)", example: "Two-factor authentication enhances account security.", exampleVi: "Xác thực hai yếu tố nâng cao an ninh tài khoản.", category: "security", level: "IT-B1" },
  { id: 113, word: "Authorization", phonetic: "/ˌɔːθəraɪˈzeɪʃn/", pos: "n", meaning: "Cấp quyền (quyết định bạn được phép làm gì)", example: "Admin authorization is required to delete user records.", exampleVi: "Cần quyền quản trị viên để xóa bản ghi người dùng.", category: "security", level: "IT-B2" },
  { id: 114, word: "Database", phonetic: "/ˈdeɪtəbeɪs/", pos: "n", meaning: "Cơ sở dữ liệu; hệ thống lưu trữ và quản lý dữ liệu có cấu trúc", example: "MongoDB is a popular NoSQL document database.", exampleVi: "MongoDB là cơ sở dữ liệu tài liệu NoSQL phổ biến.", category: "backend", level: "IT-A2" },
  { id: 115, word: "Repository", phonetic: "/rɪˈpɒzətri/", pos: "n", meaning: "Kho lưu trữ mã nguồn dự án", example: "The open-source repository received thousands of GitHub stars.", exampleVi: "Kho lưu trữ mã nguồn mở đã nhận hàng ngàn ngôi sao trên GitHub.", category: "devops", level: "IT-B1" },
  { id: 116, word: "Container", phonetic: "/kənˈteɪnər/", pos: "n", meaning: "Bộ chứa độc lập gồm phần mềm và mọi phụ thuộc để chạy ở mọi nơi", example: "Docker containers isolate application dependencies cleanly.", exampleVi: "Các container Docker cô lập sự phụ thuộc của ứng dụng một cách sạch sẽ.", category: "cloud", level: "IT-B2" }
];

// ===================================================================
// CÁC MẪU CODE CHO TRÌNH THỰC HÀNH TƯƠNG TÁC (CODE PLAYGROUND PRESETS)
// ===================================================================
const CODE_PLAYGROUND_TEMPLATES = [
  {
    id: "js-algo",
    name: "JavaScript: Thuật toán & Mảng",
    desc: "Tính toán thống kê và lọc dữ liệu công nghệ",
    code: `// Thuật toán lọc các thuật ngữ IT có cấp độ B2 trở lên
const techTerms = [
  { name: "API", level: "A2", stars: 4.8 },
  { name: "Asynchronous", level: "B2", stars: 4.9 },
  { name: "Polymorphism", level: "C1", stars: 5.0 },
  { name: "Container", level: "B2", stars: 4.7 }
];

const advancedTerms = techTerms.filter(t => t.level === "B2" || t.level === "C1");

console.log("=== DANH SÁCH THUẬT NGỮ CNTT NÂNG CAO ===");
advancedTerms.forEach(t => {
  console.log(\`* \${t.name} (Level: \${t.level}) - Đánh giá: \${t.stars}⭐\`);
});

const avgRating = techTerms.reduce((sum, t) => sum + t.stars, 0) / techTerms.length;
console.log(\`-> Điểm đánh giá trung bình: \${avgRating.toFixed(2)} / 5.0\`);`
  },
  {
    id: "dom-counter",
    name: "Interactive UI: Tạo thẻ từ vựng IT",
    desc: "Tạo phần tử HTML động với JavaScript",
    code: `// Mô phỏng tạo động thẻ Card học từ vựng CNTT
const word = "Microservices";
const meaning = "Kiến trúc chia nhỏ ứng dụng thành các dịch vụ độc lập";

console.log("Đang khởi tạo Card từ vựng...");
console.log("-----------------------------------------");
console.log("Từ vựng: " + word.toUpperCase());
console.log("Phát âm: /ˌmaɪkrəʊˈsɜːvɪsɪz/");
console.log("Loại từ: Danh từ (noun)");
console.log("Định nghĩa: " + meaning);
console.log("Ví dụ: Netflix uses microservices for seamless scaling.");
console.log("-----------------------------------------");
console.log("✅ Đã sẵn sàng hiển thị lên giao diện!");`
  },
  {
    id: "async-fetch",
    name: "API Async/Await: Gọi dữ liệu tin tức",
    desc: "Mô phỏng gọi API và xử lý dữ liệu JSON",
    code: `// Mô phỏng gọi API tin tức công nghệ
async function loadTechNews() {
  console.log("1. Gửi HTTP GET request tới /api/news...");
  
  // Giả lập độ trễ mạng 300ms
  await new Promise(r => setTimeout(r, 300));
  
  const mockResponse = {
    status: 200,
    articles: [
      { id: 1, title: "Kỷ nguyên AI Agents 2026", views: 1420 },
      { id: 2, title: "TypeScript & Edge Computing", views: 980 }
    ]
  };
  
  console.log("2. Nhận kết quả thành công HTTP " + mockResponse.status);
  console.log("3. Dữ liệu tin tức mới nhất:");
  mockResponse.articles.forEach(a => {
    console.log(\`   [#\${a.id}] \${a.title} - \${a.views} lượt xem\`);
  });
}

loadTechNews();`
  }
];

const ENGLISH_COURSES_DATA = [
  {
    id: 1,
    title: "Tiếng Anh Giao Tiếp Hàng Ngày Cho Người Mới Bắt Đầu",
    titleEn: "Everyday English Conversation for Beginners",
    category: "communication",
    level: "Cơ bản (A1-A2)",
    badge: "Phổ biến nhất",
    instructor: "ThS. Emma & TechEnglish",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=juKd26qkNAw",
    youtubeId: "juKd26qkNAw",
    views: 1250,
    rating: 4.9,
    description: "Khóa học video toàn diện giúp bạn tự tin giao tiếp tiếng Anh tự nhiên trong đời sống hàng ngày: chào hỏi, giới thiệu bản thân, mua sắm, hỏi đường và kết bạn.",
    lessons: [
      {
        id: 1,
        title: "Bài 1: 50 Mẫu câu Chào hỏi & Tự giới thiệu bản thân chuẩn bản xứ",
        youtubeUrl: "https://www.youtube.com/watch?v=juKd26qkNAw",
        youtubeId: "juKd26qkNAw",
        duration: "14:20",
        description: "Học cách bắt chuyện tự nhiên, phá vỡ khoảng cách (break the ice) và giới thiệu nghề nghiệp, sở thích.",
        order: 1,
        vocabularies: [
          { word: "Introduce", phonetic: "/ˌɪntrəˈdjuːs/", meaning: "Giới thiệu", example: "Let me introduce myself." },
          { word: "Pleasure", phonetic: "/ˈpleʒər/", meaning: "Niềm hân hạnh", example: "It's a pleasure to meet you." },
          { word: "Occupation", phonetic: "/ˌɒkjuˈpeɪʃn/", meaning: "Nghề nghiệp", example: "What is your current occupation?" }
        ]
      },
      {
        id: 2,
        title: "Bài 2: Giao tiếp tiếng Anh khi Mua sắm & Hỏi giá tiền",
        youtubeUrl: "https://www.youtube.com/watch?v=0b1r9H5h1bI",
        youtubeId: "0b1r9H5h1bI",
        duration: "12:45",
        description: "Học các mẫu câu hỏi kích cỡ, màu sắc, trả giá và thanh toán bằng thẻ hay tiền mặt.",
        order: 2,
        vocabularies: [
          { word: "Affordable", phonetic: "/əˈfɔːdəbl/", meaning: "Giá cả phải chăng", example: "This jacket is very affordable." },
          { word: "Discount", phonetic: "/ˈdɪskaʊnt/", meaning: "Giảm giá", example: "Can I get a discount on this?" },
          { word: "Receipt", phonetic: "/rɪˈsiːt/", meaning: "Hóa đơn / Biên lai", example: "Keep your receipt for returns." }
        ]
      },
      {
        id: 3,
        title: "Bài 3: Đặt bàn và Gọi món tại Nhà hàng & Quán cà phê",
        youtubeUrl: "https://www.youtube.com/watch?v=Xh_M5cMqmZc",
        youtubeId: "Xh_M5cMqmZc",
        duration: "16:10",
        description: "Tự tin bước vào nhà hàng quốc tế, đọc menu, yêu cầu món ăn đặc biệt và yêu cầu thanh toán hóa đơn.",
        order: 3,
        vocabularies: [
          { word: "Reservation", phonetic: "/ˌrezəˈveɪʃn/", meaning: "Đặt chỗ trước", example: "I have a reservation for two." },
          { word: "Recommend", phonetic: "/ˌrekəˈmend/", meaning: "Gợi ý / Khuyên dùng", example: "What dish do you recommend?" },
          { word: "Delicious", phonetic: "/dɪˈlɪʃəs/", meaning: "Ngon miệng", example: "The pasta looks delicious." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Tiếng Anh Chuyên Ngành CNTT & Kỹ Năng Phỏng Vấn Tech",
    titleEn: "English for Software Developers & Tech Interviews",
    category: "it",
    level: "Trung cấp (B1-B2)",
    badge: "Dành cho IT",
    instructor: "Alex Chen (Senior Tech Lead)",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=kJEsTjH5mVg",
    youtubeId: "kJEsTjH5mVg",
    views: 3120,
    rating: 5.0,
    description: "Bộ bài giảng video chuyên sâu dành cho Developers, Testers, DevOps và IT Leaders: báo cáo Daily Standup, thảo luận Pull Request, mô tả kiến trúc phần mềm và trả lời phỏng vấn công ty quốc tế.",
    lessons: [
      {
        id: 1,
        title: "Bài 1: Báo cáo công việc trôi chảy trong Daily Standup & Scrum",
        youtubeUrl: "https://www.youtube.com/watch?v=kJEsTjH5mVg",
        youtubeId: "kJEsTjH5mVg",
        duration: "15:30",
        description: "Cách nói về việc đã làm hôm qua, kế hoạch hôm nay và các vấn đề gặp phải (blockers) ngắn gọn, mạch lạc.",
        order: 1,
        vocabularies: [
          { word: "Blocker", phonetic: "/ˈblɒkər/", meaning: "Rào cản / Khó khăn cản trở", example: "I have no blockers today." },
          { word: "Deploy", phonetic: "/dɪˈplɔɪ/", meaning: "Triển khai lên server", example: "We will deploy the hotfix tonight." },
          { word: "Refactor", phonetic: "/ˌriːˈfæktər/", meaning: "Tối ưu và cấu trúc lại code", example: "I need to refactor the auth service." }
        ]
      },
      {
        id: 2,
        title: "Bài 2: Kỹ năng Review Code & Thảo luận Pull Request bằng tiếng Anh",
        youtubeUrl: "https://www.youtube.com/watch?v=VyfhJc2GkZ8",
        youtubeId: "VyfhJc2GkZ8",
        duration: "18:45",
        description: "Học cách viết và nói nhận xét code mang tính xây dựng, thảo luận hiệu năng và kiến trúc chuẩn phong cách quốc tế.",
        order: 2,
        vocabularies: [
          { word: "Maintainable", phonetic: "/meɪnˈteɪnəbl/", meaning: "Dễ bảo trì", example: "This structure is much more maintainable." },
          { word: "Bottleneck", phonetic: "/ˈbɒtlnek/", meaning: "Điểm nghẽn hiệu năng", example: "Database queries are the main bottleneck." },
          { word: "Redundant", phonetic: "/rɪˈdʌndənt/", meaning: "Thừa thãi / Trùng lặp", example: "This variable check seems redundant." }
        ]
      },
      {
        id: 3,
        title: "Bài 3: Trả lời câu hỏi Phỏng vấn Kỹ thuật & Tình huống (STAR Method)",
        youtubeUrl: "https://www.youtube.com/watch?v=uK8f6bYk-X4",
        youtubeId: "uK8f6bYk-X4",
        duration: "21:10",
        description: "Chiến lược trả lời phỏng vấn mượt mà theo phương pháp STAR: Tình huống (Situation) - Nhiệm vụ (Task) - Hành động (Action) - Kết quả (Result).",
        order: 3,
        vocabularies: [
          { word: "Scalability", phonetic: "/ˌskeɪləˈbɪləti/", meaning: "Khả năng mở rộng hệ thống", example: "We designed the microservice for high scalability." },
          { word: "Troubleshoot", phonetic: "/ˈtrʌblʃuːt/", meaning: "Dò tìm và khắc phục sự cố", example: "I had to troubleshoot the memory leak in production." },
          { word: "Deadline", phonetic: "/ˈdedlaɪn/", meaning: "Hạn chót hoàn thành", example: "We managed to deliver before the deadline." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Luyện Phát Âm Tiếng Anh Chuẩn Quốc Tế IPA & Ngữ Điệu Tự Nhiên",
    titleEn: "Master English Pronunciation & International Phonetic Alphabet",
    category: "pronunciation",
    level: "Cơ bản - Trung cấp (A1-B1)",
    badge: "Khuyên học",
    instructor: "Rachel & Đội ngũ Ngôn ngữ học",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=n4NVPg2kHv4",
    youtubeId: "n4NVPg2kHv4",
    views: 2480,
    rating: 4.95,
    description: "Nắm vững 44 âm trong bảng phiên âm quốc tế IPA, khắc phục tật nuốt âm cuối, nói tiếng Anh có ngữ điệu trầm bổng như người bản xứ.",
    lessons: [
      {
        id: 1,
        title: "Bài 1: Bí quyết phát âm chính xác các Nguyên âm đơn & Nguyên âm đôi",
        youtubeUrl: "https://www.youtube.com/watch?v=n4NVPg2kHv4",
        youtubeId: "n4NVPg2kHv4",
        duration: "19:15",
        description: "Khẩu hình miệng chuẩn xác cho các âm nguyên âm ngắn /ɪ/, /e/, /æ/ và nguyên âm dài /iː/, /uː/.",
        order: 1,
        vocabularies: [
          { word: "Pronunciation", phonetic: "/prəˌnʌnsiˈeɪʃn/", meaning: "Sự phát âm", example: "Her English pronunciation is flawless." },
          { word: "Vowel", phonetic: "/ˈvaʊəl/", meaning: "Nguyên âm", example: "English has both short and long vowels." },
          { word: "Articulation", phonetic: "/ɑːˌtɪkjuˈleɪʃn/", meaning: "Sự phát âm rõ ràng, khẩu hình", example: "Pay attention to tongue articulation." }
        ]
      },
      {
        id: 2,
        title: "Bài 2: Làm chủ các Phụ âm khó và Quy tắc Nối âm (Connected Speech)",
        youtubeUrl: "https://www.youtube.com/watch?v=cM35H7pEsqk",
        youtubeId: "cM35H7pEsqk",
        duration: "16:40",
        description: "Luyện tập các âm /θ/, /ð/, /ʃ/, /ʒ/ và kỹ thuật linking words giúp câu nói mượt mà không bị ngắt quãng.",
        order: 2,
        vocabularies: [
          { word: "Consonant", phonetic: "/ˈkɒnsənənt/", meaning: "Phụ âm", example: "Consonant clusters require practice." },
          { word: "Intonation", phonetic: "/ˌɪntəˈneɪʃn/", meaning: "Ngữ điệu câu", example: "Falling intonation is used in statements." },
          { word: "Linking", phonetic: "/ˈlɪŋkɪŋ/", meaning: "Sự nối âm", example: "Linking makes your speech sound natural." }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Luyện Nghe Nói Tiếng Anh Phản Xạ Qua Tình Huống Thực Tế",
    titleEn: "Active English Listening & Shadowing Technique",
    category: "listening",
    level: "Cơ bản - Trung cấp (A2-B1)",
    badge: "Thực chiến",
    instructor: "Mark Kister (English Fluency Coach)",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=7_t_B4r53pM",
    youtubeId: "7_t_B4r53pM",
    views: 1890,
    rating: 4.88,
    description: "Phương pháp Shadowing (nhại giọng tức thời) kết hợp luyện nghe phản xạ đa ngữ cảnh, giúp tai bắt âm nhạy và miệng bật từ vựng không cần dịch nhẩm sang tiếng Việt.",
    lessons: [
      {
        id: 1,
        title: "Bài 1: Phương pháp Luyện Nghe Chủ Động & Bắt Từ Khóa (Active Listening)",
        youtubeUrl: "https://www.youtube.com/watch?v=7_t_B4r53pM",
        youtubeId: "7_t_B4r53pM",
        duration: "17:50",
        description: "Bỏ thói quen cố nghe từng từ một, tập trung vào trọng âm câu và từ mang nội dung chính (content words).",
        order: 1,
        vocabularies: [
          { word: "Comprehension", phonetic: "/ˌkɒmprɪˈhenʃn/", meaning: "Sự thấu hiểu / Khả năng hiểu", example: "Listening comprehension improves with consistency." },
          { word: "Fluency", phonetic: "/ˈfluːənsi/", meaning: "Sự trôi chảy, lưu loát", example: "Fluency is more important than perfection." },
          { word: "Context", phonetic: "/ˈkɒntekst/", meaning: "Bối cảnh / Ngữ cảnh", example: "Guess the meaning from context." }
        ]
      },
      {
        id: 2,
        title: "Bài 2: Kỹ thuật Shadowing thực hành phản xạ nói trong 15 phút mỗi ngày",
        youtubeUrl: "https://www.youtube.com/watch?v=8qJ3zC2M9Jg",
        youtubeId: "8qJ3zC2M9Jg",
        duration: "15:20",
        description: "Quy trình 4 bước Shadowing cùng audio chuẩn để rèn cơ miệng và phản xạ tức thời.",
        order: 2,
        vocabularies: [
          { word: "Shadowing", phonetic: "/ˈʃædəʊɪŋ/", meaning: "Kỹ thuật nhại giọng", example: "Shadowing trains your tongue muscles." },
          { word: "Rhythm", phonetic: "/ˈrɪðəm/", meaning: "Nhịp điệu", example: "Feel the natural rhythm of English speech." }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Ngữ Pháp Tiếng Anh Ứng Dụng Trong Đời Sống & Công Việc",
    titleEn: "Practical English Grammar in Use",
    category: "grammar",
    level: "Cơ bản - Nâng cao (A2-B2)",
    badge: "Toàn diện",
    instructor: "Sarah Jenkins (Oxford CELTA)",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=jul22654iL0",
    youtubeId: "jul22654iL0",
    views: 1640,
    rating: 4.85,
    description: "Học ngữ pháp theo lối tư duy ứng dụng thực tế, không học vẹt công thức: Các thì then chốt, câu bị động, mệnh đề quan hệ và cách viết email lịch thiệp.",
    lessons: [
      {
        id: 1,
        title: "Bài 1: Làm chủ Các Thì Quá Khứ & Hiện Tại Hoàn Thành không bị nhầm lẫn",
        youtubeUrl: "https://www.youtube.com/watch?v=jul22654iL0",
        youtubeId: "jul22654iL0",
        duration: "23:40",
        description: "Bản đồ thời gian trực quan phân biệt Past Simple, Present Perfect và Present Perfect Continuous.",
        order: 1,
        vocabularies: [
          { word: "Experience", phonetic: "/ɪkˈspɪəriəns/", meaning: "Trải nghiệm / Kinh nghiệm", example: "Have you ever experienced this before?" },
          { word: "Recently", phonetic: "/ˈriːsntli/", meaning: "Gần đây", example: "I have recently finished my assignment." }
        ]
      },
      {
        id: 2,
        title: "Bài 2: Câu Điều Kiện & Động Từ Khuyết Thiếu trong Đàm phán và Email",
        youtubeUrl: "https://www.youtube.com/watch?v=W5iP_1F25fQ",
        youtubeId: "W5iP_1F25fQ",
        duration: "20:15",
        description: "Sử dụng Would, Could, If clause một cách lịch sự, tinh tế khi thương lượng với đối tác và đồng nghiệp.",
        order: 2,
        vocabularies: [
          { word: "Conditional", phonetic: "/kənˈdɪʃənl/", meaning: "Điều kiện", example: "Conditional sentences help state hypothetical situations." },
          { word: "Polite", phonetic: "/pəˈlaɪt/", meaning: "Lịch sự / Nhã nhặn", example: "Could you please review this when polite?" }
        ]
      }
    ]
  }
];

// --------- TECH INTERVIEW QUESTIONS ---------
const TECH_INTERVIEW_QUESTIONS = [
  {
    id: "interview-1",
    category: "backend",
    categoryLabel: "Backend & Database",
    question: "Can you explain how indexes work in MongoDB and when you should use them?",
    questionVi: "Bạn có thể giải thích cơ chế hoạt động của index trong MongoDB và khi nào nên áp dụng không?",
    hint: "Tập trung vào cấu trúc B-tree, scan performance O(log N) thay vì full-collection scan O(N), và nhược điểm write overhead.",
    modelAnswer: "Indexes in MongoDB use B-tree data structures to hold a small portion of the collection's dataset in an easy-to-traverse form. Without indexes, MongoDB must perform a collection scan, examining every single document to select those that match the query statement. We should index fields frequently used in query filters, sort operations, and compound keys.",
    modelAnswerVi: "Index trong MongoDB sử dụng cấu trúc cây B-tree để lưu trữ một phần nhỏ tập dữ liệu của collection theo dạng dễ duyệt qua. Nếu không có index, MongoDB phải thực hiện duyệt toàn bộ collection (collection scan), kiểm tra từng document để tìm kết quả. Chúng ta nên đánh index cho các trường thường xuyên dùng trong điều kiện tìm kiếm, sắp xếp và các truy vấn kết hợp.",
    keyVocab: [
      { word: "B-tree data structure", meaning: "Cấu trúc dữ liệu cây tự cân bằng" },
      { word: "Collection scan", meaning: "Quét duyệt qua toàn bộ bảng dữ liệu O(N)" },
      { word: "Compound index", meaning: "Chỉ mục kết hợp trên nhiều trường dữ liệu" }
    ]
  },
  {
    id: "interview-2",
    category: "system",
    categoryLabel: "Kiến trúc Hệ thống & Tối ưu",
    question: "How do you optimize web application performance on both frontend and backend?",
    questionVi: "Bạn tối ưu hóa hiệu năng ứng dụng web ở cả phía frontend và backend như thế nào?",
    hint: "Frontend: Lazy loading, caching, bundle splitting. Backend: Indexing, database queries, Redis caching.",
    modelAnswer: "On the frontend, I use code splitting, lazy loading for heavy images, and optimize bundle sizes. On the backend, I create compound indexes on MongoDB collections, implement Redis caching for frequent queries, and use asynchronous processing for heavy tasks.",
    modelAnswerVi: "Ở frontend, tôi chia nhỏ mã nguồn (code splitting), tải lười hình ảnh nặng và tối ưu hóa dung lượng bundle. Ở backend, tôi tạo chỉ mục kép trong MongoDB, triển khai bộ đệm Redis cho các truy vấn thường xuyên và sử dụng xử lý bất đồng bộ cho các tác vụ nặng.",
    keyVocab: [
      { word: "Code splitting", meaning: "Phân tách gói mã nguồn để tải nhanh hơn" },
      { word: "Redis caching", meaning: "Bộ đệm dữ liệu truy cập siêu nhanh trong RAM" },
      { word: "Asynchronous processing", meaning: "Xử lý tác vụ bất đồng bộ không chặn luồng" }
    ]
  },
  {
    id: "interview-3",
    category: "agile",
    categoryLabel: "Làm việc nhóm & Agile",
    question: "How do you handle disagreements with a teammate regarding technical architecture?",
    questionVi: "Bạn giải quyết mâu thuẫn ý kiến với đồng nghiệp về kiến trúc kỹ thuật như thế nào?",
    hint: "Tập trung vào sự tôn trọng, dữ liệu benchmark thực tế, trade-offs (được và mất) thay vì cái tôi cá nhân.",
    modelAnswer: "I believe constructive disagreement leads to better architecture. I always focus on objective trade-offs, scalability, and benchmarks rather than personal opinions. I schedule a brief technical sync with the team lead to decide based on project requirements.",
    modelAnswerVi: "Tôi tin rằng bất đồng mang tính xây dựng sẽ tạo ra kiến trúc tốt hơn. Tôi luôn tập trung vào sự đánh đổi khách quan, khả năng mở rộng và các chỉ số đo lường thực tế thay vì quan điểm cá nhân. Tôi thường lên lịch trao đổi kỹ thuật ngắn với trưởng nhóm để cùng đưa ra quyết định dựa trên yêu cầu dự án.",
    keyVocab: [
      { word: "Constructive disagreement", meaning: "Bất đồng mang tính xây dựng" },
      { word: "Trade-offs", meaning: "Sự đánh đổi được mất giữa các giải pháp" },
      { word: "Scalability", meaning: "Khả năng mở rộng của hệ thống" }
    ]
  },
  {
    id: "interview-4",
    category: "web",
    categoryLabel: "Frontend & Web",
    question: "What are the key differences between Server-Side Rendering (SSR) and Client-Side Rendering (CSR)?",
    questionVi: "Đâu là những điểm khác biệt chính giữa Server-Side Rendering (SSR) và Client-Side Rendering (CSR)?",
    hint: "So sánh về SEO, Time-to-First-Byte (TTFB), First Contentful Paint (FCP), và tải trọng máy chủ.",
    modelAnswer: "With CSR, the browser downloads a minimal HTML document and renders the UI using JavaScript, which offers rich interactivity but slower initial load and weaker SEO. In contrast, SSR generates the full HTML on the server for each request, ensuring faster initial content display and excellent search engine indexing.",
    modelAnswerVi: "Với CSR, trình duyệt tải về file HTML tối giản và dựng giao diện bằng JavaScript, mang lại tính tương tác mượt mà nhưng thời gian tải đầu tiên chậm hơn và SEO kém hơn. Ngược lại, SSR tạo sẵn toàn bộ HTML trên máy chủ cho mỗi yêu cầu, đảm bảo hiển thị nội dung ban đầu nhanh chóng và tối ưu cho công cụ tìm kiếm.",
    keyVocab: [
      { word: "Client-Side Rendering", meaning: "Dựng giao diện phía trình duyệt người dùng" },
      { word: "Server-Side Rendering", meaning: "Dựng giao diện sẵn tại máy chủ" },
      { word: "First Contentful Paint", meaning: "Thời gian hiển thị phần tử nội dung đầu tiên" }
    ]
  },
  {
    id: "interview-5",
    category: "general",
    categoryLabel: "Phỏng vấn mở đầu",
    question: "Can you tell me a little bit about yourself and your tech stack?",
    questionVi: "Bạn có thể giới thiệu đôi nét về bản thân và tech stack bạn đang sử dụng không?",
    hint: "Dùng cấu trúc: Hiện tại tôi là [Vị trí] với [X năm kinh nghiệm], thế mạnh của tôi là [Công nghệ], và dự án gần nhất tôi làm là [Dự án].",
    modelAnswer: "Sure! I'm a fullstack software developer with over two years of experience building modern web applications. My core stack includes React, Node.js, and MongoDB. Recently, I've been optimizing backend microservices and improving API response times.",
    modelAnswerVi: "Chắc chắn rồi! Tôi là một lập trình viên fullstack với hơn hai năm kinh nghiệm xây dựng các ứng dụng web hiện đại. Công nghệ cốt lõi của tôi bao gồm React, Node.js và MongoDB. Gần đây, tôi đang tập trung tối ưu hóa các microservice phía backend và cải thiện thời gian phản hồi của API.",
    keyVocab: [
      { word: "Core stack", meaning: "Công nghệ cốt lõi / chính" },
      { word: "Microservices", meaning: "Kiến trúc dịch vụ vi mô" },
      { word: "Response time", meaning: "Thời gian phản hồi của hệ thống" }
    ]
  },
  {
    id: "interview-6",
    category: "behavioral",
    categoryLabel: "Xử lý sự cố & Thử thách",
    question: "Describe a critical production bug you encountered and how you solved it.",
    questionVi: "Hãy kể về một lỗi nghiêm trọng trên production bạn từng gặp và cách bạn khắc phục nó.",
    hint: "Áp dụng công thức STAR: Situation (Bối cảnh) -> Task (Nhiệm vụ) -> Action (Hành động debug) -> Result (Kết quả và bài học).",
    modelAnswer: "During a peak promotion campaign, our payment gateway started returning 500 errors. I immediately checked the server logs, reproduced the race condition in staging, rolled out a hotfix to introduce proper database transactions, and added automated unit tests to prevent regression.",
    modelAnswerVi: "Trong một đợt cao điểm khuyến mãi, cổng thanh toán của chúng tôi bắt đầu trả về lỗi 500. Tôi lập tức kiểm tra nhật ký máy chủ, tái hiện lỗi xung đột tiến trình (race condition) trên môi trường staging, phát hành một bản vá nóng áp dụng transaction database chuẩn xác, đồng thời bổ sung các bài unit test tự động để tránh tái diễn.",
    keyVocab: [
      { word: "Race condition", meaning: "Lỗi tương tranh dữ liệu khi nhiều tiến trình chạy song song" },
      { word: "Hotfix", meaning: "Bản vá lỗi khẩn cấp trực tiếp lên production" },
      { word: "Regression", meaning: "Lỗi phát sinh làm hỏng tính năng cũ khi cập nhật code mới" }
    ]
  }
];

// --------- DICTATION EXERCISES ---------
const DICTATION_EXERCISES = [
  {
    id: "dict-1",
    audioText: "We need to deploy the latest release to production tonight.",
    textVi: "Chúng ta cần triển khai bản phát hành mới nhất lên máy chủ production tối nay.",
    hint: "W_ n___ t_ d_____ t__ l_____ r______ t_ p_________ t______.",
    level: "B1",
    category: "it"
  },
  {
    id: "dict-2",
    audioText: "Unit tests help us catch critical bugs before they reach the users.",
    textVi: "Các bài kiểm thử đơn vị giúp chúng ta bắt được các lỗi nghiêm trọng trước khi chúng đến tay người dùng.",
    hint: "U___ t____ h___ u_ c____ c_______ b___ b_____ t___ r____ t__ u____.",
    level: "B1",
    category: "it"
  },
  {
    id: "dict-3",
    audioText: "Could you please review my pull request when you have time?",
    textVi: "Bạn có thể vui lòng xem qua pull request của tôi khi bạn rảnh không?",
    hint: "C____ y__ p_____ r_____ m_ p___ r______ w___ y__ h___ t___?",
    level: "A2",
    category: "work"
  },
  {
    id: "dict-4",
    audioText: "An effective algorithm significantly reduces server CPU consumption.",
    textVi: "Một thuật toán hiệu quả giúp giảm đáng kể mức tiêu thụ CPU của máy chủ.",
    hint: "A_ e________ a________ s___________ r______ s_____ C__ c__________.",
    level: "B2",
    category: "it"
  },
  {
    id: "dict-5",
    audioText: "Security vulnerabilities should be patched as soon as possible.",
    textVi: "Các lỗ hổng bảo mật nên được vá càng sớm càng tốt.",
    hint: "S_______ v______________ s_____ b_ p______ a_ s___ a_ p_______.",
    level: "B2",
    category: "security"
  }
];

// --------- SENTENCE BUILDER PUZZLE DATA ---------
const SENTENCE_BUILDER_DATA = [
  {
    id: "builder-1",
    vietnamese: "Chúng tôi triển khai các tính năng mới sau mỗi hai tuần chạy nước rút.",
    correctSentence: "We deploy new features after every two week sprint.",
    words: ["We", "deploy", "new", "features", "after", "every", "two", "week", "sprint"],
    distractors: ["code", "server", "debug"]
  },
  {
    id: "builder-2",
    vietnamese: "Trí tuệ nhân tạo đang thay đổi cách các lập trình viên viết mã nguồn.",
    correctSentence: "Artificial intelligence is changing how software developers write code.",
    words: ["Artificial", "intelligence", "is", "changing", "how", "software", "developers", "write", "code"],
    distractors: ["server", "compile", "bug"]
  },
  {
    id: "builder-3",
    vietnamese: "Hãy sao chép kho lưu trữ Git này về máy tính cá nhân của bạn.",
    correctSentence: "Please clone this Git repository to your local machine.",
    words: ["Please", "clone", "this", "Git", "repository", "to", "your", "local", "machine"],
    distractors: ["push", "commit", "server"]
  },
  {
    id: "builder-4",
    vietnamese: "Bạn có thể vui lòng giải thích sự khác biệt giữa hai giải pháp này không?",
    correctSentence: "Could you please explain the difference between these two solutions?",
    words: ["Could", "you", "please", "explain", "the", "difference", "between", "these", "two", "solutions"],
    distractors: ["why", "where", "problem"]
  }
];

// --------- WORD OF THE DAY SPOTLIGHT ---------
const WORD_OF_THE_DAY_LIST = [
  {
    word: "Architecture",
    phonetic: "/ˈɑː.kɪ.tek.tʃər/",
    pos: "n",
    meaning: "Kiến trúc hệ thống, cấu trúc thiết kế phần mềm tổng thể",
    example: "Clean architecture ensures long-term scalability and easy maintenance.",
    exampleVi: "Kiến trúc sạch đảm bảo khả năng mở rộng lâu dài và bảo trì dễ dàng.",
    category: "it",
    level: "B2",
    tag: "DevOps & System"
  },
  {
    word: "Asynchronous",
    phonetic: "/eɪˈsɪŋ.krə.nəs/",
    pos: "adj",
    meaning: "Bất đồng bộ (trong lập trình, xử lý không chờ đợi kết quả ngay)",
    example: "JavaScript uses an asynchronous event loop to handle non-blocking I/O operations.",
    exampleVi: "JavaScript sử dụng vòng lặp sự kiện bất đồng bộ để xử lý các tác vụ I/O không chặn luồng.",
    category: "it",
    level: "B2",
    tag: "Web Development"
  },
  {
    word: "Refactoring",
    phonetic: "/riːˈfæk.tər.ɪŋ/",
    pos: "n",
    meaning: "Tái cấu trúc mã nguồn để gọn gàng, dễ bảo trì mà không làm thay đổi hành vi bên ngoài",
    example: "Regular code refactoring significantly reduces technical debt.",
    exampleVi: "Tái cấu trúc code định kỳ giúp giảm đáng kể nợ kỹ thuật của dự án.",
    category: "it",
    level: "B1",
    tag: "Software Engineering"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VOCABULARY_DATA,
    GRAMMAR_LESSONS,
    QUIZ_DATA,
    BADGES,
    TECH_NEWS_DATA,
    IT_COURSES_DATA,
    IT_VOCABULARY_DATA,
    ENGLISH_COURSES_DATA,
    CODE_PLAYGROUND_TEMPLATES,
    TECH_INTERVIEW_QUESTIONS,
    DICTATION_EXERCISES,
    SENTENCE_BUILDER_DATA,
    WORD_OF_THE_DAY_LIST
  };
}

