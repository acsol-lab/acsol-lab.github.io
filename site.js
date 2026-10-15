/* ACSoL / Chromatic Editorial v7
 * Static, read-only website. Pages CMS writes the existing data/*.json files.
 * HTTP(S): always read live JSON. file://: use the supplied preview snapshot.
 * No credentials, forms, remote JavaScript, or third-party tracking.
 */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const text = (value, fallback = '') => String(value ?? fallback).trim() || fallback;
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined && value !== null) el.textContent = String(value);
    return el;
  };
  const setText = (selector, value) => {
    const el = $(selector);
    if (el && value !== undefined && value !== null) el.textContent = String(value);
  };
  const arrow = () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M6 18 18 6M6 6h12v12'); p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.4'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    s.append(p); return s;
  };
  const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
  const emptyNote = (heading, body) => {
    const block = node('div', 'empty-note');
    if (heading) block.append(node('strong', '', heading));
    block.append(node('p', '', body)); return block;
  };
  const safeEmail = value => {
    const email = text(value);
    return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) ? 'mailto:' + encodeURIComponent(email) : '';
  };
  const safePhone = value => {
    const phone = text(value).replace(/[^+\d]/g, '');
    return /^\+?\d{5,20}$/.test(phone) ? 'tel:' + phone : '';
  };
  const setLink = (selector, href, label) => {
    const el = $(selector); if (!el) return;
    if (label !== undefined) el.textContent = text(label);
    if (href) el.href = href; else el.removeAttribute('href');
  };
  const normalPath = input => {
    if (typeof input !== 'string') return '';
    let path = input.trim();
    try { path = decodeURIComponent(path); } catch (_) { return ''; }
    if (path.startsWith('/media/')) path = path.slice(1);
    if (!path.startsWith('media/') || path.includes('..') || /[\\?#\x00-\x1f]/.test(path)) return '';
    return path;
  };
  const mediaURL = value => {
    const path = normalPath(value);
    if (!path) return '';
    return new URL(path.split('/').map(encodeURIComponent).join('/'), new URL('./', document.baseURI)).href;
  };
  const knownMissingLocalMedia = value => location.protocol === 'file:' && Array.isArray(window.ACSOL_PREVIEW_MEDIA)
    && !window.ACSOL_PREVIEW_MEDIA.includes(normalPath(value));
  const conceptImage = (asset, alt = '') => {
    const image = node('img'); image.src = 'assets/' + asset;
    image.alt = alt; image.width = 1200; image.height = 800; image.loading = 'lazy'; image.decoding = 'async';
    return image;
  };
  const initials = name => {
    const value = text(name, 'ACSoL');
    if (/[가-힣]/.test(value)) return value.slice(-2);
    return value.split(/\s+/).filter(Boolean).slice(0, 2).map(v => v[0]).join('').toUpperCase();
  };
  const portraitFallback = (name, role) => {
    const el = node('div', 'portrait-fallback');
    el.append(node('span', '', 'ACSoL / PEOPLE'), node('strong', '', initials(name)), node('span', '', role));
    el.setAttribute('aria-label', text(name) + ' — 프로필 사진 준비 중'); return el;
  };
  const imageFallback = label => {
    const el = node('div', 'image-fallback');
    el.append(node('strong', '', 'ACSoL.'), node('span', '', label || '이미지를 준비 중입니다.')); return el;
  };
  /* Show a finished fallback immediately and only replace it after a successful load.
     This also handles missing files, AVIF support, and removed CMS uploads. */
  const setImage = (target, value, alt, fallbackFactory, options = {}) => {
    if (!target) return;
    const fallback = () => {
      target.replaceChildren(fallbackFactory ? fallbackFactory() : imageFallback('이미지를 준비 중입니다.'));
      target.classList.toggle('is-concept', Boolean(options.concept));
      if (options.onFallback) options.onFallback();
    };
    fallback();
    const src = mediaURL(value);
    if (!src || knownMissingLocalMedia(value)) return;
    const image = node('img'); image.alt = text(alt); image.decoding = 'async';
    image.loading = options.eager ? 'eager' : 'lazy';
    if (options.eager) image.fetchPriority = 'high';
    image.addEventListener('load', () => {
      target.replaceChildren(image); target.classList.remove('is-concept');
      if (options.onLoad) options.onLoad();
    }, {once: true});
    image.addEventListener('error', fallback, {once: true});
    // A detached lazy image may never load; briefly mount it invisibly in its target.
    image.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
    image.addEventListener('load', () => image.removeAttribute('style'), {once: true});
    image.src = src; target.append(image);
  };
  const jsonCache = new Map();
  const getJSON = (filename, isList = true) => {
    const key = filename + ':' + isList;
    if (jsonCache.has(key)) return jsonCache.get(key);
    const promise = (async () => {
      let value;
      if (location.protocol === 'file:') {
        if (!window.ACSOL_PREVIEW_DATA || !(filename in window.ACSOL_PREVIEW_DATA)) throw new Error('로컬 미리보기 데이터가 없습니다: ' + filename);
        value = window.ACSOL_PREVIEW_DATA[filename];
      } else {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(new URL('data/' + filename + '.json', document.baseURI), {cache: 'no-store', signal: controller.signal});
          if (!response.ok) throw new Error(filename + '.json / HTTP ' + response.status);
          value = await response.json();
        } finally { clearTimeout(timer); }
      }
      if (isList && !Array.isArray(value)) throw new Error(filename + ': JSON 배열이 필요합니다.');
      if (!isList && !isObject(value)) throw new Error(filename + ': JSON 객체가 필요합니다.');
      return isList ? value.filter(isObject) : value;
    })();
    jsonCache.set(key, promise); return promise;
  };
  const readSettings = async kind => {
    try { return await getJSON(kind, false); }
    catch (_) { return getJSON('site', false); }
  };
  const validDate = value => {
    const date = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const d = new Date(date + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === date ? date : '';
  };
  const formatDate = value => text(value).replace(/-/g, '.');
  const timeNode = value => {
    const date = validDate(value); const el = node(date ? 'time' : 'span', '', formatDate(value));
    if (date) el.dateTime = date; return el;
  };
  const scrollToHash = prefix => {
    if (!new RegExp('^#' + prefix + '-\\d+$').test(location.hash)) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({behavior: 'instant', block: 'start'}));
  };
  const replaceHash = hash => {
    try { history.replaceState(null, '', location.pathname + location.search + hash); } catch (_) { /* file:// may disallow history writes */ }
  };
  const toast = message => {
    const el = $('#toast'); if (!el) return;
    el.textContent = message; el.classList.add('is-visible');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  };
  const run = async (selector, task) => {
    try { await task(); }
    catch (error) {
      console.warn('[ACSoL]', error);
      const targets = selector ? $$(selector) : [];
      for (const target of targets) {
      const block = node('div', 'error-note');
      block.append(node('p', '', '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'));
      const button = node('button', '', '다시 불러오기'); button.type = 'button';
      button.addEventListener('click', () => location.reload()); block.append(button); target.replaceChildren(block);
      }
    }
  };

  async function applyHome() {
    const cfg = await readSettings('home');
    const title = $('#hero-title');
    if (title) {
      title.replaceChildren(node('span', 'hero-title-lead', text(cfg.heroTitle)));
      title.append(document.createTextNode(' '));
      if (text(cfg.heroAccent)) title.append(node('em', '', cfg.heroAccent));
    }
    setText('#hero-korean', cfg.heroKorean); setText('#hero-description', cfg.heroDescription);
    setText('#lab-intro', cfg.labIntro); setText('#hero-caption', cfg.heroImageCaption);
    setImage($('#hero-image'), cfg.heroImage, text(cfg.heroImageCaption, 'ACSoL 연구실 대표 사진'),
      () => conceptImage('surface-study-color.svg', '반도체 소재의 표면을 연상시키는 추상 선형 그래픽'), {
        eager: true, concept: true,
        onFallback: () => setText('#hero-image-note', 'Conceptual surface study'),
        onLoad: () => setText('#hero-image-note', '')
      });
  }
  async function applyProfessor(page) {
    const cfg = await readSettings('professor');
    setText('#footer-address', cfg.address);
    if (page === 'people') {
      const fields = {
        '#professor-tagline': 'professorTagline', '#professor-name': 'professorName', '#professor-title': 'professorTitle',
        '#professor-department': 'professorDepartment', '#professor-additional-title': 'professorAdditionalTitle',
        '#professor-university': 'professorUniversity', '#professor-office': 'office', '#professor-office-label': 'professorOfficeLabel',
        '#professor-email-label': 'professorEmailLabel', '#professor-phone-label': 'professorPhoneLabel', '#professor-bio': 'professorBio'
      };
      for (const [selector, key] of Object.entries(fields)) setText(selector, cfg[key]);
      setText('#professor-ko', [text(cfg.professorKoreanName), text(cfg.professorKoreanSuffix, '교수')].filter(Boolean).join(' '));
      setLink('#professor-email', safeEmail(cfg.professorEmail), cfg.professorEmail);
      setLink('#professor-phone', safePhone(cfg.contactPhone), cfg.contactPhone);
      setImage($('#professor-photo'), cfg.professorPhoto, text(cfg.professorKoreanName) + ' 교수 프로필 사진',
        () => portraitFallback(cfg.professorName, 'Principal Investigator'), {eager: true});
    }
    if (page === 'contact') {
      setText('#contact-professor', [text(cfg.professorKoreanName), text(cfg.professorKoreanSuffix,'교수')].join(' ') + ' · ' + text(cfg.professorName));
      setLink('#contact-email', safeEmail(cfg.professorEmail), cfg.professorEmail);
      setLink('#contact-mail-button', safeEmail(cfg.professorEmail));
      setText('#contact-office', cfg.office); setText('#contact-address', cfg.address);
      setLink('#contact-phone', safePhone(cfg.contactPhone), cfg.contactPhone);
      setLink('#contact-lab-phone', safePhone(cfg.labPhone), cfg.labPhone);
      const query = [text(cfg.address), text(cfg.office)].filter(Boolean).join(' ');
      if (query) {
        setLink('#naver-map', 'https://map.naver.com/p/search/' + encodeURIComponent(query));
        setLink('#google-map', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query));
      }
      const button = $('#copy-email');
      if (button) {
        if (!safeEmail(cfg.professorEmail)) button.hidden = true;
        button.addEventListener('click', async () => {
          const value = text(cfg.professorEmail);
          try {
            let success = false;
            if (navigator.clipboard && window.isSecureContext) {
              try { await navigator.clipboard.writeText(value); success = true; } catch (_) { /* fall through */ }
            }
            if (!success) {
              const field = node('textarea'); field.value = value;
              field.style.cssText = 'position:fixed;opacity:0;left:0;top:0;'; document.body.append(field);
              field.select(); success = document.execCommand('copy'); field.remove(); button.focus();
            }
            toast(success ? '이메일 주소를 복사했습니다.' : '이메일 주소를 선택하여 복사해 주세요.');
          } catch (_) { toast('이메일 주소를 선택하여 복사해 주세요.'); }
        });
      }
    }
  }

  async function renderResearch(page) {
    const entries = await getJSON('research');
    const target = page === 'home' ? $('#home-research-list') : $('#research-list');
    if (!target) return;
    if (!entries.length) { target.replaceChildren(emptyNote('New directions ahead.', '연구 분야를 업데이트하고 있습니다.')); return; }
    if (page === 'home') {
      target.replaceChildren(...entries.slice(0,4).map((item, index) => {
        const link = node('a', 'research-mini'); link.href = 'research.html#research-' + (index + 1);
        const visual = node('div', 'mini-visual');
        setImage(visual, item.image, text(item.imageAlt, item.title), () => conceptImage('study-' + (index % 4 + 1) + '-color.svg'), {concept: true});
        const label = node('div', 'mini-label'); label.append(node('span', 'number', String(index + 1).padStart(2,'0') + ' / RESEARCH'), arrow());
        link.append(visual, label, node('h3', '', item.title), node('p', 'mini-desc', item.subtitle || item.description)); return link;
      })); return;
    }
    const controls = [];
    const setExpanded = (entry, isOpen, updateURL = false) => {
      for (const other of controls) {
        const open = other === entry && isOpen;
        other.button.setAttribute('aria-expanded', String(open)); other.detail.hidden = !open;
        other.card.classList.toggle('is-expanded', open);
        other.label.textContent = open ? 'Close details' : 'Explore this direction';
      }
      if (updateURL) replaceHash(isOpen ? '#' + entry.card.id : '');
    };
    const nav = $('#research-nav');
    if (nav) nav.replaceChildren(...entries.map((item,index) => {
      const a = node('a'); a.href = '#research-' + (index+1);
      a.append(node('span', '', String(index+1).padStart(2,'0')), document.createTextNode(text(item.title))); return a;
    }));
    target.replaceChildren(...entries.map((item, index) => {
      const card = node('article', 'research-feature'); card.id = 'research-' + (index + 1);
      const preview = node('div', 'research-feature-preview');
      const visual = node('div', 'research-visual');
      setImage(visual, item.image, text(item.imageAlt, item.title), () => conceptImage('study-' + (index % 4 + 1) + '-color.svg'), {concept: true});
      const body = node('div', 'feature-body');
      const h2 = node('h2', '', item.title); h2.id = 'research-heading-' + (index + 1);
      body.append(node('span', 'feature-number', String(index+1).padStart(2,'0') + ' / RESEARCH'), h2);
      if (text(item.subtitle)) body.append(node('p', 'feature-subtitle', item.subtitle));
      if (text(item.description)) body.append(node('p', 'feature-desc', item.description));
      const button = node('button', 'research-toggle'); button.type = 'button';
      const label = node('span', '', 'Explore this direction');
      const icon = node('span', 'toggle-icon'); icon.setAttribute('aria-hidden', 'true'); button.append(label, icon);
      button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'research-detail-' + (index+1));
      button.setAttribute('aria-label', text(item.title) + ' 상세 내용 열기/닫기');
      body.append(button); preview.append(visual, body);
      const detail = node('div', 'research-details'); detail.id = 'research-detail-' + (index+1); detail.hidden = true;
      detail.setAttribute('role', 'region'); detail.setAttribute('aria-labelledby', h2.id);
      const inner = node('div', 'research-details-inner');
      if (text(item.detailIntro)) inner.append(node('p', 'research-detail-intro', item.detailIntro));
      const sections = Array.isArray(item.detailSections) ? item.detailSections.filter(isObject) : [];
      sections.forEach(section => {
        const hasCopy = text(section.heading) || text(section.body);
        const hasImage = mediaURL(section.image);
        if (!hasCopy && !hasImage) return;
        const block = node('section', 'research-detail-block');
        if (hasCopy) {
          const copy = node('div', 'research-detail-copy');
          if (text(section.heading)) copy.append(node('h3', '', section.heading));
          if (text(section.body)) copy.append(node('p', '', section.body)); block.append(copy);
        }
        if (hasImage) {
          const figure = node('figure', 'research-detail-figure'); const imageHost = node('div');
          setImage(imageHost, section.image, text(section.imageAlt, section.heading || item.title)); figure.append(imageHost);
          if (text(section.imageCaption)) figure.append(node('figcaption', '', section.imageCaption)); block.append(figure);
        }
        inner.append(block);
      });
      const keywords = text(item.keywords).split(/[·;\n]/).map(s => s.trim()).filter(Boolean);
      if (keywords.length) {
        const block = node('div', 'research-detail-block'); block.append(node('span', 'overline', 'Focus areas'));
        const list = node('ul', 'focus-list');
        keywords.forEach((keyword, k) => {
          const li = node('li'); li.append(node('span', '', String(k+1).padStart(2,'0')), document.createTextNode(keyword)); list.append(li);
        }); block.append(list); inner.append(block);
      }
      if (!inner.children.length) inner.append(emptyNote('', '세부 연구 내용을 업데이트하고 있습니다.'));
      detail.append(inner); card.append(preview, detail);
      const entry = {card, detail, button, label}; controls.push(entry);
      button.addEventListener('click', () => setExpanded(entry, button.getAttribute('aria-expanded') !== 'true', true));
      preview.addEventListener('click', event => {
        if (!event.target.closest('button, a') && !window.getSelection()?.toString()) button.click();
      });
      return card;
    }));
    const handleHash = () => {
      const active = controls.find(entry => '#' + entry.card.id === location.hash);
      if (active) { setExpanded(active, true); scrollToHash('research'); }
    };
    window.addEventListener('hashchange', handleHash); handleHash();
  }

  async function renderHistory(filename, selector, dateKey, valueKey) {
    const entries = await getJSON(filename); const target = $(selector); if (!target) return;
    if (!entries.length) { target.replaceChildren(emptyNote('', '정보를 업데이트하고 있습니다.')); return; }
    target.replaceChildren(...entries.map(item => {
      const row = node('div', 'history-row');
      row.append(node('span', 'history-date', item[dateKey]), node('p', 'history-description', item[valueKey])); return row;
    }));
  }
  async function renderStudents() {
    const entries = await getJSON('students');
    for (const role of ['phd', 'master']) {
      const target = $('#' + role + '-list'); if (!target) continue;
      const people = entries.filter(person => text(person.role).toLowerCase() === role);
      setText('#' + role + '-count', people.length ? ' / ' + String(people.length).padStart(2, '0') : '');
      if (!people.length) { target.replaceChildren(emptyNote('Meet our researchers, soon.', '구성원 정보를 업데이트하고 있습니다.')); continue; }
      target.replaceChildren(...people.map(person => {
        const card = node('article', 'student-card'), photo = node('div', 'student-photo');
        setImage(photo, person.photo, text(person.name) + ' 연구원 사진', () => portraitFallback(person.name, role === 'phd' ? 'Ph.D. Student' : 'M.S. Student'));
        const info = node('div', 'student-info'), title = node('div', 'student-title'); title.append(node('h3', '', person.name));
        if (text(person.cohort)) title.append(node('span', 'cohort', /^\d+$/.test(text(person.cohort)) ? person.cohort + '기' : person.cohort));
        info.append(title);
        if (text(person.department)) info.append(node('p', 'student-department', person.department));
        if (text(person.research)) {
          const field = node('p', 'research-field'); field.append(node('span', 'student-field-label', 'Research'), document.createTextNode(text(person.research))); info.append(field);
        }
        if (text(person.email)) {
          const a = node(safeEmail(person.email) ? 'a' : 'span', 'student-email', person.email);
          if (safeEmail(person.email)) a.href = safeEmail(person.email); info.append(a);
        }
        card.append(photo, info); return card;
      }));
    }
  }
  async function renderAlumni() {
    const entries = await getJSON('alumni'); const target = $('#alumni-list'); if (!target) return;
    if (!entries.length) { target.replaceChildren(emptyNote('Our wider community.', '졸업생 정보를 업데이트하고 있습니다.')); return; }
    target.replaceChildren(...entries.map(person => {
      const card = node('article', 'alumni-card'), head = node('div', 'alumni-card-header');
      head.append(node('h3', '', person.name));
      head.append(node('span', 'alumni-meta', [text(person.degree), text(person.graduationYear)].filter(Boolean).join(' / ')));
      card.append(head); const dl = node('dl', 'alumni-details');
      for (const [label, key] of [['Job','company'],['Research','pastResearch'],['Email','email']]) {
        if (!text(person[key])) continue;
        const dt = node('dt', '', label), dd = node('dd');
        if (key === 'email' && safeEmail(person.email)) {
          const link = node('a', '', person.email); link.href = safeEmail(person.email); dd.append(link);
        } else dd.textContent = text(person[key]);
        dl.append(dt, dd);
      }
      if (dl.children.length) card.append(dl); return card;
    }));
  }

  function makeFilter(label, value, selected, callback) {
    const button = node('button', 'filter-button', label); button.type = 'button';
    button.dataset.value = value; button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', () => callback(value)); return button;
  }
  const publicationYear = item => {
    const date = validDate(item.publishedDate); if (date) return Number(date.slice(0,4));
    const year = Number(item.year); return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : null;
  };
  const doiURL = input => {
    const doi = text(input).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
    if (!/^10\.\d{4,9}\/[^\s<>"'\\]+$/i.test(doi) || doi.includes('://')) return '';
    return 'https://doi.org/' + doi.split('/').map(encodeURIComponent).join('/');
  };
  async function renderPublications() {
    const target = $('#publication-list'); if (!target) return;
    const raw = await getJSON('publications');
    const entries = raw.map((entry,index) => ({...entry, _date: validDate(entry.publishedDate), _year: publicationYear(entry), _index:index}));
    entries.sort((a,b) => (b._year ?? -1) - (a._year ?? -1) || b._date.localeCompare(a._date) || a._index - b._index);
    let selected = 'all', query = '';
    const years = [...new Set(entries.map(entry => entry._year === null ? 'unknown' : String(entry._year)))];
    const filter = $('#publication-filters'), input = $('#publication-search');
    const update = () => {
      $$('.filter-button', filter).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === selected)));
      const normalized = query.normalize('NFKC').toLocaleLowerCase();
      const matches = entries.filter(entry => (selected === 'all' || (entry._year === null ? 'unknown' : String(entry._year)) === selected)
        && [entry.title, entry.journal, entry.authors, entry.doi, entry._year].map(v => text(v)).join(' ').normalize('NFKC').toLocaleLowerCase().includes(normalized));
      setText('#publication-result-count', `${matches.length} publication${matches.length === 1 ? '' : 's'}${matches.length !== entries.length ? ' / ' + entries.length + ' total' : ''}`);
      if (!matches.length) {
        target.replaceChildren(emptyNote(raw.length ? 'No matching publications.' : 'Work in progress.', raw.length ? '검색어 또는 연도 필터를 변경해 주세요.' : '논문 목록을 업데이트하고 있습니다.')); return;
      }
      const groups = new Map();
      matches.forEach(entry => { const key = entry._year === null ? 'unknown' : String(entry._year); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(entry); });
      target.replaceChildren(...[...groups].map(([year, list]) => {
        const section = node('section', 'publication-year-group'), head = node('div', 'publication-year-header');
        head.append(node('h2', '', year === 'unknown' ? 'Undated' : year), node('span', 'publication-count', list.length + ' publication' + (list.length === 1 ? '' : 's')));
        const items = node('div', 'publication-year-items');
        list.forEach(entry => {
          const article = node('article', 'publication'), content = node('div'), meta = node('div', 'publication-head');
          meta.append(node('p', 'pub-journal', entry.journal));
          if (entry._date) { const date = timeNode(entry._date); date.className = 'pub-date'; meta.append(date); }
          const title = node('h3'), href = doiURL(entry.doi);
          if (href) { const link = node('a', '', entry.title); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; title.append(link); }
          else title.textContent = text(entry.title);
          content.append(meta, title); if (text(entry.authors)) content.append(node('p', 'pub-authors', entry.authors));
          article.append(content);
          if (href) {
            const link = node('a', 'pub-link', 'DOI'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', text(entry.title) + ' DOI 원문 — 새 창'); link.append(arrow()); article.append(link);
          }
          items.append(article);
        }); section.append(head, items); return section;
      }));
    };
    if (filter) filter.replaceChildren(makeFilter('All years','all',true, value => { selected = value; update(); }),
      ...years.map(year => makeFilter(year === 'unknown' ? 'Undated' : year, year, false, value => { selected = value; update(); })));
    if (input) input.addEventListener('input', () => { query = input.value.trim(); update(); });
    update();
  }

  const newsGroup = category => text(category).split(/[·|]/)[0].trim() || 'News';
  // Presentation only: content and category names are never rewritten.
  const newsTone = category => {
    const group = newsGroup(category).toLocaleLowerCase();
    if (group.includes('award') || group.includes('수상')) return 'copper';
    if (group.includes('cover') || group.includes('표지')) return 'iris';
    if (group.includes('graduation') || group.includes('졸업')) return 'teal';
    return 'blue';
  };
  async function renderNews(page) {
    const target = page === 'home' ? $('#home-news-list') : $('#news-list'); if (!target) return;
    const entries = (await getJSON('news')).map((entry,index) => ({...entry, _id: 'news-' + (index + 1)}));
    entries.sort((a,b) => validDate(b.date).localeCompare(validDate(a.date)));
    if (!entries.length) { target.replaceChildren(emptyNote('More to come.', '새로운 연구실 소식을 준비하고 있습니다.')); setText('#news-count','0 stories'); return; }
    if (page === 'home') {
      target.replaceChildren(...entries.slice(0,3).map(item => {
        const card = node('article', 'home-news-card'), meta = node('div', 'news-meta');
        card.dataset.storyTone = newsTone(item.category);
        meta.append(timeNode(item.date), node('span', 'news-category', item.category));
        card.append(meta, node('h3', '', item.title), node('p', '', item.description));
        const link = node('a', 'inline-link', 'Read the story'); link.href = 'news.html#' + item._id;
        link.setAttribute('aria-label', text(item.title) + ' — 소식 보기'); link.append(arrow()); card.append(link); return card;
      })); return;
    }
    let selected = 'all'; const filter = $('#news-filters');
    const categories = [...new Set(entries.map(item => newsGroup(item.category)))];
    const update = () => {
      if (filter) $$('.filter-button', filter).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === selected)));
      const matches = entries.filter(entry => selected === 'all' || newsGroup(entry.category) === selected);
      setText('#news-count', matches.length + ' stor' + (matches.length === 1 ? 'y' : 'ies'));
      target.replaceChildren(...matches.map(item => {
        const row = node('article', 'news-item'); row.id = item._id; row.dataset.storyTone = newsTone(item.category);
        const date = timeNode(item.date); date.className = 'news-date';
        const content = node('div'); content.append(node('span', 'news-type', item.category), node('h2', '', item.title), node('p', '', item.description));
        row.append(date, content); return row;
      }));
    };
    if (filter) filter.replaceChildren(makeFilter('All', 'all', true, value => { selected = value; update(); }),
      ...categories.map(category => makeFilter(category, category, false, value => { selected = value; update(); })));
    const handleHash = () => { if (/^#news-\d+$/.test(location.hash)) { selected = 'all'; update(); scrollToHash('news'); } };
    update(); window.addEventListener('hashchange', handleHash); handleHash();
  }

  async function renderGallery() {
    const target = $('#gallery-list'); if (!target) return;
    const photos = await getJSON('gallery');
    if (!photos.length) {
      const block = node('div', 'gallery-empty'), art = node('div', 'gallery-empty-art'); art.setAttribute('aria-hidden', 'true');
      const frame = node('div', 'empty-frame'); frame.append(node('span', '', 'Our days.')); art.append(frame);
      const content = node('div'); content.append(node('span', 'overline', 'Life at ACSoL'));
      const title = node('h2'); title.append(document.createTextNode('A collection'), node('br'), node('em', '', 'in the making.'));
      content.append(title, node('p', '', '연구실의 일상과 함께한 순간들을 준비하고 있습니다. 새로운 사진으로 곧 찾아뵙겠습니다.'));
      block.append(art, content); target.replaceChildren(block); return;
    }
    const dialog = $('#gallery-lightbox'), image = $('#lightbox-image');
    let active = 0;
    const renderSlide = () => {
      const photo = photos[active];
      setText('#lightbox-counter', `${String(active+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`);
      setText('#lightbox-title', photo.title); setText('#lightbox-description', [text(photo.date), text(photo.description)].filter(Boolean).join(' · '));
      image.hidden = false; image.alt = text(photo.description, photo.title); image.removeAttribute('src');
      const oldFallback = $('.lightbox-image-fallback', dialog); if (oldFallback) oldFallback.remove();
      image.onerror = () => {
        image.hidden = true;
        if (!$('.lightbox-image-fallback', dialog)) {
          const fallback = imageFallback('이미지를 불러올 수 없습니다.'); fallback.classList.add('lightbox-image-fallback'); image.after(fallback);
        }
      };
      const src = mediaURL(photo.image);
      if (src && !knownMissingLocalMedia(photo.image)) image.src = src; else image.onerror();
      $('.lightbox-prev', dialog).disabled = photos.length < 2; $('.lightbox-next', dialog).disabled = photos.length < 2;
    };
    const show = index => {
      active = index; renderSlide();
      if (typeof dialog.showModal === 'function') { dialog.showModal(); document.body.style.overflow = 'hidden'; }
      else { const src = mediaURL(photos[index].image); if (src) window.open(src, '_blank', 'noopener,noreferrer'); }
    };
    const step = direction => { active = (active + direction + photos.length) % photos.length; renderSlide(); };
    $('.lightbox-close', dialog).addEventListener('click', () => dialog.close());
    $('.lightbox-prev', dialog).addEventListener('click', () => step(-1));
    $('.lightbox-next', dialog).addEventListener('click', () => step(1));
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    });
    target.replaceChildren(...photos.map((photo,index) => {
      const card = node('figure', 'gallery-card'), button = node('button', 'gallery-image-button'); button.type = 'button';
      button.setAttribute('aria-label', text(photo.title) + ' — 사진 크게 보기');
      const picture = node('div', 'gallery-image');
      setImage(picture, photo.image, text(photo.description, photo.title));
      const enlarge = node('span', 'gallery-enlarge'); enlarge.append(arrow()); button.append(picture, enlarge);
      button.addEventListener('click', () => show(index));
      const caption = node('figcaption'); caption.append(node('strong', '', photo.title), node('span', '', photo.date));
      card.append(button, caption);
      if (text(photo.description)) card.append(node('p', 'gallery-description', photo.description)); return card;
    }));
  }

  function initMenu() {
    const button = $('.menu-button'), menu = $('#main-nav'); if (!button || !menu) return;
    const setOpen = state => {
      button.setAttribute('aria-expanded', String(state)); button.setAttribute('aria-label', state ? '메뉴 닫기' : '메뉴 열기');
      const label = $('.menu-label', button); if (label) label.textContent = state ? 'Close' : 'Menu'; menu.classList.toggle('is-open', state);
    };
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setOpen(false); });
    menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setOpen(false); });
  }
  initMenu(); setText('#copyright-year', new Date().getFullYear());
  const page = document.body.dataset.page, jobs = [];
  jobs.push(run(null, () => applyProfessor(page)));
  if (page === 'home') jobs.push(run(null, applyHome), run('#home-research-list', () => renderResearch(page)), run('#home-news-list', () => renderNews(page)));
  if (page === 'research') jobs.push(run('#research-list', () => renderResearch(page)));
  if (page === 'people') jobs.push(
    run('#professor-employment-list', () => renderHistory('professor-employment', '#professor-employment-list', 'period', 'position')),
    run('#professor-awards-list', () => renderHistory('professor-awards', '#professor-awards-list', 'date', 'award')),
    run('#phd-list, #master-list', renderStudents), run('#alumni-list', renderAlumni)
  );
  if (page === 'publications') jobs.push(run('#publication-list', renderPublications));
  if (page === 'news') jobs.push(run('#news-list', () => renderNews(page)));
  if (page === 'gallery') jobs.push(run('#gallery-list', renderGallery));
  Promise.allSettled(jobs).then(() => { document.body.dataset.ready = 'true'; });
})();
