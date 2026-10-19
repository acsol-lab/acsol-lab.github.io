#!/usr/bin/env python3
"""Patch the existing ACSoL Pages CMS banner in place, preserving unrelated changes.

plan: read/validate only; apply: edits current .pages.yml, site.js and index.html.
Can be applied twice safely. Intentionally does not modify data JSON or other pages.
"""
import argparse
import difflib
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
VERSION = "16.1-banner-sizing-20261019"
JS_MARK = "ACSoL-Banner-Sizing-v1"
CSS_FILE = 'banner-image-sizing.css'
CMS_FIELDS = '''- name: forceImageSize
  label: 이미지 크기 강제 지정
  type: select
  default: 'off'
  options:
    values:
    - name: 'off'
      label: 사용 안함 (원본 비율로 자동)
    - name: 'on'
      label: 사용 (가로·세로 px 직접 지정)
- name: imageWidth
  label: 가로 넓이 (px · 강제 지정일 때 적용)
  description: '예: 948.6 · 0보다 큰 숫자로 입력'
  type: number
- name: imageHeight
  label: 세로 높이 (px · 강제 지정일 때 적용)
  description: '예: 575.2 · 0보다 큰 숫자로 입력'
  type: number
- name: imageFitMode
  label: 사진 맞춤 방식 (강제 지정 시)
  type: select
  default: contain
  options:
    values:
    - name: contain
      label: 전체 표시 · 비율 유지 (권장)
    - name: cover
      label: 박스 채움 · 일부 잘릴 수 있음
    - name: fill
      label: 정확한 픽셀로 맞춤 · 비율 왜곡 가능
'''

HELPER = '''    // ACSoL-Banner-Sizing-v1: editable dimensions, per-banner, without replacing CSS layout.
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
'''


def patch_cms(source: str) -> str:
    if 'name: forceImageSize' in source:
        # Either already patched or someone else added these fields.
        for name in ['imageWidth', 'imageHeight', 'imageFitMode']:
            if 'name: ' + name not in source:
                raise RuntimeError('CMS sizing exists partially; review .pages.yml manually before patching')
        return source
    lines = source.splitlines(keepends=True)
    banner_path_i = next((i for i, line in enumerate(lines)
                         if re.search(r'^\s*path:\s*data/banners\.json\s*$', line)), -1)
    if banner_path_i < 0:
        raise RuntimeError('.pages.yml: could not locate data/banners.json CMS definition')
    # Find the "alt" field in this banner section (not an unrelated form), before next group.
    alt_i = next((i for i in range(banner_path_i + 1, min(len(lines), banner_path_i + 110))
                 if re.match(r'^\s*- name: alt\s*$', lines[i])), -1)
    if alt_i < 0:
        raise RuntimeError('.pages.yml: banner field "alt" missing; refusing unsafe patch')
    indent = len(lines[alt_i]) - len(lines[alt_i].lstrip(' '))
    # Check the next same-level field, allowing nested media upload settings.
    next_i = next((i for i in range(alt_i + 1, len(lines))
                   if re.match(r'^' + ' ' * indent + r'- name:\s*', lines[i])), -1)
    if next_i < 0 or next_i - alt_i > 20 or 'name: startDate' not in lines[next_i]:
        raise RuntimeError('.pages.yml: expected startDate after banner alt; refusing unsafe patch')
    inserted = ''.join(' ' * indent + line + '\n' if line.strip() else '\n'
                       for line in CMS_FIELDS.rstrip('\n').splitlines())
    lines.insert(next_i, inserted)
    return ''.join(lines)


def patch_js(source: str) -> str:
    if JS_MARK in source:
        return source
    start = source.find('  async function showTimedBanner() {')
    if start < 0:
        raise RuntimeError('site.js: showTimedBanner not found')
    end = source.find('\n  async function ', start + 1)
    if end < 0:
        raise RuntimeError('site.js: cannot determine banner function boundary')
    block = source[start:end]
    inject_before = '    const previousFocus=document.activeElement;'
    if block.count(inject_before) != 1:
        raise RuntimeError('site.js: drag/dismiss signature changed; refusing unsafe patch')
    block = block.replace(inject_before, HELPER + inject_before, 1)
    pattern = re.compile(r'^(\s*setImage\(picture,entry\.image,[^\n]+\);\s*)$', re.M)
    matches = list(pattern.finditer(block))
    if len(matches) != 1:
        raise RuntimeError(f'site.js: expected 1 banner image call, found {len(matches)}')
    m = matches[0]
    line = m.group(1).rstrip('\n')
    block = block[:m.start()] + line + '\n      applyBannerSize(entry);' + block[m.end():]
    return source[:start] + block + source[end:]


def patch_html(source: str) -> str:
    if CSS_FILE in source:
        return source
    hit = re.search(r'<link\b(?=[^>]*\bhref=["\']styles\.css[^"\']*["\'])[^>]*>', source, flags=re.I)
    if not hit:
        raise RuntimeError('index.html: styles.css link not found')
    inserted = '<link href="' + CSS_FILE + '?v=' + VERSION + '" rel="stylesheet"/>'
    source = source[:hit.end()] + '\n' + inserted + source[hit.end():]
    # A modified site.js can otherwise remain cached under its previous ?v= URL.
    script = re.compile(r'(<script\b[^>]*\bsrc=["\']site\.js)(?:\?[^"\']*)?(["\'][^>]*>)', re.I)
    source, count = script.subn(lambda m: m.group(1) + '?v=' + VERSION + m.group(2), source)
    if count != 1:
        raise RuntimeError('index.html: expected exactly one site.js script tag for cache busting')
    return source


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--mode', choices=['plan', 'apply'], default='plan')
    p.add_argument('--root', type=Path, default=ROOT)
    args = p.parse_args()
    root = args.root.resolve()
    paths = {
        '.pages.yml': root / '.pages.yml',
        'site.js': root / 'site.js',
        'index.html': root / 'index.html',
    }
    for path in paths.values():
        if not path.is_file():
            raise RuntimeError(f'Missing required file: {path.name}')
    old = {k: v.read_text(encoding='utf-8') for k,v in paths.items()}
    new = {
        '.pages.yml': patch_cms(old['.pages.yml']),
        'site.js': patch_js(old['site.js']),
        'index.html': patch_html(old['index.html']),
    }
    modified = [k for k in paths if new[k] != old[k]]
    print('Mode:', args.mode)
    print('Files to modify:', ', '.join(modified) if modified else '(already up to date)')
    print('Existing data/banners.json and media files: untouched')
    if args.mode == 'plan':
        for name in modified:
            diff = list(difflib.unified_diff(old[name].splitlines(), new[name].splitlines(),
                                             fromfile='before/' + name, tofile='after/' + name,
                                             lineterm=''))
            print('\n'.join(diff[:85]))
            if len(diff) > 85: print(f'... {len(diff)-85} more diff lines')
    else:
        for name in modified:
            paths[name].write_text(new[name], encoding='utf-8')
        print('Applied to current repository; retain backup before execution.')
    return 0

if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print('ERROR:', exc, file=sys.stderr)
        raise SystemExit(1)
