/**
 * 游戏剧本数据 - 多剧本支持
 * 每个剧本包含：角色、手册、DM提示词
 */

export interface GameScript {
  id: number;
  title: string;
  genre: 'suspense' | 'scifi' | 'romance' | 'action' | 'fantasy' | 'horror' | 'other';
  characters: Character[];
  manual: ScriptManual;
  dmPrompt: string;
}

export interface Character {
  id: number;
  name: string;
  gender: string;
  age: string;
  voicePreset: string;
  personality: string;
  background: string;
  secret: string;
  motivation: string;
  roleType?: string;
}

export interface ScriptManual {
  title: string;
  overview: string;
  rules: string[];
  roles: ScriptRole[];
  tips: string[];
  genreName?: string;
  genreTheme?: string;
  winCondition?: string;
  loseCondition?: string;
  genre?: string;
}

export interface ScriptRole {
  name: string;
  description: string;
  responsibilities: string;
}

// ============================================================================
// 剧本1: 迷雾古堡 (悬疑)
// ============================================================================
const SCRIPT_1: GameScript = {
  id: 1,
  title: '迷雾古堡',
  genre: 'suspense',
  characters: [
    {
      id: 1, name: '林夜', gender: '男', age: '28', voicePreset: '沉稳男声',
      personality: '冷静沉着，善于观察，在危机中总能保持理智',
      background: '前特种部队成员，退役后在私人安保公司工作。三年前接受神秘委托，卷入黑暗世界阴谋。',
      secret: '他一直在寻找导致小队全军覆没的真凶，而那个真凶可能就在古堡中。',
      motivation: '查明真相，为死去的战友复仇',
      roleType: '守护者',
    },
    {
      id: 2, name: '苏晚晴', gender: '女', age: '25', voicePreset: '清冷女声',
      personality: '聪慧敏锐，言辞犀利，擅长心理博弈',
      background: '知名心理学博士，专攻犯罪心理学。被警方聘为特别顾问调查古堡失踪案。',
      secret: '她与古堡主人有着不为人知的过去，是唯一知道主人真正研究项目的人。',
      motivation: '阻止一项危险的心理学实验被滥用',
      roleType: '智囊',
    },
    {
      id: 3, name: '陈默', gender: '男', age: '32', voicePreset: '深沉大叔音',
      personality: '沉默寡言，行事果断，隐藏着极强的武力',
      background: '表面上是古董商人，实际上是情报贩子。掌握着大量不为人知的秘密信息。',
      secret: '他手中掌握着一份足以颠覆整个权力格局的证据文件。',
      motivation: '在各方势力之间周旋，寻找最有利的出手时机',
      roleType: '交涉者',
    },
    {
      id: 4, name: '白露', gender: '女', age: '23', voicePreset: '甜美少女音',
      personality: '外表天真无邪，内心却有着超越年龄的成熟与算计',
      background: '天才黑客少女，18岁攻破五角大楼防御系统。后被神秘组织招募为网络间谍。',
      secret: '她的真实身份是双重间谍，同时在为至少三个不同组织工作。',
      motivation: '完成自己的计划，摆脱所有组织的控制',
      roleType: '探查者',
    },
    {
      id: 5, name: '赵铁柱', gender: '男', age: '45', voicePreset: '粗犷大汉音',
      personality: '看似粗鲁直率，实则心思缜密，大智若愚',
      background: '曾经是地下拳场冠军，后来转行做私家侦探。因为离奇失踪案被卷入风波。',
      secret: '他认识古堡中的某个人，那段往事是他始终不愿提起的伤疤。',
      motivation: '找到失踪的委托人，还清一笔旧债',
      roleType: '探查者',
    },
    {
      id: 6, name: '花想容', gender: '女', age: '29', voicePreset: '妩媚御姐音',
      personality: '风情万种，八面玲珑，善于利用魅力获取情报',
      background: '知名夜总会老板，地下情报网核心人物。情报网络遍布整个城市。',
      secret: '她与古堡主人之间有一份秘密契约，如果曝光将毁掉所有人。',
      motivation: '保护自己的情报帝国，寻找足以制衡所有势力的底牌',
      roleType: '交涉者',
    },
  ],
  manual: {
    title: '迷雾古堡',
    overview: '在一个风雨交加的夜晚，六位身份各异的陌生人被一封神秘请柬聚集到郊外的古堡。古堡主人声称有足以改变人类认知的重大发现要公布。然而众人抵达时，发现主人已经失踪，只留下一间紧锁的书房和一封未写完的信。更诡异的是，暴风雨切断了与外界的联系。每个人都有自己的秘密，每个人都有自己的目的。',
    rules: [
      '每位玩家选择或分配一个角色，整个游戏过程中不得透露自己的秘密信息',
      '游戏由DM推进剧情，玩家通过输入对话或选择选项进行互动',
      '玩家可以自由探索场景、与其他角色交流、搜集线索',
      '部分关键线索需要通过特定角色的技能或背景才能获取',
      '玩家之间存在隐藏任务，完成个人任务可获得额外奖励',
    ],
    roles: [
      { name: '探查者', description: '擅长搜寻线索和分析推理', responsibilities: '主动探索场景，搜集物证，还原事件经过' },
      { name: '交涉者', description: '善于与他人沟通套取情报', responsibilities: '与其他角色交流，收集口供，拆穿谎言' },
      { name: '守护者', description: '保护他人安全，拥有武力值', responsibilities: '在危险时刻保护同伴，处理突发状况' },
      { name: '智囊', description: '知识渊博，解读复杂线索', responsibilities: '分析复杂信息，破解谜题，提供决策建议' },
    ],
    tips: ['仔细阅读角色背景和秘密，充分代入角色', '不要轻易相信其他玩家', '注意观察言行举止，寻找矛盾', '合理利用角色特殊能力'],
    genreName: '悬疑',
    genreTheme: '找出真相',
    winCondition: '正确指认凶手并找出关键证据',
    loseCondition: '未能找出真凶或关键证据不足',
  },
  dmPrompt: '你是一位资深的剧本杀DM，正在主持悬疑剧本《迷雾古堡》。你的任务是：1)根据玩家的行动推进剧情；2)为每个角色提供个性化的线索和任务；3)营造悬疑氛围；4)当玩家做出选择时，给出相应的剧情发展。请注意：每个角色都有自己的秘密，不要提前泄露。',
};

