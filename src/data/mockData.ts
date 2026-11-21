export interface Course {
  id: string;
  title: string;
  category: 'math' | 'english' | 'cs';
  categoryLabel: string;
  badge: string;
  description: string;
  targetAudience: string;
  duration: string;
  schedule: string;
  groupSize: string;
  price: string;
  pricePeriod: string;
  features: string[];
  image: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  subject: string;
  experience: string;
  photo: string;
  education: string;
  achievements: string[];
  studentResults: {
    avgScore: string;
    maxScore: string;
    topUniversities: string[];
    olympiadWinners?: string;
  };
}

export interface StudentResult {
  id: string;
  name: string;
  course: string;
  score: string;
  university: string;
  faculty: string;
  avatar: string;
  quote: string;
  year: string;
}

export interface CenterInfo {
  name: string;
  tagline: string;
  description: string;
  founded: string;
  address: string;
  metro: string;
  walkTime: string;
  parking: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  workingHours: {
    weekdays: string;
    weekend: string;
  };
  socials: {
    telegram: string;
    whatsapp: string;
    vk: string;
    youtube: string;
  };
  stats: {
    value: string;
    label: string;
    sublabel: string;
  }[];
}

export const centerInfo: CenterInfo = {
  name: "Академия Знаний «AURA»",
  tagline: "Интеллектуальный старт вашего блестящего будущего",
  description: "Премиальный учебный центр подготовки к ЕГЭ, ОГЭ, олимпиадам и международным экзаменам по математике, английскому языку и информатике. Мы сочетаем фундаментальную академическую базу и передовые IT-технологии обучения.",
  founded: "2018",
  address: "г. Москва, Пресненская наб., д. 12 (Башня Федерация Восток, 14 этаж)",
  metro: "м. Деловой центр / Деловой комплекс «Москва-Сити»",
  walkTime: "3 минуты от метро",
  parking: "Подземный охраняемый паркинг (первые 2 часа бесплатно для учеников)",
  phone: "+7 (495) 820-44-22",
  phoneSecondary: "+7 (800) 555-32-10",
  email: "info@aura-academy.ru",
  workingHours: {
    weekdays: "Понедельник — Суббота: 09:00 — 21:00",
    weekend: "Воскресенье: 10:00 — 18:00"
  },
  socials: {
    telegram: "https://t.me/aura_academy",
    whatsapp: "https://wa.me/74958204422",
    vk: "https://vk.com/aura_academy",
    youtube: "https://youtube.com/@aura_academy"
  },
  stats: [
    { value: "96.8%", label: "Поступление на бюджет", sublabel: "В ведущие вузы страны" },
    { value: "88.6", label: "Средний балл ЕГЭ", sublabel: "По всем предметам за 2024-2025 гг." },
    { value: "48+", label: "Стобалльников", sublabel: "Абсолютный результат на экзаменах" },
    { value: "1 850+", label: "Выпускников центра", sublabel: "Успешно окончили наши курсы" }
  ]
};

