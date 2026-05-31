"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type QuestionType = "blank" | "choice";
type Difficulty = "基础" | "进阶";

interface ChineseQuestion {
  id: number;
  type: QuestionType;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  spokenPrompt?: string;
  answer: string;
  options?: string[];
  explanation: string;
}

interface QuizStats {
  total: number;
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
}

const STATS_KEY = "classic-games-generator:chinese-quiz:stats";
const DEFAULT_STATS: QuizStats = { total: 0, correct: 0, wrong: 0, streak: 0, bestStreak: 0 };

const QUESTIONS: ChineseQuestion[] = [
  {
    id: 1,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "《静夜思》的作者是____。",
    spokenPrompt: "填空题。《静夜思》的作者是谁？",
    answer: "李白",
    explanation: "《静夜思》是唐代诗人李白的代表作之一。",
  },
  {
    id: 2,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“春眠不觉晓，处处闻啼鸟”出自孟浩然的《____》。",
    spokenPrompt: "填空题。春眠不觉晓，处处闻啼鸟，出自孟浩然的哪首诗？",
    answer: "春晓",
    explanation: "《春晓》是唐代诗人孟浩然的五言绝句。",
  },
  {
    id: 3,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“欲穷千里目，更上一层楼”的作者是谁？",
    answer: "王之涣",
    options: ["王之涣", "王维", "杜甫", "白居易"],
    explanation: "这两句出自王之涣的《登鹳雀楼》。",
  },
  {
    id: 4,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“两个黄鹂鸣翠柳，一行白鹭上青天”出自哪位诗人？",
    answer: "杜甫",
    options: ["杜甫", "李白", "杜牧", "刘禹锡"],
    explanation: "这两句出自杜甫的《绝句》。",
  },
  {
    id: 5,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“飞流直下三千尺，疑是银河落九天”描写的是____。",
    spokenPrompt: "填空题。飞流直下三千尺，疑是银河落九天，描写的是什么？",
    answer: "庐山瀑布",
    explanation: "这两句出自李白的《望庐山瀑布》。",
  },
  {
    id: 6,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“停车坐爱枫林晚，霜叶红于二月花”的作者是谁？",
    answer: "杜牧",
    options: ["杜牧", "杜甫", "李商隐", "王安石"],
    explanation: "这两句出自杜牧的《山行》。",
  },
  {
    id: 7,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“少小离家老大回，乡音无改鬓毛衰”出自贺知章的《____》。",
    spokenPrompt: "填空题。少小离家老大回，乡音无改鬓毛衰，出自贺知章的哪首诗？",
    answer: "回乡偶书",
    explanation: "《回乡偶书》表达了久别归乡的感慨。",
  },
  {
    id: 8,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“诗中有画，画中有诗”常用来评价哪位诗人？",
    answer: "王维",
    options: ["王维", "李白", "白居易", "苏轼"],
    explanation: "王维擅长山水田园诗，也精通绘画。",
  },
  {
    id: 9,
    type: "blank",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《草船借箭》选自古典名著《____》。",
    spokenPrompt: "填空题。《草船借箭》选自哪一部古典名著？",
    answer: "三国演义",
    explanation: "《三国演义》是罗贯中的长篇历史演义小说。",
  },
  {
    id: 10,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《西游记》的作者一般认为是谁？",
    answer: "吴承恩",
    options: ["吴承恩", "施耐庵", "罗贯中", "曹雪芹"],
    explanation: "《西游记》是中国古典四大名著之一，作者一般认为是吴承恩。",
  },
  {
    id: 11,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《水浒传》的作者一般认为是谁？",
    answer: "施耐庵",
    options: ["施耐庵", "罗贯中", "吴承恩", "蒲松龄"],
    explanation: "《水浒传》是以梁山好汉故事为主线的长篇小说。",
  },
  {
    id: 12,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《红楼梦》的前八十回作者一般认为是谁？",
    answer: "曹雪芹",
    options: ["曹雪芹", "高鹗", "吴敬梓", "纪昀"],
    explanation: "《红楼梦》是中国古典小说的高峰之一。",
  },
  {
    id: 13,
    type: "blank",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "鲁迅原名____。",
    spokenPrompt: "填空题。鲁迅的原名是什么？",
    answer: "周树人",
    explanation: "鲁迅，原名周树人，是现代文学的重要作家。",
  },
  {
    id: 14,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《骆驼祥子》的作者是谁？",
    answer: "老舍",
    options: ["老舍", "巴金", "茅盾", "沈从文"],
    explanation: "《骆驼祥子》是老舍的长篇小说。",
  },
  {
    id: 15,
    type: "blank",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《聊斋志异》的作者是____。",
    spokenPrompt: "填空题。《聊斋志异》的作者是谁？",
    answer: "蒲松龄",
    explanation: "《聊斋志异》是清代蒲松龄创作的文言短篇小说集。",
  },
  {
    id: 16,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《儒林外史》的作者是谁？",
    answer: "吴敬梓",
    options: ["吴敬梓", "蒲松龄", "曹雪芹", "刘鹗"],
    explanation: "《儒林外史》是清代讽刺小说。",
  },
  {
    id: 17,
    type: "choice",
    category: "朝代",
    difficulty: "基础",
    prompt: "李白和杜甫生活在哪个朝代？",
    answer: "唐代",
    options: ["唐代", "宋代", "元代", "明代"],
    explanation: "李白和杜甫都是唐代诗人。",
  },
  {
    id: 18,
    type: "blank",
    category: "朝代",
    difficulty: "基础",
    prompt: "苏轼是____代文学家。",
    spokenPrompt: "填空题。苏轼是哪一个朝代的文学家？",
    answer: "宋代",
    explanation: "苏轼是北宋文学家、书画家。",
  },
  {
    id: 19,
    type: "choice",
    category: "朝代",
    difficulty: "基础",
    prompt: "《论语》主要记录了谁及其弟子的言行？",
    answer: "孔子",
    options: ["孔子", "孟子", "老子", "庄子"],
    explanation: "《论语》是儒家经典，主要记录孔子及其弟子的言行。",
  },
  {
    id: 20,
    type: "choice",
    category: "朝代",
    difficulty: "进阶",
    prompt: "“唐宋八大家”中，唐代的两位是谁？",
    answer: "韩愈和柳宗元",
    options: ["韩愈和柳宗元", "欧阳修和苏轼", "王安石和曾巩", "苏洵和苏辙"],
    explanation: "唐宋八大家中唐代为韩愈、柳宗元，其余六位是宋代作家。",
  },
  {
    id: 21,
    type: "blank",
    category: "文学常识",
    difficulty: "基础",
    prompt: "我国古典四大名著是《三国演义》《水浒传》《西游记》和《____》。",
    spokenPrompt: "填空题。我国古典四大名著是《三国演义》《水浒传》《西游记》和哪一部？",
    answer: "红楼梦",
    explanation: "四大名著通常指这四部长篇小说。",
  },
  {
    id: 22,
    type: "choice",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“初唐四杰”不包括下面哪一位？",
    answer: "李白",
    options: ["李白", "王勃", "杨炯", "骆宾王"],
    explanation: "初唐四杰是王勃、杨炯、卢照邻、骆宾王。",
  },
  {
    id: 23,
    type: "blank",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“文房四宝”指笔、墨、纸、____。",
    spokenPrompt: "填空题。文房四宝指笔、墨、纸和什么？",
    answer: "砚",
    explanation: "文房四宝是传统书写工具：笔、墨、纸、砚。",
  },
  {
    id: 24,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "《诗经》中的“风、雅、颂”指的是什么？",
    answer: "内容类别",
    options: ["内容类别", "写作手法", "作者姓名", "朝代顺序"],
    explanation: "“风、雅、颂”是《诗经》的内容分类，“赋、比、兴”是表现手法。",
  },
  {
    id: 25,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "《史记》的作者是谁？",
    answer: "司马迁",
    options: ["司马迁", "司马光", "班固", "陈寿"],
    explanation: "《史记》是西汉史学家司马迁撰写的纪传体通史。",
  },
  {
    id: 26,
    type: "blank",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "《资治通鉴》的主持编纂者是____。",
    spokenPrompt: "填空题。《资治通鉴》的主持编纂者是谁？",
    answer: "司马光",
    explanation: "《资治通鉴》是北宋司马光主持编纂的编年体史书。",
  },
  {
    id: 27,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "成语“负荆请罪”主要和哪两个人有关？",
    answer: "廉颇和蔺相如",
    options: ["廉颇和蔺相如", "项羽和刘邦", "诸葛亮和周瑜", "伯牙和钟子期"],
    explanation: "“负荆请罪”表现廉颇向蔺相如认错的故事。",
  },
  {
    id: 28,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“闻鸡起舞”这个典故主要和谁有关？",
    answer: "祖逖",
    options: ["祖逖", "岳飞", "文天祥", "韩信"],
    explanation: "祖逖和刘琨闻鸡起舞，常用来形容有志之士勤奋自励。",
  },
  {
    id: 29,
    type: "blank",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“完璧归赵”中的“赵”指的是____国。",
    spokenPrompt: "填空题。完璧归赵中的赵，指的是哪一个国家？",
    answer: "赵国",
    explanation: "这个典故与蔺相如把和氏璧完整带回赵国有关。",
  },
  {
    id: 30,
    type: "choice",
    category: "成语典故",
    difficulty: "进阶",
    prompt: "“纸上谈兵”常用来批评哪类人？",
    answer: "只会空谈、缺少实践的人",
    options: ["只会空谈、缺少实践的人", "勤学苦练的人", "善于变通的人", "舍己为人的人"],
    explanation: "“纸上谈兵”与赵括有关，比喻空谈理论，不能解决实际问题。",
  },
  {
    id: 31,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "农历五月初五是哪个传统节日？",
    answer: "端午节",
    options: ["端午节", "中秋节", "重阳节", "元宵节"],
    explanation: "端午节有吃粽子、赛龙舟等习俗。",
  },
  {
    id: 32,
    type: "blank",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“但愿人长久，千里共婵娟”常和____节联系在一起。",
    spokenPrompt: "填空题。但愿人长久，千里共婵娟，常和哪个传统节日联系在一起？",
    answer: "中秋节",
    explanation: "这句词出自苏轼《水调歌头》，常用于中秋团圆主题。",
  },
  {
    id: 33,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“岁寒三友”指的是哪三种植物？",
    answer: "松、竹、梅",
    options: ["松、竹、梅", "梅、兰、竹", "菊、竹、梅", "松、柏、柳"],
    explanation: "松、竹、梅在寒冬仍有风骨，合称岁寒三友。",
  },
  {
    id: 34,
    type: "choice",
    category: "文化常识",
    difficulty: "进阶",
    prompt: "“四君子”通常指哪四种植物？",
    answer: "梅、兰、竹、菊",
    options: ["梅、兰、竹、菊", "松、竹、梅、菊", "桃、李、杏、梅", "荷、菊、兰、柳"],
    explanation: "梅、兰、竹、菊因象征高洁品格，被称为花中四君子。",
  },
  {
    id: 35,
    type: "blank",
    category: "文言",
    difficulty: "基础",
    prompt: "“吾日三省吾身”中的“三省”意思是____。",
    spokenPrompt: "填空题。吾日三省吾身中的三省，大致是什么意思？",
    answer: "多次反省",
    explanation: "“三”在这里可理解为多次，“省”是反省、检查。",
  },
  {
    id: 36,
    type: "choice",
    category: "文言",
    difficulty: "基础",
    prompt: "“学而时习之，不亦说乎”中的“说”读音和意思更接近哪一项？",
    answer: "yuè，愉快",
    options: ["yuè，愉快", "shuō，说话", "shuì，劝说", "tuō，脱离"],
    explanation: "这里的“说”通“悦”，表示高兴、愉快。",
  },
  {
    id: 37,
    type: "choice",
    category: "文言",
    difficulty: "进阶",
    prompt: "“温故而知新”中的“故”是什么意思？",
    answer: "旧的知识",
    options: ["旧的知识", "故乡", "原因", "故意"],
    explanation: "“温故而知新”意思是温习旧知识，从而获得新的理解。",
  },
  {
    id: 38,
    type: "blank",
    category: "文言",
    difficulty: "进阶",
    prompt: "《岳阳楼记》中“先天下之忧而忧，____”的后半句是“后天下之乐而乐”。",
    spokenPrompt: "填空题。岳阳楼记中，先天下之忧而忧，后半句是什么？",
    answer: "后天下之乐而乐",
    explanation: "这是范仲淹《岳阳楼记》中的名句。",
  },
  {
    id: 39,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“白发三千丈”主要使用了哪种修辞手法？",
    answer: "夸张",
    options: ["夸张", "比喻", "拟人", "排比"],
    explanation: "“白发三千丈”用极度夸大的说法表达愁绪。",
  },
  {
    id: 40,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“忽如一夜春风来，千树万树梨花开”把雪比作什么？",
    answer: "梨花",
    options: ["梨花", "桃花", "柳絮", "白云"],
    explanation: "这两句以梨花比雪，形象写出雪景之美。",
  },
];

