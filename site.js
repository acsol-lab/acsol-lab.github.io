/* ACSoL: CMS JSON renderer, zero build tools required, suitable for GitHub Pages.
   The public website is read-only; admin authentication lives in Pages CMS. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  };
  const add = (parent, ...children) => { parent.append(...children); return parent; };
  const copyText = (selector, value) => { const target = $(selector); if (target && value !== undefined && value !== null) target.textContent = String(value); };
  const setLink = (selector, href, value) => {
    const a = $(selector);
    if (!a) return;
    if (value !== undefined) a.textContent = value || '';
    if (href) a.href = href; else a.removeAttribute('href');
  };
  const escapePath = (s) => s.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const mediaUrl = (input) => {
    if (typeof input !== 'string') return '';
    const trimmed = input.trim();
    // Only files hosted by this GitHub Pages site. No external Wix image links.
    const relative = trimmed.startsWith('/media/') ? trimmed.slice(1) : trimmed;
    if (!relative.startsWith('media/') || relative.includes('..') || relative.includes('\\') || /[?#]/.test(relative)) return '';
    return new URL(escapePath(relative), new URL('./', document.baseURI)).href;
  };
  const placeholder = (label = '사진을 Pages CMS에서 추가하세요') => {
    const block = node('div', 'photo-placeholder');
    const icon = node('span', null, '▧');
    icon.style.fontSize = '2.5rem';
    icon.setAttribute('aria-hidden', 'true');
    block.append(icon, node('span', null, label));
    return block;
  };
  const setImage = (target, value, alt, placeholderText) => {
    if (!target) return;
    target.replaceChildren();
    const url = mediaUrl(value);
    if (!url) { target.append(placeholder(placeholderText)); return; }
    const img = node('img');
    img.alt = alt || '';
    img.loading = 'lazy';
    img.addEventListener('error', () => target.replaceChildren(placeholder('사진 경로를 확인해 주세요')), {once:true});
    img.src = url;
    target.append(img);
  };
  const getJSON = async (filename, isList = true) => {
    const url = new URL('data/' + filename + '.json', new URL('./', document.baseURI));
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, {cache:'no-store', signal: controller.signal});
      if (!response.ok) throw new Error(url.pathname + ' HTTP ' + response.status);
      const result = await response.json();
      if (isList && !Array.isArray(result)) throw new Error(filename + ': JSON 배열 형식이 아닙니다.');
      if (!isList && (Array.isArray(result) || !result || typeof result !== 'object')) throw new Error(filename + ': JSON 객체 형식이 아닙니다.');
      return result;
    } finally { window.clearTimeout(timer); }
  };
  const textOr = (value, fallback='') => String(value ?? fallback).trim() || fallback;
  const empty = (message) => node('div','empty-note',message);
  const formatDate = (date) => textOr(date).replace(/-/g,'.');

  // Backward compatible with an existing v3 repository.
  // Editing Home and Professor now writes independent files (home.json, professor.json).
  // If either new file is not yet uploaded, the previous data/site.json is still readable.
  const readSettings = async (kind) => {
    try { return await getJSON(kind, false); }
    catch (error) {
      console.warn('ACSoL ' + kind + '.json 파일을 읽지 못해 구버전 site.json을 사용합니다.', error);
      return await getJSON('site', false);
    }
  };
  const applySite = async (page) => {
    if (page === 'home') {
      const cfg = await readSettings('home');
      const title = $('#hero-title');
      if (title) title.replaceChildren(document.createTextNode(textOr(cfg.heroTitle) + ' '), add(node('span'), document.createTextNode(textOr(cfg.heroAccent))));
      copyText('#hero-korean', cfg.heroKorean);
      copyText('#hero-description', cfg.heroDescription);
      copyText('#lab-intro', cfg.labIntro);
      copyText('#hero-caption', cfg.heroImageCaption);
      setImage($('#hero-image'), cfg.heroImage, 'ACSoL 연구실 대표 사진', '대표 사진을 CMS에서 업로드하세요');
      return;
    }
    if (page === 'people' || page === 'contact') {
      const cfg = await readSettings('professor');
      if (page === 'people') {
        copyText('#professor-tagline', cfg.professorTagline);
        copyText('#professor-name', cfg.professorName);
        copyText('#professor-ko', [textOr(cfg.professorKoreanName), textOr(cfg.professorKoreanSuffix,'교수')].filter(Boolean).join(' '));
        copyText('#professor-title',cfg.professorTitle);
        copyText('#professor-department',cfg.professorDepartment);
        copyText('#professor-additional-title',cfg.professorAdditionalTitle);
        copyText('#professor-university',cfg.professorUniversity);
        copyText('#professor-office',cfg.office);
        copyText('#professor-office-label',cfg.professorOfficeLabel);
        copyText('#professor-email-label',cfg.professorEmailLabel);
        copyText('#professor-phone-label',cfg.professorPhoneLabel);
        copyText('#professor-bio',cfg.professorBio);
        setImage($('#professor-photo'),cfg.professorPhoto, textOr(cfg.professorKoreanName)+' 교수 프로필 사진', '교수님 사진');
        const email = textOr(cfg.professorEmail);
        setLink('#professor-email', safeEmail(email), email);
        const phone = textOr(cfg.contactPhone);
        setLink('#professor-phone', phone ? 'tel:'+phone.replace(/[^+\d]/g,'') : '', phone);
      } else {
        copyText('#contact-professor', [textOr(cfg.professorKoreanName),textOr(cfg.professorKoreanSuffix,'교수')].filter(Boolean).join(' ')+' · '+textOr(cfg.professorName));
        const email = textOr(cfg.professorEmail);
        setLink('#contact-email',safeEmail(email),email);
        setLink('#contact-mail-button',safeEmail(email));
        copyText('#contact-office',cfg.office);
        const phone = textOr(cfg.contactPhone);
        setLink('#contact-phone',phone?'tel:'+phone.replace(/[^+\d]/g,''):'',phone);
        const labPhone = textOr(cfg.labPhone);
        setLink('#contact-lab-phone',labPhone?'tel:'+labPhone.replace(/[^+\d]/g,''):'',labPhone);
        copyText('#contact-address',cfg.address);
      }
    }
  };

  // Research cards expand in place. CMS can add any number of detailed text/image blocks.
  const renderResearch = async (page) => {
    const research = await getJSON('research');
    if (page === 'home') {
      const target = $('#home-research-list');
      if (!target) return;
      if (!research.length) {target.replaceChildren(empty('연구 분야가 등록되지 않았습니다.'));return;}
      const cards = research.slice(0,4).map((item,index) => {
        const a = node('a','research-mini'); a.href='research.html#research-' + (index+1);
        a.append(node('span','number',String(index+1).padStart(2,'0')+' / RESEARCH'),node('h3',null,item.title),node('p','mini-desc',item.subtitle||item.description),node('span','mini-arrow','↗'));
        return a;
      });
      target.replaceChildren(...cards);
    }
    if (page === 'research') {
      const target = $('#research-list');
      if (!target) return;
      if (!research.length) {target.replaceChildren(empty('등록된 연구 분야가 없습니다. Pages CMS에서 추가하세요.'));return;}
      const cards = research.map((item,index) => {
        const card = node('article','research-feature');
        card.id = 'research-' + (index + 1);
        const preview = node('div','research-feature-preview');
        preview.setAttribute('role','button');
        preview.setAttribute('tabindex','0');
        preview.setAttribute('aria-expanded','false');
        preview.setAttribute('aria-controls','research-detail-' + (index+1));
        preview.setAttribute('aria-label',textOr(item.title,'연구 분야')+' 상세 내용 펼치기');
        const visual = node('div','research-visual');
        setImage(visual,item.image,item.imageAlt||item.title,'RESEARCH IMAGE');
        const content = node('div','feature-body');
        content.append(node('span','feature-number',String(index+1).padStart(2,'0')+' / RESEARCH'),node('h2',null,item.title),node('p','feature-subtitle',item.subtitle),node('p','feature-desc',item.description),node('p','feature-tags',item.keywords));
        const hint = node('span','research-expand-label');
        hint.append(node('span',null,'자세히 보기'),node('span','research-chevron','⌄'));
        content.append(hint);
        preview.append(visual,content);

        const detail = node('div','research-details');
        detail.id='research-detail-' + (index+1);
        detail.hidden=true;
        const detailInner = node('div','research-details-inner');
        if(textOr(item.detailIntro)) {
          const lead=node('p','research-detail-intro',item.detailIntro);
          detailInner.append(lead);
        }
        const sections=Array.isArray(item.detailSections) ? item.detailSections : [];
        for (const section of sections) {
          if(!section || typeof section !== 'object') continue;
          const hasCopy=Boolean(textOr(section.heading)||textOr(section.body));
          const hasPicture=Boolean(mediaUrl(section.image));
          if(!hasCopy && !hasPicture) continue;
          const block=node('section','research-detail-block');
          if(!hasCopy) block.classList.add('image-only');
          if(!hasPicture) block.classList.add('text-only');
          if(hasCopy) {
            const copy=node('div','research-detail-copy');
            if(textOr(section.heading)) copy.append(node('h3',null,section.heading));
            if(textOr(section.body)) copy.append(node('p',null,section.body));
            block.append(copy);
          }
          if(hasPicture) {
            const figure=node('figure','research-detail-figure');
            setImage(figure,section.image,section.imageAlt||section.heading||item.title,'RESEARCH DETAIL IMAGE');
            if(textOr(section.imageCaption)) figure.append(node('figcaption',null,section.imageCaption));
            block.append(figure);
          }
          detailInner.append(block);
        }
        if(!detailInner.children.length) detailInner.append(empty('상세 연구 내용은 준비 중입니다.'));
        detail.append(detailInner);
        const toggle=() => {
          const willOpen=detail.hidden;
          // Keep the page uncluttered: expand only one research area at a time.
          target.querySelectorAll('.research-feature').forEach(other => {
            if(other===card)return;
            const otherDetail=other.querySelector('.research-details');
            const otherPreview=other.querySelector('.research-feature-preview');
            if(otherDetail) otherDetail.hidden=true;
            if(otherPreview){otherPreview.setAttribute('aria-expanded','false');otherPreview.setAttribute('aria-label',textOr(other.querySelector('h2')?.textContent,'연구 분야')+' 상세 내용 펼치기');}
            other.classList.remove('is-expanded');
            const label=other.querySelector('.research-expand-label > span');
            if(label) label.textContent='자세히 보기';
          });
          detail.hidden=!willOpen;
          preview.setAttribute('aria-expanded',String(willOpen));
          preview.setAttribute('aria-label',textOr(item.title,'연구 분야')+(willOpen?' 상세 내용 접기':' 상세 내용 펼치기'));
          card.classList.toggle('is-expanded',willOpen);
          hint.firstChild.textContent=willOpen?'접기':'자세히 보기';
        };
        preview.addEventListener('click',toggle);
        preview.addEventListener('keydown',e=>{
          if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
        });
        card.append(preview,detail);
        return card;
      });
      target.replaceChildren(...cards);
      // A homepage card can open a particular detailed area via #research-N.
      const match=window.location.hash.match(/^#research-(\d+)$/);
      if(match){
        const targetCard=target.querySelector('#research-'+Number(match[1]));
        const trigger=targetCard?.querySelector('.research-feature-preview');
        if(trigger){trigger.click();targetCard.scrollIntoView({block:'start',behavior:'instant'});}
      }
    }
  };

  // Career and awards are two editable JSON lists in Pages CMS.
  const renderProfessorHistory = async () => {
    const mappings = [
      {file:'professor-employment',target:'#professor-employment-list',date:'period',value:'position',empty:'등록된 경력/직책이 없습니다.'},
      {file:'professor-awards',target:'#professor-awards-list',date:'date',value:'award',empty:'등록된 수상 경력이 없습니다.'}
    ];
    await Promise.all(mappings.map(async ({file,target,date,value,empty:message}) => {
      const host=$(target);
      if (!host) return;
      try {
        const items=await getJSON(file);
        if (!items.length) {host.replaceChildren(empty(message));return;}
        const rows=items.map(item=>{
          const row=node('div','history-row');
          row.append(node('span','history-date',textOr(item[date])),node('p','history-description',textOr(item[value])));
          return row;
        });
        host.replaceChildren(...rows);
      } catch (err) {
        console.error('ACSoL 경력/수상 로딩 실패:', file, err);
        host.replaceChildren(empty(file==='professor-employment' ? '경력 정보를 불러올 수 없습니다. data/professor-employment.json 파일과 GitHub Pages 배포를 확인하세요.' : '수상 정보를 불러올 수 없습니다. data/professor-awards.json 파일과 GitHub Pages 배포를 확인하세요.'));
      }
    }));
  };

  const safeEmail=(email)=>{const value=textOr(email); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'mailto:'+encodeURIComponent(value):'';};
  const renderStudents = async () => {
    const data = await getJSON('students');
    for (const role of ['phd','master']) {
      const target = $('#' + role + '-list');
      if (!target) continue;
      const students = data.filter(item => textOr(item.role).toLowerCase() === role);
      if (!students.length) {target.replaceChildren(empty('등록된 연구원이 없습니다. Pages CMS에서 연구원을 추가하세요.'));continue;}
      const cards = students.map(item => {
        const card = node('article','student-card');
        const pic = node('div','student-photo');
        setImage(pic,item.photo,textOr(item.name)+' 연구원 사진','STUDENT PHOTO');
        const info = node('div','student-info');
        info.append(node('h3',null,item.name));
        if (textOr(item.cohort)) info.append(node('p','cohort',/^\d+$/.test(textOr(item.cohort)) ? textOr(item.cohort)+'기' : item.cohort));
        if (textOr(item.department)) info.append(node('p','student-department',item.department));
        if (textOr(item.research)) {
          const field=node('p','research-field');
          field.append(node('span','student-field-label','Research'),node('span',null,item.research));
          info.append(field);
        }
        const email=textOr(item.email);
        if (email) {
          const a=node('a','student-email',email);
          const href=safeEmail(email);
          if (href) a.href=href; else a.removeAttribute('href');
          info.append(a);
        }
        card.append(pic,info);
        return card;
      });
      target.replaceChildren(...cards);
    }
  };
  const renderAlumni = async () => {
    const target = $('#alumni-list');
    if (!target) return;
    const alumni = await getJSON('alumni');
    if (!alumni.length) {target.replaceChildren(empty('등록된 졸업생이 없습니다. Pages CMS에서 졸업생 정보를 추가하세요.'));return;}
    const cards=alumni.map(alumnus=>{
      const card=node('article','alumni-card');
      const header=node('div','alumni-card-header');
      header.append(node('h3',null,alumnus.name));
      const metadata=[textOr(alumnus.degree),textOr(alumnus.graduationYear)].filter(Boolean);
      if(metadata.length) header.append(node('span','alumni-meta',metadata.join(' / ')));
      card.append(header);
      const details=node('dl','alumni-details');
      const pairs=[['Job',alumnus.company],['Research',alumnus.pastResearch]];
      for(const [label,value] of pairs){
        if (!textOr(value)) continue;
        details.append(node('dt',null,label),node('dd',null,value));
      }
      const email=textOr(alumnus.email);
      if (email) {
        const dt=node('dt',null,'Email'),dd=node('dd');
        const a=node('a',null,email),href=safeEmail(email);
        if(href) a.href=href; else a.removeAttribute('href');
        dd.append(a); details.append(dt,dd);
      }
      if(details.children.length) card.append(details);
      return card;
    });
    target.replaceChildren(...cards);
  };
  // Exact publication date (publishedDate) takes precedence over legacy year.
  // No guessed dates: older year-only entries remain in their year, last in that group.
  const validIsoDate = (value) => {
    const date=textOr(value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const test=new Date(date+'T00:00:00Z');
    return !Number.isNaN(test.getTime()) && test.toISOString().slice(0,10)===date ? date : '';
  };
  const publicationYear=(entry)=> {
    const dated=validIsoDate(entry.publishedDate);
    if(dated) return Number(dated.slice(0,4));
    const legacy=Number(entry.year);
    return Number.isInteger(legacy) && legacy>=1900 && legacy<=2200 ? legacy : null;
  };
  const renderPublications = async () => {
    const target=$('#publication-list'); if(!target) return;
    const raw=await getJSON('publications');
    if(!raw.length) {target.replaceChildren(empty('등록된 논문이 없습니다.'));return;}
    const entries=raw.map((entry,index)=>({...entry,_date:validIsoDate(entry.publishedDate),_year:publicationYear(entry),_index:index}));
    entries.sort((a,b) => (b._year??-1)-(a._year??-1) || b._date.localeCompare(a._date) || a._index-b._index);
    const groups=new Map();
    for(const entry of entries){const key=entry._year===null?'unknown':String(entry._year);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);}
    const yearSections=[];
    for(const [year,items] of groups){
      const section=node('section','publication-year-group');
      const header=node('div','publication-year-header');
      const yearTitle=node('h2',null,year==='unknown'?'연도 미입력':year);
      header.append(yearTitle,node('span','publication-count',`${items.length} publication${items.length===1?'':'s'}`));
      const list=node('div','publication-year-items');
      const cards=items.map(entry=>{
        const row=node('article','publication');
        const date=node('span','pub-date',entry._date ? formatDate(entry._date) : '날짜 미등록');
        if(entry._date){ const time=node('time',null,formatDate(entry._date));time.dateTime=entry._date;date.replaceChildren(time); }
        const content=node('div');
        content.append(node('p','pub-journal',entry.journal),node('h3',null,entry.title),node('p','pub-authors',entry.authors));
        const link=node('a','pub-link','DOI ↗');
        const doi=textOr(entry.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i,'');
        if (doi && !/[\s<>"'\\]/.test(doi) && !doi.includes('://')) {
          link.href='https://doi.org/'+encodeURI(doi);link.rel='noopener noreferrer';link.target='_blank';
        }
        row.append(date,content,link);return row;
      });
      list.append(...cards);section.append(header,list);yearSections.push(section);
    }
    target.replaceChildren(...yearSections);
  };

  const renderNews = async () => {
    const target=$('#news-list');if (!target) return;
    const entries=(await getJSON('news')).sort((a,b)=>textOr(b.date).localeCompare(textOr(a.date)));
    if (!entries.length) {target.replaceChildren(empty('등록된 소식이 없습니다.'));return;}
    const cards=entries.map(item=>{
      const row=node('article','news-item');
      const time=node('time',null,formatDate(item.date));time.dateTime=textOr(item.date);
      const info=node('div');info.append(node('span','news-type',item.category),node('h3',null,item.title),node('p',null,item.description));
      row.append(time,info);return row;
    });target.replaceChildren(...cards);
  };
  const renderGallery = async () => {
    const target=$('#gallery-list');if (!target) return;
    const photos=await getJSON('gallery');
    if (!photos.length) {target.replaceChildren(empty('아직 등록된 사진이 없습니다. Pages CMS에서 연구실 사진을 업로드하세요.'));return;}
    const cards=photos.map(item=>{
      const card=node('figure','gallery-card'), url=mediaUrl(item.image);
      const anchor=node('a');
      if (url) {anchor.href=url;anchor.rel='noopener noreferrer';anchor.target='_blank';}
      const figureImage=node('div');
      setImage(figureImage,item.image,item.description||item.title,'GALLERY PHOTO');
      anchor.append(figureImage);
      const figcaption=node('figcaption');figcaption.append(node('strong',null,item.title),node('span',null,item.date));
      card.append(anchor,figcaption);return card;
    });target.replaceChildren(...cards);
  };

  const initMenu=()=>{
    const btn=$('.menu-button'),menu=$('#main-nav');if(!btn||!menu)return;
    const setOpen=(state)=>{btn.setAttribute('aria-expanded',String(state));btn.setAttribute('aria-label',state?'메뉴 닫기':'메뉴 열기');btn.textContent=state?'닫기 ×':'메뉴 ☰';menu.classList.toggle('is-open',state)};
    btn.addEventListener('click',()=>setOpen(btn.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
    document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))setOpen(false)});
    window.matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)setOpen(false)});
  };
  initMenu();copyText('#copyright-year',new Date().getFullYear());
  const page=document.body.dataset.page;
  const jobs=[];
  if (['home','people','contact'].includes(page)) jobs.push(applySite(page));
  if (['home','research'].includes(page)) jobs.push(renderResearch(page));
  if (page==='people') jobs.push(renderProfessorHistory(),renderStudents(),renderAlumni());
  if (page==='publications') jobs.push(renderPublications());
  if (page==='news') jobs.push(renderNews());
  if (page==='gallery') jobs.push(renderGallery());
  Promise.allSettled(jobs).then(results=>results.forEach(result=>{
    if(result.status==='rejected'){
      console.warn('ACSoL CMS 콘텐츠 불러오기 실패:',result.reason);
      document.querySelectorAll('.loading').forEach(el=>el.replaceWith(empty('데이터를 불러오지 못했습니다. GitHub Pages에서 열었는지, data/ 폴더가 있는지 확인하세요.')));
    }
  }));
})();
