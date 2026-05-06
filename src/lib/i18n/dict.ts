export type Locale = 'ko' | 'en'

const dict = {
  ko: {
    // Nav
    nav_explore: '탐색',
    nav_roadmap: '학습 로드맵',
    nav_community: '커뮤니티',
    nav_create: '만들기',
    nav_my_learning: '내 학습',
    nav_my_page: '마이페이지',

    // Header actions
    header_create_cta: '만들기',
    header_login: '로그인',
    header_search_placeholder: '배우고 싶은 주제를 검색해보세요',
    header_notifications: '알림',

    // User menu
    menu_my_page_desc: '프로필 및 통계',
    menu_my_learning_desc: '진행 중·완료한 학습',
    menu_create_desc: '새 커리큘럼 제작',
    menu_signout: '로그아웃',

    // Locale switcher
    locale_label: '언어',
    locale_ko: '한국어',
    locale_en: 'English',

    // Auth
    auth_start: '시작하기',
    auth_desc: '로그인하면 진도를 저장하고 커리큘럼을 만들 수 있어요',
    auth_google: 'Google로 계속하기',
    auth_email_divider: '또는 이메일로',
    auth_email_placeholder: '이메일 주소',
    auth_email_cta: '로그인 링크 받기',
    auth_email_sending: '전송 중...',
    auth_sent_title: '이메일을 확인하세요',
    auth_sent_desc: '으로 로그인 링크를 보냈어요.',
    auth_sent_sub: '링크를 클릭하면 자동으로 로그인됩니다.',
    auth_try_other: '다른 이메일로 시도하기',
    auth_back_home: '홈으로 돌아가기 →',
    auth_demo_label: '✦ 로그인 없이 데모 체험',
    auth_brand_headline_1: '배움이',
    auth_brand_headline_2: '이어지는',
    auth_brand_headline_3: '나만의 경로',
    auth_brand_sub: '양질의 커리큘럼을 발견하고,\n나만의 학습 로드맵으로 성장하세요.',
    auth_feature_1: '검증된 커리큘럼을 단계별로 학습',
    auth_feature_2: '진도 저장 & 언제든 이어보기',
    auth_feature_3: '나만의 커리큘럼 제작 & 공유',

    // Demo banner
    demo_title: '데모 모드로 둘러보는 중이에요',
    demo_desc: '실제 진도 저장 및 커리큘럼 제작은 로그인 후 이용할 수 있어요',
    demo_explore: '탐색하기',
    demo_start: '시작하기 →',

    // Common
    level_beginner: '초급',
    level_intermediate: '중급',
    level_advanced: '고급',
    minutes_unit: '분',
    hours_unit: '시간',
  },
  en: {
    // Nav
    nav_explore: 'Explore',
    nav_roadmap: 'Learning Roadmap',
    nav_community: 'Community',
    nav_create: 'Create',
    nav_my_learning: 'My Learning',
    nav_my_page: 'My Page',

    // Header actions
    header_create_cta: 'Create',
    header_login: 'Log in',
    header_search_placeholder: 'Search topics to learn...',
    header_notifications: 'Notifications',

    // User menu
    menu_my_page_desc: 'Profile & stats',
    menu_my_learning_desc: 'In-progress & completed',
    menu_create_desc: 'Build a new curriculum',
    menu_signout: 'Sign out',

    // Locale switcher
    locale_label: 'Language',
    locale_ko: '한국어',
    locale_en: 'English',

    // Auth
    auth_start: 'Get started',
    auth_desc: 'Sign in to save your progress and create curricula',
    auth_google: 'Continue with Google',
    auth_email_divider: 'or continue with email',
    auth_email_placeholder: 'Email address',
    auth_email_cta: 'Get login link',
    auth_email_sending: 'Sending...',
    auth_sent_title: 'Check your email',
    auth_sent_desc: 'We sent a login link to',
    auth_sent_sub: 'Click the link to sign in automatically.',
    auth_try_other: 'Try a different email',
    auth_back_home: 'Back to home →',
    auth_demo_label: '✦ Try demo without signing in',
    auth_brand_headline_1: 'Learning',
    auth_brand_headline_2: 'that continues —',
    auth_brand_headline_3: 'your own path',
    auth_brand_sub: 'Discover quality curricula and\ngrow with your own learning roadmap.',
    auth_feature_1: 'Step-by-step verified curricula',
    auth_feature_2: 'Save progress & pick up anytime',
    auth_feature_3: 'Build & share your own curriculum',

    // Demo banner
    demo_title: 'You\'re browsing in demo mode',
    demo_desc: 'Sign in to save your progress and create curricula',
    demo_explore: 'Explore',
    demo_start: 'Get started →',

    // Common
    level_beginner: 'Beginner',
    level_intermediate: 'Intermediate',
    level_advanced: 'Advanced',
    minutes_unit: 'min',
    hours_unit: 'hr',
  },
} as const

export type DictKey = keyof typeof dict.ko
export { dict }