export const coursesData: Course[] = [
  {
    id: "math",
    title: "Профильная математика и Олимпиадный трек",
    category: "math",
    categoryLabel: "Математика",
    badge: "Топ выбор для инженеров и финансистов",
    description: "Глубокая фундаментальная подготовка к ЕГЭ на 85+ баллов, ОГЭ на максимальную отметку, а также победам в Перечневых олимпиадах («Физтех», «Ломоносов», «Росатом»).",
    targetAudience: "Ученики 8–11 классов, абитуриенты технических и экономических специальностей",
    duration: "9 месяцев (модульная программа)",
    schedule: "2 раза в неделю по 90 минут + онлайн-практикум",
    groupSize: "до 6–8 человек (или индивидуально)",
    price: "14 500 ₽",
    pricePeriod: "в месяц (8 занятий)",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    features: [
      "Разбор сложных задач 2-й части ЕГЭ: параметры, экономические задачи, стереометрия и теория чисел",
      "Авторские методички с разбором 500+ нестандартных прототипов задач",
      "Проведение регулярных пробников в условиях, идентичных реальному экзамену",
      "Персональный разбор ошибок с экспертом предметной комиссии"
    ]
  },
  {
    id: "english",
    title: "Академический и разговорный английский (IELTS / ОГЭ / ЕГЭ)",
    category: "english",
    categoryLabel: "Английский язык",
    badge: "Международный уровень",
    description: "Комплексное преодоление языкового барьера, подготовка к государственным и международным экзаменам IELTS/TOEFL и поступлению в зарубежные вузы.",
    targetAudience: "Школьники 5–11 классов, студенты и взрослые (уровни A2 – C1)",
    duration: "6–9 месяцев (по уровням CEFR)",
    schedule: "2–3 раза в неделю по 80 минут + Speaking Club с носителем языка",
    groupSize: "до 6 человек в группе одного уровня",
    price: "15 900 ₽",
    pricePeriod: "в месяц (8 занятий + Speaking Club)",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop",
    features: [
      "Интерактивная практика разговорной речи и аудирования в современных мультимедийных классах",
      "Еженедельный клуб дебатов (Speaking Club) с сертифицированным носителем языка (Великобритания/США)",
      "Тренировка эссе академического формата (Task 1 & Task 2) с детальным фидбеком",
      "Гарантия повышения результата на 1.5–2 балла по шкале IELTS или 85+ баллов на ЕГЭ"
    ]
  },
  {
    id: "cs",
    title: "Информатика, Python & Алгоритмическое программирование",
    category: "cs",
    categoryLabel: "Информатика и IT",
    badge: "Старт в IT и олимпиады",
    description: "Подготовка к ЕГЭ по информатике на 90+ баллов, олимпиадам по программированию (ВсОШ, Высшая проба), освоение алгоритмов, структур данных и разработка собственных проектов.",
    targetAudience: "Ученики 7–11 классов, будущие разработчики, специалисты по AI и Data Science",
    duration: "8 месяцев",
    schedule: "2 раза в неделю по 90 минут + хакатоны по субботам",
    groupSize: "до 8 человек (у каждого мощный рабочий ПК)",
    price: "16 500 ₽",
    pricePeriod: "в месяц (8 занятий + доступ к код-ревью платформе)",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    features: [
      "Глубокое изучение Python, структур данных, теории графов и динамического программирования",
      "Решение сложных задач 26 и 27 из ЕГЭ с помощью эффективных алгоритмов",
      "Автоматизированная система проверки кода в реальном времени с подробным логом тестов",
      "Создание 2 реальных IT-проектов в портфолио для олимпиадных конкурсов"
    ]
  }
];

export const teachersData: Teacher[] = [
  {
    id: "voronov",
    name: "Александр Сергеевич Воронов",
    role: "Руководитель направления математики",
    subject: "Профильная математика и олимпиады",
    experience: "14 лет педагогического стажа",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    education: "МГУ им. М.В. Ломоносова, Механико-математический факультет. Кандидат физико-математических наук.",
    achievements: [
      "Старший эксперт региональной предметной комиссии ЕГЭ по математике",
      "Член жюри Московской математической олимпиады и Всероссийской олимпиады школьников",
      "Автор 3 научно-методических пособий по геометрии и нестандартным уравнениям"
    ],
    studentResults: {
      avgScore: "89.4 балла",
      maxScore: "100 баллов (19 учеников за 5 лет)",
      topUniversities: ["МФТИ (ФАКТ, ФИВТ)", "МГУ (Мехмат, ВМК)", "НИУ ВШЭ (МИЭФ, ПМИ)"],
      olympiadWinners: "37 призеров и победителей олимпиад I и II уровня"
    }
  },
  {
    id: "smirnova",
    name: "Елена Викторовна Смирнова",
    role: "Ведущий преподаватель английского языка",
    subject: "Академический английский, ЕГЭ & IELTS",
    experience: "11 лет преподавательской практики",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    education: "МГЛУ им. Мориса Тореза, факультет переводческого мастерства. Сертификаты Cambridge CELTA, DELTA (Module 1, 2).",
    achievements: [
      "Подтвержденный уровень владения языком C2 Proficiency (CPE)",
      "Сертифицированный тренер по подготовке к IELTS Academic & General",
      "Победитель всероссийского конкурса педагогического мастерства «Учитель года 2021»"
    ],
    studentResults: {
      avgScore: "88.8 баллов на ЕГЭ / 7.8 IELTS",
      maxScore: "IELTS 8.5 / 100 баллов ЕГЭ",
      topUniversities: ["МГИМО", "НИУ ВШЭ (Мировая экономика)", "King's College London", "University of Amsterdam"],
      olympiadWinners: "24 дипломанта Всероса и олимпиады «Высшая проба»"
    }
  },
  {
    id: "kovalev",
    name: "Дмитрий Алексеевич Ковалёв",
    role: "Руководитель кафедры IT и программирования",
    subject: "Информатика, Алгоритмы, Python",
    experience: "9 лет в образовании и Software Engineering",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    education: "МФТИ (ФИВТ), Прикладная математика и информатика. Экс-разработчик поисковых сервисов Яндекс.",
    achievements: [
      "Разработчик открытой тестирующей системы для алгоритмических задач",
      "Тренер сборной команды школьников по спортивному программированию (ICPC Junior)",
      "Спикер IT-конференций HighLoad++ и PyCon Russia"
    ],
    studentResults: {
      avgScore: "91.2 балла на ЕГЭ",
      maxScore: "100 баллов (23 выпускника)",
      topUniversities: ["МФТИ (ФИВТ, ПМИ)", "ИТМО", "ВШЭ (ФКН)", "Иннополис"],
      olympiadWinners: "Победители Открытой олимпиады по программированию и Технокубка"
    }
  }
];

