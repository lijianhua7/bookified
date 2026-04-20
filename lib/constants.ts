// 品牌色 - 用于 JS 文件中无法使用 CSS 变量的场景
export const BRAND_COLOR = '#212a3b'; // 深蓝灰色
export const BRAND_COLOR_HOVER = '#3d485e'; // 中蓝灰色

// 首页示例书籍（使用 Open Library 封面）
export const sampleBooks = [
    {
        _id: '1',
        title: 'Clean Code',
        author: 'Robert Cecil Martin',
        slug: 'clean-code',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '2',
        title: 'JavaScript: The Definitive Guide',
        author: 'David Flanagan',
        slug: 'javascript-the-definitive-guide',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780596805524-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '3',
        title: 'Brave New World',
        author: 'Aldous Huxley',
        slug: 'brave-new-world',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '4',
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        slug: 'rich-dad-poor-dad',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '5',
        title: 'Deep Work',
        author: 'Cal Newport',
        slug: 'deep-work',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '6',
        title: 'How to Win Friends and Influence People',
        author: 'Dale Carnegie',
        slug: 'how-to-win-friends-and-influence-people',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '7',
        title: 'The Power of Habit',
        author: 'Charles Duhigg',
        slug: 'the-power-of-habit',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781400069286-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '8',
        title: 'Atomic Habits',
        author: 'James Clear',
        slug: 'atomic-habits',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '9',
        title: 'The Courage to Be Disliked',
        author: 'Fumitake Koga & Ichiro Kishimi',
        slug: 'the-courage-to-be-disliked',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781501197274-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '10',
        title: '1984',
        author: 'George Orwell',
        slug: '1984',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        coverColor: '#f8f4e9',
    },
];

// 文件校验辅助常量
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_PDF_TYPES = ['application/pdf'];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 预配置的 VAPI 助手 ID（在此应用中硬编码）
// const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
// if (!assistantId || assistantId.trim() === '') {
//     throw new Error('NEXT_PUBLIC_ASSISTANT_ID 环境变量是必需的但未设置。请在 .env 文件中配置。');
// }
// export const ASSISTANT_ID = assistantId;

// 11Labs 语音 ID - 针对对话式 AI 优化
// 精选适合自然、引人入胜的书籍对话的语音
export const voiceOptions = {
    // 男声
    dave: { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', description: '年轻男性，英式埃塞克斯口音，休闲对话风格' },
    daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: '中年男性，英式口音，权威而温暖' },
    chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: '男性，休闲随和风格' },
    // 女声
    rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: '年轻女性，美式口音，沉稳清晰' },
    sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: '年轻女性，美式口音，柔和亲切' },
};

// 语音选择器 UI 的分类
export const voiceCategories = {
    male: ['dave', 'daniel', 'chris'],
    female: ['rachel', 'sarah'],
};

// 默认语音
export const DEFAULT_VOICE = 'rachel';

// ElevenLabs 语音设置，针对对话式 AI 优化
export const VOICE_SETTINGS = {
    stability: 0.45, // 较低值使语音更富情感和动态（0.30-0.50 较自然）
    similarityBoost: 0.75, // 增强清晰度且不失真
    style: 0, // 对话式 AI 保持为 0（越高延迟越大，越不稳定）
    useSpeakerBoost: true, // 提升语音质量
    speed: 1.0, // 自然对话速度
};

// VAPI 自然对话配置
// 注意：这些设置应在 VAPI 控制台中为助手进行配置
// 此处保留仅供参考和文档记录
export const VAPI_DASHBOARD_CONFIG = {
    // 轮流发言设置
    startSpeakingPlan: {
        smartEndpointingEnabled: true,
        waitSeconds: 0.4,
    },
    stopSpeakingPlan: {
        numWords: 2,
        voiceSeconds: 0.2,
        backoffSeconds: 1.0,
    },
    // 时间设置
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.4,
    llmRequestDelaySeconds: 0.1,
    // 对话功能
    backgroundDenoisingEnabled: true,
    backchannelingEnabled: true,
    fillerInjectionEnabled: false,
};

// Clerk 外观覆盖 - 温暖文艺风格
// 注意：Tailwind 在构建时需要静态类名，因此这里硬编码颜色值
export const CLERK_AUTH_APPEARANCE_OVERRIDE = {
    rootBox: 'mx-auto',
    card: 'shadow-none border-none rounded-xl bg-transparent',
    headerTitle: 'text-2xl! font-bold text-[#212a3b]',
    headerSubtitle: 'mt-3! text-sm! text-[#3d485e]',
    socialButtonsBlockButton:
        'border! border-[rgba(33,42,59,0.12)] hover:bg-[#212a3b]/10 transition-all h-12 text-lg rounded-xl! shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)]',
    socialButtonsBlockButtonText: 'font-medium text-[#212a3b]! text-lg!',
    formButtonPrimary:
        'bg-[#212a3b] hover:bg-[#3d485e] text-white font-medium border-0! shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] normal-case h-12! text-lg! rounded-xl!',
    formFieldInput:
        'border! border-[rgba(33,42,59,0.12)]! rounded-xl! focus:ring-[#212a3b] focus:border-[#212a3b] h-12! min-h-12! text-lg! bg-white! shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]',
    formFieldLabel: 'text-[#212a3b] font-medium text-lg',
    footerActionLink: 'text-[#212a3b] hover:text-[#3d485e] text-base font-medium',
};

