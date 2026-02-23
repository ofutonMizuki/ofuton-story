// エピソード設定
const episodes = [
    { number: 1, file: 'episode-01.md' },
    { number: 2, file: 'episode-02.md' },
    { number: 3, file: 'episode-03.md' },
    { number: 4, file: 'episode-04.md' },
    { number: 5, file: 'episode-05.md' },
    { number: 6, file: 'episode-06.md' },
    { number: 7, file: 'episode-07.md' },
    { number: 8, file: 'episode-08.md' },
    { number: 9, file: 'episode-09.md' },
    { number: 10, file: 'episode-10.md' },
    { number: 11, file: 'episode-11.md' },
    { number: 12, file: 'episode-12.md' },
    { number: 13, file: 'episode-13.md' },
    { number: 14, file: 'episode-14.md' },
    { number: 15, file: 'episode-15.md' },
    { number: 16, file: 'episode-16.md' },
    { number: 17, file: 'episode-17.md' },
    { number: 18, file: 'episode-18.md' },
    { number: 19, file: 'episode-19.md' },
    { number: 20, file: 'episode-20.md' },
    { number: 21, file: 'episode-21.md' },
    { number: 22, file: 'episode-22.md' },
    { number: 23, file: 'episode-23.md' },
    { number: 24, file: 'episode-24.md' }
];

// エピソード数（マジックナンバー回避のため episodes から算出）
const MAX_EPISODES = episodes.length;

// Markdown パーサ（markdown-it）
const md = window.markdownit();

// エピソード範囲チェック
function isValidEpisode(number) {
    return Number.isInteger(number) && number >= 1 && number <= MAX_EPISODES;
}

// エピソードとページの簡易キャッシュ
const episodeCache = new Map();
const pageCache = new Map();

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// アプリケーションの初期化
function initializeApp() {
    renderEpisodeList();
    setupSpecialLinks();
    handleRoute();
}

// URLパラメータに応じてコンテンツを切り替える
function handleRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const episodeParam = urlParams.get('episode');
    const pageParam = urlParams.get('page');

    if (pageParam === 'characters') {
        loadCharactersPage();
        return;
    }

    // "backstory" は settings_integrated.md の別名として扱う
    if (pageParam === 'settings' || pageParam === 'backstory') {
        loadSettingsPage();
        return;
    }

    if (pageParam === 'doctrine') {
        loadDoctrinePage();
        return;
    }

    if (episodeParam) {
        const episodeNumber = parseInt(episodeParam, 10);
        if (isValidEpisode(episodeNumber)) {
            loadEpisode(episodeNumber);
            return;
        }
    }
}

// 特別リンクのセットアップ
function setupSpecialLinks() {
    document.querySelectorAll('.special-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page === 'characters') {
                loadCharactersPage();
                updateURLForPage('characters');
            } else if (page === 'settings') {
                loadSettingsPage();
                updateURLForPage('settings');
            } else if (page === 'backstory') {
                loadSettingsPage();
                updateURLForPage('settings');
            } else if (page === 'doctrine') {
                loadDoctrinePage();
                updateURLForPage('doctrine');
            }
        });
    });
}

// エピソードリストの描画
function renderEpisodeList() {
    const episodeList = document.getElementById('episode-list');
    
    episodes.forEach(episode => {
        const li = document.createElement('li');
        li.className = 'episode-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'episode-link';
        link.textContent = `第${episode.number}話`;
        link.dataset.episode = episode.number;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadEpisode(episode.number);
            updateURL(episode.number);
        });
        
        li.appendChild(link);
        episodeList.appendChild(li);
    });
}