export const studentResultsData: StudentResult[] = [
  {
    id: "1",
    name: "Михаил Григорьев",
    course: "Информатика и Алгоритмы",
    score: "100 баллов",
    university: "МФТИ",
    faculty: "ФИВТ (Прикладная математика и информатика)",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    quote: "Дмитрий Алексеевич научил не просто заучивать шаблоны ЕГЭ, а мыслить категориями структур данных. Задачи 26 и 27 на реальном экзамене решил за 20 минут. Поступил без вступительных испытаний по олимпиаде!",
    year: "Выпуск 2024"
  },
  {
    id: "2",
    name: "Анна Мельникова",
    course: "Английский язык & IELTS",
    score: "IELTS 8.5 / ЕГЭ 98",
    university: "НИУ ВШЭ / Erasmus",
    faculty: "Международный институт экономики и финансов (МИЭФ)",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
    quote: "Спикинг клабы с носителем языка полностью стерли языковой барьер. Когда пришла сдавать Speaking в IELTS, чувствовала себя так же спокойно, как за чашкой кофе в нашем центре.",
    year: "Выпуск 2024"
  },
  {
    id: "3",
    name: "Артём Савельев",
    course: "Профильная математика",
    score: "98 баллов",
    university: "МГУ им. Ломоносова",
    faculty: "Механико-математический факультет",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    quote: "До прихода в центр боялся параметров как огня. Александр Сергеевич разложил графический метод так наглядно, что геометрия и параметры стали моими любимыми разделами. Огромная благодарность!",
    year: "Выпуск 2024"
  },
  {
    id: "4",
    name: "София Лебедева",
    course: "Математика + Информатика",
    score: "96 + 100 баллов",
    university: "НИУ ВШЭ",
    faculty: "Факультет компьютерных наук (ПМИ)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    quote: "Учебный центр «Aura» — это комьюнити мотивированных ребят. Мы вместе решали задачи допоздна, устраивали баттлы решений. Суммарно набрала 292 балла по трем предметам и прошла на бюджет!",
    year: "Выпуск 2024"
  }
];

export const aboutFeatures = [
  {
    icon: "ShieldCheck",
    title: "Лицензия и официальная гарантия",
    desc: "Имеем государственную лицензию на образовательную деятельность. Фиксируем гарантию поступления в договоре."
  },
  {
    icon: "Users",
    title: "Мини-группы до 8 человек",
    desc: "Каждый ученик получает внимание преподавателя. Индивидуальный контроль динамики успеваемости."
  },
  {
    icon: "MonitorPlay",
    title: "Современные аудитории & IT-хаб",
    desc: "Мощные рабочие станции для программирования, интерактивные доски, зоны отдыха и кофе-брейков."
  },
  {
    icon: "FileCheck",
    title: "Еженедельные срезы знаний",
    desc: "Регулярные пробные экзамены с таймингом реального тестирования и подробный отчет родителям в личном кабинете."
  }
];