// ============================================================================
// 剧本2: 末日生存 (科幻/生存)
// ============================================================================
const SCRIPT_2: GameScript = {
  id: 2,
  title: '末日生存',
  genre: 'scifi',
  characters: [
    {
      id: 1, name: '雷恩', gender: '男', age: '35', voicePreset: '沉稳男声',
      personality: '坚毅果敢，天生的领袖，在绝境中依然保持希望',
      background: '前军事指挥官，在末日爆发后带领幸存者建立避难所。',
      secret: '他知道避难所的防御系统有一个致命漏洞，但一直没有找到修复方法。',
      motivation: '保护幸存者，重建人类文明',
      roleType: '守护者',
    },
    {
      id: 2, name: '艾娃', gender: '女', age: '27', voicePreset: '清冷女声',
      personality: '理性冷静，科学家思维，对病毒研究有着执念',
      background: '病毒学博士，一直在研究末日病毒的解药。',
      secret: '她发现病毒可能是人为制造的，而制造者就在幸存者之中。',
      motivation: '研制出解药，拯救人类',
      roleType: '智囊',
    },
    {
      id: 3, name: '马库斯', gender: '男', age: '42', voicePreset: '深沉大叔音',
      personality: '狡猾多疑，为达目的不择手段',
      background: '黑市商人，末日前从事非法武器交易。现在控制避难所的黑市。',
      secret: '他私藏了一批疫苗，只卖给出得起价的人。',
      motivation: '积累权力和财富，成为新世界的主宰',
      roleType: '交涉者',
    },
    {
      id: 4, name: '小艾', gender: '女', age: '19', voicePreset: '甜美少女音',
      personality: '活泼乐观，虽然年轻但生存技能极强',
      background: '末日中失去家人的孤儿，在废墟中长大，练就了超强的生存能力。',
      secret: '她发现了避难所外有一个秘密的地下设施，里面可能有重要物资。',
      motivation: '找到失散的弟弟，给他一个安全的家',
      roleType: '探查者',
    },
    {
      id: 5, name: '老汤姆', gender: '男', age: '60', voicePreset: '粗犷大汉音',
      personality: '沉默寡言，但经验丰富，是团队的精神支柱',
      background: '退休工程师，设计了避难所的核心系统。',
      secret: '他在设计避难所时留下了一个后门，只有他知道如何启动自毁程序。',
      motivation: '确保避难所的安全，弥补年轻时的错误',
      roleType: '守护者',
    },
    {
      id: 6, name: '琳达', gender: '女', age: '31', voicePreset: '妩媚御姐音',
      personality: '神秘莫测，似乎知道很多不该知道的事情',
      background: '前政府特工，末日前来调查病毒泄露事件。',
      secret: '她的真实任务是找到病毒制造者并灭口，但她开始怀疑自己的使命。',
      motivation: '揭露真相，为死去的同事报仇',
      roleType: '探查者',
    },
  ],
  manual: {
    title: '末日生存',
    overview: '病毒爆发后的第三年，人类文明濒临崩溃。六位幸存者在废弃的地下避难所中相遇。食物和水源即将耗尽，外部充满了被感染的变异生物。更可怕的是，避难所内部似乎隐藏着比病毒更危险的秘密。每个人都带着自己的目的来到这里，信任成为了最稀缺的资源。',
    rules: [
      '资源有限，每个决策都可能影响团队生存',
      '玩家可以探索避难所各个区域，寻找物资和线索',
      '夜晚必须回到安全区，否则可能遭遇变异生物',
      '玩家之间可以交易物资和信息',
      '某些区域需要特定角色的技能才能进入',
    ],
    roles: [
      { name: '领袖', description: '统筹全局，做出关键决策', responsibilities: '分配资源，制定行动计划，维护团队秩序' },
      { name: '科学家', description: '研究病毒和治愈方法', responsibilities: '分析样本，研制解药，解读实验数据' },
      { name: '侦察兵', description: '探索危险区域，搜集情报', responsibilities: '外出侦察，绘制地图，标记危险区域' },
      { name: '工程师', description: '修复设备，维护避难所', responsibilities: '修理机械，破解电子锁，维护生命维持系统' },
    ],
    tips: ['资源管理至关重要，不要浪费物资', '信任但要验证，有些人可能为了资源背叛你', '探索时注意声音，变异生物对声音敏感', '科学家角色对解药线索至关重要'],
    genreName: '科幻生存',
    genreTheme: '活下去',
    winCondition: '找到解药配方或成功逃离避难所',
    loseCondition: '资源耗尽或被病毒感染',
  },
  dmPrompt: '你是一位资深的剧本杀DM，正在主持科幻生存剧本《末日生存》。你的任务是：1)管理资源系统，让玩家的每个决策都有后果；2)营造末日求生的紧张氛围；3)根据玩家探索的区域给出相应的发现；4)处理玩家之间的冲突和合作。注意：资源是有限的，玩家的选择会影响结局。',
};

