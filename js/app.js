// ========================================
// グローバル状態管理
// ========================================
const appState = {
    employmentStatus: null, // true: 障害者雇用検討, false: 非検討, null: わからない
    phase1Answers: {}, // { R: [true, false, null, ...], I: [...], ... }
    phase2Answers: {}, // { R: [true, false, true], I: [...], ... }
    currentPhase: 1,
    currentQuestionIndex: 0,
    currentCategoryIndex: 0, // 現在のカテゴリインデックス
    unsureCategories: [], // phase1で「わからない」が多いカテゴリのリスト
    phase2CurrentCategory: null,
    phase2CurrentSubQuestion: 0,
    scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
    history: [] // 画面遷移履歴
};

// ========================================
// RIASEC定義データ
// ========================================
const RIASEC_DATA = {
    R: {
        name: 'ものづくり・体を動かす',
        description: '手や体を使って具体的なものを作ったり、機械を操作したり、体を動かす仕事が向いています。製造業、建設業、農業、清掃業などの分野で活躍できます。',
        phase1Questions: [
            '手を使って何かを作ったり、組み立てたりするのは好きですか？',
            '体を動かして働くことに興味がありますか？',
            '機械や道具を使うのは好きですか？',
            '実際に目に見える成果が出る仕事に魅力を感じますか？'
        ],
        phase2Questions: [
            '工具や機械を使って作業するのは楽しいですか？',
            '体を動かしてスポーツをするのは好きですか？',
            '外で活動するのは好きですか？',
            'プラモデルや工作など、手先を使うのは得意ですか？',
            '車やバイク、機械の仕組みに興味がありますか？'
        ]
    },
    I: {
        name: '調べる・考える',
        description: '情報を集めて分析したり、問題を論理的に解決したりすることが得意です。IT業界、研究職、データ分析、品質管理などの分野で力を発揮できます。',
        phase1Questions: [
            '新しいことを学ぶのは楽しいですか？',
            '問題の原因を考えて解決するのは好きですか？',
            '情報を調べたり、まとめたりするのは得意ですか？',
            '「なぜ？」「どうして？」と疑問を持つことが多いですか？'
        ],
        phase2Questions: [
            'パソコンやスマホで情報を調べるのは楽しいですか？',
            '本を読んで知識を得るのは好きですか？',
            'パズルやクイズを解くのは好きですか？',
            '実験や観察をするのは面白いと思いますか？',
            '新しい技術やニュースに興味がありますか？'
        ]
    },
    A: {
        name: 'つくる・表現する',
        description: '自分のアイデアを形にしたり、芸術的な活動をしたりすることが得意です。デザイン業界、クリエイティブ職、Web制作、ハンドメイド作家などの道があります。',
        phase1Questions: [
            '絵を描いたり、何かをデザインしたりするのは好きですか？',
            '自分のアイデアや感じたことを表現したいですか？',
            '音楽、美術、デザインなどの芸術に興味がありますか？',
            'おしゃれや見た目の美しさにこだわりがありますか？'
        ],
        phase2Questions: [
            '絵を描いたり、デザインを考えたりするのは楽しいですか？',
            '音楽を聴いたり、演奏したりするのは好きですか？',
            '自分のアイデアを形にするのは好きですか？',
            '写真を撮ったり、動画を作ったりするのは楽しいですか？',
            'ファッションやインテリアに興味がありますか？'
        ]
    },
    S: {
        name: '人を助ける・支える',
        description: '人と関わり、困っている人を助けたり、支えたりすることにやりがいを感じます。福祉・介護、医療、接客・サービス業、教育補助などの分野が向いています。',
        phase1Questions: [
            '人と話すのは好きですか？',
            '困っている人を見ると助けたくなりますか？',
            '人の役に立つ仕事をしたいと思いますか？',
            '人と協力して何かをするのは楽しいですか？'
        ],
        phase2Questions: [
            '困っている人を助けるのは好きですか？',
            '人と一緒に何かをするのは楽しいですか？',
            '人の話を聞いて、アドバイスするのは好きですか？',
            'お年寄りや子どもと関わるのは好きですか？',
            '誰かに感謝されると嬉しいですか？'
        ]
    },
    E: {
        name: 'リーダー・企画する',
        description: '人をまとめたり、新しいプロジェクトを企画したりすることが得意です。営業職、イベント企画、店舗マネージャー、プロジェクトリーダーなどで活躍できます。',
        phase1Questions: [
            'グループで何かをする時、リーダーになることがありますか？',
            '新しいことを始めるのは好きですか？',
            '人を説得したり、意見を伝えたりするのは得意ですか？',
            '目標を決めて、それを達成するのは楽しいですか？'
        ],
        phase2Questions: [
            'グループで中心になって進めるのは好きですか？',
            '新しいことを企画するのは楽しいですか？',
            '目標を決めて、達成するのは好きですか？',
            '人前で話したり、発表したりするのは得意ですか？',
            '責任のある仕事を任されるとやる気が出ますか？'
        ]
    },
    C: {
        name: '正確に・きちんと進める',
        description: '決められたルールや手順に従って、正確に仕事を進めることが得意です。事務職、経理、総務、データ入力、品質チェックなどの仕事が向いています。',
        phase1Questions: [
            'ルールや決まりを守るのは大切だと思いますか？',
            'きちんと整理整頓されていると気持ちがいいですか？',
            '正確に、丁寧に作業するのは得意ですか？',
            '計画を立てて、その通りに進めるのは好きですか？'
        ],
        phase2Questions: [
            '部屋や机を整理整頓するのは好きですか？',
            'データや資料を正確にまとめるのは楽しいですか？',
            '決められた手順通りに進めるのは好きですか？',
            'チェックリストを使って確認するのは好きですか？',
            '細かい作業や、同じ作業を繰り返すのは苦にならないですか？'
        ]
    }
};