// エピソードの読み込み
async function loadEpisode(episodeNumber) {
    const episode = episodes.find(ep => ep.number === episodeNumber);
    if (!episode) return;

    const contentDiv = document.getElementById('story-content');

    // ローディング表示
    contentDiv.innerHTML = '<div class="loading">読み込み中...</div>';

    try {
        let markdown;

        // キャッシュがあればそれを利用
        if (episodeCache.has(episode.file)) {
            markdown = episodeCache.get(episode.file);
        } else {
            const response = await fetch(episode.file);

            if (!response.ok) {
                throw new Error('ファイルの読み込みに失敗しました');
            }

            markdown = await response.text();
            episodeCache.set(episode.file, markdown);
        }

        // MarkdownをHTMLに変換
        const html = md.render(markdown);

        // ナビゲーションボタンを生成
        const navigation = createNavigation(episodeNumber);

        // コンテンツを表示（アニメーション効果のため一度消してから表示）
        contentDiv.style.opacity = '0';
        setTimeout(() => {
            contentDiv.innerHTML = html + navigation;
            contentDiv.style.opacity = '1';

            // ページトップにスクロール
            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
            window.scrollTo(0, 0);

            // ナビゲーションボタンのイベントリスナーを設定
            setupNavigationListeners();
        }, 150);

        // アクティブなエピソードをハイライト
        updateActiveEpisode(episodeNumber);

    } catch (error) {
        console.error('Error loading episode:', error);
        contentDiv.innerHTML = `
            <div class="error">
                <h2>エラー</h2>
                <p>エピソードの読み込みに失敗しました。</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// URLの更新（ブラウザの履歴に追加）
function updateURL(episodeNumber) {
    const url = new URL(window.location);
    url.searchParams.delete('page');
    url.searchParams.set('episode', episodeNumber);
    window.history.pushState({}, '', url);
}

// 特別ページ用のURL更新
function updateURLForPage(pageName) {
    const url = new URL(window.location);
    url.searchParams.delete('episode');
    url.searchParams.set('page', pageName);
    window.history.pushState({}, '', url);
}

// アクティブなエピソードリンクを更新
function updateActiveEpisode(currentEpisode) {
    document.querySelectorAll('.episode-link').forEach(link => {
        const ep = parseInt(link.dataset.episode);
        if (ep === currentEpisode) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 登場人物ページの読み込み
async function loadCharactersPage() {
    const contentDiv = document.getElementById('story-content');

    // ローディング表示
    contentDiv.innerHTML = '<div class="loading">読み込み中...</div>';

    try {
        // Markdownファイルを読み込み
        const response = await fetch('characters.md');

        if (!response.ok) {
            throw new Error('ファイルの読み込みに失敗しました');
        }

        const markdown = await response.text();
        const html = md.render(markdown);

        // コンテンツを表示
        contentDiv.style.opacity = '0';
        setTimeout(() => {
            contentDiv.innerHTML = html;
            contentDiv.style.opacity = '1';

            // ページトップにスクロール
            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
            window.scrollTo(0, 0);
        }, 150);

        // アクティブなエピソードをクリア
        document.querySelectorAll('.episode-link').forEach(link => {
            link.classList.remove('active');
        });

    } catch (error) {
        console.error('Error loading characters page:', error);
        contentDiv.innerHTML = `
            <div class="error">
                <h2>エラー</h2>
                <p>登場人物ページの読み込みに失敗しました。</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 設定資料集ページの読み込み
async function loadSettingsPage() {
    const contentDiv = document.getElementById('story-content');
    
    // ローディング表示
    contentDiv.innerHTML = '<div class="loading">読み込み中...</div>';
    
    try {
        // Markdownファイルを読み込み
        const response = await fetch('settings_integrated.md');
        
        if (!response.ok) {
            throw new Error('ファイルの読み込みに失敗しました');
        }
        
        const markdown = await response.text();
        const html = md.render(markdown);
        
        // コンテンツを表示
        contentDiv.style.opacity = '0';
        setTimeout(() => {
            contentDiv.innerHTML = html;
            contentDiv.style.opacity = '1';
            
            // ページトップにスクロール
            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
            window.scrollTo(0, 0);
        }, 150);
        
        // アクティブなエピソードをクリア
        document.querySelectorAll('.episode-link').forEach(link => {
            link.classList.remove('active');
        });
        
    } catch (error) {
        console.error('Error loading settings page:', error);
        contentDiv.innerHTML = `
            <div class="error">
                <h2>エラー</h2>
                <p>設定資料集の読み込みに失敗しました。</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}



// ブラウザの戻る/進むボタンへの対応
window.addEventListener('popstate', () => {
    handleRoute();
});

// ナビゲーションボタンの生成
function createNavigation(currentEpisode) {
    const hasPrev = currentEpisode > 1;
    const hasNext = currentEpisode < MAX_EPISODES;
    
    const prevButton = hasPrev 
        ? `<a href="#" class="nav-button prev" data-episode="${currentEpisode - 1}">前の話</a>`
        : `<span class="nav-button prev disabled">前の話</span>`;
    
    const nextButton = hasNext
        ? `<a href="#" class="nav-button next" data-episode="${currentEpisode + 1}">次の話</a>`
        : `<span class="nav-button next disabled">次の話</span>`;
    
    return `
        <nav class="page-navigation">
            ${prevButton}
            <span class="nav-spacer"></span>
            ${nextButton}
        </nav>
    `;
}

// ナビゲーションボタンのイベントリスナー設定
function setupNavigationListeners() {
    document.querySelectorAll('.nav-button[data-episode]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const episodeNumber = parseInt(button.dataset.episode);
            loadEpisode(episodeNumber);
            updateURL(episodeNumber);
        });
    });
}

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentEpisode = parseInt(urlParams.get('episode')) || 0;
    
    // 左矢印キー: 前のエピソード
    if (e.key === 'ArrowLeft' && currentEpisode > 1) {
        loadEpisode(currentEpisode - 1);
        updateURL(currentEpisode - 1);
    }
    
    // 右矢印キー: 次のエピソード
    if (e.key === 'ArrowRight' && currentEpisode < MAX_EPISODES) {
        loadEpisode(currentEpisode + 1);
        updateURL(currentEpisode + 1);
    }
});

// 汎用 Markdown ページ読み込み
async function loadMarkdownPage(path) {
    const contentDiv = document.getElementById('story-content');

    // ローディング表示
    contentDiv.innerHTML = '<div class="loading">読み込み中...</div>';

    try {
        let markdown;

        if (pageCache.has(path)) {
            markdown = pageCache.get(path);
        } else {
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error('ファイルの読み込みに失敗しました');
            }

            markdown = await response.text();
            pageCache.set(path, markdown);
        }

        const html = md.render(markdown);

        contentDiv.style.opacity = '0';
        setTimeout(() => {
            contentDiv.innerHTML = html;
            contentDiv.style.opacity = '1';

            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
            window.scrollTo(0, 0);
        }, 150);

        // アクティブなエピソードをクリア
        document.querySelectorAll('.episode-link').forEach(link => {
            link.classList.remove('active');
        });
    } catch (error) {
        console.error('Error loading markdown page:', error);
        contentDiv.innerHTML = `
            <div class="error">
                <h2>エラー</h2>
                <p>ページの読み込みに失敗しました。</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 登場人物ページの読み込み
async function loadCharactersPage() {
    await loadMarkdownPage('characters.md');
}

// 設定資料集ページの読み込み
async function loadSettingsPage() {
    await loadMarkdownPage('settings_integrated.md');
}

// おふとん教の教義ページの読み込み
async function loadDoctrinePage() {
    await loadMarkdownPage('ofuton_doctrine.md');
}
