(function () {
    const pre = document.querySelector('pre');
    if (!pre) return;

    // autoindex が生成した <h1> からパスを取得
    const h1 = document.querySelector('h1');
    const path = h1 ? h1.textContent.replace('Index of', '').trim() : '/';

    // <pre> 内の各行をパースしてエントリ一覧を構築
    const entries = [];
    const lineRe = /<a href="([^"]+)">([^<]+)<\/a>(.*)/g;
    let m;
    while ((m = lineRe.exec(pre.innerHTML)) !== null) {
        const href = m[1];
        const name = m[2];
        const rest = m[3].trim();
        const meta = rest.match(/(\d{2}-\w{3}-\d{4}\s+\d{2}:\d{2})\s+(\S+)/);
        entries.push({
            href,
            name,
            date: meta ? meta[1] : '',
            size: meta ? meta[2] : '',
            isParent: name === '../',
            isDir: name !== '../' && href.endsWith('/'),
        });
    }

    // 拡張子 → アイコン
    const EXT_ICONS = {
        txt: '📄', md: '📝', log: '📋', csv: '📊',
        js: '🟨', ts: '🔷', py: '🐍', rb: '💎', go: '🐹', rs: '🦀', c: '⚙️', cpp: '⚙️',
        html: '🌐', css: '🎨', json: '📋', xml: '📋', yaml: '📋', yml: '📋', toml: '📋',
        sh: '🖥️', bash: '🖥️', zsh: '🖥️',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️', ico: '🖼️',
        mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬', webm: '🎬',
        mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵',
        zip: '🗜️', tar: '🗜️', gz: '🗜️', rar: '🗜️', '7z': '🗜️', bz2: '🗜️',
        pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
    };

    function getIcon(entry) {
        if (entry.isParent) return '↩️';
        if (entry.isDir) return '📁';
        const ext = entry.name.split('.').pop().toLowerCase();
        return EXT_ICONS[ext] || '📄';
    }

    // ソート比較用にサイズを数値へ変換（K/M/G 対応）
    function parseSizeNum(s) {
        if (!s || s === '-') return -1;
        const n = parseFloat(s);
        const u = s.slice(-1).toUpperCase();
        if (u === 'G') return n * 1024 ** 3;
        if (u === 'M') return n * 1024 ** 2;
        if (u === 'K') return n * 1024;
        return n;
    }

    // ソート状態
    let sortKey = 'name';
    let sortAsc = true;

    function sorted() {
        const parent = entries.filter(e => e.isParent);
        const dirs   = entries.filter(e => e.isDir && !e.isParent);
        const files  = entries.filter(e => !e.isDir && !e.isParent);

        function cmp(a, b) {
            const va = sortKey === 'size' ? parseSizeNum(a.size) : a[sortKey];
            const vb = sortKey === 'size' ? parseSizeNum(b.size) : b[sortKey];
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ?  1 : -1;
            return 0;
        }
        return [...parent, ...dirs.sort(cmp), ...files.sort(cmp)];
    }

    // パンくずリスト
    function breadcrumb(path) {
        const parts = path.split('/').filter(Boolean);
        let html = '<a href="/">~</a>';
        let acc = '/';
        for (const p of parts) {
            acc += p + '/';
            html += `<span class="sep">/</span><a href="${acc}">${p}</a>`;
        }
        return html;
    }

    function sortIcon(key) {
        if (sortKey !== key) return '<i class="sort-icon">⇅</i>';
        return `<i class="sort-icon active">${sortAsc ? '↑' : '↓'}</i>`;
    }

    function rows() {
        return sorted().map(e => {
            const cls = (e.isParent || e.isDir) ? 'dir-link' : 'file-link';
            const size = (e.isDir && !e.isParent) ? '—' : (e.size || '—');
            return `<tr>
                <td><div class="name-cell">
                    <span class="icon">${getIcon(e)}</span>
                    <a class="${cls}" href="${e.href}">${e.name}</a>
                </div></td>
                <td class="date">${e.date}</td>
                <td class="size right">${size}</td>
            </tr>`;
        }).join('');
    }

    // コンテナを body に追加してレンダリング
    const container = document.createElement('div');
    container.className = 'container';
    document.body.appendChild(container);

    function render() {
        container.innerHTML = `
            <header class="header">
                <span class="logo">🗂️</span>
                <nav class="breadcrumb">${breadcrumb(path)}</nav>
            </header>
            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th class="col-name" data-key="name">名前 ${sortIcon('name')}</th>
                        <th class="col-date" data-key="date">更新日時 ${sortIcon('date')}</th>
                        <th class="col-size right" data-key="size">サイズ ${sortIcon('size')}</th>
                    </tr></thead>
                    <tbody>${rows()}</tbody>
                </table>
            </div>
            <div class="footer">nginx / autoindex</div>
        `;

        container.querySelectorAll('th[data-key]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.key;
                if (sortKey === key) sortAsc = !sortAsc;
                else { sortKey = key; sortAsc = true; }
                render();
            });
        });
    }

    render();
})();
