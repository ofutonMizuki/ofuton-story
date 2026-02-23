// エピソード設定
const episodes = [
    { number: 1, file: '第1話.md' },
    { number: 2, file: '第2話.md' },
    { number: 3, file: '第3話.md' },
    { number: 4, file: '第4話.md' },
    { number: 5, file: '第5話.md' },
    { number: 6, file: '第6話.md' },
    { number: 7, file: '第7話.md' },
    { number: 8, file: '第8話.md' },
    { number: 9, file: '第9話.md' },
    { number: 10, file: '第10話.md' },
    { number: 11, file: '第11話.md' },
    { number: 12, file: '第12話.md' },
    { number: 13, file: '第13話.md' },
    { number: 14, file: '第14話.md' },
    { number: 15, file: '第15話.md' },
    { number: 16, file: '第16話.md' },
    { number: 17, file: '第17話.md' },
    { number: 18, file: '第18話.md' },
    { number: 19, file: '第19話.md' },
    { number: 20, file: '第20話.md' },
    { number: 21, file: '第21話.md' },
    { number: 22, file: '第22話.md' },
    { number: 23, file: '第23話.md' },
    { number: 24, file: '第24話.md' }
];

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// アプリケーションの初期化
function initializeApp() {
    renderEpisodeList();
    
    // URLパラメータからエピソードを読み込む
    const urlParams = new URLSearchParams(window.location.search);
    const episodeParam = urlParams.get('episode');
    
    if (episodeParam) {
        const episodeNumber = parseInt(episodeParam);
        if (episodeNumber >= 1 && episodeNumber <= 24) {
            loadEpisode(episodeNumber);
        }
    }
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
        const response = await fetch(episode.file);
        
        if (!response.ok) {
            throw new Error('ファイルの読み込みに失敗しました');
        }
        
        const markdown = await response.text();
        
        // MarkdownをHTMLに変換
        const html = marked.parse(markdown);
        
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

// アクティブなエピソードの更新
function updateActiveEpisode(episodeNumber) {
    // すべてのエピソードリンクからactiveクラスを削除
    document.querySelectorAll('.episode-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 選択されたエピソードにactiveクラスを追加
    const activeLink = document.querySelector(`[data-episode="${episodeNumber}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        
        // サイドバーをスクロールして選択されたエピソードを表示
        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// URLの更新（ブラウザの履歴に追加）
function updateURL(episodeNumber) {
    const url = new URL(window.location);
    url.searchParams.set('episode', episodeNumber);
    window.history.pushState({}, '', url);
}

// ブラウザの戻る/進むボタンへの対応
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const episodeParam = urlParams.get('episode');
    
    if (episodeParam) {
        const episodeNumber = parseInt(episodeParam);
        if (episodeNumber >= 1 && episodeNumber <= 24) {
            loadEpisode(episodeNumber);
        }
    }
});

// ナビゲーションボタンの生成
function createNavigation(currentEpisode) {
    const hasPrev = currentEpisode > 1;
    const hasNext = currentEpisode < 24;
    
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
    if (e.key === 'ArrowRight' && currentEpisode < 24) {
        loadEpisode(currentEpisode + 1);
        updateURL(currentEpisode + 1);
    }
});
