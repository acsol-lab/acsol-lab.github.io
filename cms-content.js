/* ACSoL CMS renderer. Pages CMS edits JSON; GitHub Pages serves it. */
(() => {
  'use strict';
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const safeUrl = (value) => {
    if (typeof value !== 'string') return '';
    const s = value.trim();
    if (s.startsWith('/media/')) return s;
    try {
      const u = new URL(s);
      if (['http:', 'https:'].includes(u.protocol)) return u.href;
    } catch (e) {}
    return '';
  };
  const getJSON = async (file) => {
    const url = new URL(`./data/${file}.json`, document.baseURI);
    const response = await fetch(url.toString(), {cache: 'no-store'});
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`${file}: expected array`);
    return data;
  };
  const dateText = (date) => String(date || '').replace(/-/g, '.');
  const makeNews = (item) => {
    const row = el('article','news-item');
    const time = el('time',null,dateText(item.date));
    time.dateTime = String(item.date || '');
    const main = el('div');
    main.append(el('span','news-type',item.category || ''),el('h3',null,item.title || ''),el('p',null,item.description || ''));
    row.append(time,main);
    return row;
  };
  const renderNews = async () => {
    const target = document.querySelector('.news-section > .wrap > div > .news-list');
    const older = document.querySelector('.news-more .news-list');
    const more = document.querySelector('.news-more');
    if (!target || !older || !more) return;
    const items = (await getJSON('news')).sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
    target.replaceChildren(...items.slice(0,3).map(makeNews));
    older.replaceChildren(...items.slice(3).map(makeNews));
    more.hidden = items.length <= 3;
  };
  const makePublication = (p) => {
    const item = el('article','publication');
    const year = el('span','pub-year',p.year || '');
    const content = el('div');
    content.append(el('p','pub-journal',p.journal||''),el('h3',null,p.title||''),el('p','pub-authors',p.authors||''));
    const doi = typeof p.doi === 'string' ? p.doi.trim() : '';
    const link = el('a','pub-link','DOI ↗');
    const path = doi.replace(/^https?:\/\/doi\.org\//i,'');
    // Only ordinary DOI strings, not arbitrary JavaScript/data URLs.
    if (path && !/[\s<>"']/.test(path) && !path.includes('://')) {
      link.href = 'https://doi.org/' + encodeURI(path);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label','논문 DOI 열기');
    } else { link.removeAttribute('href'); }
    item.append(year,content,link);
    return item;
  };
  const renderPublications = async () => {
    const target = document.querySelector('#publication-list');
    if (!target) return;
    const items = (await getJSON('publications')).sort((a,b) => Number(b.year||0)-Number(a.year||0));
    target.replaceChildren(...items.map(makePublication));
  };
  const makeGallery = (g) => {
    const figure = el('figure','gallery-card');
    const link = el('a');
    const src = safeUrl(g.image);
    const img = el('img');
    img.src = src || '';
    img.alt = g.description || g.title || '';
    img.loading = 'lazy';
    link.href = src || '#gallery';
    if (src) {link.target = '_blank'; link.rel='noopener noreferrer';}
    link.setAttribute('aria-label', (g.title || '사진') + ' 크게 보기');
    link.append(img);
    const caption = el('figcaption');
    caption.append(el('strong',null,g.title||''),el('span',null,g.date||''));
    figure.append(link,caption);
    return figure;
  };
  const renderGallery = async () => {
    const target = document.querySelector('.gallery-grid');
    if (!target) return;
    target.replaceChildren(...(await getJSON('gallery')).map(makeGallery));
  };
  Promise.allSettled([renderNews(),renderPublications(),renderGallery()]).then(results => {
    results.forEach((result,idx) => {
      if (result.status === 'rejected') console.warn('CMS 로드 실패:', ['news','publications','gallery'][idx], result.reason);
    });
  });
})();
