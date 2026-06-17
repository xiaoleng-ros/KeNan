/**
 * 名侦探柯南角色数据
 * 数据来源：柯南百科（Conanpedia）https://www.conanpedia.com/名侦探柯南角色
 * 更新时间：2026-06-17
 *
 * 数据结构说明：
 * - factionGroups：阵营分组数组，包含 key（唯一标识）和 label（显示名称）
 * - characterData：角色数据数组，每个角色包含 id、所属分组、中文名、日文名、声优、简介
 */

// ==================== 阵营分组定义 ====================
// 严格对标柯南百科页面分组结构
const factionGroups = [
  { key: "main", label: "主要角色" },
  { key: "kudo_family", label: "工藤家" },
  { key: "kisaki_law", label: "妃法律事务所" },
  { key: "cafe_poirot", label: "波洛咖啡厅" },
  { key: "sushi_iroha", label: "伊吕波寿司店" },
  { key: "black_org", label: "黑衣组织" },
  { key: "fbi", label: "FBI（美国联邦调查局）" },
  { key: "cia", label: "CIA（美国中央情报局）" },
  { key: "mi6", label: "MI6（英国军事情报六局）" },
  { key: "tokyo_exec", label: "警视厅刑事部高层" },
  { key: "tokyo_s1", label: "警视厅刑事部搜查一课" },
  { key: "tokyo_s2", label: "警视厅刑事部搜查二课" },
  { key: "tokyo_s3", label: "警视厅刑事部搜查三课" },
  { key: "tokyo_forensic", label: "警视厅刑事部鉴识课" },
  { key: "tokyo_traffic", label: "警视厅交通部" },
  { key: "tokyo_security", label: "警视厅公安部" },
  { key: "national_police", label: "警察厅" },
  { key: "prosecutor", label: "检察厅" },
  { key: "osaka", label: "大阪府警" },
  { key: "kyoto", label: "京都府警" },
  { key: "nagano", label: "长野县警" },
  { key: "gunma", label: "群马县警" },
  { key: "shizuoka", label: "静冈县警" },
  { key: "kanagawa", label: "神奈川县警" },
  { key: "hokkaido", label: "北海道警" },
  { key: "police_academy", label: "警视厅警察学校" },
  { key: "teitan_high", label: "帝丹高中" },
  { key: "haido_high", label: "杯户高中" },
  { key: "ekoda_high", label: "江古田高中" },
  { key: "kyoto_seishin", label: "京都泉心高中" },
  { key: "teitan_elem", label: "帝丹小学" },
  { key: "suzuki_group", label: "铃木财团" },
  { key: "araide_hospital", label: "新出医院" },
  { key: "ramen_ogura", label: "小仓拉面店" },
  { key: "tamaki_books", label: "玉木书店" },
  { key: "kaneko_jewelry", label: "金子珠宝店" },
  { key: "shogi_player", label: "将棋手" },
  { key: "soccer_player", label: "足球运动员" },
  { key: "magician", label: "魔术师" },
  { key: "entertainer", label: "艺人" },
  { key: "celebrity", label: "知名人士" },
  { key: "family_friend", label: "亲属与友人" },
  { key: "pet", label: "宠物" },
  { key: "fictional", label: "虚构角色" },
];

