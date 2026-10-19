/* ACSoL / Chromatic Editorial v8
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
  /* ACSoL v16.1: image loading optimization */
  const setImage = (target, value, alt, fallbackFactory, options = {}) => {
    if (!target) return;
    if (target._acsolImageObserver) {
      target._acsolImageObserver.disconnect();
      target._acsolImageObserver = null;
    }
    const requestId = (target._acsolImageRequest || 0) + 1;
    target._acsolImageRequest = requestId;
    const fallback = () => {
      if (target._acsolImageRequest !== requestId) return;
      target.replaceChildren(fallbackFactory ? fallbackFactory() : imageFallback('이미지를 준비 중입니다.'));
      target.classList.toggle('is-concept', Boolean(options.concept));
      if (options.onFallback) options.onFallback();
    };
    const src = mediaURL(value);
    if (!src || knownMissingLocalMedia(value)) {
      fallback();
      return;
    }
    // Do not show a misleading concept photo while the real one is downloading.
    // A neutral skeleton avoids a long-lived, unrelated illustration.
    const pending = node('div', 'acsol-image-pending');
    pending.setAttribute('aria-hidden', 'true');
    target.replaceChildren(pending);
    target.classList.remove('is-concept');
    const image = new Image();
    image.alt = text(alt);
    image.decoding = 'async';
    // Native lazy loading on a detached 1×1 image can stall indefinitely.
    // IntersectionObserver handles off-screen lazy loading instead.
    image.loading = 'eager';
    image.fetchPriority = options.eager ? 'high' : 'auto';
    image.addEventListener('load', async () => {
      try { if (image.decode) await image.decode(); } catch (_) { /* decoded by onload */ }
      if (target._acsolImageRequest !== requestId) return;
      target.replaceChildren(image);
      target.classList.remove('is-concept');
      if (options.onLoad) options.onLoad();
    }, {once:true});
    image.addEventListener('error', fallback, {once:true});
    const start = () => {
      if (target._acsolImageRequest !== requestId) return;
      image.src = src;
    };
    if (options.eager || typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        if (target._acsolImageObserver === observer) target._acsolImageObserver = null;
        start();
      }, {rootMargin:'650px 0px'});
      target._acsolImageObserver = observer;
      observer.observe(target);
    }
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
      // Existing array format and the new CMS-friendly {items:[...]} format are both accepted.
      if (isList && !Array.isArray(value)) {
        if (isObject(value) && Array.isArray(value.items)) value = value.items;
        else throw new Error(filename + ': JSON 배열 또는 {items:[...]} 구조가 필요합니다.');
      }
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


  // Site and page typography: supported presets only, numeric values clamped.
  const families = Object.freeze({
    pretendard:'"Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif',
    noto:'"Noto Sans KR", "Pretendard Variable", sans-serif',
    nanum:'"Nanum Gothic", "Pretendard Variable", sans-serif',
    serif:'"Noto Serif KR", "Nanum Myeongjo", Georgia, serif',
    system:'-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
  });
  const setSizeVar = (element, variable, value, minimum, maximum) => {
    const n=Number(value);
    if (element && Number.isFinite(n) && n > 0) element.style.setProperty(variable,Math.max(minimum,Math.min(maximum,n))+'px');
  };
  const chooseFont = (name, fallback) => families[name] || fallback || families.pretendard;
  async function applyTypography() {
    const root=document.documentElement;
    try {
      const cfg=await getJSON('typography',false);
      root.style.setProperty('--cms-global-font',chooseFont(cfg.bodyFont));
      root.style.setProperty('--cms-heading-font',chooseFont(cfg.headingFont));
      setSizeVar(root,'--cms-nav-size',cfg.navSize,12,22);
      setSizeVar(root,'--cms-brand-size',cfg.brandSize,10,20);
      setSizeVar(root,'--cms-footer-size',cfg.footerSize,12,20);
      setSizeVar(root,'--cms-caption-size',cfg.captionSize,11,20);
    } catch(e) {console.warn('[ACSoL] typography optional settings',e.message);}
  }
  function setPageTypography(cfg) {
    const body=document.body;
    if(cfg.bodyFont && cfg.bodyFont!=='inherit') body.style.setProperty('--cms-page-font',chooseFont(cfg.bodyFont));
    if(cfg.headingFont && cfg.headingFont!=='inherit') body.style.setProperty('--cms-page-heading-font',chooseFont(cfg.headingFont));
    setSizeVar(body,'--cms-page-title-size',cfg.headingSize,30,100);
    setSizeVar(body,'--cms-page-body-size',cfg.bodySize,13,23);
    setSizeVar(body,'--cms-page-label-size',cfg.labelSize,11,22);
    setSizeVar(body,'--cms-page-section-size',cfg.sectionHeadingSize,22,70);
  }
  async function applyPageCopy(page) {
    // Current CMS files are preserved; new page-copy.json files are additive.
    if(page==='home') {
      const cfg=await readSettings('home');
      setText('#cms-home-eyebrow',cfg.eyebrow || 'Hanyang University · Seoul');
      setText('#cms-home-action',cfg.actionLabel || 'Explore our research');
      setText('#cms-home-summary-label',cfg.summaryLabel || 'The laboratory');
      setPageTypography(cfg);return;
    }
    let cfg;
    try {cfg=await getJSON('page-'+page,false);}catch(e){ console.warn('[ACSoL] optional page copy',page,e.message);return; }
    setText('#cms-page-eyebrow',cfg.eyebrow);
    setText('.page-title-lead',cfg.titleLead);
    setText('.page-title-accent',cfg.titleAccent);
    // Keep existing CMS custom copy, but update the former degree-grouped default subtitle.
    const oldStudentsSubtitle = '현재 연구 중인 박사과정·석사과정 학생을 소개합니다.';
    setText('#cms-page-subtitle', page === 'students' && cfg.subtitle === oldStudentsSubtitle
      ? '연구실 구성원을 연구팀별로 소개합니다.' : cfg.subtitle);
    if (page==='contact') {
      setText('#cms-contact-lead',cfg.contactLead);
      setText('#cms-contact-accent',cfg.contactAccent);
      setText('#cms-contact-intro',cfg.contactIntro);
      setText('#cms-contact-action',cfg.actionLabel);
    }
    setPageTypography(cfg);
  }
  // Optional item-level style within any Pages CMS list entry.
  const applyEntryTypography=(element,record)=>{
    if(!element || !record || !isObject(record.typography))return element;
    const st=record.typography;
    if(st.bodyFont && st.bodyFont!=='inherit')element.style.setProperty('--cms-item-body-font',chooseFont(st.bodyFont));
    if(st.titleFont && st.titleFont!=='inherit')element.style.setProperty('--cms-item-heading-font',chooseFont(st.titleFont));
    setSizeVar(element,'--cms-item-body-size',st.bodySize,12,28);
    if (Number(st.bodySize)>0) element.classList.add('cms-item-body-sized');
    setSizeVar(element,'--cms-item-heading-size',st.titleSize,13,42);
    if (Number(st.titleSize)>0) element.classList.add('cms-item-title-sized');
    element.classList.add('cms-styled-entry');return element;
  };

  async function applyHome() {
    const galleryPromise = getJSON('gallery');
    const cfg = await readSettings('home');
    const title = $('#hero-title');
    if (title) {
      title.replaceChildren(node('span', 'hero-title-lead', text(cfg.heroTitle)));
      if (text(cfg.heroAccent)) title.append(document.createTextNode(' '), node('em', '', cfg.heroAccent));
    }
    setText('#hero-korean', cfg.heroKorean);
    setText('#hero-description', cfg.heroDescription);
    setText('#lab-intro', cfg.labIntro);
    const host = $('#hero-image'), prev = $('#hero-slide-prev'), next = $('#hero-slide-next');
    const gallery = await galleryPromise;
    const slides = gallery.filter(x => isObject(x) && x.featured === true && normalPath(x.image));
    const seconds = Math.max(2, Math.min(60, Number(cfg.slideIntervalSeconds) || 5));
    const nextPreloaded = new Map();
    const prepareNext = () => {
      if (slides.length < 2) return;
      const nextPhoto = slides[(current + 1) % slides.length];
      const nextSrc = mediaURL(nextPhoto.image);
      if (!nextSrc || nextPreloaded.has(nextSrc)) return;
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = 'low';
      img.src = nextSrc;
      nextPreloaded.set(nextSrc, img);
    };
    let current = 0, timer = null;
    const show = index => {
      if (!slides.length) {
        setText('#hero-caption', 'ACSoL · Hanyang University');
        setImage(host, '', 'ACSoL 연구실 사진', () => conceptImage('surface-study-color.svg', '연구실 대표 사진 준비 중'), {concept:true});
        setText('#hero-image-note', 'Gallery에서 메인 사진을 선택해 주세요');
        return;
      }
      current = (index + slides.length) % slides.length;
      const photo = slides[current];
      setText('#hero-caption', text(photo.title, 'ACSoL · Hanyang University'));
      setText('#hero-image-note', text(photo.date));
      setImage(host, photo.image, text(photo.description, photo.title || 'ACSoL 연구실 사진'),
        () => imageFallback('사진을 불러올 수 없습니다.'), {eager:true, onLoad:prepareNext});
    };
    const stop = () => { if (timer !== null) clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (slides.length > 1 && !document.hidden)
        timer = setInterval(() => show(current + 1), seconds * 1000);
    };
    const step = direction => { show(current + direction); start(); };
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));
    document.addEventListener('visibilitychange', start);
    // Touch users can swipe; visual controls remain unobtrusive.
    if (host) {
      let touchX = null;
      host.addEventListener('touchstart', event => { touchX = event.changedTouches[0]?.screenX ?? null; }, {passive:true});
      host.addEventListener('touchend', event => {
        if (touchX === null || slides.length < 2) return;
        const difference = (event.changedTouches[0]?.screenX ?? touchX) - touchX;
        touchX = null;
        if (Math.abs(difference) > 45) step(difference < 0 ? 1 : -1);
      }, {passive:true});
    }
    if (prev) prev.hidden = slides.length < 2;
    if (next) next.hidden = slides.length < 2;
    show(0); start();
  }
  async function showTimedBanner() {
    let banners=[];
    try{banners=await getJSON('banners');}catch(error){console.warn('[ACSoL] Banner data not ready',error);return;}
    if(!banners.length)return;
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const stamp=Number(today.replace(/\D/g,''));
    const storage=(kind,method,key,value)=>{try{return method==='get'?window[kind].getItem(key):window[kind].setItem(key,value);}catch(_){return null;}};
    const eligible=banners.filter((entry)=>{
      if(!entry || entry.enabled===false || !normalPath(entry.image))return false;
      const start=validDate(entry.startDate),end=validDate(entry.endDate);
      if(!start||!end || start>end)return false;
      const code=text(entry.id)||[entry.image,start,end].join('|');
      return stamp>=Number(start.replace(/-/g,'')) && stamp<=Number(end.replace(/-/g,'')) &&
        storage('localStorage','get','acsol-banner-day:'+code)!==today &&
        storage('sessionStorage','get','acsol-banner-closed:'+code)!=='1';
    });
    if(!eligible.length)return;
    let index=0;
    const overlay=node('div','recruit-banner-overlay');
    overlay.setAttribute('role','presentation');
    const popup=node('section','recruit-banner-popup');
    popup.setAttribute('role','region');
    popup.setAttribute('aria-label','연구실 모집 및 안내 배너');
    const grip=node('div','recruit-banner-drag-handle','ACSoL  /  ANNOUNCEMENT');
    grip.title='마우스로 잡아서 배너 위치 이동';
    grip.setAttribute('aria-label','이 배너를 드래그하여 이동할 수 있습니다');
    const picture=node('div','recruit-banner-image');
    const link=node('a','recruit-banner-link');link.append(picture);
    const footer=node('div','recruit-banner-footer');
    const label=node('label','recruit-banner-hide-label');
    const check=node('input');check.type='checkbox';check.id='recruit-banner-hide-today';
    label.append(check,document.createTextNode(' 오늘 하루 보지 않기'));
    const done=node('button','recruit-banner-done','닫기');done.type='button';
    footer.append(label,done);popup.append(grip,link,footer);overlay.append(popup);
    // Move only from the banner handle; buttons, links and text remain usable.
    let drag=null;
    grip.addEventListener('pointerdown',ev=>{
      if(ev.button!==0)return;
      const r=popup.getBoundingClientRect();
      popup.style.left=r.left+'px';popup.style.top=r.top+'px';popup.style.right='auto';
      drag={x:ev.clientX,y:ev.clientY,left:r.left,top:r.top};
      grip.setPointerCapture(ev.pointerId);grip.classList.add('is-dragging');ev.preventDefault();
    });
    grip.addEventListener('pointermove',ev=>{
      if(!drag)return;
      const x=Math.max(8,Math.min(window.innerWidth-popup.offsetWidth-8,drag.left+ev.clientX-drag.x));
      const y=Math.max(8,Math.min(window.innerHeight-Math.min(popup.offsetHeight,window.innerHeight-16)-8,drag.top+ev.clientY-drag.y));
      popup.style.left=x+'px';popup.style.top=y+'px';
    });
    const endDrag=()=>{drag=null;grip.classList.remove('is-dragging');};
    grip.addEventListener('pointerup',endDrag);grip.addEventListener('pointercancel',endDrag);
    window.addEventListener('resize',()=>{
      if(!popup.isConnected)return;const rect=popup.getBoundingClientRect();
      if(rect.right>window.innerWidth-8)popup.style.left=Math.max(8,window.innerWidth-popup.offsetWidth-8)+'px';
      if(rect.bottom>window.innerHeight-8)popup.style.top=Math.max(8,window.innerHeight-popup.offsetHeight-8)+'px';
    });
    // ACSoL-Banner-Sizing-v1: editable dimensions, per-banner, without replacing CSS layout.
    // Actual pixels are respected when the viewport has room; on narrow screens the
    // requested rectangle scales uniformly so it does not overflow the viewport.
    const applyBannerSize = (entry) => {
      const mode = String(entry?.forceImageSize ?? 'off').toLowerCase();
      const requested = mode === 'on' || mode === 'true' || entry?.forceImageSize === true;
      const width = Number(entry?.imageWidth);
      const height = Number(entry?.imageHeight);
      const valid = requested && Number.isFinite(width) && Number.isFinite(height)
        && width > 0 && height > 0 && width <= 4096 && height <= 4096;
      popup.classList.toggle('acsol-banner-fixed-size', valid);
      if (!valid) {
        popup.style.removeProperty('--acsol-banner-width');
        popup.style.removeProperty('--acsol-banner-height');
        popup.style.removeProperty('--acsol-banner-fit');
        return;
      }
      const fit = ['contain', 'cover', 'fill'].includes(entry.imageFitMode)
        ? entry.imageFitMode : 'contain';
      // Leave room for the popup padding, drag handle and hide-today footer.
      const availableWidth = Math.max(110, window.innerWidth - 48);
      const availableHeight = Math.max(110, window.innerHeight - 152);
      const factor = Math.min(1, availableWidth / width, availableHeight / height);
      popup.style.setProperty('--acsol-banner-width', (width * factor).toFixed(2) + 'px');
      popup.style.setProperty('--acsol-banner-height', (height * factor).toFixed(2) + 'px');
      popup.style.setProperty('--acsol-banner-fit', fit);
      requestAnimationFrame(() => {
        if (!popup.isConnected) return;
        const bounds = popup.getBoundingClientRect();
        const maxLeft = Math.max(8, window.innerWidth - popup.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - popup.offsetHeight - 8);
        if (bounds.left > maxLeft) popup.style.left = maxLeft + 'px';
        if (bounds.top > maxTop) popup.style.top = maxTop + 'px';
      });
    };
    window.addEventListener('resize', () => {
      if (popup.isConnected) applyBannerSize(eligible[index]);
    });
    const previousFocus=document.activeElement;
    const render=()=>{
      const entry=eligible[index];if(!entry){overlay.remove();previousFocus?.focus?.();return;}
      setImage(picture,entry.image,text(entry.alt,entry.title||'연구실 공지 배너'),()=>imageFallback('배너 사진을 불러오지 못했습니다.'),{eager:true});
      applyBannerSize(entry);
      const url=text(entry.linkUrl);const good=/^https:\/\/[^\s<]+$/i.test(url)||/^(research|students|news|contact|publications|equipment|gallery)\.html(\?[a-z0-9=&-]+)?$/i.test(url);
      link.href=good?url:'#';link.classList.toggle('is-static',!good);
      if(good&&url.startsWith('https://')){link.target='_blank';link.rel='noopener noreferrer';}else{link.removeAttribute('target');link.removeAttribute('rel');}
      check.checked=false;
    };
    const dismiss=()=>{
      const entry=eligible[index];const code=text(entry.id)||[entry.image,validDate(entry.startDate),validDate(entry.endDate)].join('|');
      if(check.checked)storage('localStorage','set','acsol-banner-day:'+code,today);
      else storage('sessionStorage','set','acsol-banner-closed:'+code,'1');
      index+=1;render();
    };
    done.addEventListener('click',dismiss);
    link.addEventListener('click',e=>{if(link.classList.contains('is-static'))e.preventDefault();});
    overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss();});
    overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dismiss();}});
    document.body.append(overlay);render();
  }

  async function applyProfessor(page) {
    const cfg = await readSettings('professor');
    setText('#footer-address', cfg.address);
    setLink('#footer-prof-email', safeEmail(cfg.professorEmail), cfg.professorEmail);
    setLink('#footer-prof-phone', safePhone(cfg.contactPhone), cfg.contactPhone);
    if (page === 'professor') {
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

  async function applyContactConfig() {
    let cfg;
    try { cfg = await getJSON('contact', false); }
    catch (e) { console.warn('[ACSoL] optional contact settings:', e); return; }
    setText('#footer-student-name', text(cfg.studentName, '연락처 등록 예정'));
    setText('#contact-student-name', text(cfg.studentName, '담당자 정보 등록 예정'));
    setText('#contact-directions', text(cfg.directionsNote, '한양대학교 서울캠퍼스'));
    const fields = [
      ['#footer-student-email', safeEmail(cfg.studentEmail), cfg.studentEmail],
      ['#footer-student-phone', safePhone(cfg.studentPhone), cfg.studentPhone],
      ['#contact-student-email', safeEmail(cfg.studentEmail), cfg.studentEmail],
      ['#contact-student-phone', safePhone(cfg.studentPhone), cfg.studentPhone],
    ];
    for (const [selector,href,label] of fields) {
      const el = $(selector);if (!el) continue;
      el.hidden = !href;if (href) setLink(selector,href,label);
    }
    const url=text(cfg.directionsMapUrl);
    const map=$('#contact-extra-map');
    if (map && /^https:\/\/[^\s]+$/i.test(url)) {map.href=url;map.hidden=false;}
  }

  function researchSummarySrc(item) {
    return mediaURL(item?.summaryImage) ? item.summaryImage : item?.image;
  }

  function researchDetailSrc(item) {
    if (mediaURL(item?.detailImage)) return item.detailImage;
    if (mediaURL(item?.summaryImage)) return item.summaryImage;
    return item?.image;
  }

  function researchSummaryAlt(item) {
    return text(item?.summaryImageAlt, item?.imageAlt, item?.title);
  }

  function researchDetailAlt(item) {
    return text(item?.detailImageAlt, item?.imageAlt, item?.title);
  }

  async function renderResearchOverview() {
    const host=$('#research-overview');if (!host) return;
    const entries=await getJSON('research');
    if (!entries.length) {host.replaceChildren(emptyNote('Research coming soon','연구 분야를 등록해 주세요.'));return;}
    host.replaceChildren(...entries.map((item,index) => {
      const card=node('a','research-overview-card');applyEntryTypography(card,item);card.href='research-detail.html?topic='+(index+1);
      const image=node('div','research-overview-image');
      setImage(image,researchSummarySrc(item),researchSummaryAlt(item),() => conceptImage('study-'+(index%4+1)+'-color.svg'),{concept:true});
      const copy=node('div','research-overview-copy');
      copy.append(node('span','overline',String(index+1).padStart(2,'0')+' / RESEARCH'),node('h2','',item.title));
      if (text(item.description)) copy.append(node('p','',item.description));
      const more=node('span','research-overview-more','Explore research ↗');copy.append(more);
      card.append(image,copy);return card;
    }));
  }

  async function renderResearchDetail() {
    const host=$('#research-detail-content');if (!host)return;
    const entries=await getJSON('research');
    const index=Number(new URLSearchParams(location.search).get('topic'));
    if (!Number.isInteger(index)||index<1||index>entries.length) {
      host.replaceChildren(emptyNote('연구 분야를 찾을 수 없습니다.','Research 메뉴에서 항목을 선택해 주세요.'));return;
    }
    const item=entries[index-1],article=node('article','research-detail-article');applyEntryTypography(article,item);
    article.append(node('span','overline',String(index).padStart(2,'0')+' / RESEARCH'));
    article.append(node('h2','',text(item.title)));
    if (text(item.subtitle))article.append(node('p','research-detail-subtitle',item.subtitle));
    if (text(item.description))article.append(node('p','research-detail-lead',item.description));
    const cover=node('div','research-detail-cover');
    setImage(cover,researchDetailSrc(item),researchDetailAlt(item),()=>conceptImage('study-'+((index-1)%4+1)+'-color.svg'),{concept:true});
    article.append(cover);
    if (text(item.detailIntro))article.append(node('p','research-detail-intro',item.detailIntro));
    for (const section of (Array.isArray(item.detailSections)?item.detailSections:[])) {
      if (!isObject(section))continue;
      if (![section.heading,section.body,section.image].some(x=>text(x)))continue;
      const block=node('section','research-detail-block');applyEntryTypography(block,section);
      if (text(section.heading)||text(section.body)) {
        const copy=node('div','research-detail-copy');
        if (text(section.heading))copy.append(node('h3','',section.heading));
        if (text(section.body))copy.append(node('p','',section.body));
        block.append(copy);
      }
      if (normalPath(section.image)) {
        const figure=node('figure','research-detail-figure'),pic=node('div');
        setImage(pic,section.image,text(section.imageAlt,section.heading||item.title));figure.append(pic);
        if (text(section.imageCaption))figure.append(node('figcaption','',section.imageCaption));
        block.append(figure);
      }
      article.append(block);
    }
    const keywords=text(item.keywords).split(/[·;\n]/).map(x=>x.trim()).filter(Boolean);
    if (keywords.length) {
      const list=node('ul','focus-list');
      keywords.forEach((word,i)=>{const li=node('li');li.append(node('span','',String(i+1).padStart(2,'0')),document.createTextNode(word));list.append(li);});
      const wrap=node('section','research-detail-focus');wrap.append(node('h3','','Focus areas'),list);article.append(wrap);
    }
    host.replaceChildren(article);
    const nav=$('#research-detail-navigation');
    if(nav)nav.replaceChildren(...entries.map((entry,i)=>{
      const link=node('a','research-topic-link',String(i+1).padStart(2,'0')+' · '+text(entry.title));
      link.href='research-detail.html?topic='+(i+1);if(i+1===index)link.setAttribute('aria-current','page');return link;
    }));
    document.title=text(item.title)+' — Research · ACSoL';
  }

  async function renderEquipment() {
    const host = $('#equipment-list'); if (!host) return;
    const entries = await getJSON('equipment');
    if (!entries.length) {host.replaceChildren(emptyNote('Equipment directory','Pages CMS에서 장비를 등록해 주세요.')); return;}
    host.replaceChildren(...entries.map(item => {
      const card=node('article','equipment-card'), photo=node('div','equipment-photo');
      setImage(photo, item.photo, text(item.name,'장비 사진'), () => imageFallback('장비 사진 등록 예정'));
      const caption=node('div','equipment-copy');
      caption.append(node('h2','',text(item.name,'Equipment')));
      if (text(item.model)) caption.append(node('p','equipment-model',item.model));
      card.append(photo,caption); return applyEntryTypography(card,item);
    }));
  }
  async function hydrateResearchMenu() {
    const panel=$('#research-submenu');if(!panel)return;
    const entries=await getJSON('research');
    const links=entries.map((entry,index)=>{
      const title=text(entry.title);if(!title)return null;
      const link=node('a','research-dropdown-link',title);
      link.href='research-detail.html?topic='+(index+1);
      return link;
    }).filter(Boolean);
    panel.replaceChildren(...links);
    panel.dataset.researchCount=String(links.length);
    if(!links.length)panel.append(node('span','submenu-empty','연구 분야 준비 중')); 
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
        setImage(visual, researchSummarySrc(item), researchSummaryAlt(item), () => conceptImage('study-' + (index % 4 + 1) + '-color.svg'), {concept: true});
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
      const card = node('article', 'research-feature');applyEntryTypography(card,item); card.id = 'research-' + (index + 1);
      const preview = node('div', 'research-feature-preview');
      const visual = node('div', 'research-visual');
      setImage(visual, researchSummarySrc(item), researchSummaryAlt(item), () => conceptImage('study-' + (index % 4 + 1) + '-color.svg'), {concept: true});
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
      row.append(node('span', 'history-date', item[dateKey]), node('p', 'history-description', item[valueKey])); return applyEntryTypography(row,item);
    }));
  }
  // v14: team-first Students page, with legacy role support.
  async function renderStudents() {
    const target = $('#student-teams'); if (!target) return;
    const studentData = await (async () => {
      try { return await getJSON('students', false); }
      catch (err) { return await getJSON('students'); }
    })();
    const entries = Array.isArray(studentData) ? studentData : (Array.isArray(studentData.students) ? studentData.students : []);
    if (!entries.length) {
      target.replaceChildren(emptyNote('Meet our researchers, soon.', '연구원 정보를 업데이트하고 있습니다.'));
      return;
    }
    const courseNames = { integrated: '석박통합과정', phd: '박사과정', master: '석사과정' };
    const teams = new Map();
    entries.forEach(person => {
      if (!person || !text(person.name)) return;
      const team = text(person.team, '소속 팀 미지정');
      if (!teams.has(team)) teams.set(team, []);
      teams.get(team).push(person);
    });
    if (!teams.size) {
      target.replaceChildren(emptyNote('Meet our researchers, soon.', '연구원 정보를 업데이트하고 있습니다.'));
      return;
    }
    const sections = [];
    teams.forEach((people, teamName) => {
      const section = node('section', 'people-group student-team-group');
      const heading = node('div', 'subsection-head student-team-heading');
      heading.append(node('h2', '', teamName), node('span', 'overline', String(people.length) + ' Members'));
      const grid = node('div', 'student-grid');
      grid.append(...people.map(person => {
        const role = text(person.role).toLowerCase();
        const course = courseNames[role] || (text(person.role) && !['ph.d.', 'm.s.'].includes(role) ? text(person.role) : '');
        const card = node('article', 'student-card'), photo = node('div', 'student-photo');
        // Keep the existing 'photo' property as the primary ID photo.
        // Additional candid photo loads independently and crossfades on hover.
        const primary = text(person.idPhoto || person.portraitPhoto || person.photo);
        const everyday = text(person.casualPhoto);
        let casual = null;
        if (normalPath(everyday) && !knownMissingLocalMedia(everyday)) {
          casual = node('img', 'student-casual-photo');
          casual.alt = text(person.name) + ' 일상사진';
          casual.loading = 'lazy'; casual.decoding = 'async';
          casual.addEventListener('error',()=>{casual.remove();photo.classList.remove('has-casual-photo');},{once:true});
          casual.src = mediaURL(everyday);
          photo.classList.add('has-casual-photo');card.tabIndex = 0;
        }
        const attachCasual = ()=>{if(casual && !casual.isConnected)photo.append(casual);};
        setImage(photo, primary, text(person.name) + ' 연구원 증명사진',
          () => portraitFallback(person.name,course || 'ACSoL Researcher'),
          {onLoad:attachCasual,onFallback:attachCasual});
        const info = node('div', 'student-info'), title = node('div', 'student-title');
        const identity = node('div', 'student-identity'); identity.append(node('h3', '', person.name));
        // Degree and cohort share one badge next to the student name.
        // Keep the original CMS cohort text intact (e.g. '8학기' stays '8학기').
        // Bare numbers get the '기' suffix for display only.
        const cohortRaw = text(person.cohort);
        const cohortLabel = /^\d+$/.test(cohortRaw) ? cohortRaw + '기' : cohortRaw;
        const programLabel = [course, cohortLabel].filter(Boolean).join(' ');
        if (programLabel) identity.append(node('span', 'student-program program-' + (courseNames[role] ? role : 'other'), programLabel));
        // Industry-academic scholarship label: CMS opt-in, no change to student data.
        const scholarship = text(person.scholarshipCompany).toLowerCase().replace(/[ _-]/g,'');
        const scholarshipBrands = {
          samsung: {src:'assets/samsung-scholarship-logo.png', alt:'Samsung'},
          skhynix: {src:'assets/skhynix-scholarship-logo.png', alt:'SK hynix'},
        };
        if (scholarshipBrands[scholarship]) {
          const brand = scholarshipBrands[scholarship];
          const tag = node('span','student-scholarship');
          tag.setAttribute('aria-label', brand.alt + ' 산학장학생');
          const brandImage = document.createElement('img');
          brandImage.src = brand.src;
          brandImage.alt = brand.alt;
          brandImage.decoding = 'async';
          brandImage.loading = 'lazy';
          tag.append(brandImage,node('span','student-scholarship-label','산학장학생'));
          identity.append(tag);
        }
        title.append(identity);
        info.append(title);
        if (text(person.department)) info.append(node('p', 'student-department', person.department));
        if (text(person.research)) {
          const field = node('p', 'research-field');
          field.append(node('span', 'student-field-label', 'Research'), document.createTextNode(text(person.research)));
          info.append(field);
        }
        if (text(person.email)) {
          const href = safeEmail(person.email);
          const a = node(href ? 'a' : 'span', 'student-email', person.email);
          if (href) a.href = href;
          info.append(a);
        }
        card.append(photo, info); return applyEntryTypography(card, person);
      }));
      section.append(heading, grid); sections.push(section);
    });
    target.replaceChildren(...sections);
  }
  async function renderAlumni() {
    const target = $('#alumni-list'); if (!target) return;
    const entries = await getJSON('alumni');
    if (!entries.length) {
      target.replaceChildren(emptyNote('Our wider community.', '졸업생 정보를 업데이트하고 있습니다.'));
      return;
    }

    const alumniYear = entry => {
      const match = text(entry.graduationYear).match(/(?:19|20)\d{2}/);
      return match ? Number(match[0]) : 0;
    };
    // Sort by year/month descending but keep the original order within a tie.
    const dateScore = entry => {
      const match = text(entry.graduationYear).match(/((?:19|20)\d{2})(?:[.\-/ ](0?[1-9]|1[0-2]))?/);
      return match ? Number(match[1])*12 + Number(match[2] || 0) : 0;
    };
    const ordered = entries.map((person, index) => ({person, index}))
      .sort((a,b) => dateScore(b.person) - dateScore(a.person) || a.index - b.index)
      .map(({person}) => person);
    const recent = ordered.filter(person => alumniYear(person) >= 2024);
    const archive = ordered.filter(person => alumniYear(person) < 2024);
    const sections = [];

    if (recent.length) {
      const section = node('section','alumni-directory-section alumni-recent-section');
      const heading = node('div','alumni-directory-heading');
      heading.append(node('h3','','Recent Alumni'),node('span','alumni-directory-period','2024 – Present'));
      const grid = node('div','alumni-compact-grid');
      grid.setAttribute('role','list');
      for (const person of recent) {
        const card = node('article','alumni-compact-card');
        card.setAttribute('role','listitem');
        applyEntryTypography(card, person);
        const photo = node('div','alumni-compact-photo');
        const fallback = () => {
          const holder = node('div','alumni-compact-fallback');
          holder.append(node('span','','ACSoL'),node('strong','',initials(person.name)));
          return holder;
        };
        setImage(photo, person.photo, text(person.name, 'Alumni') + ' 프로필 사진', fallback);
        const info = node('div','alumni-compact-info');
        const name = node('h4','alumni-compact-name', text(person.name, 'Alumni'));
        name.title = text(person.name);
        info.append(name);
        if (text(person.pastResearch)) {
          const field = node('p','alumni-compact-research',person.pastResearch);
          field.title = text(person.pastResearch); info.append(field);
        }
        if (text(person.company)) {
          const company = node('p','alumni-compact-company',person.company);
          company.title = text(person.company);info.append(company);
        }
        const history = [text(person.graduationYear),text(person.degree)].filter(Boolean).join(' · ');
        if (history) info.append(node('p','alumni-compact-year',history));
        card.append(photo,info);grid.append(card);
      }
      section.append(heading,grid);sections.push(section);
    }

    if (archive.length) {
      const section=node('section','alumni-directory-section alumni-archive-section');
      const heading=node('div','alumni-directory-heading');
      heading.append(node('h3','','Alumni (~2023)'),node('span','alumni-directory-period','2023 and earlier'));
      const table=node('div','alumni-archive-table');
      table.setAttribute('role','list');
      const header=node('div','alumni-archive-columns');
      for(const textLabel of ['졸업 / 활동','이름 · 학위','연구 분야','현 직장 / 소속']) header.append(node('span','',textLabel));
      table.append(header);
      for (const person of archive) {
        const row=node('div','alumni-archive-row');
        row.setAttribute('role','listitem');applyEntryTypography(row,person);
        const year=node('span','alumni-archive-year',text(person.graduationYear,'—'));
        const name=node('span','alumni-archive-name');
        name.append(node('strong','',text(person.name,'이름 미등록')));
        if(text(person.degree)) name.append(node('small','',person.degree));
        const research=node('span','alumni-archive-research',text(person.pastResearch,'—'));
        const company=node('span','alumni-archive-company',text(person.company,'—'));
        for(const [element,value] of [[year,year.textContent],[name,text(person.name)],[research,research.textContent],[company,company.textContent]]) {
          if(value) element.title=value;
        }
        row.append(year,name,research,company);table.append(row);
      }
      section.append(heading,table);sections.push(section);
    }
    target.replaceChildren(...sections);
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
  // New 2-state review flag; preserve old CMS data when the new field is absent.
  const isUnderReview = entry => {
    if (typeof entry.underReview === 'boolean') return entry.underReview;
    return text(entry.status).trim().toLowerCase() === 'under review';
  };
  const publicationPeriod = year => {
    if (year === null) return 'unknown';
    if (year >= 2020) return String(year);
    if (year >= 2010) return '2010s';
    if (year >= 2000) return '2000s';
    return 'earlier';
  };
  const doiURL = input => {
    const doi = text(input).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
    if (!/^10\.\d{4,9}\/[^\s<>"'\\]+$/i.test(doi) || doi.includes('://')) return '';
    return 'https://doi.org/' + doi.split('/').map(encodeURIComponent).join('/');
  };
  async function renderPublications() {
    const target = $('#publication-list'); if (!target) return;
    const saved=await getJSON('publications');
    let imported=[];
    try { imported=await getJSON('publications-import'); }
    catch(error) { console.warn('[ACSoL] Wix publication import not found; original records retained.',error); }
    const canonical=record=>{
      const d=text(record.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').toLowerCase();
      return d ? 'doi:'+d : 'title:'+text(record.title).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
    };
    // Imported original-language titles take precedence when an old translated record has the same DOI.
    const keys=new Set(imported.map(canonical));
    const raw=[...imported,...saved.filter(item=>!keys.has(canonical(item)))];
    const entries = raw.map((entry,index) => ({...entry, _date: validDate(entry.publishedDate), _year: publicationYear(entry), _index:index}));
    entries.sort((a,b) => (b._year ?? -1) - (a._year ?? -1) || b._date.localeCompare(a._date) || a._index - b._index);
    let selected = 'all', query = '';
    const recentYears = [...new Set(entries.filter(entry => entry._year !== null && entry._year >= 2020).map(entry => entry._year))];
    const periods = [...recentYears.map(String), ...['2010s', '2000s', 'earlier', 'unknown'].filter(p => entries.some(entry => publicationPeriod(entry._year) === p))];
    const filter = $('#publication-filters'), input = $('#publication-search');
    const update = () => {
      $$('.filter-button', filter).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === selected)));
      const normalized = query.normalize('NFKC').toLocaleLowerCase();
      const matches = entries.filter(entry => (selected === 'review' ? isUnderReview(entry) : !isUnderReview(entry) && (selected === 'all' || publicationPeriod(entry._year) === selected))
        && [entry.title, entry.journal, entry.authors, entry.doi, entry._year, isUnderReview(entry) ? 'Under Review' : ''].map(v => text(v)).join(' ').normalize('NFKC').toLocaleLowerCase().includes(normalized));
      if (!matches.length) {
        target.replaceChildren(emptyNote(raw.length ? 'No matching publications.' : 'Work in progress.', raw.length ? '검색어 또는 연도 필터를 변경해 주세요.' : '논문 목록을 업데이트하고 있습니다.')); return;
      }
      const groups = new Map();
      matches.forEach(entry => { const key = entry._year === null ? 'unknown' : String(entry._year); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(entry); });
      target.replaceChildren(...[...groups].map(([year, list]) => {
        const section = node('section', 'publication-year-group'), head = node('div', 'publication-year-header');
        head.append(node('h2', '', year === 'unknown' ? 'Undated' : year));
        const items = node('div', 'publication-year-items');
        list.forEach(entry => {
          const article = node('article', 'publication'), content = node('div'), meta = node('div', 'publication-head');
          meta.append(node('p', 'pub-journal', text(entry.journal,entry.publicationType==='book'?'Book Chapter':'Publication')));
          if (isUnderReview(entry)) meta.append(node('span', 'pub-status', 'Under Review'));
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
          items.append(applyEntryTypography(article,entry));
        }); section.append(head, items); return section;
      }));
    };
    if (filter) filter.replaceChildren(
      makeFilter('All years', 'all', true, value => { selected = value; update(); }),
      ...periods.map(period => makeFilter(
        period === 'unknown' ? 'Undated' : period === 'earlier' ? 'Before 2000' : period === '2010s' ? '2010~2019' : period === '2000s' ? '~2009' : period,
        period, false, value => { selected = value; update(); }
      )),
      makeFilter('Under Review', 'review', false, value => { selected = value; update(); })
    );
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
    const entries = (await getJSON('news')).map((entry,index) => ({...entry, _id:'news-'+(index+1)}));
    entries.sort((a,b) => validDate(b.date).localeCompare(validDate(a.date)));
    if (!entries.length) {target.replaceChildren(emptyNote('More to come.','새로운 연구실 소식을 준비하고 있습니다.'));setText('#news-count','0 stories');return;}
    if (page === 'home') {
      const prev=$('#home-news-prev'), next=$('#home-news-next');
      let start=0;
      const visible=()=>window.matchMedia('(max-width:650px)').matches?1:
        window.matchMedia('(max-width:950px)').matches?2:3;
      const renderSlide=()=>{
        const count=Math.min(entries.length,visible());
        const portion=Array.from({length:count},(_,offset)=>entries[(start+offset)%entries.length]);
        target.replaceChildren(...portion.map(item => {
        const card=node('article','home-news-card'), meta=node('div','news-meta');
        card.dataset.storyTone=newsTone(item.category);
        meta.append(timeNode(item.date), node('span','news-category',item.category));
        // ACSoL-News-Main-Photo-v1: existing detailImage becomes the public cover photo.
        // No image path means no image element or reserved blank space.
        if (normalPath(item.detailImage)) {
          const media=node('div','home-news-media');
          setImage(media,item.detailImage,text(item.detailCaption,item.title),()=>imageFallback('사진 불러오기 실패'));
          const copy=node('div','home-news-copy');
          copy.append(meta,node('h3','',item.title),node('p','',item.description));
          card.classList.add('has-image');card.append(media,copy);
        } else {
          card.append(meta,node('h3','',item.title),node('p','',item.description));
        }
        applyEntryTypography(card,item);
        const link=node('a','inline-link','Read the story');link.href='news.html#'+item._id;
        link.setAttribute('aria-label',text(item.title)+' — 소식 보기');link.append(arrow());
        const contentHost=card.querySelector('.home-news-copy');
        (contentHost||card).append(link);return card;
        }));
        [prev,next].forEach(btn=>{if(btn)btn.hidden=entries.length<=count;});
      };
      if(prev)prev.addEventListener('click',()=>{start=(start-1+entries.length)%entries.length;renderSlide();});
      if(next)next.addEventListener('click',()=>{start=(start+1)%entries.length;renderSlide();});
      let resizeTimer;
      window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderSlide,120);});
      renderSlide();return;
    }
    let selected='all'; const filter=$('#news-filters');
    const categories=[...new Set(entries.map(item => newsGroup(item.category)))];
    const update = () => {
      if(filter) $$('.filter-button',filter).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===selected)));
      const matches=entries.filter(entry=>selected==='all'||newsGroup(entry.category)===selected);
      setText('#news-count',matches.length+' stor'+(matches.length===1?'y':'ies'));
      target.replaceChildren(...matches.map(item=>{
        const row=node('article','news-item');row.id=item._id;row.dataset.storyTone=newsTone(item.category);
        const date=timeNode(item.date);date.className='news-date';
        const content=node('div','news-content');
        content.append(node('span','news-type',item.category),node('h2','',item.title));
        if(text(item.description))content.append(node('p','news-summary',item.description));
        const button=node('button','news-expand-toggle');button.type='button';
        button.setAttribute('aria-controls','details-'+item._id);button.setAttribute('aria-expanded','false');
        button.setAttribute('aria-label',text(item.title)+' 상세 내용 펼치기');
        button.append(node('span','news-chevron')); 
        const detail=node('div','news-expanded');detail.id='details-'+item._id;detail.hidden=true;
        if (text(item.detailBody)) detail.append(node('p','news-detail-body',item.detailBody));
        if (!detail.childNodes.length)detail.append(node('p','news-detail-empty','추가 상세 내용을 준비 중입니다.'));
        const setExpanded=open=>{
          detail.hidden=!open;button.setAttribute('aria-expanded',String(open));
          button.setAttribute('aria-label',text(item.title)+(open?' 상세 내용 접기':' 상세 내용 펼치기'));
        };
        button.addEventListener('click',()=>setExpanded(detail.hidden));
        // If the cover photo was the only expanded content, omit the empty toggle.
        // Text-only news retain their existing expand/collapse behavior.
        if (text(item.detailBody) || !normalPath(item.detailImage)) content.append(button,detail);
        if (normalPath(item.detailImage)) {
          const media=node('div','news-main-media');
          setImage(media,item.detailImage,text(item.detailCaption,item.title),()=>imageFallback('사진 불러오기 실패'));
          row.classList.add('has-image');
          row.append(date,media,content);
        } else {
          row.append(date,content);
        }
        applyEntryTypography(row,item);
        if(location.hash==='#'+item._id)setExpanded(true);
        return row;
      }));
    };
    if (filter)filter.replaceChildren(makeFilter('All','all',true,value=>{selected=value;update();}),
      ...categories.map(category=>makeFilter(category,category,false,value=>{selected=value;update();})));
    const handleHash=()=>{
      if (!/^#news-\d+$/.test(location.hash))return;
      selected='all';update();scrollToHash('news');
    };
    update();window.addEventListener('hashchange',handleHash);handleHash();
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
      if (text(photo.description)) card.append(node('p', 'gallery-description', photo.description)); return applyEntryTypography(card,photo);
    }));
  }

  function initSubmenus() {
    const groups=$$('.nav-group.has-submenu');
    const close=()=>groups.forEach(group=>{
      group.classList.remove('submenu-open');
      const button=$('.submenu-touch-toggle',group);
      if(button) button.setAttribute('aria-expanded','false');
    });
    for(const group of groups) {
      const name=group.dataset.group;
      const parent=$('.nav-parent',group),anchor=$('.nav-parent > a',group);
      if(!parent||!anchor)continue;
      // A true link: Research -> overview, People -> Professor on click.
      // A separate button permits keyboard/touch access to submenus on small screens.
      const button=node('button','submenu-touch-toggle','⌄');button.type='button';
      button.setAttribute('aria-label',name==='research'?'연구 분야 하위 메뉴 열기':'구성원 하위 메뉴 열기');
      button.setAttribute('aria-controls',name+'-submenu');
      button.setAttribute('aria-expanded','false');parent.append(button);
      button.addEventListener('click',event=>{
        event.stopPropagation();const state=!group.classList.contains('submenu-open');
        close();group.classList.toggle('submenu-open',state);
        button.setAttribute('aria-expanded',String(state));
      });
      anchor.addEventListener('keydown',event=>{
        if(event.key==='ArrowDown'){
          event.preventDefault();group.classList.add('submenu-open');
          button.setAttribute('aria-expanded','true');
          $('.submenu-panel a',group)?.focus();
        }
      });
      const desktopHover=()=>window.matchMedia('(hover:hover) and (min-width:1051px)').matches;
      const showDropdown=visible=>{
        if(!desktopHover())return;
        const panel=$('.submenu-panel',group);if(!panel)return;
        for(const key of ['visibility','opacity','pointer-events','transform'])panel.style.removeProperty(key);
        if(visible){
          panel.style.setProperty('visibility','visible','important');
          panel.style.setProperty('opacity','1','important');
          panel.style.setProperty('pointer-events','auto','important');
          panel.style.setProperty('transform','translateY(0)','important');
        }
      };
      group.addEventListener('mouseenter',()=>showDropdown(true));
      group.addEventListener('focusin',()=>showDropdown(true));
      group.addEventListener('mouseleave',()=>{
        showDropdown(false);
        if(desktopHover())group.classList.remove('submenu-open');
      });
      group.addEventListener('focusout',event=>{
        if(!group.contains(event.relatedTarget))showDropdown(false);
      });
    }
    document.addEventListener('click',event=>{if(!event.target.closest('.nav-group'))close();});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        const focus=$('.nav-group.submenu-open .submenu-touch-toggle');close();
        if(focus)focus.focus();
      }
    });
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
    window.matchMedia('(min-width: 1051px)').addEventListener('change', event => { if (event.matches) setOpen(false); });
  }
  if (document.body.dataset.page === 'home') {
    const hero = $('#hero-image');
    if (hero) { hero.replaceChildren(node('div','acsol-image-pending')); hero.classList.remove('is-concept'); }
  }
  initMenu();initSubmenus(); setText('#copyright-year', new Date().getFullYear());
  const page = document.body.dataset.page, jobs = [];
  jobs.push(run(null, () => applyProfessor(page)));
  jobs.push(run(null, applyContactConfig));
  jobs.push(run(null, hydrateResearchMenu));
  jobs.push(run(null, applyTypography));
  jobs.push(run(null, () => applyPageCopy(page)));
  if (page === 'home') jobs.push(run(null, applyHome), run('#home-news-list', () => renderNews(page)), run(null,showTimedBanner));
  if (page === 'research') jobs.push(run('#research-overview', renderResearchOverview));
  if (page === 'research-detail') jobs.push(run('#research-detail-content', renderResearchDetail));
  if (page === 'professor') jobs.push(
    run('#professor-employment-list', () => renderHistory('professor-employment', '#professor-employment-list', 'period', 'position')),
    run('#professor-awards-list', () => renderHistory('professor-awards', '#professor-awards-list', 'date', 'award'))
  );
  if (page === 'students') jobs.push(run('#student-teams', renderStudents));
  if (page === 'alumni') jobs.push(run('#alumni-list', renderAlumni));
  if (page === 'equipment') jobs.push(run('#equipment-list', renderEquipment));
  if (page === 'publications') jobs.push(run('#publication-list', renderPublications));
  if (page === 'news') jobs.push(run('#news-list', () => renderNews(page)));
  if (page === 'gallery') jobs.push(run('#gallery-list', renderGallery));
  Promise.allSettled(jobs).then(() => { document.body.dataset.ready = 'true'; });
})();