// 職業データベース（立川・多摩・東京近郊を考慮）
const CAREER_DATABASE = {
    R: [
        { 
            name: '製造スタッフ', 
            description: '工場で製品を組み立てたり、部品を検査したりする仕事です。電子部品、自動車部品、食品加工などの業界があります。立川周辺には中小製造業が多く、求人も豊富です。',
            disabilityNote: '座り作業や軽作業の求人が多くあります。作業手順が明確で、自分のペースで働けます。'
        },
        { 
            name: '清掃スタッフ', 
            description: 'オフィスビル、商業施設、病院などをきれいに保つ仕事です。掃除機がけ、モップ掛け、トイレ清掃などを担当します。',
            disabilityNote: '自分のペースで作業でき、ルーティンワークが中心です。立川駅周辺のビルで多くの求人があります。'
        },
        { 
            name: '配送・物流スタッフ', 
            description: '倉庫で商品をピッキング（集める）したり、梱包したりする仕事です。Amazonや楽天などのネット通販の物流センターで働きます。',
            disabilityNote: '多摩地区には大型物流センターが多く、倉庫内作業の求人が豊富です。体を動かす仕事が好きな方に向いています。'
        },
        { 
            name: '農業・園芸スタッフ', 
            description: '畑で野菜を育てたり、温室で花や観葉植物を栽培したりする仕事です。種まき、水やり、収穫などを行います。',
            disabilityNote: '多摩地区には農園や園芸施設が多くあります。自然の中で働くことができ、季節の変化を感じられます。'
        },
        { 
            name: '食品加工スタッフ', 
            description: 'パンやお弁当、お菓子などを作ったり、包装したりする仕事です。レシピ通りに材料を計量したり、機械を操作したりします。',
            disabilityNote: '座り作業や軽作業が中心で、清潔な環境で働けます。パン工場や食品工場の求人があります。'
        }
    ],
    I: [
        { 
            name: 'データ入力スタッフ', 
            description: 'パソコンを使って、顧客情報や商品データなどを入力・整理する仕事です。ExcelやWordを使って、データベースを管理します。一般企業の事務部門で働きます。',
            disabilityNote: '在宅勤務やフレックスタイム制の職場も増えています。自分のペースで正確に作業できる環境です。'
        },
        { 
            name: '図書館スタッフ', 
            description: '図書館や公民館で、本の貸出・返却、本棚の整理、新刊書の登録などを行う仕事です。本が好きな人にぴったりです。',
            disabilityNote: '静かで落ち着いた環境で働けます。立川市立図書館などで求人があります。'
        },
        { 
            name: 'IT・プログラミング', 
            description: 'パソコンを使ってプログラムを作ったり、ウェブサイトを設計・開発したりする仕事です。Python、JavaScriptなどのプログラミング言語を使います。',
            disabilityNote: '在宅勤務やフレックス勤務が可能な職場が多く、自分のペースで学びながら働けます。'
        },
        { 
            name: '研究補助スタッフ', 
            description: '大学や企業の研究室で、実験機器の準備、データの記録、資料の整理などを行う仕事です。理系の知識を活かせます。',
            disabilityNote: '立川周辺には国立極地研究所などの研究機関があり、求人があります。'
        },
        { 
            name: '品質管理スタッフ', 
            description: '製造された製品が基準を満たしているか、目視検査や測定器を使ってチェックする仕事です。製造業、食品業界で需要があります。',
            disabilityNote: '細かいところに気が付く力と正確さを活かせる仕事です。'
        }
    ],
    A: [
        { 
            name: 'デザイナー・イラストレーター', 
            description: 'Adobe IllustratorやPhotoshopを使って、ポスター、チラシ、商品パッケージ、イラストなどをデザインする仕事です。広告代理店、印刷会社、デザイン事務所で働きます。',
            disabilityNote: '在宅で作業できるフリーランスや業務委託の求人もあります。'
        },
        { 
            name: 'ハンドメイド作家', 
            description: 'アクセサリー、雑貨、小物、レジンアートなどを手作りして、minneやCreema、メルカリなどのプラットフォームで販売したり、イベントで売ったりします。',
            disabilityNote: '自分のペースで活動でき、就労支援を受けながら起業することもできます。'
        },
        { 
            name: 'Web制作スタッフ', 
            description: 'HTML、CSS、JavaScriptを使ってウェブサイトをデザイン・作成したり、サイトの情報を更新したりする仕事です。Web制作会社やIT企業で働きます。',
            disabilityNote: '在宅勤務やフリーランスとして働く道もあり、自分のペースで作業できます。'
        },
        { 
            name: '音楽・動画編集スタッフ', 
            description: 'Adobe Premiere ProやFinal Cut Proで動画を編集したり、DAWソフトで音楽を編集・ミックスしたりする仕事です。YouTube、TikTokなどの動画制作需要が増えています。',
            disabilityNote: 'フリーランスや在宅で活動でき、クリエイティブな力を存分に発揮できます。'
        },
        { 
            name: '写真スタッフ', 
            description: '結婚式、イベント、商品、風景などをカメラで撮影し、LightroomやPhotoshopで編集する仕事です。フリーランスやスタジオ勤務があります。',
            disabilityNote: '自分のペースで活動でき、趣味を仕事にできます。'
        }
    ],
    S: [
        { 
            name: '介護・福祉スタッフ', 
            description: '特別養護老人ホーム、デイサービス、障害者支援施設で、食事介助、入浴介助、レクリエーション活動などを通じて、利用者の生活をサポートします。',
            disabilityNote: '多摩地区には多くの福祉施設があり、初任者研修や資格取得支援が充実しています。'
        },
        { 
            name: '保育補助スタッフ', 
            description: '保育園や学童保育で、保育士をサポートしながら、子どもたちの遊びの見守り、食事の手伝い、掃除、教材の準備などを行います。資格がなくても働けます。',
            disabilityNote: '補助スタッフやパートタイムとして働く道があり、子どもが好きな人に向いています。'
        },
        { 
            name: '接客・販売スタッフ', 
            description: 'コンビニ、スーパー、アパレルショップ、雑貨屋などで、レジ打ち、商品陳列、お客様対応、在庫管理などを行います。立川駅周辺には多くの小売店があります。',
            disabilityNote: 'マニュアルが整っているチェーン店が多く、研修制度が充実しています。'
        },
        { 
            name: '受付スタッフ', 
            description: '会社の受付、ホテルのフロント、病院の受付などで、来客対応、電話対応、来客管理、簡単な事務作業を行います。第一印象を大切にする仕事です。',
            disabilityNote: '落ち着いた環境で、マナーや対応方法を学びながら働けます。'
        },
        { 
            name: 'カスタマーサポート', 
            description: 'コールセンターやチャットサポートで、お客様からの問い合わせやクレームに対応します。製品知識を学び、マニュアルに沿って解決策を提案します。',
            disabilityNote: '在宅勤務やフレックスタイム制の職場も多く、自分のペースで働けます。'
        }
    ],
    E: [
        { 
            name: '営業スタッフ', 
            description: '企業の商品やサービスを企業や個人のお客様に紹介・提案し、契約を結ぶ仕事です。外勤営業（訪問）と内勤営業（電話・メール）があります。',
            disabilityNote: '内勤営業や営業サポート（資料作成、データ管理）の求人が増えています。'
        },
        { 
            name: 'イベント企画スタッフ', 
            description: 'コンサート、展示会、セミナー、地域イベントなどを企画・運営します。会場手配、参加者管理、当日の進行サポートなどを担当します。',
            disabilityNote: '裏方スタッフや運営サポートとして働く道があり、チームで達成感を共有できます。'
        },
        { 
            name: '店舗マネージャー', 
            description: '小売店、飲食店、サービス店などで、スタッフのシフト管理、売上管理、在庫管理、スタッフ教育などを行い、店舗全体を管理します。',
            disabilityNote: '接客スタッフから経験を積み、ステップアップできるキャリアパスがあります。'
        },
        { 
            name: 'プロジェクトマネージャー', 
            description: 'ITプロジェクト、建設プロジェクト、製品開発プロジェクトなどで、スケジュール管理、予算管理、チームマネジメント、進捗管理を行います。',
            disabilityNote: 'IT企業、コンサルティング会社、製造業などで需要が高まっています。'
        },
        { 
            name: '起業・自営業', 
            description: 'カフェ、ネットショップ、ハンドメイド作家、フリーランスなど、自分のアイデアやスキルを活かして独立し、自分でビジネスを運営します。',
            disabilityNote: '就労移行支援や起業支援制度を利用しながら、少しずつ始めることができます。'
        }
    ],
    C: [
        { 
            name: '事務スタッフ', 
            description: '企業の事務部門で、書類作成、データ入力、ファイル整理、電話対応、来客対応などを行います。Excel、Word、PowerPointなどのOfficeソフトを使います。',
            disabilityNote: '立川駅周辺には企業が多く、一般事務の求人が豊富です。未経験歓迎の職場もあります。'
        },
        { 
            name: '経理スタッフ', 
            description: '会社のお金の流れを管理します。請求書の処理、領収書発行、入出金管理、月次・年次決算などを行います。簿記検定などの資格が活かせます。',
            disabilityNote: '正確さと細かい作業が得意な方に向いています。資格取得支援もあります。'
        },
        { 
            name: '総務スタッフ', 
            description: '会社全体の裏方業務を担当します。備品管理、社内イベント企画、施設管理、契約書管理、来客対応など、幅広い業務を行います。',
            disabilityNote: 'ルーティンワークが中心で、計画的に進められる仕事です。'
        },
        { 
            name: '倉庫管理スタッフ', 
            description: '倉庫で商品の入庫・出庫管理、在庫数のチェック、商品の保管場所管理、棚卸し作業などを行います。ハンディターミナルや在庫管理システムを使います。',
            disabilityNote: '多摩地区には物流センターが多く、求人が豊富です。正確な作業が求められます。'
        },
        { 
            name: '医療事務スタッフ', 
            description: '病院やクリニックの受付で、患者さんの受付対応、保険証の確認、カルテ入力、会計処理、レセプト（請求業務）などを行います。医療事勑の資格が活かせます。',
            disabilityNote: '立川市医師会など、周辺には多くの医療機関があり、求人が安定しています。'
        }
    ]
};

