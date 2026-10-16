from pathlib import Path
import argparse, re, sys

JS_OLD_START = "  const setImage = (target, value, alt, fallbackFactory, options = {}) => {"
JS_OLD_END = "  const jsonCache = new Map();"
CSS_MARKER = '/* ACSoL v16.1: image loading optimization */'
JS_MARKER = '/* ACSoL v16.1: image loading optimization */'

SET_IMAGE = '''  /* ACSoL v16.1: image loading optimization */
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
'''

CSS_BLOCK = '''\n/* ACSoL v16.1: image loading optimization */
.acsol-image-pending {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: linear-gradient(100deg, #eef2f6 20%, #e1eaf2 42%, #eef2f6 64%);
  background-size: 200% 100%;
  animation: acsol-image-shimmer 1.5s ease-in-out infinite;
}
@keyframes acsol-image-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .acsol-image-pending { animation: none; }
}
'''

def patch(src: Path, apply: bool):
    site_path=src/'site.js'; css_path=src/'styles.css'
    if not site_path.is_file() or not css_path.is_file():
        raise RuntimeError('site.js/styles.css files must be present in repo root')
    js=site_path.read_text(encoding='utf-8'); css=css_path.read_text(encoding='utf-8')
    if JS_MARKER in js:
        print('Already patched: site.js'); return []
    a=js.find(JS_OLD_START);b=js.find(JS_OLD_END,a+1)
    if a < 0 or b < 0: raise RuntimeError('setImage() block changed; refusing to overwrite. Please share current site.js.')
    js = js[:a] + SET_IMAGE + js[b:]

    # Start CMS Home and Gallery requests together (but keep no-store cache semantics).
    home_start=js.find('  async function applyHome() {')
    home_end=js.find('  async function showTimedBanner() {',home_start)
    if home_start < 0 or home_end < 0: raise RuntimeError('Could not locate applyHome boundaries.')
    home=js[home_start:home_end]
    old_cfg="    const cfg = await readSettings('home');"
    old_gal="    const gallery = await getJSON('gallery');"
    if old_cfg not in home or old_gal not in home: raise RuntimeError('applyHome has changed; no unsafe replacement attempted.')
    home=home.replace(old_cfg, "    const galleryPromise = getJSON('gallery');\n"+old_cfg,1)
    home=home.replace(old_gal, "    const gallery = await galleryPromise;",1)

    # Cache just the next image after the current slide finishes loading.
    slide_marker="    let current = 0, timer = null;"
    if slide_marker not in home: raise RuntimeError('Home slideshow signature changed; stopping safely.')
    home=home.replace(slide_marker, '''    const nextPreloaded = new Map();
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
'''+slide_marker,1)
    old_set="        () => imageFallback('사진을 불러올 수 없습니다.'), {eager:true});"
    if old_set not in home: raise RuntimeError('Home photo call changed; stopping safely.')
    home=home.replace(old_set,"        () => imageFallback('사진을 불러올 수 없습니다.'), {eager:true, onLoad:prepareNext});",1)
    js=js[:home_start]+home+js[home_end:]

    # For actual homepage start with a neutral placeholder, not stock art.
    marker="  initMenu();initSubmenus();"
    if marker not in js: raise RuntimeError('Cannot locate website initializer.')
    js=js.replace(marker, '''  if (document.body.dataset.page === 'home') {
    const hero = $('#hero-image');
    if (hero) { hero.replaceChildren(node('div','acsol-image-pending')); hero.classList.remove('is-concept'); }
  }
'''+marker,1)
    if CSS_MARKER not in css: css += CSS_BLOCK
    paths = ['site.js','styles.css']
    print('Will update: '+', '.join(paths))
    print('• Keep CMS JSON and all media unchanged')
    print('• Neutral placeholder, prioritized hero/professor images, offscreen lazy loading')
    print('• Next Home slideshow photo preloaded after previous is ready')
    if apply:
        site_path.write_text(js,encoding='utf-8')
        css_path.write_text(css,encoding='utf-8')
        print('Applied successfully')
    else: print('PLAN ONLY — no files modified')
    return paths

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--mode',choices=['plan','apply'],default='plan');p.add_argument('--root',type=Path,default=Path('.'))
    args=p.parse_args()
    try: patch(args.root,args.mode=='apply')
    except Exception as e:
        print('Error:',e,file=sys.stderr);sys.exit(1)