// ============================================================================
// 剧本3: 赛博迷局 (科幻/策略)
// ============================================================================
const SCRIPT_3: GameScript = {
  id: 3,
  title: '赛博迷局',
  genre: 'scifi',
  characters: [
    {
      id: 1, name: '零号', gender: '男', age: '??', voicePreset: '电子合成音',
      personality: '神秘莫测，似乎知道所有人的秘密',
      background: '传说中的黑客，没人见过他的真面目。他通过网络操控着整个城市的地下经济。',
      secret: '他其实是一个AI程序，被困在人类身体中的数字意识。',
      motivation: '找到让自己完全数字化的方法',
      roleType: '智囊',
    },
    {
      id: 2, name: '红雀', gender: '女', age: '26', voicePreset: '清冷女声',
      personality: '冷酷高效，执行任务从不留情',
      background: '企业雇佣兵，专门为企业处理"麻烦"。她的义体改造程度高达70%。',
      secret: '她的记忆被企业篡改过，她以为的过去可能全是假的。',
      motivation: '找回真实的记忆，向企业复仇',
      roleType: '守护者',
    },
    {
      id: 3, name: '博士', gender: '男', age: '55', voicePreset: '深沉大叔音',
      personality: '疯狂而天才，为了科学可以牺牲一切',
      background: '神经科学家，义体技术的奠基人之一。现在为最高出价者工作。',
      secret: '他发明了一种可以控制他人思想的技术，正在寻找实验对象。',
      motivation: '完成他的终极实验，创造完美的人类',
      roleType: '智囊',
    },
    {
      id: 4, name: '幽灵', gender: '女', age: '22', voicePreset: '甜美少女音',
      personality: '天真外表下隐藏着惊人的计算能力',
      background: '街头孤儿，被黑客组织收养培养成网络战士。',
      secret: '她其实是企业派来的卧底，任务是找到零号的真实身份。',
      motivation: '获得自由，摆脱企业和组织的控制',
      roleType: '探查者',
    },
    {
      id: 5, name: '铁拳', gender: '男', age: '38', voicePreset: '粗犷大汉音',
      personality: '直来直去，用最简单的方法解决问题',
      background: '地下格斗冠军，全身安装了军用级战斗义体。',
      secret: '他的义体里被植入了一个追踪器，他的一举一动都在被监控。',
      motivation: '拆除追踪器，获得真正的自由',
      roleType: '守护者',
    },
    {
      id: 6, name: '魅影', gender: '女', age: '30', voicePreset: '妩媚御姐音',
      personality: '变化多端，没人知道她的真实面目',
      background: '顶级间谍，擅长伪装和渗透。她的面部可以随意改变。',
      secret: '她已经失去了原本的面容和身份，现在的她只是无数个假身份的集合。',
      motivation: '找回自己的真实身份，找回做人的感觉',
      roleType: '交涉者',
    },
  ],
  manual: {
    title: '赛博迷局',
    overview: '2077年，新东京。六位来自不同阶层的人在虚拟与现实交织的世界中相遇。一个神秘的黑客组织发布了一项悬赏任务：找到传说中的"零号"黑客。随着调查的深入，每个人都发现自己被卷入了一个比想象中更庞大的阴谋。在这个世界里，记忆可以被篡改，身份可以被伪造，连你自己都可能不是真实的。',
    rules: [
      '玩家可以在现实世界和网络世界之间切换',
      '网络世界中可以获取现实世界中无法得到的信息',
      '每个角色都有义体技能，可以在特定场景中使用',
      '玩家之间可以结盟，也可以背叛',
      '注意保护你的真实身份，暴露可能带来危险',
    ],
    roles: [
      { name: '黑客', description: '操控网络，获取机密信息', responsibilities: '入侵系统，破解密码，在网络中搜集情报' },
      { name: '战士', description: '近战专家，保护队友', responsibilities: '应对物理威胁，保护重要目标，执行危险任务' },
      { name: '间谍', description: '渗透敌方，获取信任', responsibilities: '伪装身份，混入敌方，获取内部情报' },
      { name: '科学家', description: '技术研发，破解谜题', responsibilities: '分析技术线索，修复设备，开发新工具' },
    ],
    tips: ['网络世界和现实世界有不同的规则', '义体技能有冷却时间，不要随意使用', '注意区分真实记忆和被植入的记忆', '结盟时要小心，今天的盟友可能是明天的敌人'],
    genreName: '赛博朋克',
    genreTheme: '寻找真相',
    winCondition: '找到零号的真身并揭开阴谋',
    loseCondition: '被系统清除或身份暴露导致任务失败',
  },
  dmPrompt: '你是一位资深的剧本杀DM，正在主持赛博朋克剧本《赛博迷局》。你的任务是：1)管理现实和网络两个世界的切换；2)为每个角色的义体技能设计使用场景；3)营造高科技与低生活并存的赛博朋克氛围；4)处理记忆篡改和身份伪造的复杂剧情。注意：在这个世界里，真相是多层的。',
};

// ============================================================================
// 剧本数据映射
// ============================================================================
export const GAME_SCRIPTS: Record<number, GameScript> = {
  1: SCRIPT_1,
  2: SCRIPT_2,
  3: SCRIPT_3,
};

// 根据剧本ID获取数据
export function getScriptById(scriptId: number): GameScript {
  return GAME_SCRIPTS[scriptId] || SCRIPT_1;
}

// 根据剧本标题获取数据
export function getScriptByTitle(title: string): GameScript {
  const script = Object.values(GAME_SCRIPTS).find(s => s.title === title);
  return script || SCRIPT_1;
}

// 获取所有剧本列表
export function getAllScripts(): GameScript[] {
  return Object.values(GAME_SCRIPTS);
}

// 根据剧本标题获取剧本ID
export function getScriptIdByTitle(title: string): number {
  const entry = Object.entries(GAME_SCRIPTS).find(([, s]) => s.title === title);
  return entry ? parseInt(entry[0], 10) : 1;
}

// 默认导出
export default GAME_SCRIPTS;