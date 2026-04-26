// 游戏配置
const CONFIG = {
    WORD_SPEED: 2200, // 单词流动速度(ms) - 加快了
    INITIAL_TIME: 90, // 初始时间(秒) - 延长到90秒
    PENALTY_TIME: 5,  // 撤销惩罚时间(秒)
    BONUS_TIME: 10,   // 成功奖励时间(秒)
    POINTS_PER_LEVEL: 100 // 每关基础分数
};

// 游戏状态
const gameState = {
    isPlaying: false,
    level: 1,
    score: 0,
    timeRemaining: CONFIG.INITIAL_TIME,
    currentSentence: null,
    currentWordIndex: 0,
    placedWords: [],
    history: [],
    usedSentenceIds: [], // 记录已使用的句子，避免重复
    timerInterval: null,
    wordStreamInterval: null
};

// 句子数据库 - 包含大量花园路径句
const SENTENCES = [
    // ========== 经典花园路径句 (25条) ==========
    {
        id: 1,
        words: ['The', 'horse', 'raced', 'past', 'the', 'barn', 'fell'],
        display: 'The horse raced past the barn fell.',
        translation: '那匹跑过谷仓的马摔倒了。',
        structure: {
            NP: { position: 0, word: 'The horse', words: [0, 1] },
            Participial: { position: 1, word: 'raced past the barn', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'fell', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'raced',
        trapExplanation: '大脑倾向于将"raced"解析为主句谓语（最小附着原则），但这样"fell"就没有位置了！',
        difficulty: 2
    },
    {
        id: 2,
        words: ['The', 'woman', 'driven', 'to', 'the', 'hospital', 'fainted'],
        display: 'The woman driven to the hospital fainted.',
        translation: '被送往医院的那个女人晕倒了。',
        structure: {
            NP: { position: 0, word: 'The woman', words: [0, 1] },
            Participial: { position: 1, word: 'driven to the hospital', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'fainted', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'driven',
        trapExplanation: '"driven"看起来像被动语态的谓语，但实际上是修饰主语的后置定语！',
        difficulty: 2
    },
    {
        id: 3,
        words: ['The', 'man', 'whistled', 'past', 'the', 'graveyard', 'fainted'],
        display: 'The man whistled past the graveyard fainted.',
        translation: '那个吹着口哨走过墓地的人晕倒了。',
        structure: {
            NP: { position: 0, word: 'The man', words: [0, 1] },
            Participial: { position: 1, word: 'whistled past the graveyard', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'fainted', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'whistled',
        trapExplanation: '"whistled"被误认为是主句谓语，实际上是描述主语的后置定语！',
        difficulty: 2
    },
    {
        id: 4,
        words: ['The', 'old', 'dog', 'sent', 'to', 'the', 'vet', 'died'],
        display: 'The old dog sent to the vet died.',
        translation: '那只被送去看兽医的老狗死了。',
        structure: {
            NP: { position: 0, word: 'The old dog', words: [0, 1, 2] },
            Participial: { position: 1, word: 'sent to the vet', words: [3, 4, 5, 6] },
            VP: { position: 2, word: 'died', words: [7] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'sent',
        trapExplanation: '"sent"看起来是谓语动词，但实际上是修饰"dog"的后置定语！',
        difficulty: 2
    },
    {
        id: 5,
        words: ['The', 'students', 'taught', 'by', 'the', 'professor', 'failed'],
        display: 'The students taught by the professor failed.',
        translation: '被教授教的那些学生考试不及格。',
        structure: {
            NP: { position: 0, word: 'The students', words: [0, 1] },
            Participial: { position: 1, word: 'taught by the professor', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'failed', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'taught',
        trapExplanation: '"taught"被误认为是主句谓语，实际上是修饰"students"的后置定语！',
        difficulty: 2
    },
    {
        id: 6,
        words: ['The', 'girl', 'told', 'the', 'story', 'cried'],
        display: 'The girl told the story cried.',
        translation: '那个被告知故事的女孩哭了。',
        structure: {
            NP: { position: 0, word: 'The girl', words: [0, 1] },
            Participial: { position: 1, word: 'told the story', words: [2, 3, 4] },
            VP: { position: 2, word: 'cried', words: [5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'told',
        trapExplanation: '"told"看起来是主句谓语"告诉"，但实际上是被动"被告知"，修饰主语！',
        difficulty: 3
    },
    {
        id: 7,
        words: ['The', 'butter', 'melted', 'in', 'the', 'microwave', 'spilled'],
        display: 'The butter melted in the microwave spilled.',
        translation: '在微波炉里融化的黄油溢出来了。',
        structure: {
            NP: { position: 0, word: 'The butter', words: [0, 1] },
            Participial: { position: 1, word: 'melted in the microwave', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'spilled', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'melted',
        trapExplanation: '"melted"被误认为是主句谓语，但实际上是修饰"butter"的后置定语！',
        difficulty: 2
    },
    {
        id: 8,
        words: ['The', 'cake', 'baked', 'in', 'the', 'oven', 'burnt'],
        display: 'The cake baked in the oven burnt.',
        translation: '在烤箱里烤的蛋糕烧焦了。',
        structure: {
            NP: { position: 0, word: 'The cake', words: [0, 1] },
            Participial: { position: 1, word: 'baked in the oven', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'burnt', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'baked',
        trapExplanation: '"baked"被误认为是主句谓语，但实际上是修饰"cake"的后置定语！',
        difficulty: 2
    },
    {
        id: 9,
        words: ['The', 'car', 'pushed', 'by', 'the', 'kids', 'started'],
        display: 'The car pushed by the kids started.',
        translation: '被孩子们推着的汽车启动了。',
        structure: {
            NP: { position: 0, word: 'The car', words: [0, 1] },
            Participial: { position: 1, word: 'pushed by the kids', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'started', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'pushed',
        trapExplanation: '"pushed"被误认为是主句谓语，但实际上是修饰"car"的后置定语！',
        difficulty: 2
    },
    {
        id: 11,
        words: ['The', 'message', 'sent', 'by', 'the', 'spy', 'arrived'],
        display: 'The message sent by the spy arrived.',
        translation: '被间谍发送的消息到达了。',
        structure: {
            NP: { position: 0, word: 'The message', words: [0, 1] },
            Participial: { position: 1, word: 'sent by the spy', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'arrived', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'sent',
        trapExplanation: '"sent"被误认为是主句谓语，但实际上是修饰"message"的后置定语！',
        difficulty: 2
    },





    {
        id: 19,
        words: ['The', 'suspect', 'arrested', 'by', 'the', 'police', 'escaped'],
        display: 'The suspect arrested by the police escaped.',
        translation: '被警察逮捕的嫌疑人逃跑了。',
        structure: {
            NP: { position: 0, word: 'The suspect', words: [0, 1] },
            Participial: { position: 1, word: 'arrested by the police', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'escaped', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'arrested',
        trapExplanation: '"arrested"被误认为是主句谓语，但实际上是修饰"suspect"的后置定语！',
        difficulty: 2
    },
    {
        id: 20,
        words: ['The', 'food', 'cooked', 'for', 'the', 'party', 'spoiled'],
        display: 'The food cooked for the party spoiled.',
        translation: '为派对准备的食物变质了。',
        structure: {
            NP: { position: 0, word: 'The food', words: [0, 1] },
            Participial: { position: 1, word: 'cooked for the party', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'spoiled', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'cooked',
        trapExplanation: '"cooked"被误认为是主句谓语，但实际上是修饰"food"的后置定语！',
        difficulty: 2
    },
    {
        id: 21,
        words: ['The', 'treasure', 'buried', 'in', 'the', 'sand', 'remained'],
        display: 'The treasure buried in the sand remained.',
        translation: '埋在沙子里的宝藏仍然存在。',
        structure: {
            NP: { position: 0, word: 'The treasure', words: [0, 1] },
            Participial: { position: 1, word: 'buried in the sand', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'remained', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'buried',
        trapExplanation: '"buried"被误认为是主句谓语，但实际上是修饰"treasure"的后置定语！',
        difficulty: 2
    },


    {
        id: 24,
        words: ['The', 'report', 'written', 'by', 'the', 'clerk', 'lied'],
        display: 'The report written by the clerk lied.',
        translation: '那个职员写的报告撒谎了。',
        structure: {
            NP: { position: 0, word: 'The report', words: [0, 1] },
            Participial: { position: 1, word: 'written by the clerk', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'lied', words: [6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (主句谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'written',
        trapExplanation: '"written"被误认为是主句谓语，但实际上是修饰"report"的后置定语！',
        difficulty: 2
    },

    
    // ========== 语义冲突：名词/动词词性误导 (10条) ==========
    {
        id: 26,
        words: ['The', 'complex', 'houses', 'married', 'and', 'single', 'soldiers'],
        display: 'The complex houses married and single soldiers.',
        translation: '这个建筑群容纳了已婚和单身的士兵。',
        structure: {
            NP: { position: 0, word: 'The complex', words: [0, 1] },
            VP: { position: 1, word: 'houses', words: [2] },
            NP2: { position: 2, word: 'married and single soldiers', words: [3, 4, 5, 6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'houses',
        trapExplanation: '"houses"看起来像名词复数（房子们），但实际上是动词（容纳）！',
        difficulty: 3
    },
    {
        id: 27,
        words: ['The', 'old', 'man', 'the', 'boats'],
        display: 'The old man the boats.',
        translation: '老年人操纵船只。',
        structure: {
            NP: { position: 0, word: 'The old', words: [0, 1] },
            VP: { position: 1, word: 'man', words: [2] },
            NP2: { position: 2, word: 'the boats', words: [3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'man',
        trapExplanation: '"man"看起来像名词（男人），但实际上是动词（操纵/驾驶）！',
        difficulty: 3
    },
    {
        id: 28,
        words: ['The', 'prime', 'number', 'few'],
        display: 'The prime number few.',
        translation: '质数很少。',
        structure: {
            NP: { position: 0, word: 'The prime', words: [0, 1] },
            VP: { position: 1, word: 'number few', words: [2, 3] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'number',
        trapExplanation: '"number"看起来像名词（数字），但实际上是动词（计数）！',
        difficulty: 3
    },
    {
        id: 29,
        words: ['The', 'cotton', 'clothing', 'is', 'made', 'of', 'grows', 'in', 'Mississippi'],
        display: 'The cotton clothing is made of grows in Mississippi.',
        translation: '制作衣服的棉花生长在密西西比州。',
        structure: {
            NP: { position: 0, word: 'The cotton', words: [0, 1] },
            Participial: { position: 1, word: 'clothing is made of', words: [2, 3, 4, 5] },
            VP: { position: 2, word: 'grows', words: [6] },
            PP: { position: 3, word: 'in Mississippi', words: [7, 8] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'participial', label: 'Participial (分词短语)', type: 'Participial', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'pp', label: 'PP (地点)', type: 'PP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'clothing',
        trapExplanation: '"clothing"看起来是名词（衣服），但实际上是修饰"cotton"的后置定语的一部分！',
        difficulty: 4
    },

    {
        id: 31,
        words: ['The', 'orange', 'ducks', 'under', 'the', 'bridge'],
        display: 'The orange ducks under the bridge.',
        translation: '橘子在桥下潜水。',
        structure: {
            NP: { position: 0, word: 'The orange', words: [0, 1] },
            VP: { position: 1, word: 'ducks', words: [2] },
            PP: { position: 2, word: 'under the bridge', words: [3, 4, 5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'pp', label: 'PP (地点)', type: 'PP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'ducks',
        trapExplanation: '"orange ducks"看起来像"橙色的鸭子"，但实际上"orange"是主语，"ducks"是动词（潜水）！',
        difficulty: 3
    },
    
    {
        id: 34,
        words: ['The', 'square', 'squares', 'the', 'circle'],
        display: 'The square squares the circle.',
        translation: '正方形使圆形变方。',
        structure: {
            NP: { position: 0, word: 'The square', words: [0, 1] },
            VP: { position: 1, word: 'squares', words: [2] },
            NP2: { position: 2, word: 'the circle', words: [3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'squares',
        trapExplanation: '"square squares"看起来是重复，但第一个是名词（正方形），第二个是动词（使变方）！',
        difficulty: 3
    },
    {
        id: 35,
        words: ['The', 'sour', 'drink', 'is', 'bad'],
        display: 'The sour drink is bad.',
        translation: '酸饮料很糟糕。',
        structure: {
            NP: { position: 0, word: 'The sour', words: [0, 1] },
            VP: { position: 1, word: 'drink', words: [2] },
            Complement: { position: 2, word: 'is bad', words: [3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'complement', label: 'Complement (补语)', type: 'Complement', required: true }
        ],
        isGardenPath: true,
        trapWord: 'drink',
        trapExplanation: '"sour drink"看起来像"酸饮料"，但"sour"是主语，"drink"是动词（喝）！',
        difficulty: 3
    },
    {
        id: 36,
        words: ['The', 'fast', 'cars', 'race'],
        display: 'The fast cars race.',
        translation: '禁食的人参加比赛。',
        structure: {
            NP: { position: 0, word: 'The fast', words: [0, 1] },
            VP: { position: 1, word: 'cars', words: [2] },
            NP2: { position: 2, word: 'race', words: [3] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'cars',
        trapExplanation: '"fast cars"看起来像"快速的汽车"，但"fast"是名词（禁食），"cars"是动词（参加）！',
        difficulty: 3
    },
    {
        id: 37,
        words: ['The', 'light', 'lights', 'the', 'room'],
        display: 'The light lights the room.',
        translation: '电灯照亮房间。',
        structure: {
            NP: { position: 0, word: 'The light', words: [0, 1] },
            VP: { position: 1, word: 'lights', words: [2] },
            NP2: { position: 2, word: 'the room', words: [3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'lights',
        trapExplanation: '第一个"light"是名词（灯），第二个"lights"是动词（照亮）！',
        difficulty: 3
    },
    {
        id: 38,
        words: ['The', 'black', 'blacks', 'out'],
        display: 'The black blacks out.',
        translation: '黑人昏厥了。',
        structure: {
            NP: { position: 0, word: 'The black', words: [0, 1] },
            VP: { position: 1, word: 'blacks out', words: [2, 3] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'blacks',
        trapExplanation: '"black blacks"看起来是重复，但第一个是名词，第二个是动词（昏厥）！',
        difficulty: 3
    },
    {
        id: 39,
        words: ['The', 'hard', 'hardens'],
        display: 'The hard hardens.',
        translation: '困难会变硬。',
        structure: {
            NP: { position: 0, word: 'The hard', words: [0, 1] },
            VP: { position: 1, word: 'hardens', words: [2] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'hardens',
        trapExplanation: '"hard"看起来是形容词，但实际上是名词，"hardens"是动词（变硬）！',
        difficulty: 3
    },
    {
        id: 40,
        words: ['The', 'long', 'longs', 'for', 'home'],
        display: 'The long longs for home.',
        translation: '渴望家的人渴望回家。',
        structure: {
            NP: { position: 0, word: 'The long', words: [0, 1] },
            VP: { position: 1, word: 'longs for', words: [2, 3] },
            NP2: { position: 2, word: 'home', words: [4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'longs',
        trapExplanation: '"long longs"看起来是重复，但第一个是名词（渴望），第二个是动词（渴望）！',
        difficulty: 3
    },
    {
        id: 41,
        words: ['The', 'round', 'rounds', 'up', 'the', 'cattle'],
        display: 'The round rounds up the cattle.',
        translation: '圆形把牛群聚拢。',
        structure: {
            NP: { position: 0, word: 'The round', words: [0, 1] },
            VP: { position: 1, word: 'rounds up', words: [2, 3] },
            NP2: { position: 2, word: 'the cattle', words: [4, 5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'rounds',
        trapExplanation: '"round rounds"看起来是重复，但第一个是名词（圆形），第二个是动词（聚拢）！',
        difficulty: 3
    },
    
    
    // ========== 干扰项：普通非歧义句 (10条) ==========
    {
        id: 43,
        words: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
        display: 'The cat sat on the mat.',
        translation: '猫坐在垫子上。',
        structure: {
            NP: { position: 0, word: 'The cat', words: [0, 1] },
            VP: { position: 1, word: 'sat', words: [2] },
            PP: { position: 2, word: 'on the mat', words: [3, 4, 5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'pp', label: 'PP (地点)', type: 'PP', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 44,
        words: ['Sherlock', 'saw', 'the', 'man', 'with', 'a', 'telescope'],
        display: 'Sherlock saw the man with a telescope.',
        translation: '夏洛克用望远镜看到了那个人。',
        structure: {
            NP: { position: 0, word: 'Sherlock', words: [0] },
            VP: { position: 1, word: 'saw', words: [1] },
            NP2: { position: 2, word: 'the man', words: [2, 3] },
            PP: { position: 3, word: 'with a telescope', words: [4, 5, 6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true },
            { id: 'pp', label: 'PP (工具)', type: 'PP', required: true }
        ],
        isGardenPath: false,
        difficulty: 2
    },
    {
        id: 45,
        words: ['The', 'students', 'finished', 'their', 'homework', 'early'],
        display: 'The students finished their homework early.',
        translation: '学生们早早完成了作业。',
        structure: {
            NP: { position: 0, word: 'The students', words: [0, 1] },
            VP: { position: 1, word: 'finished', words: [2] },
            NP2: { position: 2, word: 'their homework', words: [3, 4] },
            Adv: { position: 3, word: 'early', words: [5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true },
            { id: 'adv', label: 'Adv (副词)', type: 'Adv', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 46,
        words: ['The', 'weather', 'is', 'very', 'cold', 'today'],
        display: 'The weather is very cold today.',
        translation: '今天天气很冷。',
        structure: {
            NP: { position: 0, word: 'The weather', words: [0, 1] },
            VP: { position: 1, word: 'is', words: [2] },
            AdjP: { position: 2, word: 'very cold', words: [3, 4] },
            Adv: { position: 3, word: 'today', words: [5] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (系动词)', type: 'VP', required: true },
            { id: 'adjp', label: 'AdjP (表语)', type: 'AdjP', required: true },
            { id: 'adv', label: 'Adv (时间)', type: 'Adv', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 47,
        words: ['She', 'gave', 'the', 'boy', 'a', 'beautiful', 'gift'],
        display: 'She gave the boy a beautiful gift.',
        translation: '她给了男孩一个漂亮的礼物。',
        structure: {
            NP: { position: 0, word: 'She', words: [0] },
            VP: { position: 1, word: 'gave', words: [1] },
            NP2: { position: 2, word: 'the boy', words: [2, 3] },
            NP3: { position: 3, word: 'a beautiful gift', words: [4, 5, 6] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (间接宾语)', type: 'NP', required: true },
            { id: 'np3', label: 'NP (直接宾语)', type: 'NP', required: true }
        ],
        isGardenPath: false,
        difficulty: 2
    },
    {
        id: 48,
        words: ['The', 'sun', 'shines', 'brightly'],
        display: 'The sun shines brightly.',
        translation: '太阳明亮地照耀。',
        structure: {
            NP: { position: 0, word: 'The sun', words: [0, 1] },
            VP: { position: 1, word: 'shines', words: [2] },
            Adv: { position: 2, word: 'brightly', words: [3] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'adv', label: 'Adv (副词)', type: 'Adv', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 49,
        words: ['He', 'reads', 'books', 'every', 'day'],
        display: 'He reads books every day.',
        translation: '他每天读书。',
        structure: {
            NP: { position: 0, word: 'He', words: [0] },
            VP: { position: 1, word: 'reads', words: [1] },
            NP2: { position: 2, word: 'books', words: [2] },
            Adv: { position: 3, word: 'every day', words: [3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true },
            { id: 'adv', label: 'Adv (时间)', type: 'Adv', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 50,
        words: ['Birds', 'fly', 'in', 'the', 'sky'],
        display: 'Birds fly in the sky.',
        translation: '鸟在天空飞翔。',
        structure: {
            NP: { position: 0, word: 'Birds', words: [0] },
            VP: { position: 1, word: 'fly', words: [1] },
            PP: { position: 2, word: 'in the sky', words: [2, 3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'pp', label: 'PP (地点)', type: 'PP', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 51,
        words: ['Children', 'play', 'games', 'happily'],
        display: 'Children play games happily.',
        translation: '孩子们快乐地玩游戏。',
        structure: {
            NP: { position: 0, word: 'Children', words: [0] },
            VP: { position: 1, word: 'play', words: [1] },
            NP2: { position: 2, word: 'games', words: [2] },
            Adv: { position: 3, word: 'happily', words: [3] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true },
            { id: 'adv', label: 'Adv (副词)', type: 'Adv', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 52,
        words: ['Water', 'flows', 'down', 'the', 'river'],
        display: 'Water flows down the river.',
        translation: '水沿着河流流动。',
        structure: {
            NP: { position: 0, word: 'Water', words: [0] },
            VP: { position: 1, word: 'flows', words: [1] },
            PP: { position: 2, word: 'down the river', words: [2, 3, 4] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'pp', label: 'PP (地点)', type: 'PP', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    
    // ========== 简单句 - 教学关 ==========
    {
        id: 53,
        words: ['The', 'cat', 'sleeps'],
        display: 'The cat sleeps.',
        translation: '猫在睡觉。',
        structure: {
            NP: { position: 0, word: 'The cat', words: [0, 1] },
            VP: { position: 1, word: 'sleeps', words: [2] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 54,
        words: ['The', 'dog', 'chased', 'the', 'ball'],
        display: 'The dog chased the ball.',
        translation: '狗追球。',
        structure: {
            NP1: { position: 0, word: 'The dog', words: [0, 1] },
            VP: { position: 1, word: 'chased', words: [2] },
            NP2: { position: 2, word: 'the ball', words: [3, 4] }
        },
        slots: [
            { id: 'np1', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: false,
        difficulty: 1
    },
    {
        id: 55,
        words: ['Mary', 'gave', 'the', 'child', 'the', 'doll'],
        display: 'Mary gave the child the doll.',
        translation: '玛丽把娃娃给了那个孩子。',
        structure: {
            NP1: { position: 0, word: 'Mary', words: [0] },
            VP: { position: 1, word: 'gave', words: [1] },
            NP2: { position: 2, word: 'the child', words: [2, 3] },
            NP3: { position: 3, word: 'the doll', words: [4, 5] }
        },
        slots: [
            { id: 'np1', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (间接宾语)', type: 'NP', required: true },
            { id: 'np3', label: 'NP (直接宾语)', type: 'NP', required: true }
        ],
        isGardenPath: false,
        difficulty: 2
    },
    {
        id: 56,
        words: ['The', 'rat', 'the', 'cat', 'the', 'dog', 'chased', 'killed', 'ate', 'the', 'malt'],
        display: 'The rat the cat the dog chased killed ate the malt.',
        translation: '那只被狗追的猫杀死的老鼠吃了麦芽。',
        structure: {
            NP1: { position: 0, word: 'The rat', words: [0, 1] },
            RC1: { position: 1, word: 'the cat the dog chased killed', words: [2, 3, 4, 5, 6, 7] },
            VP: { position: 2, word: 'ate', words: [8] },
            NP2: { position: 3, word: 'the malt', words: [9, 10] }
        },
        slots: [
            { id: 'np1', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'rc1', label: 'RC (嵌套关系从句)', type: 'RC', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true },
            { id: 'np2', label: 'NP (宾语)', type: 'NP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'chased',
        trapExplanation: '这是一个三重嵌套的中心嵌入句！需要仔细分析每个动词的归属。',
        difficulty: 4
    },
    {
        id: 57,
        words: ['Fat', 'people', 'accumulate'],
        display: 'Fat people accumulate.',
        translation: '脂肪积累。',
        structure: {
            NP: { position: 0, word: 'Fat', words: [0] },
            VP: { position: 1, word: 'people accumulate', words: [1, 2] }
        },
        slots: [
            { id: 'np', label: 'NP (主语)', type: 'NP', required: true },
            { id: 'vp', label: 'VP (谓语)', type: 'VP', required: true }
        ],
        isGardenPath: true,
        trapWord: 'people',
        trapExplanation: '"Fat people"看起来像"肥胖的人"，但实际上是"脂肪积累"！',
        difficulty: 3
    }
];

// DOM 元素
const elements = {
    wordStream: document.getElementById('word-stream'),
    syntaxTree: document.getElementById('syntax-tree'),
    currentSentence: document.getElementById('current-sentence'),
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    btnUndo: document.getElementById('btn-undo'),
    btnHint: document.getElementById('btn-hint'),
    btnSubmit: document.getElementById('btn-submit'),
    btnStart: document.getElementById('btn-start'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayDesc: document.getElementById('overlay-desc'),
    hintDisplay: document.getElementById('hint-display'),
    message: document.getElementById('message'),
    academicContent: document.getElementById('academic-content')
};

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    elements.btnStart.addEventListener('click', startGame);
    elements.btnUndo.addEventListener('click', undoLastAction);
    elements.btnHint.addEventListener('click', showHint);
    elements.btnSubmit.addEventListener('click', checkSolution);
});

// 开始游戏
function startGame() {
    gameState.isPlaying = true;
    gameState.level = 1;
    gameState.score = 0;
    gameState.timeRemaining = CONFIG.INITIAL_TIME;
    gameState.usedSentenceIds = []; // 重置已使用句子列表
    
    updateUI();
    elements.overlay.classList.add('hidden');
    
    loadLevel();
    startTimer();
}

// 加载关卡
function loadLevel() {
    // 根据等级选择句子，遵循游戏平衡建议
    const level = gameState.level;
    
    // 获取可用句子池
    let availableSentences;
    
    // 定义句子类型
    const getAllowedSentences = (maxDifficulty) => {
        return SENTENCES.filter(s => s.difficulty <= maxDifficulty && !gameState.usedSentenceIds.includes(s.id));
    };
    
    const getClassicGardenPath = (maxDifficulty) => {
        // 经典花园路径句：id 1-25
        return SENTENCES.filter(s => 
            s.isGardenPath && 
            s.id >= 1 && s.id <= 25 && 
            s.difficulty <= maxDifficulty && 
            !gameState.usedSentenceIds.includes(s.id)
        );
    };
    
    const getSemanticConflict = (maxDifficulty) => {
        // 语义冲突句：id 26+
        return SENTENCES.filter(s => 
            s.isGardenPath && 
            s.id >= 26 && 
            s.difficulty <= maxDifficulty && 
            !gameState.usedSentenceIds.includes(s.id)
        );
    };
    
    const getNormal = (maxDifficulty) => {
        return SENTENCES.filter(s => 
            !s.isGardenPath && 
            s.difficulty <= maxDifficulty && 
            !gameState.usedSentenceIds.includes(s.id)
        );
    };
    
    const maxDifficulty = Math.min(Math.ceil(level / 2), 4);
    
    // 获取各类句子
    const classicGP = getClassicGardenPath(maxDifficulty);
    const semanticConflict = getSemanticConflict(maxDifficulty);
    const normal = getNormal(maxDifficulty);
    
    // 混合策略
    if (level <= 3) {
        // 前3关：平衡混合经典句和语义冲突句
        const allTraps = [...classicGP, ...semanticConflict];
        const totalTraps = allTraps.length;
        const totalNormal = normal.length;
        
        // 60%陷阱句（经典和语义冲突各占一半），40%普通句
        if (totalTraps > 0 && (Math.random() < 0.6 || totalNormal === 0)) {
            // 从陷阱句中随机选择，经典和语义冲突各50%概率
            if (classicGP.length > 0 && semanticConflict.length > 0) {
                availableSentences = Math.random() < 0.5 ? classicGP : semanticConflict;
            } else if (classicGP.length > 0) {
                availableSentences = classicGP;
            } else {
                availableSentences = semanticConflict;
            }
        } else {
            availableSentences = totalNormal > 0 ? normal : allTraps;
        }
    } else {
        // 后续关卡：80%陷阱句，20%普通句
        // 陷阱句中经典句和语义冲突句各占50%
        const allTraps = [...classicGP, ...semanticConflict];
        const totalTraps = allTraps.length;
        const totalNormal = normal.length;
        
        if (totalTraps > 0 && (Math.random() < 0.8 || totalNormal === 0)) {
            // 在陷阱句中平衡选择经典和语义冲突
            if (classicGP.length > 0 && semanticConflict.length > 0) {
                // 50%概率选择语义冲突句，增加多样性
                availableSentences = Math.random() < 0.5 ? classicGP : semanticConflict;
            } else if (classicGP.length > 0) {
                availableSentences = classicGP;
            } else {
                availableSentences = semanticConflict;
            }
        } else {
            availableSentences = totalNormal > 0 ? normal : allTraps;
        }
    }
    
    // 如果所有句子都用过了，重置
    if (!availableSentences || availableSentences.length === 0) {
        gameState.usedSentenceIds = [];
        availableSentences = getAllowedSentences(maxDifficulty);
    }
    
    // 随机选择句子
    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    
    // 记录已使用的句子
    gameState.usedSentenceIds.push(sentence.id);
    
    gameState.currentSentence = sentence;
    gameState.currentWordIndex = 0;
    gameState.placedWords = [];
    gameState.history = [];
    
    // 清空界面
    elements.wordStream.innerHTML = '';
    elements.currentSentence.innerHTML = '';
    
    // 创建句法树槽位
    createSyntaxTree(sentence);
    
    // 开始单词流
    startWordStream(sentence);
    
    // 更新学术说明
    updateAcademicContent(sentence);

    // 重置提示面板
    if (elements.hintDisplay) {
        elements.hintDisplay.textContent = 'HINT READY';
        elements.hintDisplay.classList.remove('active');
    }
    
    // 更新按钮状态
    updateButtonStates();
}

// 创建句法树槽位
function createSyntaxTree(sentence) {
    elements.syntaxTree.innerHTML = '';
    
    const treeLevel = document.createElement('div');
    treeLevel.className = 'tree-level';
    
    sentence.slots.forEach((slot, index) => {
        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot-container';
        
        const label = document.createElement('div');
        label.className = 'slot-label';
        label.textContent = slot.label;
        
        const slotElement = document.createElement('div');
        slotElement.className = 'slot empty';
        slotElement.id = `slot-${slot.id}`;
        slotElement.dataset.slotId = slot.id;
        slotElement.dataset.slotType = slot.type;
        slotElement.dataset.placeholder = '?';
        slotElement.dataset.required = slot.required;
        
        // 获取该槽位预期的单词数量
        const slotInfo = sentence.structure[slot.type];
        if (slotInfo && slotInfo.words) {
            slotElement.dataset.expectedWords = slotInfo.words.length;
        } else {
            slotElement.dataset.expectedWords = 1;
        }
        
        // 添加点击事件
        slotElement.addEventListener('click', () => onSlotClick(slotElement));
        
        // 添加拖放事件
        slotElement.addEventListener('dragover', onDragOver);
        slotElement.addEventListener('drop', onDrop);
        slotElement.addEventListener('dragleave', onDragLeave);
        
        slotContainer.appendChild(label);
        slotContainer.appendChild(slotElement);
        treeLevel.appendChild(slotContainer);
        
        // 添加连接线（除了最后一个）
        if (index < sentence.slots.length - 1) {
            const connector = document.createElement('div');
            connector.className = 'tree-connector';
            treeLevel.appendChild(connector);
        }
    });
    
    elements.syntaxTree.appendChild(treeLevel);
}

// 开始单词流
function startWordStream(sentence) {
    let wordIndex = 0;
    gameState.currentWordIndex = 0;
    
    // 清除之前的interval
    if (gameState.wordStreamInterval) {
        clearInterval(gameState.wordStreamInterval);
    }
    
    // 立即显示第一个单词
    if (sentence.words.length > 0) {
        addWordToStream(sentence.words[0], 0);
        wordIndex = 1;
        gameState.currentWordIndex = 1;
    }
    
    // 定期添加新单词
    gameState.wordStreamInterval = setInterval(() => {
        if (wordIndex < sentence.words.length) {
            addWordToStream(sentence.words[wordIndex], wordIndex);
            wordIndex++;
            gameState.currentWordIndex = wordIndex;
        } else {
            clearInterval(gameState.wordStreamInterval);
        }
    }, CONFIG.WORD_SPEED);
}

// 添加单词到流
function addWordToStream(word, index) {
    const wordElement = document.createElement('div');
    wordElement.className = 'word-item';
    wordElement.textContent = word;
    wordElement.dataset.word = word;
    wordElement.dataset.index = index;
    wordElement.draggable = true;
    
    // 设置初始位置
    wordElement.style.left = '20px';
    
    // 添加拖拽事件
    wordElement.addEventListener('dragstart', onDragStart);
    wordElement.addEventListener('dragend', onDragEnd);
    
    // 添加点击事件（用于点击选择）
    wordElement.addEventListener('click', () => onWordClick(wordElement));
    
    elements.wordStream.appendChild(wordElement);
    
    // 动画移动
    setTimeout(() => {
        wordElement.style.left = `${20 + index * 100}px`;
    }, 50);
}

// 更新当前句子显示 - 只显示已流动的单词，不显示答案
function updateCurrentSentenceDisplay() {
    if (!gameState.currentSentence) return;
    
    const words = gameState.currentSentence.words;
    const placedIndices = gameState.placedWords.map(pw => pw.wordIndex);
    
    // 只显示已经流出的单词（即index < currentWordIndex）
    let html = '';
    for (let i = 0; i < gameState.currentWordIndex; i++) {
        if (placedIndices.includes(i)) {
            html += `<span class="parsed-word">${words[i]}</span> `;
        } else {
            html += `<span class="pending-word">${words[i]}</span> `;
        }
    }
    
    elements.currentSentence.innerHTML = html;
}

// 点击单词
let selectedWord = null;

function onWordClick(wordElement) {
    if (!gameState.isPlaying) return;
    
    // 如果已经放置，不能选择
    if (wordElement.classList.contains('placed')) return;
    
    // 取消之前的选择
    if (selectedWord) {
        selectedWord.classList.remove('selected');
    }
    
    // 选择新单词
    if (selectedWord !== wordElement) {
        wordElement.classList.add('selected');
        selectedWord = wordElement;
        
        // 高亮可放置的槽位
        highlightAvailableSlots();
    } else {
        selectedWord = null;
        clearSlotHighlights();
    }
}

// 点击槽位
function onSlotClick(slotElement) {
    if (!gameState.isPlaying) return;
    if (!selectedWord) return;
    if (slotElement.classList.contains('filled')) return;
    
    placeWordInSlot(selectedWord, slotElement);
}

// 拖拽开始
function onDragStart(e) {
    if (!gameState.isPlaying) {
        e.preventDefault();
        return;
    }
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
        word: e.target.dataset.word,
        index: parseInt(e.target.dataset.index),
        elementId: e.target.id || `word-${Date.now()}`
    }));
    
    if (!e.target.id) {
        e.target.id = `word-${Date.now()}`;
    }
    
    highlightAvailableSlots();
}

// 拖拽结束
function onDragEnd(e) {
    e.target.classList.remove('dragging');
    clearSlotHighlights();
}

// 拖拽悬停
function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    let slotElement = e.target;
    if (!slotElement.classList.contains('slot')) {
        slotElement = e.target.closest('.slot');
    }
    
    if (slotElement && !slotElement.classList.contains('filled')) {
        slotElement.style.borderColor = 'var(--warning-color)';
        slotElement.style.transform = 'scale(1.05)';
    }
}

// 拖拽离开
function onDragLeave(e) {
    let slotElement = e.target;
    if (!slotElement.classList.contains('slot')) {
        slotElement = e.target.closest('.slot');
    }
    
    if (slotElement) {
        slotElement.style.borderColor = '';
        slotElement.style.transform = '';
    }
}

// 放置
function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let slotElement = e.target;
    if (!slotElement.classList.contains('slot')) {
        slotElement = e.target.closest('.slot');
    }
    
    if (!slotElement) return;
    
    slotElement.style.borderColor = '';
    slotElement.style.transform = '';
    
    // 检查槽位是否已满
    const expectedWords = parseInt(slotElement.dataset.expectedWords) || 1;
    const currentWordsInSlot = gameState.placedWords.filter(pw => pw.slotId === slotElement.dataset.slotId);
    
    if (currentWordsInSlot.length >= expectedWords) {
        return; // 槽位已满，不能再放
    }
    
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const wordElement = document.querySelector(`[data-index="${data.index}"]`);
        
        if (wordElement && !wordElement.classList.contains('placed')) {
            placeWordInSlot(wordElement, slotElement);
        }
    } catch (err) {
        console.error('Drop error:', err);
    }
}

// 高亮可用槽位
function highlightAvailableSlots() {
    const slots = document.querySelectorAll('.slot.empty');
    slots.forEach(slot => {
        slot.classList.add('highlight');
    });
}

// 清除槽位高亮
function clearSlotHighlights() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.classList.remove('highlight');
    });
}

// 放置单词到槽位
function placeWordInSlot(wordElement, slotElement) {
    const word = wordElement.dataset.word;
    const wordIndex = parseInt(wordElement.dataset.index);
    const slotId = slotElement.dataset.slotId;
    
    // 保存历史
    gameState.history.push({
        wordElement: wordElement,
        slotElement: slotElement,
        word: word,
        wordIndex: wordIndex,
        slotId: slotId
    });
    
    // 更新状态
    gameState.placedWords.push({
        word: word,
        wordIndex: wordIndex,
        slotId: slotId
    });
    
    // 更新UI
    wordElement.classList.remove('selected');
    wordElement.classList.add('placed');
    selectedWord = null;
    
    // 获取该槽位当前已放置的单词
    const currentWordsInSlot = gameState.placedWords.filter(pw => pw.slotId === slotId);
    const expectedWords = parseInt(slotElement.dataset.expectedWords) || 1;
    
    // 更新槽位内容
    const wordsText = currentWordsInSlot.map(pw => pw.word).join(' ');
    slotElement.innerHTML = `<span class="slot-content">${wordsText}</span>`;
    
    // 如果槽位已满，标记为filled
    if (currentWordsInSlot.length >= expectedWords) {
        slotElement.classList.remove('empty', 'highlight');
        slotElement.classList.add('filled');
    } else {
        // 槽位还没满，保持empty状态但显示已有单词
        slotElement.classList.remove('highlight');
    }
    
    clearSlotHighlights();
    updateCurrentSentenceDisplay();
    updateButtonStates();
    
    // 检查是否是花园路径陷阱
    checkGardenPathTrap(word, slotElement);
}

// 检查花园路径陷阱
function checkGardenPathTrap(word, slotElement) {
    const sentence = gameState.currentSentence;
    if (!sentence.isGardenPath) return;
    
    // 检查是否将陷阱词放入了错误的位置
    if (word === sentence.trapWord) {
        const slotType = slotElement.dataset.slotType;
        
        // 如果陷阱词被放入了VP槽位，这是错误的（会导致花园路径）
        if (slotType === 'VP') {
            showMessage('⚠️ 注意：你可能掉进了花园路径！', 'warning');
            
            // 高亮显示陷阱
            setTimeout(() => {
                slotElement.classList.add('error');
                showAcademicExplanation(sentence.trapExplanation);
            }, 300);
            
            setTimeout(() => {
                slotElement.classList.remove('error');
            }, 1500);
        }
    }
}

// 显示学术解释
function showAcademicExplanation(explanation) {
    const panel = document.createElement('div');
    panel.className = 'academic-explanation';
    panel.innerHTML = `
        <div style="
            background: rgba(233, 69, 96, 0.2);
            border: 2px solid var(--accent-color);
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
            animation: slideIn 0.3s ease;
        ">
            <strong style="color: var(--accent-color);">🧠 心理语言学分析：</strong>
            <p style="margin-top: 8px; color: var(--text-color);">${explanation}</p>
        </div>
    `;
    
    elements.academicContent.appendChild(panel);
    
    // 5秒后移除
    setTimeout(() => {
        panel.remove();
    }, 8000);
}

// 撤销操作
function undoLastAction() {
    if (gameState.history.length === 0) return;
    
    const lastAction = gameState.history.pop();
    
    // 恢复单词
    lastAction.wordElement.classList.remove('placed');
    
    // 从placedWords中移除
    gameState.placedWords = gameState.placedWords.filter(
        pw => pw.wordIndex !== lastAction.wordIndex
    );
    
    // 更新槽位内容（保留其他已放置的单词）
    const currentWordsInSlot = gameState.placedWords.filter(pw => pw.slotId === lastAction.slotId);
    
    if (currentWordsInSlot.length > 0) {
        // 槽位还有其他单词，更新显示
        const wordsText = currentWordsInSlot.map(pw => pw.word).join(' ');
        lastAction.slotElement.innerHTML = `<span class="slot-content">${wordsText}</span>`;
        lastAction.slotElement.classList.remove('filled');
        
        // 检查是否已满
        const expectedWords = parseInt(lastAction.slotElement.dataset.expectedWords) || 1;
        if (currentWordsInSlot.length >= expectedWords) {
            lastAction.slotElement.classList.add('filled');
        }
    } else {
        // 槽位已空
        lastAction.slotElement.classList.remove('filled');
        lastAction.slotElement.classList.add('empty');
        lastAction.slotElement.innerHTML = '';
    }
    
    // 扣除时间
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - CONFIG.PENALTY_TIME);
    
    updateCurrentSentenceDisplay();
    updateUI();
    updateButtonStates();
    
    showTimeChange(CONFIG.PENALTY_TIME, false);
    showMessage(`撤销成功！扣除 ${CONFIG.PENALTY_TIME} 秒`, 'warning');
}

// 显示提示
function showHint() {
    if (!gameState.currentSentence) return;
    
    const sentence = gameState.currentSentence;
    let hintText = '';
    
    // 计算“第一个尚未放置”的单词索引，避免用长度推断导致提示不准确
    const placedSet = new Set(gameState.placedWords.map(pw => pw.wordIndex));
    const nextIndex = sentence.words.findIndex((_, index) => !placedSet.has(index));
    
    if (nextIndex !== -1) {
        const nextWord = sentence.words[nextIndex];
        
        // 从句法结构中推断该词可能所属的槽位类型
        const candidateSlotTypes = [];
        for (const [slotKey, slotInfo] of Object.entries(sentence.structure)) {
            if (Array.isArray(slotInfo.words) && slotInfo.words.includes(nextIndex)) {
                candidateSlotTypes.push(slotInfo.type || slotKey);
            }
        }
        
        const uniqueSlotTypes = [...new Set(candidateSlotTypes)];
        const slotHint = uniqueSlotTypes.length > 0
            ? `（建议槽位：${uniqueSlotTypes.join(' / ')}）`
            : '';
        
        hintText = `💡 下一个单词 "${nextWord}" ${slotHint}`;
        
        // 花园路径句追加陷阱提醒（但不覆盖“下一个词”信息）
        if (sentence.isGardenPath && sentence.trapExplanation) {
            hintText += ` ｜ ⚠️ ${sentence.trapExplanation}`;
        }
    } else {
        hintText = '💡 所有单词都已放置，点击确认解析！';
    }
    
    showMessage(hintText, 'warning');
    if (elements.hintDisplay) {
        elements.hintDisplay.textContent = hintText;
        elements.hintDisplay.classList.add('active');
    }
    
    // 扣除少量时间作为提示代价
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - 2);
    updateUI();
}

// 检查解决方案
function checkSolution() {
    const sentence = gameState.currentSentence;
    const structure = sentence.structure;
    
    let isCorrect = true;
    let errors = [];
    
    // 检查每个槽位
    for (const [slotType, slotInfo] of Object.entries(structure)) {
        const slotElement = document.querySelector(`[data-slot-type="${slotInfo.type || slotType}"]`);
        
        if (!slotElement) continue;
        
        // 获取该槽位所有已放置的单词
        const placedWordsInSlot = gameState.placedWords.filter(pw => pw.slotId === slotElement.dataset.slotId);
        
        // 检查槽位是否为空
        if (placedWordsInSlot.length === 0) {
            isCorrect = false;
            errors.push(`${slotType} 槽位为空`);
            slotElement.classList.add('error');
            continue;
        }
        
        // 获取预期的单词索引和实际放置的单词索引
        const expectedWordIndices = slotInfo.words;
        const actualWordIndices = placedWordsInSlot.map(pw => pw.wordIndex);
        
        // 检查单词数量是否匹配
        if (expectedWordIndices.length !== actualWordIndices.length) {
            isCorrect = false;
            errors.push(`${slotType} 槽位单词数量错误`);
            slotElement.classList.add('error');
            continue;
        }
        
        // 检查每个单词是否正确（顺序也要正确）
        let slotCorrect = true;
        for (let i = 0; i < expectedWordIndices.length; i++) {
            if (expectedWordIndices[i] !== actualWordIndices[i]) {
                slotCorrect = false;
                break;
            }
        }
        
        if (!slotCorrect) {
            isCorrect = false;
            errors.push(`${slotType} 槽位单词错误`);
            slotElement.classList.add('error');
        } else {
            slotElement.classList.add('correct');
        }
    }
    
    // 清除错误/正确状态
    setTimeout(() => {
        document.querySelectorAll('.slot').forEach(slot => {
            slot.classList.remove('error', 'correct');
        });
    }, 2000);
    
    if (isCorrect) {
        // 成功！
        const bonus = sentence.isGardenPath ? 2 : 1;
        const points = CONFIG.POINTS_PER_LEVEL * sentence.difficulty * bonus;
        
        gameState.score += points;
        gameState.timeRemaining += CONFIG.BONUS_TIME;
        gameState.level++;
        
        // 在verify按钮附近显示时间奖励效果
        showTimeChangeOnButton(CONFIG.BONUS_TIME, true);
        showTimeChange(CONFIG.BONUS_TIME, true);
        showMessage(`🎉 解析成功！+${points}分 +${CONFIG.BONUS_TIME}秒`, 'success');
        
        setTimeout(() => {
            loadLevel();
            updateUI();
        }, 2000);
    } else {
        // 失败
        showMessage(`❌ 解析失败：${errors.join('，')}`, 'error');
        
        // 如果是花园路径句，显示解释
        if (sentence.isGardenPath) {
            setTimeout(() => {
                showAcademicExplanation(sentence.trapExplanation);
            }, 500);
        }
    }
}

// 更新按钮状态
function updateButtonStates() {
    elements.btnUndo.disabled = gameState.history.length === 0;
    
    // 检查是否可以提交（所有必需槽位已填充）
    const requiredSlots = document.querySelectorAll('.slot[data-required="true"]');
    const filledRequiredSlots = document.querySelectorAll('.slot[data-required="true"].filled');
    
    elements.btnSubmit.disabled = filledRequiredSlots.length < requiredSlots.length;
}

// 更新学术内容
function updateAcademicContent(sentence) {
    let content = '';
    
    if (sentence.isGardenPath) {
        content = `
            <p><strong>🌸 花园路径句 (Garden Path Sentence):</strong></p>
            <p>这是一个经典的花园路径句！当你读到 "${sentence.trapWord}" 时，大脑会本能地按照<strong>最小附着原则 (Minimal Attachment)</strong>进行解析。</p>
            <p><strong>当前句子:</strong> "${sentence.display}"</p>
            <p><strong>正确解析:</strong> ${sentence.translation}</p>
            <p><strong>陷阱:</strong> ${sentence.trapExplanation}</p>
        `;
    } else {
        content = `
            <p><strong>📚 句法分析:</strong></p>
            <p>这是一个标准句子，按照常规句法结构进行解析即可。</p>
            <p><strong>当前句子:</strong> "${sentence.display}"</p>
            <p><strong>翻译:</strong> ${sentence.translation}</p>
        `;
    }
    
    // 保留原有内容，添加新内容
    const baseContent = `
        <p><strong>花园路径句 (Garden Path Sentence):</strong></p>
        <p>一种初始解析会导致错误、需要回溯重新解析的句子。</p>
        <p><strong>最小附着原则 (Minimal Attachment):</strong></p>
        <p>大脑倾向于用最少的句法节点来解析新词，这正是导致"掉进花园路径"的原因！</p>
    `;
    
    elements.academicContent.innerHTML = baseContent + '<hr style="margin: 15px 0; opacity: 0.3;">' + content;
}

// 计时器
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateUI();
        
        if (gameState.timeRemaining <= 0) {
            gameOver();
        }
    }, 1000);
}

// 显示时间变化提示
function showTimeChange(delta, isBonus = true) {
    const timerElement = elements.timer;
    const changeElement = document.createElement('span');
    changeElement.className = `time-change ${isBonus ? 'bonus' : 'penalty'}`;
    changeElement.textContent = isBonus ? `+${delta}s` : `-${delta}s`;
    
    timerElement.parentNode.appendChild(changeElement);
    
    // 添加震动效果
    if (!isBonus) {
        document.body.style.animation = 'screen-shake 0.3s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 300);
    }
    
    // 动画后移除元素
    setTimeout(() => {
        changeElement.classList.add('fade-out');
        setTimeout(() => {
            changeElement.remove();
        }, 500);
    }, 1000);
}

// 在verify按钮附近显示时间奖励效果
function showTimeChangeOnButton(delta, isBonus = true) {
    const btnSubmit = elements.btnSubmit;
    
    // 清除之前的时间奖励效果
    document.querySelectorAll('.time-change-button').forEach(el => el.remove());
    
    const changeElement = document.createElement('div');
    changeElement.className = `time-change-button ${isBonus ? 'bonus' : 'penalty'}`;
    
    const icon = isBonus ? '⏱️' : '⏰';
    changeElement.innerHTML = `<span class="time-icon">${icon}</span><span class="time-value">+${delta}秒</span>`;
    
    btnSubmit.parentNode.appendChild(changeElement);
    
    // 添加按钮闪烁效果
    btnSubmit.classList.add('btn-success-flash');
    
    // 动画后移除元素
    setTimeout(() => {
        changeElement.classList.add('fade-out');
        btnSubmit.classList.remove('btn-success-flash');
        setTimeout(() => {
            changeElement.remove();
        }, 500);
    }, 2000);
}

// 游戏结束
function gameOver() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.wordStreamInterval);
    
    // 添加屏幕震动效果
    document.body.style.animation = 'screen-shake 0.5s ease-in-out 3';
    
    setTimeout(() => {
        const totalTrapsAvoided = gameState.usedSentenceIds.filter(id => {
            const s = SENTENCES.find(s => s.id === id);
            return s && s.isGardenPath;
        }).length;
        const totalSentences = gameState.usedSentenceIds.length;
        const accuracy = totalSentences > 0 ? Math.round((totalTrapsAvoided / totalSentences) * 100) : 0;
        
        let grade = 'C';
        let gradeColor = '#ffb400';
        let feedback = '继续练习，你会变得更强！';
        
        if (gameState.score >= 500) {
            grade = 'S';
            gradeColor = '#00ff88';
            feedback = '🎖️ 句法大师！你完美地掌握了花园路径句的解析！';
        } else if (gameState.score >= 300) {
            grade = 'A';
            gradeColor = '#00d4ff';
            feedback = '⭐ 优秀！你的语言解析能力非常出色！';
        } else if (gameState.score >= 200) {
            grade = 'B';
            gradeColor = '#ff00ff';
            feedback = '👍 不错！继续努力，你能做得更好！';
        }
        
        elements.overlayTitle.textContent = 'GAME OVER';
        elements.overlayDesc.innerHTML = `
            <div class="game-over-grade" style="color: ${gradeColor};">${grade}</div>
            <div class="game-over-stats">
                <div class="stat-item">
                    <span class="stat-label">最终得分</span>
                    <span class="stat-value">${gameState.score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">完成关卡</span>
                    <span class="stat-value">${gameState.level - 1}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">陷阱避开</span>
                    <span class="stat-value">${totalTrapsAvoided}/${totalSentences}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">准确率</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
            </div>
            <p class="game-over-feedback">${feedback}</p>
            <p class="game-over-message">时间已耗尽</p>
        `;
        elements.btnStart.textContent = '再玩一次';
        elements.btnStart.classList.add('reboot-btn');
        
        elements.overlay.classList.remove('hidden');
        document.body.style.animation = '';
    }, 1500);
}

// 更新UI
function updateUI() {
    elements.level.textContent = gameState.level;
    elements.score.textContent = gameState.score;
    elements.timer.textContent = gameState.timeRemaining;
    
    // 时间警告效果
    if (gameState.timeRemaining <= 5) {
        elements.timer.style.color = 'var(--destructive)';
        elements.timer.classList.add('timer-danger');
        document.body.style.animation = 'screen-shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    } else if (gameState.timeRemaining <= 15) {
        elements.timer.style.color = '#ffb400';
        elements.timer.classList.add('timer-warning');
    } else {
        elements.timer.style.color = 'var(--accent)';
        elements.timer.classList.remove('timer-warning', 'timer-danger');
    }
}

// 显示消息
let messageClearTimer = null;

function showMessage(text, type = 'info') {
    // 清理上一条消息的清除定时器，避免旧定时器误清空新消息
    if (messageClearTimer) {
        clearTimeout(messageClearTimer);
        messageClearTimer = null;
    }

    // 先重置消息元素
    elements.message.textContent = '';
    elements.message.className = 'message';
    elements.message.style.cssText = '';
    
    // 强制触发重绘
    void elements.message.offsetWidth;
    
    // 设置新消息（与 CSS 的 `.message.warning` 命名保持一致）
    elements.message.textContent = text;
    elements.message.className = `message ${type}`;
    
    // 兜底内联样式：避免类名/层级冲突导致消息看不见
    elements.message.style.display = 'block';
    elements.message.style.opacity = '1';
    elements.message.style.zIndex = '3000';
    elements.message.style.pointerEvents = 'none';
    
    if (type === 'success') {
        elements.message.style.background = 'rgba(0, 255, 136, 0.2)';
        elements.message.style.border = '1px solid #00ff88';
        elements.message.style.color = '#00ff88';
    } else if (type === 'error') {
        elements.message.style.background = 'rgba(255, 51, 102, 0.2)';
        elements.message.style.border = '1px solid #ff3366';
        elements.message.style.color = '#ff3366';
    } else if (type === 'warning') {
        elements.message.style.background = 'rgba(255, 180, 0, 0.2)';
        elements.message.style.border = '1px solid #ffb400';
        elements.message.style.color = '#ffb400';
    } else {
        elements.message.style.background = 'rgba(0, 212, 255, 0.2)';
        elements.message.style.border = '1px solid #00d4ff';
        elements.message.style.color = '#00d4ff';
    }
    
    // 3.5秒后清除消息（等待动画完成）
    messageClearTimer = setTimeout(() => {
        elements.message.textContent = '';
        elements.message.className = 'message';
        elements.message.style.cssText = '';
        messageClearTimer = null;
    }, 3500);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);