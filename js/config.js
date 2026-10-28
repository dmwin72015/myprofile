/**
 * ==============================================================================
 * Minecraft Cottage - Centralized Configuration (Family Edition)
 * ==============================================================================
 * 包含爸爸、妈妈、大女儿、小女儿四位家庭成员的核心档案与设定！
 * 支持在右上角【⚙️ 角色编辑器】中随时在线替换任何家庭成员的头像、姓名与简介。
 */

window.MINECRAFT_CONFIG = {
  // ----------------------------------------------------------------------------
  // 1. 家庭成员档案 (4 Family Members: Dad, Mom, Daughter 1, Daughter 2)
  // ----------------------------------------------------------------------------
  family: {
    dad: {
      id: "dad",
      name: "史蒂夫 (爸爸)",
      title: "全栈红石工程师 · 方块世界的建筑师",
      role: "户主 / 工程师",
      photo: "assets/steve_avatar.svg",
      skinColors: {
        shirt: '#00aaaa', // 经典蓝绿色工匠衬衫
        pants: '#2d288a', // 耐磨工作裤
        hair: '#4a3321',  // 棕色短发
        skin: '#c68a5c'   // 健康小麦肤色
      },
      scale: 1.0,
      quote: "“用红石的精密逻辑构建系统，用黑曜石的坚韧守护我们温暖的家。”",
      bio: [
        "方块小屋的建造者与全栈攻城狮。白天攻克系统架构与各类疑难 Bug，夜晚在附魔台前打磨优雅的交互设计。",
        "坚信‘只要红石粉充足、逻辑时钟稳定，就没有搭不出的数字奇迹’。",
        "最幸福的时刻就是陪老婆在露台喝咖啡，看两个宝贝女儿在院子里追逐嬉戏。"
      ],
      spawn: { x: -13.5, z: -19, label: "爸爸的红石研发室" },
      favoriteSpot: "computer",
      heldItem: "assets/sword.svg",
      heldItemName: "全栈红石神剑"
    },

    mom: {
      id: "mom",
      name: "艾利克斯 (妈妈)",
      title: "方块小屋的女主人 · 治愈系生活美学家",
      role: "女主人 / 生活家",
      photo: "assets/mom_avatar.svg",
      skinColors: {
        shirt: '#ff6b8b', // 温暖玫瑰粉上衣
        pants: '#e05368', // 优雅长裙色调
        hair: '#5a3821',  // 栗色温婉长发
        skin: '#fce2cd',  // 白皙肤色
        isDress: true
      },
      scale: 0.96,
      quote: "“阳光、咖啡、盛开的花朵与一家人的欢笑，是方块世界最珍贵的宝藏。”",
      bio: [
        "方块小屋的首席审美官与温暖守护者。擅长烹饪手作、室内设计与打造温馨的生活空间。",
        "把屋后的小花园和咖啡露台打理得如诗如画，常常给全家人准备惊喜的下午茶点心。",
        "拥有包容一切的温柔力量，是全家人最安心的心灵港湾。"
      ],
      spawn: { x: 2, z: -8, label: "咖啡休闲吧" },
      favoriteSpot: "coffee",
      heldItem: "assets/golden_apple.svg",
      heldItemName: "爱心治愈金苹果"
    },

    daughter1: {
      id: "daughter1",
      name: "大女儿 (小悦悦)",
      title: "元气小探险家 · 街机高分纪录保持者",
      role: "大女儿 / 科学画师",
      photo: "assets/daughter1_avatar.svg",
      skinColors: {
        shirt: '#f6b93b', // 元气姜黄色卫衣
        pants: '#4a69bd', // 活泼牛仔背带裤
        hair: '#6d4425',  // 扎着俏皮发夹的马尾
        skin: '#ffecd9',
        isDress: false
      },
      scale: 0.82,
      quote: "“爸爸你看，我又破了街机贪吃蛇的最高纪录啦！”",
      bio: [
        "充满奇思妙想的小学生，对自然科学、天文和像素绘画有着无限热忱。",
        "是复古街机工坊的常客，喜欢研读附魔书架上的科学百科，也喜欢带妹妹一起画画。",
        "立志将来要和爸爸一起开发出全家人都能一起玩通关的梦幻游戏大作！"
      ],
      spawn: { x: 3, z: -18, label: "儿童游乐角" },
      favoriteSpot: "arcade",
      heldItem: "assets/book.svg",
      heldItemName: "百科探险手账"
    },

    daughter2: {
      id: "daughter2",
      name: "小女儿 (小恬恬)",
      title: "快乐小精灵 · 皇家宠物驯服大师",
      role: "小女儿 / 开心果",
      photo: "assets/daughter2_avatar.svg",
      skinColors: {
        shirt: '#fd79a8', // 甜心草莓粉连衣裙
        pants: '#fab1a0',
        hair: '#794d28',  // 头戴黄色蝴蝶结
        skin: '#fff0e1',
        isDress: true
      },
      scale: 0.70,
      quote: "“派森猫猫最喜欢我了！杰斯狗狗快来追我呀~”",
      bio: [
        "全家人的贴心小棉袄与超级开心果，笑声清脆像风铃一样。",
        "是猫咪‘派森’与柴犬‘杰斯’的最佳好朋友，每天都认真负责地给它们喂小鱼干。",
        "最喜欢吃妈妈烤的小熊曲奇，以及听爸爸讲‘代码小人打败 Bug 巨龙’的睡前故事。"
      ],
      spawn: { x: -14, z: -8, label: "客厅猫咪身边" },
      favoriteSpot: "pet_cat",
      heldItem: "assets/emerald.svg",
      heldItemName: "幸运闪光绿宝石"
    }
  },

  // 当前默认激活控制的角色 ID
  activeMemberId: "dad",

  // ----------------------------------------------------------------------------
  // 2. 快捷栏导航 (Hotbar - 9 槽位)
  // ----------------------------------------------------------------------------
  hotbar: [
    { slot: 1, icon: "🪪", name: "家庭档案", target: "profile", hint: "查看全家人物档案与属性" },
    { slot: 2, icon: "💻", name: "爸爸电脑", target: "computer", hint: "全栈红石工作台" },
    { slot: 3, icon: "📦", name: "精选宝箱", target: "chest", hint: "精选独立作品与开源项目" },
    { slot: 4, icon: "📚", name: "附魔书架", target: "skills", hint: "全栈技术栈与学识技能" },
    { slot: 5, icon: "🕹️", name: "街机工坊", target: "arcade", hint: "大女儿最爱的贪吃蛇小游戏" },
    { slot: 6, icon: "☕", name: "妈妈咖啡", target: "coffee", hint: "妈妈的特调咖啡与生活美学" },
    { slot: 7, icon: "📖", name: "家族日记", target: "diary", hint: "翻阅方块小屋的温馨生活笔记" },
    { slot: 8, icon: "🏆", name: "幸福进度", target: "advancements", hint: "家庭与事业里程碑" },
    { slot: 9, icon: "✉️", name: "末影信箱", target: "mailbox", hint: "联系我们与留言互动" }
  ],

  // ----------------------------------------------------------------------------
  // 3. 作品宝箱 (Featured Projects)
  // ----------------------------------------------------------------------------
  projects: [
    {
      name: "方块云盘 (BlockCloud Storage)",
      url: "https://github.com",
      icon: "☁️",
      tag: "全栈",
      desc: "高性能多端文件协同与分布式存储网盘，支持秒传、大文件切片与实时加密协同。",
      stats: "⭐ GitHub 1.2k+ | 300+ 活跃节点"
    },
    {
      name: "红石监控台 (Redstone Monitor)",
      url: "https://github.com",
      icon: "⚡",
      tag: "工具",
      desc: "Minecraft 像素风微服务全链路监控拓扑仪表盘，让枯燥运维像玩红石一样直观。",
      stats: "⭐ 开源推荐 | 零侵入轻量代理"
    },
    {
      name: "像素画板工坊 (PixelCraft Studio)",
      url: "https://github.com",
      icon: "🎨",
      tag: "创意",
      desc: "支持多人在线协作绘制像素画的 Web 应用，给女儿们画画玩的涂鸦神器。",
      stats: "累计画作 50,000+"
    },
    {
      name: "末影信使网关 (Ender Gateway)",
      url: "https://github.com",
      icon: "🚀",
      tag: "架构",
      desc: "基于异步非阻塞事件驱动的高性能微服务消息网关，支撑数十万长连接与低延迟投递。",
      stats: "P99 响应 < 5ms"
    },
    {
      name: "体感结印施法 (Hand Jutsu Web)",
      url: "https://github.com",
      icon: "🥷",
      tag: "AI",
      desc: "基于浏览器端骨骼识别的网页体感结印游戏，对着摄像头结印瞬间呼唤忍术！",
      stats: "纯前端本地推理 60fps"
    },
    {
      name: "复古像素地牢 (Pixel Roguelike)",
      url: "https://github.com",
      icon: "🗡️",
      tag: "游戏",
      desc: "程序化生成地图、百种装备词条与回合制策略战斗的纯 Canvas 像素地牢冒险游戏。",
      stats: "独立自研 | 完整 8-bit 音效"
    }
  ],

  // ----------------------------------------------------------------------------
  // 4. 技能树 (Technical Skills)
  // ----------------------------------------------------------------------------
  skills: [
    { name: "TypeScript / JavaScript", level: 95, icon: "⚡", desc: "现代 ES 标准、类型体操与前端复杂架构设计" },
    { name: "Vue.js 3 / React 18", level: 92, icon: "⚛️", desc: "响应式核心机制、高复用组件库与性能优化" },
    { name: "Node.js / Go / Python", level: 88, icon: "🐍", desc: "高并发后端 API、分布式微服务与自动化流水线" },
    { name: "Three.js / WebGL / Canvas", level: 85, icon: "🧊", desc: "3D 场景渲染、物理交互与轻量级游戏开发" },
    { name: "Docker / K8s / Linux", level: 82, icon: "🐳", desc: "容器化微服务编排、CI/CD 自动化交付与稳定性保障" },
    { name: "MySQL / Redis / MongoDB", level: 86, icon: "🗄️", desc: "高可用数据库设计、缓存优化与海量数据索引" }
  ],

  // ----------------------------------------------------------------------------
  // 5. 咖啡吧与生活美学 (Coffee & Lifestyle)
  // ----------------------------------------------------------------------------
  coffee: [
    { name: "特调红石冰美式 (Redstone Iced Americano)", color: "#3a2012", desc: "爸爸写代码的每日续命第一选择，强劲深沉，灵感瞬间拉满。" },
    { name: "妈妈的燕麦玫瑰拿铁 (Rose Oat Latte)", color: "#8a6642", desc: "浓郁意式浓缩搭配丝滑燕麦奶与有机玫瑰蜜，充满温柔治愈的香气。" },
    { name: "大女儿的蓝莓气泡苏打 (Blueberry Fizz)", color: "#4834d4", desc: "新鲜手捣蓝莓果泥冲入冰镇气泡水，酸甜解暑，街机高分必备！" },
    { name: "小女儿的草莓棉花糖热巧 (Strawberry Choco)", color: "#e84118", desc: "香浓热可可覆盖软绵绵草莓棉花糖，甜蜜梦幻的童年滋味。" }
  ],

  // ----------------------------------------------------------------------------
  // 6. 家族冒险日记 (Family Diary)
  // ----------------------------------------------------------------------------
  diary: [
    {
      title: "方块小屋落成记",
      date: "2024年 春 · 晴",
      content: "我们在平原与绿林相拥的山谷建成了这座小屋。我和老婆一起设计了宽敞明亮的大窗户，给两个小宝贝准备了充足的游乐空间。门前种满花草，后院养了猫狗，屋里永远亮着温暖的灯火。"
    },
    {
      title: "一家人的周末街机大赛",
      date: "2025年 夏 · 凉风",
      content: "今天大女儿在街机贪吃蛇上打出了 260 分的新高，兴奋地拉着全家人看。小女儿在旁边蹦蹦跳跳喊加油，老婆端来了刚出炉的草莓泡芙。在这个充满方块的世界里，平凡的生活就是最动人的诗篇。"
    },
    {
      title: "关于爱、家庭与代码",
      date: "2026年 极光之夜",
      content: "代码是严谨的逻辑构筑，而家是包容一切温暖的港湾。无论外面的数字世界如何飞速变化，只要回到这里，推开木门，看到家人安稳灿烂的笑脸，所有的疲惫都会化作前行的力量。"
    }
  ],

  // ----------------------------------------------------------------------------
  // 7. 幸福成长进度 (Achievements)
  // ----------------------------------------------------------------------------
  advancements: [
    { id: "enter", title: "【欢迎光临】", desc: "首次踏入四口之家的温馨方块小屋", icon: "assets/torch.svg", unlocked: true },
    { id: "family_switch", title: "【全家总动员】", desc: "体验切换不同家庭成员在方块世界中漫游", icon: "assets/golden_apple.svg", unlocked: true },
    { id: "snake_master", title: "【街机小冠军】", desc: "在街机工坊中体验大女儿热爱的贪吃蛇小游戏", icon: "assets/emerald.svg", unlocked: true },
    { id: "coffee_time", title: "【咖啡时光】", desc: "造访妈妈的花园咖啡吧，品味治愈特调配方", icon: "assets/compass.svg", unlocked: true },
    { id: "all_together", title: "【最爱一家人】", desc: "与爸爸、妈妈、两个小天使共同度过美好时光", icon: "assets/elytra.svg", unlocked: true }
  ],

  // ----------------------------------------------------------------------------
  // 8. 标语池 (Splashes)
  // ----------------------------------------------------------------------------
  splashes: [
    "充满爱与欢笑的四口之家！",
    "点击右上角头像随时切换控制角色！",
    "按 W A S D 带小女儿在花园里跑跑！",
    "大女儿又刷新了街机最高分！",
    "妈妈的特调咖啡今天依然香气扑鼻！",
    "爸爸的代码今天依然没有 Bug！",
    "按 R 键可以掀开屋顶查看温馨全家福！",
    "后院的猫咪和柴犬正在晒太阳！",
    "100% 纯手工红石与爱心构筑！"
  ],

  // ----------------------------------------------------------------------------
  // 9. 社交联系
  // ----------------------------------------------------------------------------
  contact: {
    email: "steve_family@minecraft.local",
    github: "https://github.com/steve-crafter",
    bilibili: "https://space.bilibili.com",
    blog: "https://blog.crafter.me",
    wechat: "Crafter_Family"
  }
};