// ========================================
// 画面遷移関数
// ========================================
function showScreen(screenId) {
    // 現在のアクティブ画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 指定された画面を表示
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function goBack() {
    if (appState.history.length > 0) {
        const previousScreen = appState.history.pop();
        showScreen(previousScreen);
    }
}

// ========================================
// アプリ開始
// ========================================
function startApp() {
    appState.history = ['screen-home'];
    showScreen('screen-employment-check');
}

// ========================================
// 障害者雇用確認
// ========================================
function setEmploymentStatus(status) {
    appState.employmentStatus = status;
    appState.history.push('screen-employment-check');
    startPhase1();
}

// ========================================
// Phase 1: 抽象的質問（各カテゴリ4問 = 計24問）
// ========================================
function startPhase1() {
    appState.currentPhase = 1;
    appState.currentQuestionIndex = 0;
    appState.currentCategoryIndex = 0;
    appState.phase1Answers = {};
    
    // 各カテゴリの回答配列を初期化
    Object.keys(RIASEC_DATA).forEach(cat => {
        appState.phase1Answers[cat] = [];
    });
    
    showPhase1Question();
    showScreen('screen-questions-phase1');
}

function showPhase1Question() {
    const categories = Object.keys(RIASEC_DATA);
    const currentCategory = categories[appState.currentCategoryIndex];
    const questionData = RIASEC_DATA[currentCategory];
    const questions = questionData.phase1Questions;
    
    // 総質問数を計算
    const totalQuestions = categories.reduce((sum, cat) => {
        return sum + RIASEC_DATA[cat].phase1Questions.length;
    }, 0);
    
    // 現在の質問番号を計算
    let currentQuestionNumber = 1;
    for (let i = 0; i < appState.currentCategoryIndex; i++) {
        currentQuestionNumber += RIASEC_DATA[categories[i]].phase1Questions.length;
    }
    currentQuestionNumber += appState.currentQuestionIndex;
    
    // 進捗バー更新
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progress-phase1').style.width = progress + '%';
    
    // 質問番号
    document.getElementById('question-number-phase1').textContent = 
        `${currentQuestionNumber} / ${totalQuestions}`;
    
    // 質問テキスト
    document.getElementById('question-box-phase1').innerHTML = `
        <p class="question-text">${questions[appState.currentQuestionIndex]}</p>
        <p class="question-help">「${questionData.name}」に関する質問です（${appState.currentQuestionIndex + 1}/${questions.length}問目）</p>
    `;
}

function answerPhase1(answer) {
    const categories = Object.keys(RIASEC_DATA);
    const currentCategory = categories[appState.currentCategoryIndex];
    const questionData = RIASEC_DATA[currentCategory];
    const questions = questionData.phase1Questions;
    
    // 回答を記録（はい: true, いいえ: false, わからない: null）
    const answerValue = answer === 'yes' ? true : answer === 'no' ? false : null;
    appState.phase1Answers[currentCategory].push(answerValue);
    
    // 次の質問へ
    appState.currentQuestionIndex++;
    
    if (appState.currentQuestionIndex < questions.length) {
        // 同じカテゴリの次の質問
        showPhase1Question();
    } else {
        // このカテゴリの質問終了、スコア計算
        const answers = appState.phase1Answers[currentCategory];
        const yesCount = answers.filter(a => a === true).length;
        const noCount = answers.filter(a => a === false).length;
        const unsureCount = answers.filter(a => a === null).length;
        
        // スコア計算（各「はい」で1点）
        appState.scores[currentCategory] = yesCount;
        
        // 「わからない」が2問以上ある場合、Phase2で詳細質問
        if (unsureCount >= 2) {
            appState.unsureCategories.push(currentCategory);
        }
        
        // 次のカテゴリへ
        appState.currentCategoryIndex++;
        appState.currentQuestionIndex = 0;
        
        if (appState.currentCategoryIndex < categories.length) {
            showPhase1Question();
        } else {
            // Phase1終了
            if (appState.unsureCategories.length > 0) {
                // 「わからない」が多いカテゴリがあればPhase2へ
                startPhase2();
            } else {
                // なければ結果表示
                showResults();
            }
        }
    }
}

// ========================================
// Phase 2: 具体的質問（わからないカテゴリのみ）
// ========================================
function startPhase2() {
    appState.currentPhase = 2;
    appState.currentQuestionIndex = 0;
    appState.phase2CurrentCategory = appState.unsureCategories[0];
    appState.phase2CurrentSubQuestion = 0;
    appState.phase2Answers = {};
    
    // 各カテゴリの回答配列を初期化
    appState.unsureCategories.forEach(cat => {
        appState.phase2Answers[cat] = [];
    });
    
    showPhase2Question();
    showScreen('screen-questions-phase2');
}

function showPhase2Question() {
    const currentCategory = appState.phase2CurrentCategory;
    const questionData = RIASEC_DATA[currentCategory];
    const questions = questionData.phase2Questions;
    const currentSubQ = appState.phase2CurrentSubQuestion;
    
    // 進捗計算
    const totalQuestions = appState.unsureCategories.reduce((sum, cat) => {
        return sum + RIASEC_DATA[cat].phase2Questions.length;
    }, 0);
    
    const answeredQuestions = appState.unsureCategories.reduce((sum, cat, index) => {
        if (index < appState.unsureCategories.indexOf(currentCategory)) {
            return sum + RIASEC_DATA[cat].phase2Questions.length;
        }
        return sum;
    }, 0) + currentSubQ;
    
    const progress = ((answeredQuestions + 1) / totalQuestions) * 100;
    document.getElementById('progress-phase2').style.width = progress + '%';
    
    // 質問テキスト
    document.getElementById('question-box-phase2').innerHTML = `
        <p class="question-text">${questions[currentSubQ]}</p>
        <p class="question-help">「${questionData.name}」についてもう少し詳しく教えてください（${currentSubQ + 1}/${questions.length}問目）</p>
    `;
}

function answerPhase2(answer) {
    const currentCategory = appState.phase2CurrentCategory;
    const questionData = RIASEC_DATA[currentCategory];
    const questions = questionData.phase2Questions;
    
    // 回答を記録（はい: true, いいえ: false）
    appState.phase2Answers[currentCategory].push(answer === 'yes');
    
    // 次のサブ質問へ
    appState.phase2CurrentSubQuestion++;
    
    if (appState.phase2CurrentSubQuestion < questions.length) {
        // 同じカテゴリの次の質問
        showPhase2Question();
    } else {
        // このカテゴリの質問終了、スコア計算
        const yesCount = appState.phase2Answers[currentCategory].filter(a => a).length;
        // Phase1のスコアに加算（Phase2は1問1点）
        appState.scores[currentCategory] += yesCount;
        
        // 次のカテゴリへ
        const currentCategoryIndex = appState.unsureCategories.indexOf(currentCategory);
        if (currentCategoryIndex < appState.unsureCategories.length - 1) {
            appState.phase2CurrentCategory = appState.unsureCategories[currentCategoryIndex + 1];
            appState.phase2CurrentSubQuestion = 0;
            showPhase2Question();
        } else {
            // Phase2終了、結果表示
            showResults();
        }
    }
}

// ========================================
// 結果表示
// ========================================
function showResults() {
    showScreen('screen-results');
    
    // スコアを降順にソート
    const sortedScores = Object.entries(appState.scores)
        .sort((a, b) => b[1] - a[1]);
    
    // TOP3を取得
    const top3 = sortedScores.slice(0, 3);
    
    // レーダーチャート描画
    drawRadarChart();
    
    // TOP3興味領域を表示
    displayTopInterests(top3);
    
    // 職業リストを表示
    displayCareerRecommendations(top3);
    
    // 支援者向け情報を準備（PDF用）
    prepareSupporterInfo(top3);
}

function drawRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // 既存のチャートがあれば破棄
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }
    
    const categories = Object.keys(RIASEC_DATA);
    const labels = categories.map(cat => RIASEC_DATA[cat].name);
    const data = categories.map(cat => appState.scores[cat]);
    
    window.radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'あなたの興味・関心スコア',
                data: data,
                backgroundColor: 'rgba(44, 122, 123, 0.2)',
                borderColor: 'rgba(44, 122, 123, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(44, 122, 123, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(44, 122, 123, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 4,  // Phase1最大4点
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 13
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 15,
                            weight: 'bold'
                        },
                        padding: 10
                    },
                    grid: {
                        color: 'rgba(13, 148, 136, 0.15)'
                    },
                    angleLines: {
                        color: 'rgba(13, 148, 136, 0.15)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function displayTopInterests(top3) {
    const container = document.getElementById('top-interests');
    let html = '<h3 style="font-size: 22px; color: var(--primary-color); margin-bottom: 20px; font-weight: 600;">あなたの<ruby>強<rt>つよ</rt></ruby>い<ruby>興味<rt>きょうみ</rt></ruby> TOP3</h3>';
    
    top3.forEach((item, index) => {
        const [category, score] = item;
        const data = RIASEC_DATA[category];
        const rank = ['1位', '2位', '3位'][index];
        
        html += `
            <div class="interest-card">
                <span class="interest-rank">${rank}</span>
                <h4 class="interest-name">${data.name}</h4>
                <p class="interest-description">${data.description}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function displayCareerRecommendations(top3) {
    const container = document.getElementById('career-recommendations');
    let html = '<h3 style="font-size: 24px; color: var(--primary-color); margin-bottom: 25px; font-weight: 700; text-align: center;">あなたに<ruby>向<rt>む</rt></ruby>いているかもしれない<ruby>仕事<rt>しごと</rt></ruby></h3>';
    
    top3.forEach((item, index) => {
        const [category, score] = item;
        const data = RIASEC_DATA[category];
        const careers = CAREER_DATABASE[category];
        const rank = ['1位', '2位', '3位'][index];
        
        html += `
            <div class="career-section">
                <h4 class="career-section-title">${rank}：${data.name} に<ruby>関連<rt>かんれん</rt></ruby>する<ruby>仕事<rt>しごと</rt></ruby></h4>
                <div class="career-grid">
        `;
        
        careers.forEach(career => {
            html += `
                <div class="career-card">
                    <h5 class="career-name">${career.name}</h5>
                    <p class="career-description">${career.description}</p>
            `;
            
            // 障害者雇用を検討している場合のみ追加情報を表示
            if (appState.employmentStatus === true) {
                html += `<p class="career-disability-note">💡 ${career.disabilityNote}</p>`;
            }
            
            html += `</div>`;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="note-box" style="margin-top: 30px;">
            <p><strong>※ <ruby>大切<rt>たいせつ</rt></ruby>なこと</strong></p>
            <p>・この<ruby>結果<rt>けっか</rt></ruby>は、あなたの<ruby>仕事<rt>しごと</rt></ruby>を<ruby>決<rt>き</rt></ruby>めるものではありません</p>
            <p>・<ruby>興味<rt>きょうみ</rt></ruby>は<ruby>経験<rt>けいけん</rt></ruby>とともに<ruby>変<rt>か</rt></ruby>わることがあります</p>
            <p>・<ruby>実際<rt>じっさい</rt></ruby>にやってみることで、<ruby>新<rt>あたら</rt></ruby>しい<ruby>発見<rt>はっけん</rt></ruby>があるかもしれません</p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ========================================
// 支援者向け情報の準備
// ========================================
function prepareSupporterInfo(top3) {
    // 回答の詳細
    let answerDetailsHTML = '<div style="font-size: 14px; line-height: 1.8;">';
    answerDetailsHTML += '<p style="margin-bottom: 15px;"><strong>■ Phase1（基本質問）の回答</strong></p>';
    
    const categories = Object.keys(RIASEC_DATA);
    categories.forEach(category => {
        const data = RIASEC_DATA[category];
        const answers = appState.phase1Answers[category] || [];
        const yesCount = answers.filter(a => a === true).length;
        const noCount = answers.filter(a => a === false).length;
        const unsureCount = answers.filter(a => a === null).length;
        const totalQuestions = data.phase1Questions.length;
        
        answerDetailsHTML += `<p style="margin: 8px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">`;
        answerDetailsHTML += `<strong>${data.name}</strong>: `;
        answerDetailsHTML += `<span style="color: #10B981;">はい ${yesCount}問</span> / `;
        answerDetailsHTML += `<span style="color: #6B7280;">いいえ ${noCount}問</span> / `;
        answerDetailsHTML += `<span style="color: #F59E0B;">わからない ${unsureCount}問</span>`;
        answerDetailsHTML += ` （全${totalQuestions}問中）`;
        answerDetailsHTML += `</p>`;
    });
    
    if (appState.unsureCategories.length > 0) {
        answerDetailsHTML += '<p style="margin-top: 20px; margin-bottom: 15px;"><strong>■ Phase2（詳細質問）の回答</strong></p>';
        answerDetailsHTML += '<p style="font-size: 13px; color: #6B7280; margin-bottom: 10px;">※「わからない」が2問以上あったカテゴリのみ実施</p>';
        
        appState.unsureCategories.forEach(category => {
            const data = RIASEC_DATA[category];
            const answers = appState.phase2Answers[category] || [];
            const yesCount = answers.filter(a => a).length;
            const totalQuestions = data.phase2Questions.length;
            
            answerDetailsHTML += `<p style="margin: 8px 0; padding: 8px; background: #fffbeb; border-radius: 6px;">`;
            answerDetailsHTML += `<strong>${data.name}</strong>: `;
            answerDetailsHTML += `<span style="color: #10B981;">はい ${yesCount}問</span> / `;
            answerDetailsHTML += `<span style="color: #6B7280;">いいえ ${totalQuestions - yesCount}問</span>`;
            answerDetailsHTML += ` （全${totalQuestions}問中）`;
            answerDetailsHTML += `</p>`;
        });
    }
    
    answerDetailsHTML += '<p style="margin-top: 15px; font-size: 13px; color: #6B7280; padding: 10px; background: #f0f9ff; border-radius: 6px;">';
    answerDetailsHTML += '📊 <strong>スコア計算方法</strong>: Phase1とPhase2の「はい」の数を合計（最大4点/カテゴリ）';
    answerDetailsHTML += '</p>';
    
    answerDetailsHTML += '</div>';
    
    document.getElementById('answer-details').innerHTML = answerDetailsHTML;
    
    // 支援のヒント
    let hintsHTML = '';
    
    top3.forEach((item, index) => {
        const [category, score] = item;
        const data = RIASEC_DATA[category];
        const rank = ['1位', '2位', '3位'][index];
        
        const hints = getSupportHints(category);
        hintsHTML += `<li style="margin-bottom: 18px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0D9488;">`;
        hintsHTML += `<strong style="color: #0D9488; font-size: 15px;">${rank}: ${data.name} (${score}点)</strong><br>`;
        hintsHTML += `<span style="margin-top: 8px; display: block; line-height: 1.8;">${hints}</span>`;
        hintsHTML += `</li>`;
    });
    
    document.getElementById('support-hints').innerHTML = hintsHTML;
}

function getSupportHints(category) {
    const hints = {
        R: '体験活動や実習を通じて、具体的な作業に触れる機会を作りましょう。製造業や清掃業の職場見学が効果的です。',
        I: 'じっくり考える時間を確保し、興味のあるテーマについて調べる活動を促しましょう。図書館やPC作業の体験が有効です。',
        A: '創作活動の機会を増やし、自己表現を尊重しましょう。デザインやハンドメイド作品の制作体験を検討してください。',
        S: '人との関わりを大切にし、ボランティア活動や接客体験を提案しましょう。コミュニケーションスキルの向上支援も重要です。',
        E: 'リーダーシップを発揮できる場面を作り、企画や運営に関わる経験を提供しましょう。小規模なプロジェクトから始めると良いでしょう。',
        C: '手順やルールを明確にした作業環境を整え、正確さを活かせる業務（事務、データ入力など）の体験を推奨します。'
    };
    return hints[category] || '';
}

// ========================================
// PDF出力
// ========================================
async function downloadPDF() {
    try {
        // 日付をフォーマット
        const today = new Date();
        const dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';
        
        const element = document.getElementById('results-content');
        
        // ボタンを一時的に非表示
        const buttons = element.querySelectorAll('.btn');
        buttons.forEach(btn => btn.style.display = 'none');
        
        // 支援者向け情報を表示
        const supporterInfo = document.getElementById('supporter-info');
        supporterInfo.style.display = 'block';
        
        // jsPDFで PDF作成
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - (margin * 2);
        
        // ページごとにセクションをキャプチャして追加
        const sections = [
            {
                elements: [
                    document.querySelector('.app-header-small'),
                    document.querySelector('.results-title'),
                    document.querySelector('.chart-container'),
                    document.getElementById('top-interests')
                ],
                title: 'ページ1: 結果概要'
            },
            {
                elements: [
                    document.getElementById('career-recommendations')
                ],
                title: 'ページ2: 職業リスト'
            },
            {
                elements: [
                    document.querySelector('.next-steps'),
                    document.querySelectorAll('.note-box')[0]
                ],
                title: 'ページ3: 次のステップ'
            },
            {
                elements: [
                    document.getElementById('supporter-info')
                ],
                title: 'ページ4: 支援者向け情報'
            }
        ];
        
        let isFirstPage = true;
        
        for (const section of sections) {
            const validElements = section.elements.filter(el => el !== null && el !== undefined);
            if (validElements.length === 0) continue;
            
            // ページコンテナを作成（A4サイズに最適化）
            const pageContainer = document.createElement('div');
            pageContainer.style.backgroundColor = '#ffffff';
            pageContainer.style.padding = '30px';
            pageContainer.style.width = '210mm';  // A4幅
            pageContainer.style.minHeight = '297mm';  // A4高さ
            pageContainer.style.boxSizing = 'border-box';
            pageContainer.style.fontSize = '14px';
            
            // 各要素をクローンして追加
            validElements.forEach((el, index) => {
                const clone = el.cloneNode(true);
                
                // Chart.jsのCanvasを画像に変換
                const chartCanvas = clone.querySelector('#radarChart');
                if (chartCanvas) {
                    const originalChart = document.getElementById('radarChart');
                    const chartImage = originalChart.toDataURL('image/png', 1.0);
                    const img = document.createElement('img');
                    img.src = chartImage;
                    img.style.width = '100%';
                    img.style.maxWidth = '400px';
                    img.style.display = 'block';
                    img.style.margin = '20px auto';
                    chartCanvas.parentNode.replaceChild(img, chartCanvas);
                }
                
                // ボタンを削除
                clone.querySelectorAll('.btn').forEach(btn => btn.remove());
                
                // スタイル調整
                clone.style.marginBottom = index < validElements.length - 1 ? '20px' : '0';
                
                // すべてのテキストを濃くする
                clone.querySelectorAll('*').forEach(elem => {
                    const computedStyle = window.getComputedStyle(elem);
                    const currentColor = computedStyle.color;
                    
                    // 薄い色を濃い色に変換
                    if (currentColor.includes('74, 85, 104') || 
                        currentColor.includes('113, 128, 150') || 
                        currentColor.includes('160, 174, 192')) {
                        elem.style.color = '#0F172A';
                        elem.style.setProperty('color', '#0F172A', 'important');
                    }
                    
                    // フォントサイズ調整
                    const fontSize = parseInt(computedStyle.fontSize);
                    if (fontSize > 24) {
                        elem.style.fontSize = '22px';
                    } else if (fontSize > 18) {
                        elem.style.fontSize = '16px';
                    }
                });
                
                pageContainer.appendChild(clone);
            });
            
            document.body.appendChild(pageContainer);
            
            // html2canvasでキャプチャ
            const canvas = await html2canvas(pageContainer, {
                scale: 2.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: pageContainer.offsetWidth,
                height: pageContainer.offsetHeight
            });
            
            // ページコンテナを削除
            document.body.removeChild(pageContainer);
            
            // 新しいページを追加（最初のページ以外）
            if (!isFirstPage) {
                pdf.addPage();
            }
            isFirstPage = false;
            
            // 画像をPDFに追加（A4サイズに最適化）
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // ページ内に収まるように調整
            if (imgHeight <= contentHeight) {
                // 中央配置
                const yOffset = margin + (contentHeight - imgHeight) / 2;
                pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
            } else {
                // 縮小してフィット
                const scale = contentHeight / imgHeight;
                const finalWidth = imgWidth * scale;
                const finalHeight = contentHeight;
                const xOffset = margin + (contentWidth - finalWidth) / 2;
                pdf.addImage(imgData, 'PNG', xOffset, margin, finalWidth, finalHeight);
            }
        }
        
        // PDFを保存
        pdf.save('キャリア探索ツール_結果_' + dateStr + '.pdf');
        
        // ボタンを再表示
        buttons.forEach(btn => btn.style.display = '');
        // 支援者向け情報を非表示に戻す
        supporterInfo.style.display = 'none';
        
    } catch (error) {
        console.error('PDF生成エラー:', error);
        alert('PDFの生成に失敗しました。ブラウザの印刷機能（Ctrl+P / Cmd+P）をお試しください。');
        
        // エラー時もボタンを戻す
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => btn.style.display = '');
        const supporterInfo = document.getElementById('supporter-info');
        if (supporterInfo) supporterInfo.style.display = 'none';
    }
}

// ========================================
// アプリ再開
// ========================================
function restartApp() {
    // 状態をリセット
    appState.employmentStatus = null;
    appState.phase1Answers = {};
    appState.phase2Answers = {};
    appState.currentPhase = 1;
    appState.currentQuestionIndex = 0;
    appState.currentCategoryIndex = 0;
    appState.unsureCategories = [];
    appState.phase2CurrentCategory = null;
    appState.phase2CurrentSubQuestion = 0;
    appState.scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    appState.history = [];
    
    // チャートを破棄
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
        window.radarChartInstance = null;
    }
    
    // ホーム画面に戻る
    showScreen('screen-home');
}

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    showScreen('screen-home');
});