// ==================== 角色数据 ====================
const characterData = [

  // ============================================================
  // 【主要角色】
  // ============================================================
  {
    id: 1,
    factionKey: "main",
    nameZh: "江户川柯南",
    nameJa: "江戸川コナン",
    voiceActorJa: "高山南",
    avatar: "https://www.conanpedia.com/images/6/69/%E6%B1%9F%E6%88%B7%E5%B7%9D%E6%9F%AF%E5%8D%97.png",
    desc: "《名侦探柯南》主角。生日为5月4日，7岁，侦探，帝丹小学1年B班学生，少年侦探团实际领导者。本为高中生工藤新一，因被琴酒灌下APTX-4869而身体缩小，后在阿笠博士的建议下隐瞒了身份，为了收集黑衣组织的情报，寄住于毛利小五郎和毛利兰的家中。"
  },
  {
    id: 2,
    factionKey: "main",
    nameZh: "工藤新一",
    nameJa: "工藤新一",
    voiceActorJa: "山口胜平、高山南（幼年）",
    avatar: "https://www.conanpedia.com/images/3/3e/%E5%B7%A5%E8%97%A4%E6%96%B0%E4%B8%80.png",
    desc: "《名侦探柯南》主角。生日为5月4日，17岁，侦探，帝丹高中2年B班学生，工藤优作与工藤有希子的儿子，黑羽快斗的堂兄弟，毛利兰的发小兼男友。因被琴酒灌下APTX-4869而身体缩小，身体缩小后化名江户川柯南。"
  },
  {
    id: 3,
    factionKey: "main",
    nameZh: "毛利兰",
    nameJa: "毛利蘭",
    voiceActorJa: "山崎和佳奈→冈村明美",
    avatar: "https://www.conanpedia.com/images/1/15/CHARACTER_LIST_%E6%AF%9B%E5%88%A9%E5%85%B0.png",
    desc: "16岁，名侦探柯南女主角，帝丹高中2年B班学生，空手道部主将兼关东空手道大赛冠军，毛利小五郎与妃英理的独女，工藤新一的青梅竹马兼女友。"
  },
  {
    id: 4,
    factionKey: "main",
    nameZh: "毛利小五郎",
    nameJa: "毛利小五郎",
    voiceActorJa: "神谷明→小山力也",
    avatar: "https://www.conanpedia.com/images/4/4a/CHARACTER_LIST_%E6%AF%9B%E5%88%A9%E5%B0%8F%E4%BA%94%E9%83%8E.png",
    desc: "38岁，原警视厅刑事部搜查一课强行犯搜查三系刑警，警衔为巡查部长，经营毛利侦探事务所的知名侦探，妃英理的丈夫，毛利兰的父亲，因经常被柯南麻醉破案，被称为“沉睡的小五郎”。"
  },
  {
    id: 5,
    factionKey: "main",
    nameZh: "阿笠博士",
    nameJa: "阿笠博士",
    voiceActorJa: "绪方贤一、田中一成（少年）",
    avatar: "https://www.conanpedia.com/images/f/fc/CHARACTER_LIST_%E9%98%BF%E7%AC%A0%E5%8D%9A%E5%A3%AB.png",
    desc: "53岁，发明家，工藤新一的邻居，工藤优作与寺井黄之助的老相识，少年侦探团的协助者，芙莎绘·坎贝尔·木之下的初恋，自称“天才发明家”。"
  },
  {
    id: 6,
    factionKey: "main",
    nameZh: "灰原哀",
    nameJa: "灰原哀",
    voiceActorJa: "林原惠美",
    avatar: "https://www.conanpedia.com/images/8/8d/CHARACTER_LIST_%E7%81%B0%E5%8E%9F%E5%93%80.png",
    desc: "约7岁，原是黑衣组织科学家宫野志保、代号雪莉，因宫野明美之死，向组织抗议被囚禁，服下APTX-4869变成小学生后被阿笠博士收养，现化名灰原哀并就读于帝丹小学1年B班。"
  },
  {
    id: 7,
    factionKey: "main",
    nameZh: "吉田步美",
    nameJa: "吉田歩美",
    voiceActorJa: "岩居由希子",
    avatar: "https://www.conanpedia.com/images/2/2a/CHARACTER_LIST_%E5%90%89%E7%94%B0%E6%AD%A5%E7%BE%8E.png",
    desc: "7岁，帝丹小学1年B班，少年侦探团成员。"
  },
  {
    id: 8,
    factionKey: "main",
    nameZh: "圆谷光彦",
    nameJa: "円谷光彦",
    voiceActorJa: "大谷育江、折笠爱（临时）",
    avatar: "https://www.conanpedia.com/images/8/83/CHARACTER_LIST_%E5%9C%86%E8%B0%B7%E5%85%89%E5%BD%A6.png",
    desc: "7岁，帝丹小学1年B班，少年侦探团成员，圆谷朝美的弟弟。"
  },
  {
    id: 9,
    factionKey: "main",
    nameZh: "小岛元太",
    nameJa: "小嶋元太",
    voiceActorJa: "高木涉",
    avatar: "https://www.conanpedia.com/images/7/71/CHARACTER_LIST_%E5%B0%8F%E5%B2%9B%E5%85%83%E5%A4%AA.png",
    desc: "7岁，帝丹小学1年B班，自称少年侦探团团长，小岛元次的独子。"
  },
  {
    id: 10,
    factionKey: "main",
    nameZh: "铃木园子",
    nameJa: "鈴木園子",
    voiceActorJa: "松井菜樱子",
    avatar: "https://www.conanpedia.com/images/f/fe/CHARACTER_LIST_%E9%93%83%E6%9C%A8%E5%9B%AD%E5%AD%90.png",
    desc: "17岁，帝丹高中2年B班学生，铃木财团二千金，网球部成员，铃木史郎与铃木朋子的次女，铃木绫子的妹妹，京极真的女友。"
  },
  {
    id: 11,
    factionKey: "main",
    nameZh: "服部平次",
    nameJa: "服部平次",
    voiceActorJa: "堀川亮、堀川亮→比嘉久美子（幼年）",
    avatar: "https://www.conanpedia.com/images/2/2b/CHARACTER_LIST_%E6%9C%8D%E9%83%A8%E5%B9%B3%E6%AC%A1.png",
    desc: "17岁，改方学园高中2年级学生，知名高中生侦探，剑道部部长，服部平藏与服部静华的独子，远山和叶的青梅竹马兼男友，并与新一共称“关西的服部”“关东的工藤”。"
  },
  {
    id: 12,
    factionKey: "main",
    nameZh: "远山和叶",
    nameJa: "遠山和葉",
    voiceActorJa: "宫村优子、佐久间玲（幼年）",
    avatar: "https://www.conanpedia.com/images/f/fb/%E8%BF%9C%E5%B1%B1%E5%92%8C%E5%8F%B6.png",
    desc: "17岁，改方学园高中2年级学生，合气道二段兼歌牌部成员，远山银司郎的独女，服部平次的青梅竹马兼女友。"
  },
  {
    id: 13,
    factionKey: "main",
    nameZh: "世良真纯",
    nameJa: "世良真純",
    voiceActorJa: "日高范子",
    avatar: "https://www.conanpedia.com/images/8/8e/CHARACTER_LIST_%E4%B8%96%E8%89%AF%E7%9C%9F%E7%BA%AF_1.png",
    desc: "约16-17岁，帝丹高中2年B班学生，侦探，赤井务武与世良玛丽的长女，赤井秀一和羽田秀吉的妹妹。"
  },
  {
    id: 14,
    factionKey: "main",
    nameZh: "赤井秀一",
    nameJa: "赤井秀一",
    voiceActorJa: "池田秀一、梶裕贵（少年）",
    avatar: "https://www.conanpedia.com/images/a/a3/CHARACTER_LIST_%E8%B5%A4%E4%BA%95%E7%A7%80%E4%B8%80_1.png",
    desc: "32岁，化名诸星大，代号莱伊，FBI探员兼狙击手，曾潜伏在黑衣组织的卧底，赤井务武与世良玛丽的长子，羽田秀吉与世良真纯的大哥，宫野明美与宫野志保的表亲，詹姆斯·布莱克的下属，茱蒂·斯泰琳的前男友兼同事，安德雷·卡迈尔的同事，琴酒的宿敌。"
  },
  {
    id: 15,
    factionKey: "main",
    nameZh: "安室透",
    nameJa: "安室透",
    voiceActorJa: "古谷彻→草尾毅、古谷彻→伊濑茉莉也（幼年）",
    avatar: "https://www.conanpedia.com/images/4/44/CHARACTER_LIST_%E9%99%8D%E8%B0%B7%E9%9B%B6.png",
    desc: "29岁，本名降谷零，代号波本，警察厅警备局警备企划课“零”的公安警察，警衔为警部，波洛咖啡厅服务员，私家侦探，潜伏在黑衣组织的卧底，与松田、萩原、景光、伊达为同期毕业生兼好友，朗姆与黑田兵卫的下属，风见裕也的上级，榎本梓的同事，毛利小五郎的大徒弟，被称为“秘密主义者”。"
  },
  {
    id: 16,
    factionKey: "main",
    nameZh: "怪盗基德",
    nameJa: "怪盗キッド",
    voiceActorJa: "山口胜平",
    avatar: "https://www.conanpedia.com/images/7/7b/CHARACTER_LIST_%E6%80%AA%E7%9B%97%E5%9F%BA%E5%BE%B7.png",
    desc: "此指第二代怪盗基德。怪盗魔术师，江户川柯南的对手兼伙伴，白马探的对手，中森银三、茶木神太郎与铃木次郎吉的抓捕对象，国际犯罪代号1412，被称为“令和的魔术师”。<br>来自《魔术快斗》，真实身份是黑羽快斗。"
  },

  // ============================================================
  // 【工藤家】
  // ============================================================
  {
    id: 17,
    factionKey: "kudo_family",
    nameZh: "工藤优作",
    nameJa: "工藤優作",
    voiceActorJa: "田中秀幸",
    avatar: "https://www.conanpedia.com/images/d/db/CHARACTER_LIST_%E5%B7%A5%E8%97%A4%E4%BC%98%E4%BD%9C.png",
    desc: "世界首屈一指的推理小说家，知名侦探，工藤有希子的丈夫，工藤新一的父亲，黑羽盗一的双胞胎弟弟兼对手，阿笠博士和目暮十三的老相识。"
  },
  {
    id: 18,
    factionKey: "kudo_family",
    nameZh: "工藤有希子",
    nameJa: "工藤有希子",
    voiceActorJa: "岛本须美",
    avatar: "https://www.conanpedia.com/images/b/bd/%E5%B7%A5%E8%97%A4%E6%9C%89%E5%B8%8C%E5%AD%90.png",
    desc: "37岁，旧姓藤峰，前演员，工藤优作的妻子，工藤新一的母亲，黑羽盗一的徒弟，贝尔摩德的好友，山村操的偶像，自称“暗夜男爵夫人”，高中时期被称为“帝丹公主”，并与妃英理争夺“帝丹小姐”的宝座。"
  },
  {
    id: 19,
    factionKey: "kudo_family",
    nameZh: "冲矢昴",
    nameJa: "沖矢昴",
    voiceActorJa: "置鲇龙太郎",
    avatar: "https://www.conanpedia.com/images/d/dd/CHARACTER_LIST_%E5%86%B2%E7%9F%A2%E6%98%B4.png",
    desc: "27岁，东都大学工科研究生，工藤家房客，少年侦探团的伙伴，阿笠博士的朋友。<br>真实身份是FBI探员赤井秀一。"
  },

  // ============================================================
  // 【妃法律事务所】
  // ============================================================
  {
    id: 20,
    factionKey: "kisaki_law",
    nameZh: "妃英理",
    nameJa: "妃英理",
    voiceActorJa: "高岛雅罗",
    avatar: "https://www.conanpedia.com/images/7/78/%E5%A6%83%E8%8B%B1%E7%90%86.png",
    desc: "生日为10月10日，38岁，婚后姓毛利，知名律师，“妃法律事务所”创办人，毛利小五郎的妻子，毛利兰的母亲，在法律界和高中时期分别被称为“法庭女王”与“帝丹女王”，并与工藤有希子争夺“帝丹小姐”的宝座。"
  },
  {
    id: 21,
    factionKey: "kisaki_law",
    nameZh: "栗山绿",
    nameJa: "栗山緑",
    voiceActorJa: "百百麻子",
    avatar: "https://www.conanpedia.com/images/a/af/CHARACTER_LIST_%E6%A0%97%E5%B1%B1%E7%BB%BF.png",
    desc: "妃英理的秘书。"
  },

  // ============================================================
  // 【波洛咖啡厅】
  // ============================================================
  {
    id: 22,
    factionKey: "cafe_poirot",
    nameZh: "榎本梓",
    nameJa: "榎本梓",
    voiceActorJa: "榎本充希子",
    avatar: "https://www.conanpedia.com/images/e/ed/CHARACTER_Enomoto_Azusa.png",
    desc: "23岁，波洛咖啡厅女服务员，安室透的同事，怪盗基德的忠实粉丝，自称“月下的侍者”。"
  },

  // ============================================================
  // 【伊吕波寿司店】
  // ============================================================
  {
    id: 23,
    factionKey: "sushi_iroha",
    nameZh: "胁田兼则",
    nameJa: "脇田兼則",
    voiceActorJa: "千叶繁",
    avatar: "https://www.conanpedia.com/images/3/31/CHARACTER_LIST_%E8%83%81%E7%94%B0%E5%85%BC%E5%88%99.png",
    desc: "56岁，伊吕波寿司店厨师，万马券事件后成为毛利小五郎的二弟子。<br>真实身份是黑衣组织二把手朗姆。"
  },

  // ============================================================
  // 【黑衣组织】
  // ============================================================
  {
    id: 24,
    factionKey: "black_org",
    nameZh: "乌丸莲耶",
    nameJa: "烏丸蓮耶",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/8/8a/CHARACTER_LIST_%E4%B9%8C%E4%B8%B8%E8%8E%B2%E8%80%B6.png",
    desc: "大富豪，黑衣组织首脑，半世纪前99岁高龄时对外宣称去世，被组织成员称为“那位大人”。"
  },
  {
    id: 25,
    factionKey: "black_org",
    nameZh: "朗姆",
    nameJa: "ラム",
    voiceActorJa: "千叶繁",
    avatar: "https://www.conanpedia.com/images/3/31/%E6%9C%97%E5%A7%86.png",
    desc: "黑衣组织二把手，乌丸莲耶的亲信，库拉索与宾加的上级，以胁田兼则的身份在寿司店打工并调查毛利小五郎，现阶段身份败露离开寿司店。"
  },
  {
    id: 26,
    factionKey: "black_org",
    nameZh: "琴酒",
    nameJa: "ジン",
    voiceActorJa: "堀之纪",
    avatar: "https://www.conanpedia.com/images/1/1e/CHARACTER_LIST_%E7%90%B4%E9%85%92.png",
    desc: "本名黑泽阵，黑衣组织成员，负责重要交易、处决不合格成员与间谍，伏特加的上级，赤井秀一的宿敌，爱尔兰的仇人，导致工藤新一变小的元凶，杀害宫野明美的凶手。"
  },
  {
    id: 27,
    factionKey: "black_org",
    nameZh: "伏特加",
    nameJa: "ウォッカ",
    voiceActorJa: "立木文彦",
    avatar: "https://www.conanpedia.com/images/7/77/CHARACTER_Vodka.png",
    desc: "本名鱼冢三郎，黑衣组织成员，负责重要交易买卖，琴酒的部下。"
  },
  {
    id: 28,
    factionKey: "black_org",
    nameZh: "贝尔摩德",
    nameJa: "ベルモット",
    voiceActorJa: "小山茉美",
    avatar: "https://www.conanpedia.com/images/a/a3/CHARACTER_LIST_%E8%B4%9D%E5%B0%94%E6%91%A9%E5%BE%B7.png",
    desc: "本名莎朗·温亚德，现用名克丽丝·温亚德，黑衣组织成员，已息影的著名女演员，负责情报搜集与暗杀，乌丸莲耶最宠爱的成员，黑羽盗一的徒弟，工藤有希子的好友，被琴酒称为“秘密主义者”。"
  },
  {
    id: 29,
    factionKey: "black_org",
    nameZh: "基安蒂",
    nameJa: "キャンティ",
    voiceActorJa: "井上喜久子",
    avatar: "https://www.conanpedia.com/images/5/51/CHARACTER_LIST_%E5%9F%BA%E5%AE%89%E8%92%82.png",
    desc: "黑衣组织狙击手，科恩的搭档。"
  },
  {
    id: 30,
    factionKey: "black_org",
    nameZh: "科恩",
    nameJa: "コルン",
    voiceActorJa: "木下浩之",
    avatar: "https://www.conanpedia.com/images/e/e1/CHARACTER_LIST_%E7%A7%91%E6%81%A9.png",
    desc: "黑衣组织狙击手，基安蒂的搭档。"
  },
  {
    id: 31,
    factionKey: "black_org",
    nameZh: "宫野厚司",
    nameJa: "宮野厚司",
    voiceActorJa: "中村悠一",
    avatar: "https://www.conanpedia.com/images/1/1b/CHARACTER_LIST_%E5%AE%AB%E9%87%8E%E5%8E%9A%E5%8F%B8.png",
    desc: "17年前去世，去世时约37岁，原白鸠制药员工、宫野诊所医生，前黑衣组织科学家，负责开发药物“APTX-4869”，宫野艾莲娜的丈夫，宫野明美与宫野志保的父亲，皮斯克的好友，死于组织实验室的意外火灾。"
  },
  {
    id: 32,
    factionKey: "black_org",
    nameZh: "宫野艾莲娜",
    nameJa: "宮野エレーナ",
    voiceActorJa: "铃木弘子→林原惠美",
    avatar: "https://www.conanpedia.com/images/e/e4/CHARACTER_LIST_%E5%AE%AB%E9%87%8E%E8%89%BE%E8%8E%B2%E5%A8%9C.png",
    desc: "17年前去世，去世时约31岁，原名世良艾莲娜，原宫野诊所医生，前黑衣组织科学家，负责开发药物“APTX-4869”，世良玛丽的妹妹，宫野厚司的妻子，宫野明美与宫野志保的母亲，皮斯克的好友，降谷零的初恋，死于组织实验室的意外火灾。"
  },
  {
    id: 33,
    factionKey: "black_org",
    nameZh: "宫野明美",
    nameJa: "宮野明美",
    voiceActorJa: "胜生真沙子→玉川砂记子",
    avatar: "https://www.conanpedia.com/images/4/49/CHARACTER_LIST_%E5%AE%AB%E9%87%8E%E6%98%8E%E7%BE%8E.png",
    desc: "约25岁，化名广田雅美，前黑衣组织外围成员，帝丹小学第19届毕业生，宫野厚司与宫野艾莲娜的长女，宫野志保的姐姐，赤井秀一的表妹兼前女友，以脱离组织为条件抢劫十亿日元，事后被琴酒杀害。"
  },
  {
    id: 34,
    factionKey: "black_org",
    nameZh: "宫野志保",
    nameJa: "宮野志保",
    voiceActorJa: "林原惠美",
    avatar: "https://www.conanpedia.com/images/3/3e/%E5%AE%AB%E9%87%8E%E5%BF%97%E4%BF%9D1.png",
    desc: "18岁，原黑衣组织科学家，代号雪莉，负责开发药物“APTX-4869”，宫野厚司与宫野艾莲娜的次女，宫野明美的妹妹，在明美死后向组织抗议被囚禁，服下药物变成小学生模样并化名灰原哀。"
  },
  {
    id: 35,
    factionKey: "black_org",
    nameZh: "火伤赤井秀一",
    nameJa: "火傷の赤井秀一",
    voiceActorJa: "池田秀一",
    avatar: "https://www.conanpedia.com/images/8/8a/CHARACTER_LIST_%E7%81%AB%E4%BC%A4%E8%B5%A4%E4%BA%95.png",
    desc: "由波本和贝尔摩德假扮，用以试探FBI、灰原哀与世良真纯的对象。"
  },
  {
    id: 36,
    factionKey: "black_org",
    nameZh: "龙舌兰",
    nameJa: "テキーラ",
    voiceActorJa: "广田行生",
    avatar: "https://www.conanpedia.com/images/7/72/%E9%BE%99%E8%88%8C%E5%85%B0.png",
    desc: "前黑衣组织成员，负责招募研发计算机软件的程序员，与满天堂员工交易时拿错箱子被炸死。"
  },
  {
    id: 37,
    factionKey: "black_org",
    nameZh: "皮斯克",
    nameJa: "ピスコ",
    voiceActorJa: "村松康雄",
    avatar: "https://www.conanpedia.com/images/8/85/CHARACTER_LIST_%E7%9A%AE%E6%96%AF%E5%85%8B.png",
    desc: "71岁，本名枡山宪三，前黑衣组织元老成员，汽车公司董事长，宫野夫妇的好友，被称为“财经界的大人物”，在杯户城市饭店执行暗杀任务时不慎暴露组织，而被琴酒处决。"
  },
  {
    id: 38,
    factionKey: "black_org",
    nameZh: "卡尔瓦多斯",
    nameJa: "カルバドス",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/e/ef/CHARACTER_LIST_%E5%8D%A1%E5%B0%94%E7%93%A6%E5%A4%9A%E6%96%AF.png",
    desc: "前黑衣组织狙击手，贝尔摩德的迷恋者，被赤井秀一调侃为“军火商”，在满月对决协助贝尔摩德时被赤井秀一偷袭重伤后自杀。"
  },
  {
    id: 39,
    factionKey: "black_org",
    nameZh: "爱尔兰",
    nameJa: "アイリッシュ",
    voiceActorJa: "干本雄之",
    avatar: "https://www.conanpedia.com/images/b/bd/CHARACTER_LIST_%E7%88%B1%E5%B0%94%E5%85%B0.png",
    desc: "前黑衣组织成员，皮斯克的仰慕者，在调查卧底名单存储卡的下落时不慎暴露，而被基安蒂处决。"
  },
  {
    id: 40,
    factionKey: "black_org",
    nameZh: "库拉索",
    nameJa: "キュラソー",
    voiceActorJa: "天海祐希",
    avatar: "https://www.conanpedia.com/images/d/de/%E5%BA%93%E6%8B%89%E7%B4%A2.png",
    desc: "前黑衣组织成员，朗姆的心腹之一，侦探团三人的朋友，在盗取间谍名单时意外失忆并在恢复记忆后背叛组织，最后为保护侦探团三人被摩天轮辗毙身亡。"
  },
  {
    id: 41,
    factionKey: "black_org",
    nameZh: "宾加",
    nameJa: "ピンガ",
    voiceActorJa: "村濑步",
    avatar: "https://www.conanpedia.com/images/d/d4/%E5%AE%BE%E5%8A%A0.png",
    desc: "化名格蕾丝，前黑衣组织成员，朗姆的心腹之一，五年前以法国工程师的身份潜入国际刑警后加入太平洋浮标的核心团队，协助盗取老幼认证系统并绑架灰原哀，最后被琴酒暗算命丧在潜艇自爆中。"
  },
  {
    id: 42,
    factionKey: "black_org",
    nameZh: "沼渊己一郎",
    nameJa: "沼淵己一郎",
    voiceActorJa: "龙田直树",
    avatar: "https://www.conanpedia.com/images/2/2a/%E6%B2%BC%E6%B8%8A%E5%B7%B1%E4%B8%80%E9%83%8E.png",
    desc: "原黑衣组织外围成员，连续杀人犯，现阶段被逮捕并等待死刑执行。"
  },
  {
    id: 43,
    factionKey: "black_org",
    nameZh: "楠田陆道",
    nameJa: "楠田陸道",
    voiceActorJa: "岩田光央",
    avatar: "https://www.conanpedia.com/images/b/b1/CHARACTER_LIST_%E6%A5%A0%E7%94%B0%E9%99%86%E9%81%93.png",
    desc: "前黑衣组织外围成员，奉琴酒之命伪装病人在杯户中央医院调查基尔的下落，在身份暴露后的逃亡中开枪自杀。"
  },

  // ============================================================
  // 【FBI（美国联邦调查局）】
  // ============================================================
  {
    id: 44,
    factionKey: "fbi",
    nameZh: "詹姆斯·布莱克",
    nameJa: "ジェイムズ·ブラック",
    voiceActorJa: "家弓家正→土师孝也",
    avatar: "https://www.conanpedia.com/images/5/56/CHARACTER_LIST_%E8%A9%B9%E5%A7%86%E6%96%AF%C2%B7%E5%B8%83%E8%8E%B1%E5%85%8B.png",
    desc: "FBI高级探员，赤井秀一、茱蒂·斯泰琳和安德雷·卡迈尔的上级。"
  },
  {
    id: 45,
    factionKey: "fbi",
    nameZh: "茱蒂·斯泰琳",
    nameJa: "ジョディ·スターリング",
    voiceActorJa: "一城美由希、冬马由美（幼年）",
    avatar: "https://www.conanpedia.com/images/4/49/%E8%8C%B1%E8%92%82%C2%B7%E6%96%AF%E6%B3%B0%E7%90%B3.png",
    desc: "28岁，化名茱蒂·圣提米利翁，FBI探员，前帝丹高中英语老师，詹姆斯·布莱克的下属，赤井秀一的前女友兼同事，安德雷·卡迈尔的同事，毛利兰和铃木园子的老师，贝尔摩德的仇人。"
  },
  {
    id: 46,
    factionKey: "fbi",
    nameZh: "安德雷·卡迈尔",
    nameJa: "アンドレ·キャメル",
    voiceActorJa: "梁田清之→乃村健次",
    avatar: "https://www.conanpedia.com/images/e/e5/CHARACTER_LIST_%E5%AE%89%E5%BE%B7%E9%9B%B7%C2%B7%E5%8D%A1%E8%BF%88%E5%B0%94.png",
    desc: "28岁，FBI探员，詹姆斯·布莱克的下属，赤井秀一和茱蒂·斯泰琳的同事。"
  },

  // ============================================================
  // 【CIA（美国中央情报局）】
  // ============================================================
  {
    id: 47,
    factionKey: "cia",
    nameZh: "伊森·本堂",
    nameJa: "イーサン·本堂",
    voiceActorJa: "小山力也",
    avatar: "https://www.conanpedia.com/images/a/a1/CHARACTER_LIST_%E4%BC%8A%E6%A3%AE%C2%B7%E6%9C%AC%E5%A0%82.png",
    desc: "化名坪内、石井，前CIA谍报员，曾潜伏在黑衣组织的卧底，本堂瑛海与本堂瑛祐的父亲，4年前为保护身份暴露的瑛海自杀殉职。"
  },
  {
    id: 48,
    factionKey: "cia",
    nameZh: "水无怜奈",
    nameJa: "水無怜奈",
    voiceActorJa: "三石琴乃",
    avatar: "https://www.conanpedia.com/images/6/67/CHARACTER_LIST_%E6%B0%B4%E6%97%A0%E6%80%9C%E5%A5%88.png",
    desc: "27岁，本名本堂瑛海，CIA谍报员，黑衣组织卧底（代号为“基尔”），前日卖电视台媒体人，伊森·本堂的女儿，本堂瑛祐的姐姐，冲野洋子的友人兼前同事。曾临时潜入黑衣组织，4年前与伊森·本堂接头时不慎暴露行踪，被迫继承父亲的遗志成为长期的黑衣组织卧底。在暗杀土门康辉的任务中，意外身受重伤、陷入昏迷而被FBI擒获，后接受江户川柯南和赤井秀一的计划返回黑衣组织、协助赤井秀一假死，成为嵌入黑衣组织的“钢楔”。"
  },

  // ============================================================
  // 【MI6（英国军事情报六局）】
  // ============================================================
  {
    id: 49,
    factionKey: "mi6",
    nameZh: "赤井务武",
    nameJa: "赤井務武",
    voiceActorJa: "山寺宏一",
    avatar: "https://www.conanpedia.com/images/9/9c/CHARACTER_LIST_%E8%B5%A4%E4%BA%95%E5%8A%A1%E6%AD%A6.png",
    desc: "MI6特工，世良玛丽的丈夫，赤井秀一、羽田秀吉与世良真纯的父亲，羽田康晴的好友，17年前赴美调查羽田浩司案时失踪，现阶段生死不明。"
  },
  {
    id: 50,
    factionKey: "mi6",
    nameZh: "世良玛丽",
    nameJa: "世良メアリー",
    voiceActorJa: "田中敦子→本田贵子",
    avatar: "https://www.conanpedia.com/images/0/01/CHARACTER_LIST_%E8%B5%A4%E4%BA%95%E7%8E%9B%E4%B8%BD.png",
    desc: "约53岁，曾姓赤井，外号领域外的妹妹，MI6特工，宫野艾莲娜的姐姐，赤井务武的妻子，赤井秀一、羽田秀吉与世良真纯的母亲，几个月前在伦敦被假扮务武的贝尔摩德灌药变小，现阶段与世良返回日本试探柯南并争夺解药。"
  },

  // ============================================================
  // 【警视厅刑事部高层】
  // ============================================================
  {
    id: 51,
    factionKey: "tokyo_exec",
    nameZh: "小田切敏郎",
    nameJa: "小田切敏郎",
    voiceActorJa: "中田浩二",
    avatar: "https://www.conanpedia.com/images/8/89/CHARACTER_LIST_%E5%B0%8F%E7%94%B0%E5%88%87%E6%95%8F%E9%83%8E.png",
    desc: "56岁，警视厅刑事部部长，警衔为警视长，居合斩高手，小田切敏也的父亲，毛利小五郎的前上级。"
  },
  {
    id: 52,
    factionKey: "tokyo_exec",
    nameZh: "松本清长",
    nameJa: "松本清長",
    voiceActorJa: "加藤精三",
    avatar: "https://www.conanpedia.com/images/a/a4/%E6%9D%BE%E6%9C%AC%E6%B8%85%E9%95%BF.png",
    desc: "54岁，前警视厅刑事部搜查一课管理官，警衔为警视，松本小百合的父亲，目暮十三的前上级，现阶段升至警视正。"
  },

  // ============================================================
  // 【警视厅刑事部搜查一课】
  // ============================================================
  {
    id: 53,
    factionKey: "tokyo_s1",
    nameZh: "黑田兵卫",
    nameJa: "黒田兵衛",
    voiceActorJa: "岸野幸正",
    avatar: "https://www.conanpedia.com/images/f/fe/CHARACTER_LIST_%E9%BB%91%E7%94%B0%E5%85%B5%E5%8D%AB.png",
    desc: "50岁，前警察厅警备局警备企划课的公安警察，长野县警察本部刑事部搜查一课课长，警视厅刑事部搜查一课管理官，警衔为警视，目暮十三的现任上级，于17年前的秘密任务遭遇严重车祸重伤昏迷10年，苏醒后被暂时调至长野县，后回到东京接替松本清长的职务。"
  },
  {
    id: 54,
    factionKey: "tokyo_s1",
    nameZh: "目暮十三",
    nameJa: "目暮十三",
    voiceActorJa: "茶风林",
    avatar: "https://www.conanpedia.com/images/f/f8/CHARACTER_LIST_%E7%9B%AE%E6%9A%AE%E5%8D%81%E4%B8%89.png",
    desc: "约42岁，警视厅刑事部搜查一课强行犯搜查三系系长，警衔为警部，目暮绿的丈夫，中森银三的警校同期，白鸟任三郎的同事，毛利小五郎的前上级。"
  },
  {
    id: 55,
    factionKey: "tokyo_s1",
    nameZh: "白鸟任三郎",
    nameJa: "白鳥任三郎",
    voiceActorJa: "盐泽兼人→井上和彦、本田贵子（少年）",
    avatar: "https://www.conanpedia.com/images/f/f2/%E7%99%BD%E9%B8%9F%E4%BB%BB%E4%B8%89%E9%83%8E.png",
    desc: "约28岁，警视厅刑事部搜查一课强行犯搜查三系刑事，警衔为警部，职业组出身，绫小路文麿的警校同期，目暮十三的同事，小林澄子的青梅竹马兼男友。"
  },
  {
    id: 56,
    factionKey: "tokyo_s1",
    nameZh: "佐藤美和子",
    nameJa: "佐藤美和子",
    voiceActorJa: "汤屋敦子",
    avatar: "https://www.conanpedia.com/images/e/e2/%E4%BD%90%E8%97%A4%E7%BE%8E%E5%92%8C%E5%AD%90.png",
    desc: "约28岁，警视厅刑事部搜查一课强行犯搜查三系刑事，警衔为警部补，佐藤正义的女儿，目暮十三的下属，高木涉的上级兼恋人，松田阵平的后辈、前同事兼搭档。"
  },
  {
    id: 57,
    factionKey: "tokyo_s1",
    nameZh: "高木涉",
    nameJa: "高木渉",
    voiceActorJa: "高木涉",
    avatar: "https://www.conanpedia.com/images/e/eb/CHARACTER_LIST_%E9%AB%98%E6%9C%A8%E6%B6%89.png",
    desc: "约26岁，警视厅刑事部搜查一课强行犯搜查三系刑警，警衔为巡查部长，目暮十三的下属，千叶和伸的同事，佐藤美和子的下属兼恋人，与前辈伊达航被称为“Wataru兄弟”。"
  },
  {
    id: 58,
    factionKey: "tokyo_s1",
    nameZh: "千叶和伸",
    nameJa: "千葉和伸",
    voiceActorJa: "千叶一伸、爱河里花子（少年）",
    avatar: "https://www.conanpedia.com/images/a/a6/CHARACTER_LIST_%E5%8D%83%E5%8F%B6%E5%92%8C%E4%BC%B8.png",
    desc: "24岁，警视厅刑事部搜查一课强行犯搜查三系刑警，警衔为巡查部长，帝丹小学第20届毕业生，目暮十三的下属，高木涉的同事，三池苗子的青梅竹马、同班同学兼恋人。"
  },
  {
    id: 59,
    factionKey: "tokyo_s1",
    nameZh: "佐藤正义",
    nameJa: "佐藤正義",
    voiceActorJa: "大川透",
    avatar: "https://www.conanpedia.com/images/a/ac/%E4%BD%90%E8%97%A4%E6%AD%A3%E4%B9%89.png",
    desc: "前警视厅刑事部搜查一课强行犯搜查三系警部，佐藤美和子的父亲，18年前为拯救好友鹿野修二遭遇车祸殉职，死后被追授为警视正。"
  },
  {
    id: 60,
    factionKey: "tokyo_s1",
    nameZh: "弓长",
    nameJa: "弓長",
    voiceActorJa: "德弘夏生",
    avatar: "https://www.conanpedia.com/images/2/2e/CHARACTER_LIST_%E5%BC%93%E9%95%BF.png",
    desc: "警视厅刑事部搜查一课纵火犯搜查一系长官，警衔为警部，毛利小五郎在纵火犯科系的上级，被称为“火灾老爹”。"
  },

  // ============================================================
  // 【警视厅刑事部搜查二课】
  // ============================================================
  {
    id: 61,
    factionKey: "tokyo_s2",
    nameZh: "茶木神太郎",
    nameJa: "茶木神太郎",
    voiceActorJa: "田中信夫",
    avatar: "https://www.conanpedia.com/images/4/44/%E8%8C%B6%E6%9C%A8%E7%A5%9E%E5%A4%AA%E9%83%8E.png",
    desc: "49岁，警视厅刑事部搜查二课警视，中森银三的上级，以逮捕怪盗基德为终极目标。"
  },
  {
    id: 62,
    factionKey: "tokyo_s2",
    nameZh: "中森银三",
    nameJa: "中森銀三",
    voiceActorJa: "石冢运昇→石井康嗣",
    avatar: "https://www.conanpedia.com/images/b/bd/%E4%B8%AD%E6%A3%AE%E9%93%B6%E4%B8%89.png",
    desc: "42岁，警视厅刑事部搜查二课智能犯搜查系警部，茶木神太郎的下属，中森碧子的丈夫，中森青子的父亲，铃木次郎吉的合作伙伴，两代怪盗基德的对手。<br>来自《魔术快斗》。"
  },

  // ============================================================
  // 【警视厅刑事部搜查三课】
  // ============================================================
  {
    id: 63,
    factionKey: "tokyo_s3",
    nameZh: "百濑",
    nameJa: "百瀬",
    voiceActorJa: "盐屋浩三",
    avatar: "https://www.conanpedia.com/images/7/7b/%E7%99%BE%E6%BF%91.png",
    desc: "警视厅刑事部搜查三课警部，主管一般盗窃案。"
  },

  // ============================================================
  // 【警视厅刑事部鉴识课】
  // ============================================================
  {
    id: 64,
    factionKey: "tokyo_forensic",
    nameZh: "登米",
    nameJa: "トメ",
    voiceActorJa: "中岛聪彦、卷岛直树（临时）、长嶝高士（临时）",
    avatar: "https://www.conanpedia.com/images/2/23/CHARACTER_LIST_%E7%99%BB%E7%B1%B3.png",
    desc: "警视厅刑事部鉴识课鉴识官，负责验尸与收集案发现场的痕迹。"
  },

  // ============================================================
  // 【警视厅交通部】
  // ============================================================
  {
    id: 65,
    factionKey: "tokyo_traffic",
    nameZh: "宫本由美",
    nameJa: "宮本由美",
    voiceActorJa: "杉本优",
    avatar: "https://www.conanpedia.com/images/e/ed/CHARACTER_LIST_%E5%AE%AB%E6%9C%AC%E7%94%B1%E7%BE%8E.png",
    desc: "约28岁，警视厅交通部交通执行课女警，警衔为警部补，三池苗子的上级，佐藤美和子的好友，羽田秀吉的女友。"
  },
  {
    id: 66,
    factionKey: "tokyo_traffic",
    nameZh: "三池苗子",
    nameJa: "三池苗子",
    voiceActorJa: "田中理惠",
    avatar: "https://www.conanpedia.com/images/8/8d/%E4%B8%89%E6%B1%A0%E8%8B%97%E5%AD%90_1.png",
    desc: "24岁，警视厅交通部交通执行课女警，警衔为巡查部长，帝丹小学第20届毕业生，宫本由美的下属，米原樱子的幼年玩伴兼同校同学，千叶和伸的青梅竹马、同班同学兼恋人。"
  },

  // ============================================================
  // 【警视厅公安部】
  // ============================================================
  {
    id: 67,
    factionKey: "tokyo_security",
    nameZh: "风见裕也",
    nameJa: "風見裕也",
    voiceActorJa: "飞田展男",
    avatar: "https://www.conanpedia.com/images/3/36/CHARACTER_LIST_%E9%A3%8E%E8%A7%81%E8%A3%95%E4%B9%9F.png",
    desc: "30岁，化名飞田男六，警视厅公安部的公安警察，警衔为警部补，安室透的部下，冲野洋子的粉丝。"
  },

  // ============================================================
  // 【警察厅】
  // ============================================================
  {
    id: 68,
    factionKey: "national_police",
    nameZh: "伊织无我",
    nameJa: "伊織無我",
    voiceActorJa: "小野大辅",
    avatar: "https://www.conanpedia.com/images/9/9a/CHARACTER_LIST_%E4%BC%8A%E7%BB%87%E6%97%A0%E6%88%91.png",
    desc: "30岁，化名榊原与和田进一，原警察厅警备局警备企划课的公安警察，风见裕也的警校同期，大冈红叶的管家。"
  },

  // ============================================================
  // 【检察厅】
  // ============================================================
  {
    id: 69,
    factionKey: "prosecutor",
    nameZh: "九条玲子",
    nameJa: "九条玲子",
    voiceActorJa: "松本梨香",
    avatar: "https://www.conanpedia.com/images/f/fb/CHARACTER_LIST_%E4%B9%9D%E6%9D%A1%E7%8E%B2%E5%AD%90.png",
    desc: "33岁，东京地方检察厅检察官，妃英理的对手，被称为“司法界的麦当娜”。"
  },

  // ============================================================
  // 【大阪府警】
  // ============================================================
  {
    id: 70,
    factionKey: "osaka",
    nameZh: "服部平藏",
    nameJa: "服部平蔵",
    voiceActorJa: "小山武宏→山路和弘",
    avatar: "https://www.conanpedia.com/images/0/08/CHARACTER_LIST_%E6%9C%8D%E9%83%A8%E5%B9%B3%E8%97%8F.png",
    desc: "大阪府警察本部长，警衔为警视监，剑道高手，服部静华的丈夫，服部平次的父亲，远山银司郎的上级、好友兼左右手。"
  },
  {
    id: 71,
    factionKey: "osaka",
    nameZh: "远山银司郎",
    nameJa: "遠山銀司郎",
    voiceActorJa: "佐古正人→小川真司→寺杣昌纪",
    avatar: "https://www.conanpedia.com/images/b/bc/%E8%BF%9C%E5%B1%B1%E9%93%B6%E5%8F%B8%E9%83%8E.png",
    desc: "大阪府警察本部刑事部长，警衔为警视长，远山和叶的父亲，服部平藏的下属、好友兼左右手。"
  },
  {
    id: 72,
    factionKey: "osaka",
    nameZh: "大泷悟郎",
    nameJa: "大滝悟郎",
    voiceActorJa: "若本规夫、小野坂昌也（青年）",
    avatar: "https://www.conanpedia.com/images/0/00/%E5%A4%A7%E6%B3%B7%E6%82%9F%E9%83%8E.png",
    desc: "大阪府警察本部刑事部搜查一课刑警，警衔为警部，服部平藏与远山银司郎的下属兼好友。"
  },

  // ============================================================
  // 【京都府警】
  // ============================================================
  {
    id: 73,
    factionKey: "kyoto",
    nameZh: "绫小路文麿",
    nameJa: "綾小路文麿",
    voiceActorJa: "置鲇龙太郎",
    avatar: "https://www.conanpedia.com/images/a/a0/%E7%BB%AB%E5%B0%8F%E8%B7%AF%E6%96%87%E9%BA%BF.png",
    desc: "28岁，京都府警察本部刑事部搜查一课刑警，警衔为警部，职业组出身，白鸟任三郎的警校同期，被称为“贵族警部”。"
  },

  // ============================================================
  // 【长野县警】
  // ============================================================
  {
    id: 74,
    factionKey: "nagano",
    nameZh: "诸伏高明",
    nameJa: "諸伏高明",
    voiceActorJa: "速水奖、冈本信彦（少年）",
    avatar: "https://www.conanpedia.com/images/9/90/CHARACTER_LIST_%E8%AF%B8%E4%BC%8F%E9%AB%98%E6%98%8E.png",
    desc: "35岁，长野县警察本部刑事部搜查一课刑警，警衔为警部，诸伏景光的哥哥，黑田兵卫的前下属，大和敢助的好友兼竞争对手，上原由衣的同事，曾违抗上级命令被调往新野署，后再度调回原职。"
  },
  {
    id: 75,
    factionKey: "nagano",
    nameZh: "大和敢助",
    nameJa: "大和敢助",
    voiceActorJa: "高田裕司",
    avatar: "https://www.conanpedia.com/images/a/aa/CHARACTER_LIST_%E5%A4%A7%E5%92%8C%E6%95%A2%E5%8A%A9.png",
    desc: "35岁，长野县警察本部刑事部搜查一课刑警，警衔为警部，黑田兵卫的前下属，诸伏高明的好友兼竞争对手，上原由衣的青梅竹马兼同事。"
  },
  {
    id: 76,
    factionKey: "nagano",
    nameZh: "上原由衣",
    nameJa: "上原由衣",
    voiceActorJa: "小清水亚美",
    avatar: "https://www.conanpedia.com/images/8/8f/%E4%B8%8A%E5%8E%9F%E7%94%B1%E8%A1%A3.png",
    desc: "29岁，曾姓虎田，长野县警察本部刑事部搜查一课刑警，警衔为巡查部长，黑田兵卫的前下属，大和敢助的青梅竹马兼同事，诸伏高明的同事。"
  },

  // ============================================================
  // 【群马县警】
  // ============================================================
  {
    id: 77,
    factionKey: "gunma",
    nameZh: "山村操",
    nameJa: "山村ミサオ",
    voiceActorJa: "古川登志夫、村濑迪与（幼年）",
    avatar: "https://www.conanpedia.com/images/7/78/CHARACTER_LIST_%E5%B1%B1%E6%9D%91%E6%93%8D.png",
    desc: "群马县警察本部刑事部搜查一课刑警，警衔为警部，山村美纱绘的孙子，诸伏景光的幼年玩伴，毛利小五郎的仰慕者，工藤有希子的粉丝，自称“阿山先生”，被称为“警察界第一麻瓜”。"
  },

  // ============================================================
  // 【静冈县警】
  // ============================================================
  {
    id: 78,
    factionKey: "shizuoka",
    nameZh: "横沟参悟",
    nameJa: "横溝参悟",
    voiceActorJa: "大冢明夫",
    avatar: "https://www.conanpedia.com/images/6/6f/%E6%A8%AA%E6%B2%9F%E5%8F%82%E6%82%9F.png",
    desc: "35岁，原埼玉县，现静冈县警察本部刑事部搜查一课刑警，警衔为警部，横沟重悟的双胞胎哥哥，毛利小五郎的仰慕者，自称“毛利的大弟子”。"
  },

  // ============================================================
  // 【神奈川县警】
  // ============================================================
  {
    id: 79,
    factionKey: "kanagawa",
    nameZh: "横沟重悟",
    nameJa: "横溝重悟",
    voiceActorJa: "大冢明夫",
    avatar: "https://www.conanpedia.com/images/d/d3/%E6%A8%AA%E6%B2%9F%E9%87%8D%E6%82%9F.png",
    desc: "35岁，神奈川县警察本部刑事部搜查一课刑警，警衔为警部，横沟参悟的双胞胎弟弟，萩原千速的同事。"
  },
  {
    id: 80,
    factionKey: "kanagawa",
    nameZh: "萩原千速",
    nameJa: "萩原千速",
    voiceActorJa: "田中敦子→泽城美雪",
    avatar: "https://www.conanpedia.com/images/8/82/%E8%90%A9%E5%8E%9F%E5%8D%83%E9%80%9F.png",
    desc: "31岁，神奈川县警察本部交通部第三交通机动队小队长，警衔为警部补，萩原研二的姐姐，横沟重悟的同事，松田阵平的初恋，大江忍的朋友。"
  },

  // ============================================================
  // 【北海道警】
  // ============================================================
  {
    id: 81,
    factionKey: "hokkaido",
    nameZh: "西村京兵",
    nameJa: "西村京兵",
    voiceActorJa: "花田光",
    avatar: "https://www.conanpedia.com/images/1/1d/%E8%A5%BF%E6%9D%91%E4%BA%AC%E5%85%B5.png",
    desc: "北海道警察本部刑事部搜查一课刑警，警衔为警部。"
  },

  // ============================================================
  // 【警视厅警察学校】
  // ============================================================
  {
    id: 82,
    factionKey: "police_academy",
    nameZh: "鬼冢八藏",
    nameJa: "鬼塚八蔵",
    voiceActorJa: "大冢芳忠",
    avatar: "https://www.conanpedia.com/images/3/3d/CHARACTER_LIST_%E9%AC%BC%E5%86%A2%E5%85%AB%E8%97%8F.png",
    desc: "约55岁，警视厅警察学校初任科鬼冢班教官，警校五人组的总教官；警衔为警部补。"
  },
  {
    id: 83,
    factionKey: "police_academy",
    nameZh: "诸伏景光",
    nameJa: "諸伏景光",
    voiceActorJa: "绿川光、金元寿子（幼年）",
    avatar: "https://www.conanpedia.com/images/8/85/CHARACTER_LIST_%E8%AF%B8%E4%BC%8F%E6%99%AF%E5%85%89.png",
    desc: "2-3年前去世，卒日为12月7日，去世时约26-27岁，代号苏格兰，前警视厅公安部的公安警察，曾潜伏在黑衣组织的卧底，与降谷、松田、萩原、伊达为同期毕业生兼好友，诸伏高明的弟弟，山村操的幼年玩伴，卧底身份暴露后为不牵连亲友而自杀殉职。"
  },
  {
    id: 84,
    factionKey: "police_academy",
    nameZh: "松田阵平",
    nameJa: "松田阵平",
    voiceActorJa: "神奈延年",
    avatar: "https://www.conanpedia.com/images/6/69/CHARACTER_LIST_%E6%9D%BE%E7%94%B0%E9%98%B5%E5%B9%B3.png",
    desc: "3年前去世，卒日为11月7日，去世时26-27岁，前警视厅警备部机动队爆炸物处理班成员、警视厅刑事部搜查一课强行犯搜查三系刑警，警衔为巡查部长，与降谷、萩原、景光、伊达为同期毕业生兼好友，佐藤美和子的前辈、前同事兼搭档，萩原千速的双向初恋，在炸弹案中为保护民众而殉职。"
  },
  {
    id: 85,
    factionKey: "police_academy",
    nameZh: "萩原研二",
    nameJa: "萩原研二",
    voiceActorJa: "三木真一郎",
    avatar: "https://www.conanpedia.com/images/f/f1/CHARACTER_LIST_%E8%90%A9%E5%8E%9F%E7%A0%94%E4%BA%8C.png",
    desc: "7年前去世，卒日为11月7日，去世时22-23岁，前警视厅警备部机动队爆炸物处理班成员，与降谷、松田、景光、伊达为同期毕业生兼好友，萩原千速的弟弟，在炸弹案中为保护民众而殉职。"
  },
  {
    id: 86,
    factionKey: "police_academy",
    nameZh: "伊达航",
    nameJa: "伊達航",
    voiceActorJa: "藤原启治→东地宏树",
    avatar: "https://www.conanpedia.com/images/a/a3/CHARACTER_LIST_%E4%BC%8A%E8%BE%BE%E8%88%AA.png",
    desc: "1年前去世，卒日为2月7日，去世时约28岁，前警视厅刑事部搜查一课强行犯搜查三系刑警，与降谷、松田、萩原、景光为同期毕业生兼好友，和后辈高木涉被称为“Wataru兄弟”，娜塔莉·来间的女友，因遭遇交通事故而殉职。"
  },

  // ============================================================
  // 【帝丹高中】
  // ============================================================
  {
    id: 87,
    factionKey: "teitan_high",
    nameZh: "冢本数美",
    nameJa: "塚本数美",
    voiceActorJa: "桑岛法子→仓田雅世",
    avatar: "https://www.conanpedia.com/images/3/3b/%E5%86%A2%E6%9C%AC%E6%95%B0%E7%BE%8E.png",
    desc: "18岁，帝丹高中3年级学生，空手道部成员兼前主将，毛利兰的前辈。"
  },
  {
    id: 88,
    factionKey: "teitan_high",
    nameZh: "本堂瑛祐",
    nameJa: "本堂瑛祐",
    voiceActorJa: "野田顺子",
    avatar: "https://www.conanpedia.com/images/0/05/CHARACTER_LIST_%E6%9C%AC%E5%A0%82%E7%91%9B%E7%A5%90.png",
    desc: "17岁，原帝丹高中2年B班学生，前书法部成员，伊森·本堂的长子，本堂瑛海的弟弟。现阶段在美国留学并准备加入CIA。"
  },
  {
    id: 89,
    factionKey: "teitan_high",
    nameZh: "中道",
    nameJa: "中道",
    voiceActorJa: "山崎巧→坪井智浩→福岛润→松本健太",
    avatar: "https://www.conanpedia.com/images/e/ee/%E4%B8%AD%E9%81%93_1.png",
    desc: "约16-17岁，帝丹高中2年B班学生，足球部成员。"
  },

  // ============================================================
  // 【杯户高中】
  // ============================================================
  {
    id: 90,
    factionKey: "haido_high",
    nameZh: "京极真",
    nameJa: "京極真",
    voiceActorJa: "桧山修之、泷本富士子（幼年）",
    avatar: "https://www.conanpedia.com/images/1/13/CHARACTER_LIST_%E4%BA%AC%E6%9E%81%E7%9C%9F.png",
    desc: "18岁，原杯户高中3年级学生，铃木园子的男友，前空手道部主将，全日本空手道黑带冠军，拥有连胜400项大赛的记录，被称为“蹴击贵公子”和“冲撞王子”。现阶段在美国留学修行。"
  },

  // ============================================================
  // 【江古田高中】
  // ============================================================
  {
    id: 91,
    factionKey: "ekoda_high",
    nameZh: "黑羽快斗",
    nameJa: "黒羽快斗",
    voiceActorJa: "山口胜平",
    avatar: "https://www.conanpedia.com/images/5/5f/%E9%BB%91%E7%BE%BD%E5%BF%AB%E6%96%97.png",
    desc: "生日为6月21日，17岁，江古田高中2年B班学生，黑羽盗一与黑羽千影的独子，工藤新一的堂兄弟，中森青子的青梅竹马兼同学，白马探、小泉红子与桃井惠子的同学。<br>来自《魔术快斗》，另一层身份是第二代怪盗基德。"
  },
  {
    id: 92,
    factionKey: "ekoda_high",
    nameZh: "中森青子",
    nameJa: "中森青子",
    voiceActorJa: "岩井由希子→高山南→M·A·O",
    avatar: "https://www.conanpedia.com/images/a/ad/%E4%B8%AD%E6%A3%AE%E9%9D%92%E5%AD%90.png",
    desc: "生日为9月12日，17岁，江古田高中2年B班学生，中森银三的独女，黑羽快斗的青梅竹马兼同学，白马探、小泉红子与桃井惠子的同学。<br>来自《魔术快斗》。"
  },
  {
    id: 93,
    factionKey: "ekoda_high",
    nameZh: "白马探",
    nameJa: "白馬探",
    voiceActorJa: "石田彰",
    avatar: "https://www.conanpedia.com/images/7/70/%E7%99%BD%E9%A9%AC%E6%8E%A2.png",
    desc: "生日为8月29日，17岁，江古田高中2年B班学生，侦探，白马警视总监的独子，黑羽快斗、中森青子、小泉红子与桃井惠子的同学，怪盗基德的对手。<br>来自《魔术快斗》。"
  },

  // ============================================================
  // 【京都泉心高中】
  // ============================================================
  {
    id: 94,
    factionKey: "kyoto_seishin",
    nameZh: "冲田总司",
    nameJa: "沖田総司",
    voiceActorJa: "游佐浩二",
    avatar: "https://www.conanpedia.com/images/7/70/%E5%86%B2%E7%94%B0%E6%80%BB%E5%8F%B8.png",
    desc: "约16-17岁，京都泉心高中2年级学生，大冈红叶的同班同学，剑道部成员，服部平次的对手，暗恋铁刃的妹妹铁诸羽。<br>来自《YAIBA》。"
  },
  {
    id: 95,
    factionKey: "kyoto_seishin",
    nameZh: "大冈红叶",
    nameJa: "大岡紅葉",
    voiceActorJa: "雪野五月",
    avatar: "https://www.conanpedia.com/images/5/53/Momiji.png",
    desc: "17岁，京都泉心高中2年级学生，冲田总司的同学，远山和叶的对手兼情敌，歌牌部成员，连续两年蝉联高中歌牌大赛的冠军，被称为“未来的女王”。"
  },

  // ============================================================
  // 【帝丹小学】
  // ============================================================
  {
    id: 96,
    factionKey: "teitan_elem",
    nameZh: "植松龙司郎",
    nameJa: "植松竜司郎",
    voiceActorJa: "清川元梦→辻亲八",
    avatar: "https://www.conanpedia.com/images/4/41/%E6%A4%8D%E6%9D%BE%E9%BE%99%E5%8F%B8%E9%83%8E.png",
    desc: "59岁，帝丹小学校长。"
  },
  {
    id: 97,
    factionKey: "teitan_elem",
    nameZh: "小林澄子",
    nameJa: "小林澄子",
    voiceActorJa: "加藤有生子",
    avatar: "https://www.conanpedia.com/images/3/33/%E5%B0%8F%E6%9E%97%E6%BE%84%E5%AD%90.png",
    desc: "26岁，帝丹小学1年B班班主任，第18届毕业生，自称少年侦探团顾问，白鸟任三郎的青梅竹马兼女友。"
  },
  {
    id: 98,
    factionKey: "teitan_elem",
    nameZh: "若狭留美",
    nameJa: "若狭留美",
    voiceActorJa: "平野文",
    avatar: "https://www.conanpedia.com/images/9/94/%E8%8B%A5%E7%8B%AD%E7%95%99%E7%BE%8E.png",
    desc: "37岁，帝丹小学1年B班副班主任。<br>原为阿曼达·休斯的养女兼保镖蕾切尔·浅香。"
  },
  {
    id: 99,
    factionKey: "teitan_elem",
    nameZh: "东尾玛利亚",
    nameJa: "東尾マリア",
    voiceActorJa: "白鸟由里→松冈由贵",
    avatar: "https://www.conanpedia.com/images/8/80/%E4%B8%9C%E5%B0%BE%E7%8E%9B%E5%88%A9%E4%BA%9A.png",
    desc: "7岁，帝丹小学1年B班学生。"
  },
  {
    id: 100,
    factionKey: "teitan_elem",
    nameZh: "坂本琢马",
    nameJa: "坂本琢馬",
    voiceActorJa: "爱河里花子→青山桐子",
    avatar: "https://www.conanpedia.com/images/4/4f/CHARACTER_LIST_%E5%9D%82%E6%9C%AC%E7%90%A2%E9%A9%AC.png",
    desc: "7岁，帝丹小学1年B班学生。"
  },
  {
    id: 101,
    factionKey: "teitan_elem",
    nameZh: "伊东惠",
    nameJa: "伊東めぐみ",
    voiceActorJa: "{{示亡号",
    avatar: "https://www.conanpedia.com/images/2/23/CHARACTER_LIST_%E4%BC%8A%E4%B8%9C%E6%83%A0.png",
    desc: "7岁，帝丹小学1年级C班学生、玉之助一座旅行剧团演员，伊东玉之助的妹妹，江户川柯南的同年级同学。"
  },

  // ============================================================
  // 【铃木财团】
  // ============================================================
  {
    id: 102,
    factionKey: "suzuki_group",
    nameZh: "铃木次郎吉",
    nameJa: "鈴木次郎吉",
    voiceActorJa: "永井一郎→富田耕生→佐藤正治",
    avatar: "https://www.conanpedia.com/images/e/ea/%E9%93%83%E6%9C%A8%E6%AC%A1%E9%83%8E%E5%90%89.png",
    desc: "72岁，铃木财团顾问，铃木史郎的堂兄，铃木绫子与铃木园子的堂伯父，中森银三的合作伙伴，以擒拿怪盗基德为人生最重要的目标。"
  },
  {
    id: 103,
    factionKey: "suzuki_group",
    nameZh: "铃木史郎",
    nameJa: "鈴木史郎",
    voiceActorJa: "松冈文雄",
    avatar: "https://www.conanpedia.com/images/3/34/%E9%93%83%E6%9C%A8%E5%8F%B2%E9%83%8E.png",
    desc: "51岁，铃木财团董事长，铃木朋子的丈夫，铃木绫子与铃木园子的父亲。"
  },
  {
    id: 104,
    factionKey: "suzuki_group",
    nameZh: "铃木朋子",
    nameJa: "鈴木朋子",
    voiceActorJa: "一柳美琉",
    avatar: "https://www.conanpedia.com/images/e/ed/CHARACTER_LIST_%E9%93%83%E6%9C%A8%E6%9C%8B%E5%AD%90.png",
    desc: "43岁，铃木财团董事长夫人，铃木史郎的妻子，铃木绫子与铃木园子的母亲，十分热衷于抓住怪盗基德。"
  },
  {
    id: 105,
    factionKey: "suzuki_group",
    nameZh: "铃木绫子",
    nameJa: "鈴木綾子",
    voiceActorJa: "元井须美子→铃鹿千春",
    avatar: "https://www.conanpedia.com/images/d/d0/%E9%93%83%E6%9C%A8%E7%BB%AB%E5%AD%901.png",
    desc: "24岁，大学研究生，铃木财团大千金，铃木史郎与铃木朋子的长女，铃木园子的姐姐，富泽雄三的未婚妻。"
  },

  // ============================================================
  // 【新出医院】
  // ============================================================
  {
    id: 106,
    factionKey: "araide_hospital",
    nameZh: "新出智明",
    nameJa: "新出智明",
    voiceActorJa: "堀秀行",
    avatar: "https://www.conanpedia.com/images/d/da/%E6%96%B0%E5%87%BA%E6%99%BA%E6%98%8E1.png",
    desc: "25岁，新出医院医生兼帝丹高中校医，东京医科大学高材生，新出义辉的独子，新出阳子的继子，保本光的好友。"
  },

  // ============================================================
  // 【小仓拉面店】
  // ============================================================
  {
    id: 107,
    factionKey: "ramen_ogura",
    nameZh: "小仓功雅",
    nameJa: "小倉功雅",
    voiceActorJa: "鱼建",
    avatar: "https://www.conanpedia.com/images/c/c6/%E5%B0%8F%E4%BB%93%E5%8A%9F%E9%9B%851.png",
    desc: "49岁，小仓拉面店店主，“阎魔大王拉面”的发明者，曾在杯户町开店多年，后搬至米花町继续经营。"
  },
  {
    id: 108,
    factionKey: "ramen_ogura",
    nameZh: "大桥彩代",
    nameJa: "大橋彩代",
    voiceActorJa: "平松晶子",
    avatar: "https://www.conanpedia.com/images/2/2c/%E5%A4%A7%E6%A1%A5%E5%BD%A9%E4%BB%A3.png",
    desc: "28岁，小仓拉面店兼职女店员。"
  },

  // ============================================================
  // 【玉木书店】
  // ============================================================
  {
    id: 109,
    factionKey: "tamaki_books",
    nameZh: "玉木裕次郎",
    nameJa: "玉木裕次郎",
    voiceActorJa: "牛山茂",
    avatar: "https://www.conanpedia.com/images/c/c0/%E7%8E%89%E6%9C%A8%E8%A3%95%E6%AC%A1%E9%83%8E.png",
    desc: "65岁，玉木书店店长，玉木一朗的父亲。"
  },
  {
    id: 110,
    factionKey: "tamaki_books",
    nameZh: "玉木一朗",
    nameJa: "玉木一朗",
    voiceActorJa: "志村贵博",
    avatar: "https://www.conanpedia.com/images/d/dd/%E7%8E%89%E6%9C%A8%E4%B8%80%E6%9C%97.png",
    desc: "35岁，玉木书店店员，玉木裕次郎的儿子。"
  },
  {
    id: 111,
    factionKey: "tamaki_books",
    nameZh: "吉川美知子",
    nameJa: "吉川美知子",
    voiceActorJa: "宫川美保",
    avatar: "https://www.conanpedia.com/images/c/cf/%E5%90%89%E5%B7%9D%E7%BE%8E%E7%9F%A5%E5%AD%90.png",
    desc: "27岁，玉木书店店员，玉木一朗的未婚妻。"
  },

  // ============================================================
  // 【金子珠宝店】
  // ============================================================
  {
    id: 112,
    factionKey: "kaneko_jewelry",
    nameZh: "金子圭太",
    nameJa: "金子圭太",
    voiceActorJa: "落合弘治",
    avatar: "https://www.conanpedia.com/images/9/99/%E9%87%91%E5%AD%90%E5%9C%AD%E5%A4%AA.png",
    desc: "57岁，金子珠宝店店主，其经营的珠宝店经常遭遇抢劫。"
  },

  // ============================================================
  // 【将棋手】
  // ============================================================
  {
    id: 113,
    factionKey: "shogi_player",
    nameZh: "羽田浩司",
    nameJa: "羽田浩司",
    voiceActorJa: "安元洋贵",
    avatar: "https://www.conanpedia.com/images/d/df/CHARACTER_LIST_%E7%BE%BD%E7%94%B0%E6%B5%A9%E5%8F%B8.png",
    desc: "17年前去世，去世时28岁，职业将棋棋手，四冠王，羽田康晴与羽田市代的独子，羽田秀吉的义兄，阿曼达·休斯的偶像，为保护浅香被朗姆殴打灌药致死。"
  },
  {
    id: 114,
    factionKey: "shogi_player",
    nameZh: "羽田秀吉",
    nameJa: "羽田秀𠮷",
    voiceActorJa: "森川智之、甲斐田幸（少年）",
    avatar: "https://www.conanpedia.com/images/b/b2/CHARACTER_Haneda_Shukichi.png",
    desc: "28岁，曾姓赤井和世良，职业将棋棋手，六冠王，赤井务武与世良玛丽的次子，赤井秀一的弟弟，世良真纯的二哥，羽田家养子，羽田浩司的义弟，宫本由美的男友。"
  },
  {
    id: 115,
    factionKey: "shogi_player",
    nameZh: "胜又力",
    nameJa: "勝又力",
    voiceActorJa: "稻叶实",
    avatar: "https://www.conanpedia.com/images/7/7d/CHARACTER_Katsumata_Chikara.png",
    desc: "职业将棋棋手，羽田浩司与羽田秀吉的对手。"
  },

  // ============================================================
  // 【足球运动员】
  // ============================================================
  {
    id: 116,
    factionKey: "soccer_player",
    nameZh: "赤木英雄",
    nameJa: "赤木英雄",
    voiceActorJa: "辻谷耕史",
    avatar: "https://www.conanpedia.com/images/3/3c/CHARACTER_%E8%B5%A4%E6%9C%A8%E8%8B%B1%E9%9B%84_1.png",
    desc: "19岁，米花高中毕业生，东京SPIRITS队前锋，队内号码为11，赤木守的哥哥，上村直树的队友兼同学，侦探团三人的偶像。"
  },
  {
    id: 117,
    factionKey: "soccer_player",
    nameZh: "上村直树",
    nameJa: "上村直樹",
    voiceActorJa: "矢尾一树",
    avatar: "https://www.conanpedia.com/images/3/33/CHARACTER_%E4%B8%8A%E6%9D%91%E7%9B%B4%E6%A0%91_1.png",
    desc: "约19岁，米花高中毕业生，东京SPIRITS队前锋，队内号码为9，赤木英雄的队友兼同学，侦探团三人的偶像。"
  },
  {
    id: 118,
    factionKey: "soccer_player",
    nameZh: "比护隆佑",
    nameJa: "比護隆佑",
    voiceActorJa: "樱井孝宏",
    avatar: "https://www.conanpedia.com/images/3/32/CHARACTER_LIST_%E6%AF%94%E6%8A%A4%E9%9A%86%E4%BD%91.png",
    desc: "港南高中毕业生，BIG大阪队前锋，队内号码为9，冲野洋子的学长，真田贵大的队友，灰原哀的偶像。"
  },
  {
    id: 119,
    factionKey: "soccer_player",
    nameZh: "真田贵大",
    nameJa: "真田貴大",
    voiceActorJa: "吉野裕行",
    avatar: "https://www.conanpedia.com/images/d/de/%E7%9C%9F%E7%94%B0%E8%B4%B5%E5%A4%A7.png",
    desc: "18岁，BIG大阪队替补前锋，队内号码为19，比护隆佑的队友。"
  },

  // ============================================================
  // 【魔术师】
  // ============================================================
  {
    id: 120,
    factionKey: "magician",
    nameZh: "黑羽盗一",
    nameJa: "黒羽盗一",
    voiceActorJa: "池田秀一",
    avatar: "https://www.conanpedia.com/images/d/d1/%E9%BB%91%E7%BE%BD%E7%9B%97%E4%B8%80.png",
    desc: "著名魔术师，黑羽千影的丈夫，黑羽快斗的父亲，工藤优作的双胞胎哥哥兼对手，工藤有希子与贝尔摩德的师傅。8年前在魔术表演中遭遇意外，表面上已经去世，实际上依旧存活并与工藤优作保持联系。<br>来自《魔术快斗》，另两层身份是第一代怪盗基德和怪盗乌鸦。"
  },
  {
    id: 121,
    factionKey: "magician",
    nameZh: "第一代怪盗基德",
    nameJa: "初代怪盗キッド",
    voiceActorJa: "池田秀一",
    avatar: "https://www.conanpedia.com/images/c/c9/%E7%AC%AC%E4%B8%80%E4%BB%A3%E6%80%AA%E7%9B%97%E5%9F%BA%E5%BE%B7.png",
    desc: "怪盗魔术师，工藤优作的对手，中森银三的抓捕对象，国际犯罪代号1412。<br>来自《魔术快斗》，真实身份是黑羽盗一。"
  },
  {
    id: 122,
    factionKey: "magician",
    nameZh: "怪盗乌鸦",
    nameJa: "怪盗コルボー",
    voiceActorJa: "池田秀一",
    avatar: "https://www.conanpedia.com/images/c/cb/%E6%80%AA%E7%9B%97%E4%B9%8C%E9%B8%A6.png",
    desc: "如乌鸦般一身漆黑的怪盗魔术师，外貌如同黑色的怪盗基德。<br>来自《魔术快斗》，真实身份是黑羽盗一。"
  },
  {
    id: 123,
    factionKey: "magician",
    nameZh: "真田一三",
    nameJa: "真田一三",
    voiceActorJa: "置鲇龙太郎",
    avatar: "https://www.conanpedia.com/images/6/69/%E7%9C%9F%E7%94%B0%E4%B8%80%E4%B8%892.png",
    desc: "27岁。知名魔术师，奇迹魔术团的王牌成员。"
  },

  // ============================================================
  // 【艺人】
  // ============================================================
  {
    id: 124,
    factionKey: "entertainer",
    nameZh: "冲野洋子",
    nameJa: "沖野ヨーコ",
    voiceActorJa: "天野由梨→长泽美树、筱原智子→伊织→三枝夕夏（演唱）",
    avatar: "https://www.conanpedia.com/images/9/91/CHARACTER_LIST_%E5%86%B2%E9%87%8E%E6%B4%8B%E5%AD%90.png",
    desc: "22岁，多栖艺人，日卖电视台主持人，港南高中毕业生，与草野薰、岳野雪、星野辉美共同组成偶像组合“地球淑女队”，毛利小五郎的偶像兼支持者，水无怜奈的友人兼前同事，风见裕也的偶像，比护隆佑的高中后辈。"
  },
  {
    id: 125,
    factionKey: "entertainer",
    nameZh: "剑崎修",
    nameJa: "剣崎修",
    voiceActorJa: "江川央生",
    avatar: "https://www.conanpedia.com/images/1/12/%E5%89%91%E5%B4%8E%E4%BF%AE.png",
    desc: "26岁，演员兼主持人，人气推理剧《侦探左文字》的主演，岳野雪的未婚夫，冲野洋子、草野薰与星野辉美的友人。"
  },
  {
    id: 126,
    factionKey: "entertainer",
    nameZh: "岳野雪",
    nameJa: "岳野ユキ",
    voiceActorJa: "坂本真绫",
    avatar: "https://www.conanpedia.com/images/0/02/%E5%B2%B3%E9%87%8E%E9%9B%AA1.png",
    desc: "22岁，多栖艺人，与冲野洋子、草野薰、星野辉美共同组成偶像组合“地球淑女队”，剑崎修的未婚妻。"
  },
  {
    id: 127,
    factionKey: "entertainer",
    nameZh: "伊东玉之助",
    nameJa: "伊東玉之助",
    voiceActorJa: "保志总一朗",
    avatar: "https://www.conanpedia.com/images/f/f9/CHARACTER_LIST_%E4%BC%8A%E4%B8%9C%E7%8E%89%E4%B9%8B%E5%8A%A9.png",
    desc: "17岁，原帝丹高中2年B班学生、玉之助一座旅行剧团座长，伊东惠的哥哥，毛利兰的同学。"
  },
  {
    id: 128,
    factionKey: "entertainer",
    nameZh: "片冈莲华",
    nameJa: "片岡れんげ",
    voiceActorJa: "高野直子",
    avatar: "https://www.conanpedia.com/images/4/4b/CHARACTER_LIST_%E7%89%87%E5%86%88%E8%8E%B2%E5%8D%8E.png",
    desc: "17岁，玉之助一座旅行剧团女演员，伊东玉之助的搭档。"
  },
  {
    id: 129,
    factionKey: "entertainer",
    nameZh: "光本兵我",
    nameJa: "光本兵我",
    voiceActorJa: "梶原岳人",
    avatar: "https://www.conanpedia.com/images/e/e1/%E5%85%89%E6%9C%AC%E5%85%B5%E6%88%91.png",
    desc: "偶像组合“浪花少年”成员，著名男演员。"
  },

  // ============================================================
  // 【知名人士】
  // ============================================================
  {
    id: 130,
    factionKey: "celebrity",
    nameZh: "板仓卓",
    nameJa: "板倉卓",
    voiceActorJa: "大友龙三郎",
    avatar: "https://www.conanpedia.com/images/c/c2/%E6%9D%BF%E4%BB%93%E5%8D%93.png",
    desc: "45岁，前电影CG特效制作师，软件工程师，2年前被龙舌兰胁迫开发“逆转时间”的软件，后在交易前被他人暗算，来不及吃药而死于心脏病。"
  },
  {
    id: 131,
    factionKey: "celebrity",
    nameZh: "芙莎绘·坎贝尔·木之下",
    nameJa: "フサエ·キャンベル·木之下",
    voiceActorJa: "增山江威子、本多知惠子（幼年）",
    avatar: "https://www.conanpedia.com/images/d/da/%E8%8A%99%E8%8E%8E%E7%BB%98%C2%B7%E5%9D%8E%E8%B4%9D%E5%B0%94%C2%B7%E6%9C%A8%E4%B9%8B%E4%B8%8B.png",
    desc: "约51岁，芙莎绘品牌公司社长，国际知名时尚设计师，阿笠博士的初恋。"
  },
  {
    id: 132,
    factionKey: "celebrity",
    nameZh: "阿曼达·休斯",
    nameJa: "アマンダ·ヒューズ",
    voiceActorJa: "富永美衣奈",
    avatar: "https://www.conanpedia.com/images/8/89/CHARACTER_LIST_%E9%98%BF%E6%9B%BC%E8%BE%BE%C2%B7%E4%BC%91%E6%96%AF.png",
    desc: "17年前去世，去世时81岁，美国银行家，蕾切尔·浅香的养母，羽田浩司的狂热粉丝，在FBI与CIA之间相当有地位，为保护浅香主动吞下APTX-4869自杀身亡。"
  },

  // ============================================================
  // 【亲属与友人】
  // ============================================================
  {
    id: 133,
    factionKey: "family_friend",
    nameZh: "山岸荣一",
    nameJa: "山岸栄一",
    voiceActorJa: "一条和矢",
    avatar: "https://www.conanpedia.com/images/3/3b/CHARACTER_LIST_%E5%B1%B1%E5%B2%B8%E8%8D%A3%E4%B8%80.png",
    desc: "冲野洋子的经纪人。"
  },
  {
    id: 134,
    factionKey: "family_friend",
    nameZh: "吉田步美的母亲",
    nameJa: "吉田歩美の母親",
    voiceActorJa: "佐藤忍",
    avatar: "assets/images/placeholder.svg",
    desc: "吉田步美的母亲，在《名侦探柯南》本篇从未展现过清晰的面貌。"
  },
  {
    id: 135,
    factionKey: "family_friend",
    nameZh: "江户川文代",
    nameJa: "江戸川文代",
    voiceActorJa: "高畑淳子",
    avatar: "https://www.conanpedia.com/images/6/6d/%E6%B1%9F%E6%88%B7%E5%B7%9D%E6%96%87%E4%BB%A3.png",
    desc: "自称江户川柯南的母亲。<br>真实身份是工藤新一的母亲工藤有希子。"
  },
  {
    id: 136,
    factionKey: "family_friend",
    nameZh: "富泽雄三",
    nameJa: "富沢雄三",
    voiceActorJa: "松本保典",
    avatar: "https://www.conanpedia.com/images/d/d0/%E5%AF%8C%E6%B3%BD%E9%9B%84%E4%B8%891.png",
    desc: "28岁，富泽财团三公子，铃木绫子的未婚夫。"
  },
  {
    id: 137,
    factionKey: "family_friend",
    nameZh: "佐藤美和子的母亲",
    nameJa: "佐藤美和子の母親",
    voiceActorJa: "秋元千贺子、岩居由希子（青年）",
    avatar: "https://www.conanpedia.com/images/b/b3/%E7%BE%8E%E5%92%8C%E5%AD%90%E7%9A%84%E6%AF%8D%E4%BA%B2.png",
    desc: "佐藤正义的妻子，佐藤美和子的母亲。"
  },
  {
    id: 138,
    factionKey: "family_friend",
    nameZh: "目暮绿",
    nameJa: "目暮みどり",
    voiceActorJa: "折笠爱",
    avatar: "https://www.conanpedia.com/images/8/8b/%E7%9B%AE%E6%9A%AE%E7%BB%BF.png",
    desc: "目暮十三的妻子，高中时期的不良少女。"
  },
  {
    id: 139,
    factionKey: "family_friend",
    nameZh: "寺井黄之助",
    nameJa: "寺井黄之助",
    voiceActorJa: "肝付兼太、陶山章央（青年）",
    avatar: "https://www.conanpedia.com/images/b/bd/%E5%AF%BA%E4%BA%95%E9%BB%84%E4%B9%8B%E5%8A%A9.png",
    desc: "61岁，两代怪盗基德助手，台球酒吧老板，黑羽盗一生前的魔术助手，阿笠博士的老相识。<br>来自《魔术快斗》。"
  },
  {
    id: 140,
    factionKey: "family_friend",
    nameZh: "服部静华",
    nameJa: "服部静華",
    voiceActorJa: "胜生真沙子",
    avatar: "https://www.conanpedia.com/images/f/f4/%E6%9C%8D%E9%83%A8%E9%9D%99%E5%8D%8E.png",
    desc: "42岁，旧姓池波，全职家庭主妇，剑道高手，前歌牌女王，服部平藏的妻子，服部平次的母亲。"
  },
  {
    id: 141,
    factionKey: "family_friend",
    nameZh: "鸭井五十吉",
    nameJa: "鴨井五十吉",
    voiceActorJa: "长克巳",
    avatar: "https://www.conanpedia.com/images/e/e0/%E9%B8%AD%E4%BA%95%E4%BA%94%E5%8D%81%E5%90%89.png",
    desc: "白鸟家管家。"
  },
  {
    id: 142,
    factionKey: "family_friend",
    nameZh: "圆谷朝美",
    nameJa: "円谷朝美",
    voiceActorJa: "大谷育江",
    avatar: "https://www.conanpedia.com/images/b/bb/CHARACTER_LIST_%E5%9C%86%E8%B0%B7%E6%9C%9D%E7%BE%8E.png",
    desc: "初中生，圆谷光彦的姐姐，三途之Ⅲ乐团的歌迷。"
  },
  {
    id: 143,
    factionKey: "family_friend",
    nameZh: "山村美纱绘",
    nameJa: "山村ミサエ",
    voiceActorJa: "古川登志夫→堀绚子",
    avatar: "https://www.conanpedia.com/images/6/66/%E5%B1%B1%E6%9D%91%E7%BE%8E%E7%BA%B1%E7%BB%98.png",
    desc: "85岁，山村操的奶奶，家乡在鸟取县八头町。"
  },
  {
    id: 144,
    factionKey: "family_friend",
    nameZh: "小岛元次",
    nameJa: "小嶋元次",
    voiceActorJa: "野岛昭生",
    avatar: "https://www.conanpedia.com/images/a/ad/%E5%B0%8F%E5%B2%9B%E5%85%83%E6%AC%A1.png",
    desc: "32岁，地道的江户人，小岛酒铺老板，小岛元太的父亲。"
  },
  {
    id: 145,
    factionKey: "family_friend",
    nameZh: "黑羽千影",
    nameJa: "黒羽千影",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/0/03/CHARACTER_LIST_%E9%BB%91%E7%BE%BD%E5%8D%83%E5%BD%B1.png",
    desc: "黑羽盗一的妻子，黑羽快斗的母亲。<br>来自《魔术快斗》，另一层身份是怪盗淑女。"
  },
  {
    id: 146,
    factionKey: "family_friend",
    nameZh: "怪盗淑女",
    nameJa: "怪盗淑女",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/c/c4/%E6%80%AA%E7%9B%97%E6%B7%91%E5%A5%B3.png",
    desc: "已然隐退的怪盗，被称为“昭和时代的女二十面相”，第二代怪盗基德曾向江户川柯南暗示怪盗淑女是自己的母亲。<br>真实身份是黑羽千影。"
  },
  {
    id: 147,
    factionKey: "family_friend",
    nameZh: "米原樱子",
    nameJa: "米原桜子",
    voiceActorJa: "丹下樱",
    avatar: "https://www.conanpedia.com/images/9/96/%E7%B1%B3%E5%8E%9F%E6%A8%B1%E5%AD%90.png",
    desc: "23岁，女佣，三池苗子的好友。"
  },
  {
    id: 148,
    factionKey: "family_friend",
    nameZh: "鬼丸猛",
    nameJa: "鬼丸猛",
    voiceActorJa: "堀川亮→津田健次郎",
    avatar: "https://www.conanpedia.com/images/6/6d/%E9%AC%BC%E4%B8%B8%E7%8C%9B.png",
    desc: "高中生，第41-43届日本剑道锦标赛男子组冠军，铁刃的对手，冲田总司的友人。<br>来自《YAIBA》。"
  },
  {
    id: 149,
    factionKey: "family_friend",
    nameZh: "石川元气",
    nameJa: "石川元気",
    voiceActorJa: "松野太纪→三矢雄二",
    avatar: "https://www.conanpedia.com/images/e/e5/%E7%9F%B3%E5%B7%9D%E5%85%83%E6%B0%94_%E5%8D%A1%E7%89%87%E5%9B%BE.png",
    desc: "25岁，出租车司机，毛利小五郎的友人兼爱慕者，江户川柯南的友人。<br>"
  },
  {
    id: 150,
    factionKey: "family_friend",
    nameZh: "大井宏树",
    nameJa: "大井宏樹",
    voiceActorJa: "乃村健次",
    avatar: "https://www.conanpedia.com/images/d/d8/%E5%A4%A7%E4%BA%95%E5%AE%8F%E6%A0%91.png",
    desc: "36岁，律师，江户川柯南、毛利兰、毛利小五郎的友人。"
  },
  {
    id: 151,
    factionKey: "family_friend",
    nameZh: "大江忍",
    nameJa: "大江忍",
    voiceActorJa: "今野宏美",
    avatar: "https://www.conanpedia.com/images/1/1b/%E5%A4%A7%E6%B1%9F%E5%BF%8D.png",
    desc: "约31岁，萩原千速的好友兼高中同学。"
  },
  {
    id: 152,
    factionKey: "family_friend",
    nameZh: "远山樱",
    nameJa: "遠山桜",
    voiceActorJa: "无",
    avatar: "assets/images/placeholder.svg",
    desc: "原大阪府警枪械对策部队的精锐，远山银司郎的妻子，远山和叶的母亲。"
  },

  // ============================================================
  // 【宠物】
  // ============================================================
  {
    id: 153,
    factionKey: "pet",
    nameZh: "小麿",
    nameJa: "マロ",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/2/21/%E5%B0%8F%E9%BA%BF.png",
    desc: "绫小路文麿饲养的花栗鼠。"
  },
  {
    id: 154,
    factionKey: "pet",
    nameZh: "鲁邦",
    nameJa: "ルパン",
    voiceActorJa: "不明→高木涉",
    avatar: "https://www.conanpedia.com/images/1/11/CHARACTER_LIST_%E9%B2%81%E9%82%A6.png",
    desc: "雄性，铃木次郎吉饲养的爱犬。"
  },
  {
    id: 155,
    factionKey: "pet",
    nameZh: "咕噜",
    nameJa: "ゴロ",
    voiceActorJa: "青山快斗→高山南",
    avatar: "https://www.conanpedia.com/images/b/bc/%E5%92%95%E5%99%9C.png",
    desc: "雄性，妃英理饲养的俄罗斯蓝猫。"
  },
  {
    id: 156,
    factionKey: "pet",
    nameZh: "大尉",
    nameJa: "大尉",
    voiceActorJa: "藤田彩",
    avatar: "https://www.conanpedia.com/images/f/ff/CHARACTER_LIST_%E5%A4%A7%E5%B0%89.png",
    desc: "雄性，榎本梓收养的三色猫。"
  },

  // ============================================================
  // 【虚构角色】
  // ============================================================
  {
    id: 157,
    factionKey: "fictional",
    nameZh: "假面超人",
    nameJa: "仮面ヤイバー",
    voiceActorJa: "高木涉、千叶一伸（临时）",
    avatar: "https://www.conanpedia.com/images/a/aa/CHARACTER_LIST_%E5%81%87%E9%9D%A2%E8%B6%85%E4%BA%BA.png",
    desc: "剧中剧《假面超人》的主角，捍卫正义的超人，在少年儿童中人气较高。"
  },
  {
    id: 158,
    factionKey: "fictional",
    nameZh: "暗夜男爵",
    nameJa: "闇の男爵",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/2/28/CHARACTER_LIST_%E6%9A%97%E5%A4%9C%E7%94%B7%E7%88%B5.png",
    desc: "以工藤优作所著小说为原作的剧中剧《暗夜男爵》的主角，行动诡秘的怪人。"
  },
  {
    id: 159,
    factionKey: "fictional",
    nameZh: "哥美拉",
    nameJa: "ゴメラ",
    voiceActorJa: "无",
    avatar: "https://www.conanpedia.com/images/b/b3/CHARACTER_LIST_%E5%93%A5%E7%BE%8E%E6%8B%89.png",
    desc: "剧中剧《大怪兽哥美拉》的主角，巨型怪兽。"
  },
  {
    id: 160,
    factionKey: "fictional",
    nameZh: "松田左文字",
    nameJa: "松田左文字",
    voiceActorJa: "铃木英一郎→江川央生",
    avatar: "https://www.conanpedia.com/images/f/fe/CHARACTER_LIST_%E6%9D%BE%E7%94%B0%E5%B7%A6%E6%96%87%E5%AD%97.png",
    desc: "以新名任太朗、新名香保里所著小说为原作的剧中剧《侦探左文字》的主角，侦探，真人剧中由剑崎修饰演。"
  },
];

// ==================== 导出模块 ====================
// 可供其他JavaScript文件引用的数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { factionGroups, characterData };
}