const TYPE_LABELS: Record<QuestionType, string> = {
  blank: "填空题",
  choice: "选择题",
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function speakText(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function getQuestionSpeech(question: ChineseQuestion): string {
  const base = question.spokenPrompt ?? `${TYPE_LABELS[question.type]}。${question.prompt.replaceAll("____", "空白处")}`;
  if (question.type !== "choice" || !question.options?.length) return base;

  const options = question.options
    .map((option, index) => `${String.fromCharCode(65 + index)}，${option}`)
    .join("。");
  return `${base}。选项是：${options}。`;
}

export default function ChineseQuizGame() {
  const [enabledTypes, setEnabledTypes] = useState<QuestionType[]>(["blank", "choice"]);
  const [category, setCategory] = useState("全部");
  const [difficulty, setDifficulty] = useState<"全部" | Difficulty>("全部");
  const [question, setQuestion] = useState<ChineseQuestion>(() => QUESTIONS[0]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [stats, setStats] = useState<QuizStats>(DEFAULT_STATS);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const spokenQuestionIdRef = useRef<number | null>(null);

  const categories = useMemo(() => ["全部", ...Array.from(new Set(QUESTIONS.map(item => item.category)))], []);

  const filteredQuestions = useMemo(() => {
    const result = QUESTIONS.filter(item => {
      const typeMatched = enabledTypes.includes(item.type);
      const categoryMatched = category === "全部" || item.category === category;
      const difficultyMatched = difficulty === "全部" || item.difficulty === difficulty;
      return typeMatched && categoryMatched && difficultyMatched;
    });
    return result.length > 0 ? result : QUESTIONS;
  }, [category, difficulty, enabledTypes]);

  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      if (raw) setStats({ ...DEFAULT_STATS, ...JSON.parse(raw) });
    } catch {
      setStats(DEFAULT_STATS);
    }
  }, []);

  useEffect(() => {
    if (!filteredQuestions.some(item => item.id === question.id)) {
      const next = shuffle(filteredQuestions)[0];
      setQuestion(next);
      setShowAnswer(false);
      setLastResult(null);
    }
  }, [filteredQuestions, question.id]);

  useEffect(() => {
    if (!autoSpeak || spokenQuestionIdRef.current === question.id) return;
    spokenQuestionIdRef.current = question.id;
    window.setTimeout(() => speakText(getQuestionSpeech(question), true), 250);
  }, [autoSpeak, question]);

  const saveStats = (next: QuizStats) => {
    setStats(next);
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {
      // localStorage can be unavailable in private browsing.
    }
  };

  const chooseNextQuestion = () => {
    const pool = filteredQuestions.length > 1
      ? filteredQuestions.filter(item => item.id !== question.id)
      : filteredQuestions;
    const next = shuffle(pool)[0];
    setQuestion(next);
    setShowAnswer(false);
    setLastResult(null);
    spokenQuestionIdRef.current = null;
  };

  const toggleQuestionType = (type: QuestionType) => {
    setEnabledTypes(prev => {
      if (prev.includes(type)) {
        return prev.length === 1 ? prev : prev.filter(item => item !== type);
      }
      return [...prev, type];
    });
    setShowAnswer(false);
    setLastResult(null);
    spokenQuestionIdRef.current = null;
  };

  const markResult = (result: "correct" | "wrong") => {
    const isCorrect = result === "correct";
    const nextStats: QuizStats = {
      total: stats.total + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      wrong: stats.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? stats.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
    };
    saveStats(nextStats);
    setLastResult(result);
  };

  const resetStats = () => {
    saveStats(DEFAULT_STATS);
    setLastResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <section className="mb-5 sm:mb-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-300 via-red-300 to-sky-300" />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-4xl mb-2">📚</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">文常问答</h2>
                <p className="text-slate-400 text-sm mt-1">
                  语音报题，家庭口答，点按钮揭晓答案。
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-[240px]">
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500">题库</p>
                  <p className="text-xl font-bold text-white mt-1">{filteredQuestions.length}</p>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500">正确率</p>
                  <p className="text-xl font-bold text-white mt-1">{accuracy}%</p>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-center">
                  <p className="text-xs text-slate-500">连对</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.streak}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-semibold">题目设置</h3>
                <p className="text-xs text-slate-400 mt-1">支持填空题和选择题，可按类别筛题。</p>
              </div>
              <button
                onClick={() => setAutoSpeak(prev => !prev)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  autoSpeak ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                }`}
              >
                {autoSpeak ? "自动朗读开" : "自动朗读关"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">题型</p>
                <div className="flex flex-wrap gap-2">
                  {(["blank", "choice"] as QuestionType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => toggleQuestionType(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        enabledTypes.includes(type)
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">类别</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setCategory(item);
                        setShowAnswer(false);
                        setLastResult(null);
                        spokenQuestionIdRef.current = null;
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        category === item
                          ? "bg-sky-500 text-slate-950"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">难度</p>
                <div className="flex flex-wrap gap-2">
                  {(["全部", "基础", "进阶"] as const).map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setDifficulty(item);
                        setShowAnswer(false);
                        setLastResult(null);
                        spokenQuestionIdRef.current = null;
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        difficulty === item
                          ? "bg-red-400 text-slate-950"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold">
                {TYPE_LABELS[question.type]}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold">
                {question.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold">
                {question.difficulty}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 mb-4">
              <p className="text-lg sm:text-xl leading-relaxed text-white font-semibold">
                {question.prompt}
              </p>

              {question.type === "choice" && question.options && (
                <div className="grid gap-2 sm:grid-cols-2 mt-5">
                  {question.options.map((option, index) => (
                    <div
                      key={option}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        showAnswer && option === question.answer
                          ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-100"
                          : "border-slate-700 bg-slate-800 text-slate-300"
                      }`}
                    >
                      <span className="font-bold text-slate-500 mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => speakText(getQuestionSpeech(question), true)}
                className="py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm"
              >
                朗读题目
              </button>
              <button
                onClick={() => setShowAnswer(true)}
                className="py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm"
              >
                显示答案
              </button>
              <button
                onClick={chooseNextQuestion}
                className="py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm"
              >
                下一题
              </button>
              <button
                onClick={() => window.speechSynthesis?.cancel()}
                className="py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm"
              >
                停止朗读
              </button>
            </div>

            {showAnswer && (
              <div className="rounded-2xl border border-emerald-400/50 bg-emerald-500/15 p-4 mb-4">
                <p className="text-xs text-emerald-200 mb-1">参考答案</p>
                <p className="text-2xl font-bold text-white">{question.answer}</p>
                <p className="text-sm text-emerald-100/80 mt-2">{question.explanation}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => markResult("correct")}
                className={`py-3 rounded-xl font-bold text-sm ${
                  lastResult === "correct"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                答对了
              </button>
              <button
                onClick={() => markResult("wrong")}
                className={`py-3 rounded-xl font-bold text-sm ${
                  lastResult === "wrong"
                    ? "bg-red-300 text-slate-950"
                    : "bg-red-700 hover:bg-red-600 text-white"
                }`}
              >
                没答对
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">成绩统计</h3>
              <button
                onClick={resetStats}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium"
              >
                重置
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">答题数</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">正确率</p>
                <p className="text-2xl font-bold text-white mt-1">{accuracy}%</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">答对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.correct}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">没答对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.wrong}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">当前连对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.streak}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">最佳连对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.bestStreak}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <h3 className="text-white font-semibold mb-3">家庭玩法</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>1. 点击“朗读题目”，全家一起听题。</p>
              <p>2. 先让孩子口答，必要时家长补充。</p>
              <p>3. 点“显示答案”核对，不需要键盘输入。</p>
              <p>4. 用“答对了 / 没答对”记录这一轮成绩。</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <h3 className="text-white font-semibold mb-3">题库范围</h3>
            <div className="flex flex-wrap gap-2">
              {categories.filter(item => item !== "全部").map(item => (
                <span key={item} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
