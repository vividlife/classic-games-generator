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
    prompt: "《岳阳楼记》中“先天下之忧而忧，____”。",
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
  {
    id: 41,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "《咏鹅》的作者是谁？",
    answer: "骆宾王",
    options: ["骆宾王", "王勃", "杨炯", "卢照邻"],
    explanation: "《咏鹅》相传是骆宾王七岁时所作。",
  },
  {
    id: 42,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“孤舟蓑笠翁，独钓寒江雪”出自柳宗元的《____》。",
    spokenPrompt: "填空题。孤舟蓑笠翁，独钓寒江雪，出自柳宗元的哪首诗？",
    answer: "江雪",
    explanation: "《江雪》是柳宗元的五言绝句。",
  },
  {
    id: 43,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“朝辞白帝彩云间，千里江陵一日还”出自哪首诗？",
    answer: "早发白帝城",
    options: ["早发白帝城", "望庐山瀑布", "赠汪伦", "夜宿山寺"],
    explanation: "这两句出自李白的《早发白帝城》。",
  },
  {
    id: 44,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“欲把西湖比西子，淡妆浓抹总相宜”的作者是谁？",
    answer: "苏轼",
    options: ["苏轼", "王安石", "陆游", "辛弃疾"],
    explanation: "这两句出自苏轼的《饮湖上初晴后雨》。",
  },
  {
    id: 45,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“不识庐山真面目，只缘身在此山中”出自《____》。",
    spokenPrompt: "填空题。不识庐山真面目，只缘身在此山中，出自哪首诗？",
    answer: "题西林壁",
    explanation: "《题西林壁》是苏轼游庐山时所作。",
  },
  {
    id: 46,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“海内存知己，天涯若比邻”的作者是谁？",
    answer: "王勃",
    options: ["王勃", "王维", "王昌龄", "孟浩然"],
    explanation: "这两句出自王勃的《送杜少府之任蜀州》。",
  },
  {
    id: 47,
    type: "blank",
    category: "诗词",
    difficulty: "基础",
    prompt: "“谁言寸草心，报得三春晖”出自孟郊的《____》。",
    spokenPrompt: "填空题。谁言寸草心，报得三春晖，出自孟郊的哪首诗？",
    answer: "游子吟",
    explanation: "《游子吟》是歌颂母爱的名篇。",
  },
  {
    id: 48,
    type: "choice",
    category: "诗词",
    difficulty: "基础",
    prompt: "“劝君更尽一杯酒，西出阳关无故人”的作者是谁？",
    answer: "王维",
    options: ["王维", "李白", "高适", "岑参"],
    explanation: "这两句出自王维的《送元二使安西》。",
  },
  {
    id: 49,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“沉舟侧畔千帆过，病树前头万木春”的作者是谁？",
    answer: "刘禹锡",
    options: ["刘禹锡", "白居易", "韩愈", "柳宗元"],
    explanation: "这两句出自刘禹锡的《酬乐天扬州初逢席上见赠》。",
  },
  {
    id: 50,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“商女不知亡国恨，隔江犹唱后庭花”出自哪首诗？",
    answer: "泊秦淮",
    options: ["泊秦淮", "赤壁", "山行", "江南春"],
    explanation: "这两句出自杜牧的《泊秦淮》。",
  },
  {
    id: 51,
    type: "blank",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“人生自古谁无死，留取丹心照汗青”的作者是____。",
    spokenPrompt: "填空题。人生自古谁无死，留取丹心照汗青，作者是谁？",
    answer: "文天祥",
    explanation: "这两句出自文天祥的《过零丁洋》。",
  },
  {
    id: 52,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“问渠那得清如许？为有源头活水来”的作者是谁？",
    answer: "朱熹",
    options: ["朱熹", "陆游", "杨万里", "范成大"],
    explanation: "这两句出自朱熹的《观书有感》。",
  },
  {
    id: 53,
    type: "blank",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“会当凌绝顶，一览众山小”出自杜甫的《____》。",
    spokenPrompt: "填空题。会当凌绝顶，一览众山小，出自杜甫的哪首诗？",
    answer: "望岳",
    explanation: "《望岳》表现了诗人登临泰山的壮志。",
  },
  {
    id: 54,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“山重水复疑无路，柳暗花明又一村”的作者是谁？",
    answer: "陆游",
    options: ["陆游", "苏轼", "辛弃疾", "杨万里"],
    explanation: "这两句出自陆游的《游山西村》。",
  },
  {
    id: 55,
    type: "choice",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“采菊东篱下，悠然见南山”的作者是谁？",
    answer: "陶渊明",
    options: ["陶渊明", "谢灵运", "王维", "孟浩然"],
    explanation: "这两句出自陶渊明的《饮酒》。",
  },
  {
    id: 56,
    type: "blank",
    category: "诗词",
    difficulty: "进阶",
    prompt: "“大漠孤烟直，长河落日圆”出自王维的《____》。",
    spokenPrompt: "填空题。大漠孤烟直，长河落日圆，出自王维的哪首诗？",
    answer: "使至塞上",
    explanation: "这两句是边塞景象描写的名句。",
  },
  {
    id: 57,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《卖火柴的小女孩》的作者是谁？",
    answer: "安徒生",
    options: ["安徒生", "格林兄弟", "伊索", "笛福"],
    explanation: "《卖火柴的小女孩》是丹麦作家安徒生的童话。",
  },
  {
    id: 58,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《皇帝的新装》的作者是谁？",
    answer: "安徒生",
    options: ["安徒生", "列夫·托尔斯泰", "高尔基", "契诃夫"],
    explanation: "《皇帝的新装》是安徒生童话中的名篇。",
  },
  {
    id: 59,
    type: "blank",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《少年闰土》选自鲁迅的小说集《____》。",
    spokenPrompt: "填空题。《少年闰土》选自鲁迅的哪部小说集？",
    answer: "呐喊",
    explanation: "《少年闰土》节选自鲁迅小说《故乡》，收在《呐喊》中。",
  },
  {
    id: 60,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《背影》的作者是谁？",
    answer: "朱自清",
    options: ["朱自清", "鲁迅", "老舍", "冰心"],
    explanation: "《背影》是朱自清的散文名篇。",
  },
  {
    id: 61,
    type: "choice",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《繁星》《春水》的作者是谁？",
    answer: "冰心",
    options: ["冰心", "萧红", "丁玲", "林海音"],
    explanation: "《繁星》《春水》是冰心的小诗集。",
  },
  {
    id: 62,
    type: "blank",
    category: "作者作品",
    difficulty: "基础",
    prompt: "《海底两万里》的作者是____。",
    spokenPrompt: "填空题。《海底两万里》的作者是谁？",
    answer: "凡尔纳",
    explanation: "儒勒·凡尔纳被称为科幻小说的重要奠基人之一。",
  },
  {
    id: 63,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《朝花夕拾》属于哪一类作品集？",
    answer: "散文集",
    options: ["散文集", "小说集", "诗集", "戏剧集"],
    explanation: "《朝花夕拾》是鲁迅的回忆性散文集。",
  },
  {
    id: 64,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《家》《春》《秋》合称什么？",
    answer: "激流三部曲",
    options: ["激流三部曲", "爱情三部曲", "农村三部曲", "蚀三部曲"],
    explanation: "巴金的《家》《春》《秋》合称“激流三部曲”。",
  },
  {
    id: 65,
    type: "blank",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《边城》的作者是____。",
    spokenPrompt: "填空题。《边城》的作者是谁？",
    answer: "沈从文",
    explanation: "《边城》是沈从文的代表作。",
  },
  {
    id: 66,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《子夜》的作者是谁？",
    answer: "茅盾",
    options: ["茅盾", "巴金", "老舍", "叶圣陶"],
    explanation: "《子夜》是茅盾的长篇小说。",
  },
  {
    id: 67,
    type: "blank",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《茶馆》的作者是____。",
    spokenPrompt: "填空题。《茶馆》的作者是谁？",
    answer: "老舍",
    explanation: "《茶馆》是老舍的话剧代表作。",
  },
  {
    id: 68,
    type: "choice",
    category: "作者作品",
    difficulty: "进阶",
    prompt: "《荷塘月色》的作者是谁？",
    answer: "朱自清",
    options: ["朱自清", "郁达夫", "徐志摩", "梁实秋"],
    explanation: "《荷塘月色》是朱自清的散文名篇。",
  },
  {
    id: 69,
    type: "choice",
    category: "朝代",
    difficulty: "基础",
    prompt: "陶渊明生活在哪个时期？",
    answer: "东晋",
    options: ["东晋", "唐代", "宋代", "元代"],
    explanation: "陶渊明是东晋诗人，以田园诗著称。",
  },
  {
    id: 70,
    type: "blank",
    category: "朝代",
    difficulty: "基础",
    prompt: "范仲淹是____代文学家、政治家。",
    spokenPrompt: "填空题。范仲淹是哪一个朝代的文学家、政治家？",
    answer: "宋代",
    explanation: "范仲淹是北宋文学家、政治家。",
  },
  {
    id: 71,
    type: "choice",
    category: "朝代",
    difficulty: "基础",
    prompt: "关汉卿是哪个朝代的杂剧作家？",
    answer: "元代",
    options: ["元代", "唐代", "宋代", "明代"],
    explanation: "关汉卿是元曲四大家之一。",
  },
  {
    id: 72,
    type: "choice",
    category: "朝代",
    difficulty: "基础",
    prompt: "曹操、曹丕、曹植常被称为什么？",
    answer: "三曹",
    options: ["三曹", "三苏", "三袁", "三班"],
    explanation: "曹操、曹丕、曹植在文学史上并称“三曹”。",
  },
  {
    id: 73,
    type: "blank",
    category: "朝代",
    difficulty: "进阶",
    prompt: "“建安七子”主要活动于____末年。",
    spokenPrompt: "填空题。建安七子主要活动于哪个朝代末年？",
    answer: "东汉",
    explanation: "建安文学形成于东汉末年至魏初。",
  },
  {
    id: 74,
    type: "choice",
    category: "朝代",
    difficulty: "进阶",
    prompt: "欧阳修、苏轼、王安石都属于哪个朝代？",
    answer: "宋代",
    options: ["宋代", "唐代", "明代", "清代"],
    explanation: "三人都属于宋代文学家，也都列入唐宋八大家。",
  },
  {
    id: 75,
    type: "choice",
    category: "朝代",
    difficulty: "进阶",
    prompt: "《木兰诗》通常被认为是哪一时期的北方民歌？",
    answer: "南北朝",
    options: ["南北朝", "先秦", "唐代", "宋代"],
    explanation: "《木兰诗》是南北朝时期北方乐府民歌代表作。",
  },
  {
    id: 76,
    type: "blank",
    category: "朝代",
    difficulty: "进阶",
    prompt: "《桃花源记》的作者陶渊明是____时期诗人。",
    spokenPrompt: "填空题。《桃花源记》的作者陶渊明是哪一时期诗人？",
    answer: "东晋",
    explanation: "陶渊明是东晋末至南朝宋初诗人。",
  },
  {
    id: 77,
    type: "choice",
    category: "文学常识",
    difficulty: "基础",
    prompt: "我国第一部诗歌总集是哪一部？",
    answer: "诗经",
    options: ["诗经", "楚辞", "乐府诗集", "古诗十九首"],
    explanation: "《诗经》是我国最早的一部诗歌总集。",
  },
  {
    id: 78,
    type: "choice",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“乐府双璧”通常指《木兰诗》和哪一篇？",
    answer: "孔雀东南飞",
    options: ["孔雀东南飞", "长恨歌", "琵琶行", "陌上桑"],
    explanation: "《木兰诗》和《孔雀东南飞》并称“乐府双璧”。",
  },
  {
    id: 79,
    type: "blank",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“三苏”指苏洵、苏轼和____。",
    spokenPrompt: "填空题。三苏指苏洵、苏轼和谁？",
    answer: "苏辙",
    explanation: "三苏是北宋文学家苏洵、苏轼、苏辙父子三人。",
  },
  {
    id: 80,
    type: "choice",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“唐宋八大家”中姓苏的有几位？",
    answer: "三位",
    options: ["三位", "两位", "四位", "一位"],
    explanation: "唐宋八大家中有苏洵、苏轼、苏辙三人。",
  },
  {
    id: 81,
    type: "choice",
    category: "文学常识",
    difficulty: "基础",
    prompt: "《楚辞》的代表作家是谁？",
    answer: "屈原",
    options: ["屈原", "孔子", "孟子", "司马迁"],
    explanation: "屈原是《楚辞》的代表作家，《离骚》是其代表作。",
  },
  {
    id: 82,
    type: "blank",
    category: "文学常识",
    difficulty: "基础",
    prompt: "“四书”指《大学》《中庸》《论语》和《____》。",
    spokenPrompt: "填空题。四书指《大学》《中庸》《论语》和哪一部？",
    answer: "孟子",
    explanation: "四书是儒家经典的重要组成部分。",
  },
  {
    id: 83,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "“赋、比、兴”是《诗经》的什么？",
    answer: "表现手法",
    options: ["表现手法", "内容分类", "作者身份", "篇章顺序"],
    explanation: "《诗经》常说“六义”：风、雅、颂，赋、比、兴。",
  },
  {
    id: 84,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "我国第一部纪传体通史是哪一部？",
    answer: "史记",
    options: ["史记", "汉书", "资治通鉴", "左传"],
    explanation: "《史记》是司马迁撰写的纪传体通史。",
  },
  {
    id: 85,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "我国第一部编年体通史是哪一部？",
    answer: "资治通鉴",
    options: ["资治通鉴", "史记", "汉书", "三国志"],
    explanation: "《资治通鉴》是北宋司马光主持编纂的编年体通史。",
  },
  {
    id: 86,
    type: "blank",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "《汉书》的作者是____。",
    spokenPrompt: "填空题。《汉书》的作者是谁？",
    answer: "班固",
    explanation: "《汉书》是东汉班固撰写的纪传体断代史。",
  },
  {
    id: 87,
    type: "blank",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "《三国志》的作者是____。",
    spokenPrompt: "填空题。《三国志》的作者是谁？",
    answer: "陈寿",
    explanation: "《三国志》是西晋史学家陈寿撰写的纪传体史书。",
  },
  {
    id: 88,
    type: "choice",
    category: "文学常识",
    difficulty: "进阶",
    prompt: "“元曲四大家”不包括下面哪一位？",
    answer: "汤显祖",
    options: ["汤显祖", "关汉卿", "白朴", "马致远"],
    explanation: "元曲四大家通常指关汉卿、白朴、马致远、郑光祖。",
  },
  {
    id: 89,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“卧薪尝胆”主要和谁有关？",
    answer: "勾践",
    options: ["勾践", "夫差", "项羽", "刘邦"],
    explanation: "越王勾践卧薪尝胆，最终复国。",
  },
  {
    id: 90,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“破釜沉舟”主要和谁有关？",
    answer: "项羽",
    options: ["项羽", "刘邦", "韩信", "岳飞"],
    explanation: "项羽破釜沉舟，表示决一死战。",
  },
  {
    id: 91,
    type: "blank",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“凿壁偷光”讲的是____勤学的故事。",
    spokenPrompt: "填空题。凿壁偷光讲的是谁勤学的故事？",
    answer: "匡衡",
    explanation: "匡衡凿壁借光读书，常用来形容勤学苦读。",
  },
  {
    id: 92,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“程门立雪”主要体现什么品质？",
    answer: "尊师重道",
    options: ["尊师重道", "骄傲自满", "临危不惧", "舍生取义"],
    explanation: "“程门立雪”讲杨时拜见程颐，体现尊师重道。",
  },
  {
    id: 93,
    type: "choice",
    category: "成语典故",
    difficulty: "基础",
    prompt: "“四面楚歌”主要和谁有关？",
    answer: "项羽",
    options: ["项羽", "曹操", "诸葛亮", "赵括"],
    explanation: "“四面楚歌”出自楚汉相争，形容陷入孤立无援的处境。",
  },
  {
    id: 94,
    type: "choice",
    category: "成语典故",
    difficulty: "进阶",
    prompt: "“高山流水”常用来比喻什么？",
    answer: "知音难得",
    options: ["知音难得", "山水秀丽", "文章华美", "战争激烈"],
    explanation: "“高山流水”与伯牙、钟子期的知音故事有关。",
  },
  {
    id: 95,
    type: "blank",
    category: "成语典故",
    difficulty: "进阶",
    prompt: "“三顾茅庐”中的“茅庐”是指____的住处。",
    spokenPrompt: "填空题。三顾茅庐中的茅庐，是指谁的住处？",
    answer: "诸葛亮",
    explanation: "刘备三次拜访诸葛亮，请他出山辅佐。",
  },
  {
    id: 96,
    type: "choice",
    category: "成语典故",
    difficulty: "进阶",
    prompt: "“东山再起”最早常和哪位历史人物有关？",
    answer: "谢安",
    options: ["谢安", "曹操", "李白", "苏轼"],
    explanation: "谢安曾隐居东山，后来重新出仕，故有“东山再起”。",
  },
  {
    id: 97,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "农历正月十五是哪个传统节日？",
    answer: "元宵节",
    options: ["元宵节", "端午节", "中秋节", "重阳节"],
    explanation: "元宵节有赏花灯、吃元宵等习俗。",
  },
  {
    id: 98,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "农历九月初九是哪个传统节日？",
    answer: "重阳节",
    options: ["重阳节", "中秋节", "七夕节", "清明节"],
    explanation: "重阳节有登高、赏菊等习俗。",
  },
  {
    id: 99,
    type: "blank",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“爆竹声中一岁除，春风送暖入屠苏”描写的是____节。",
    spokenPrompt: "填空题。爆竹声中一岁除，春风送暖入屠苏，描写的是哪个节日？",
    answer: "春节",
    explanation: "这两句出自王安石的《元日》，描写春节景象。",
  },
  {
    id: 100,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“清明时节雨纷纷，路上行人欲断魂”的作者是谁？",
    answer: "杜牧",
    options: ["杜牧", "杜甫", "白居易", "李商隐"],
    explanation: "这两句出自杜牧的《清明》。",
  },
  {
    id: 101,
    type: "choice",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“琴棋书画”中的“棋”通常指哪种棋？",
    answer: "围棋",
    options: ["围棋", "象棋", "五子棋", "跳棋"],
    explanation: "传统“琴棋书画”中的棋一般指围棋。",
  },
  {
    id: 102,
    type: "blank",
    category: "文化常识",
    difficulty: "基础",
    prompt: "“五谷”通常泛指各种____。",
    spokenPrompt: "填空题。五谷通常泛指各种什么？",
    answer: "粮食作物",
    explanation: "五谷常用来泛称粮食作物。",
  },
  {
    id: 103,
    type: "choice",
    category: "文化常识",
    difficulty: "进阶",
    prompt: "“花中四君子”中的“兰”通常象征什么品格？",
    answer: "高洁",
    options: ["高洁", "富贵", "鲁莽", "迟钝"],
    explanation: "兰花常被赋予清雅、高洁的象征意义。",
  },
  {
    id: 104,
    type: "choice",
    category: "文化常识",
    difficulty: "进阶",
    prompt: "“杏林”常用来代称什么行业？",
    answer: "医学界",
    options: ["医学界", "教育界", "戏曲界", "书法界"],
    explanation: "“杏林”源自董奉行医的传说，后代称医学界。",
  },
  {
    id: 105,
    type: "blank",
    category: "文言",
    difficulty: "基础",
    prompt: "“有朋自远方来，不亦乐乎”出自《____》。",
    spokenPrompt: "填空题。有朋自远方来，不亦乐乎，出自哪部经典？",
    answer: "论语",
    explanation: "这句话出自《论语·学而》。",
  },
  {
    id: 106,
    type: "choice",
    category: "文言",
    difficulty: "基础",
    prompt: "“己所不欲，勿施于人”出自哪部经典？",
    answer: "论语",
    options: ["论语", "孟子", "庄子", "韩非子"],
    explanation: "这句话体现儒家推己及人的思想。",
  },
  {
    id: 107,
    type: "choice",
    category: "文言",
    difficulty: "基础",
    prompt: "“人不知而不愠，不亦君子乎”中的“愠”是什么意思？",
    answer: "生气、恼怒",
    options: ["生气、恼怒", "快乐", "知道", "学习"],
    explanation: "“愠”在这里指怨恨、生气。",
  },
  {
    id: 108,
    type: "blank",
    category: "文言",
    difficulty: "基础",
    prompt: "“学而不思则罔，思而不学则____”。",
    spokenPrompt: "填空题。学而不思则罔，思而不学则什么？",
    answer: "殆",
    explanation: "这句话出自《论语》，强调学习和思考要结合。",
  },
  {
    id: 109,
    type: "choice",
    category: "文言",
    difficulty: "进阶",
    prompt: "“择其善者而从之”中的“从”是什么意思？",
    answer: "跟从、学习",
    options: ["跟从、学习", "从前", "纵容", "仆从"],
    explanation: "这里的“从”指采纳、学习。",
  },
  {
    id: 110,
    type: "choice",
    category: "文言",
    difficulty: "进阶",
    prompt: "“吾十有五而志于学”中的“有”通什么字？",
    answer: "又",
    options: ["又", "友", "右", "幼"],
    explanation: "“十有五”即十五，“有”通“又”。",
  },
  {
    id: 111,
    type: "blank",
    category: "文言",
    difficulty: "进阶",
    prompt: "“醉翁之意不在酒，在乎____之间也”。",
    spokenPrompt: "填空题。醉翁之意不在酒，在乎什么之间也？",
    answer: "山水",
    explanation: "这句话出自欧阳修的《醉翁亭记》。",
  },
  {
    id: 112,
    type: "choice",
    category: "文言",
    difficulty: "进阶",
    prompt: "“不以物喜，不以己悲”出自哪篇文章？",
    answer: "岳阳楼记",
    options: ["岳阳楼记", "醉翁亭记", "桃花源记", "出师表"],
    explanation: "这句话出自范仲淹的《岳阳楼记》。",
  },
  {
    id: 113,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“桃花潭水深千尺，不及汪伦送我情”主要用了哪种修辞？",
    answer: "夸张",
    options: ["夸张", "对偶", "反问", "排比"],
    explanation: "“深千尺”夸大水深，以突出友情深厚。",
  },
  {
    id: 114,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“危楼高百尺，手可摘星辰”主要用了哪种修辞？",
    answer: "夸张",
    options: ["夸张", "拟人", "设问", "借代"],
    explanation: "诗句夸大楼高，表现高楼直入云霄。",
  },
  {
    id: 115,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“感时花溅泪，恨别鸟惊心”主要使用了哪种修辞？",
    answer: "拟人",
    options: ["拟人", "反复", "设问", "排比"],
    explanation: "诗句把人的情感赋予花鸟，属于拟人。",
  },
  {
    id: 116,
    type: "choice",
    category: "修辞",
    difficulty: "进阶",
    prompt: "“忽如一夜春风来，千树万树梨花开”主要用了哪种修辞？",
    answer: "比喻",
    options: ["比喻", "设问", "借代", "反语"],
    explanation: "诗句把雪后的树枝比作盛开的梨花。",
  },
  {
    id: 117,
    type: "choice",
    category: "修辞",
    difficulty: "进阶",
    prompt: "“问君能有几多愁？恰似一江春水向东流”主要用了哪两种修辞？",
    answer: "设问和比喻",
    options: ["设问和比喻", "排比和反复", "借代和对偶", "反问和夸张"],
    explanation: "前句自问，后句用江水比愁绪。",
  },
  {
    id: 118,
    type: "choice",
    category: "修辞",
    difficulty: "进阶",
    prompt: "“朱门酒肉臭，路有冻死骨”主要运用了哪种表现手法？",
    answer: "对比",
    options: ["对比", "拟人", "设问", "反复"],
    explanation: "富贵人家的奢侈与穷人的悲惨形成鲜明对比。",
  },
  {
    id: 119,
    type: "blank",
    category: "修辞",
    difficulty: "进阶",
    prompt: "“黑发不知勤学早，白首方悔读书迟”在结构上使用了____。",
    spokenPrompt: "填空题。黑发不知勤学早，白首方悔读书迟，在结构上使用了什么？",
    answer: "对偶",
    explanation: "两句字数相等、结构相近，形成对偶。",
  },
  {
    id: 120,
    type: "choice",
    category: "修辞",
    difficulty: "基础",
    prompt: "“好雨知时节，当春乃发生”把雨写得像人一样，这是哪种修辞？",
    answer: "拟人",
    options: ["拟人", "比喻", "排比", "夸张"],
    explanation: "“知时节”赋予雨以人的特征。",
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
