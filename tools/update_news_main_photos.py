#!/usr/bin/env python3
"""Update ACSoL News covers in place without replacing unrelated v16.1 changes.

The existing News CMS field `detailImage` is used as the cover in both News and Home.
Supports list-shaped JSON and {items:[...]} via existing ACSoL getJSON implementation.
"""
import argparse
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
VERSION = "16.1-news-covers-20261016"


def must_replace(text, old, new, name):
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f"{name}: expected 1 match; found {n}. Repository has a different version. No files were modified.")
    return text.replace(old, new, 1)


def patch_js(original):
    # Work exclusively inside the one News rendering function.
    marker_start = '  async function renderNews(page) {'
    marker_end = '  async function renderGallery() {'
    if marker_start not in original or marker_end not in original:
        raise RuntimeError('site.js: cannot locate the News renderer; nothing modified')
    head, rest = original.split(marker_start, 1)
    current, tail = rest.split(marker_end, 1)
    if 'ACSoL-News-Main-Photo-v1' in current:
        return original

    old_home = """        card.append(meta,node('h3','',item.title),node('p','',item.description));applyEntryTypography(card,item);"""
    new_home = """        // ACSoL-News-Main-Photo-v1: existing detailImage becomes the public cover photo.
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
        applyEntryTypography(card,item);"""
    current = must_replace(current, old_home, new_home, 'Home news layout')

    old_link = """        link.setAttribute('aria-label',text(item.title)+' — 소식 보기');link.append(arrow());card.append(link);return card;"""
    new_link = """        link.setAttribute('aria-label',text(item.title)+' — 소식 보기');link.append(arrow());
        const contentHost=card.querySelector('.home-news-copy');
        (contentHost||card).append(link);return card;"""
    current = must_replace(current, old_link, new_link, 'Home story link')

    old_detail = """        if (normalPath(item.detailImage)) {
          const fig=node('figure','news-detail-figure'), pic=node('div');
          setImage(pic,item.detailImage,text(item.detailCaption,item.title),()=>imageFallback('이미지 등록 예정'));
          fig.append(pic);
          if (text(item.detailCaption))fig.append(node('figcaption','',item.detailCaption));
          detail.append(fig);
        }
"""
    current = must_replace(current,old_detail,'', 'expanded detail image')

    old_row = """        content.append(button,detail);row.append(date,content);applyEntryTypography(row,item);"""
    new_row = """        // If the cover photo was the only expanded content, omit the empty toggle.
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
        applyEntryTypography(row,item);"""
    current = must_replace(current, old_row, new_row, 'News listing image')
    return head + marker_start + current + marker_end + tail


def patch_cms(original):
    # Rename labels, preserve original JSON key, media upload configuration and all other settings.
    old = 'label: 상세 내용 사진 (선택)'
    if old in original:
        original = original.replace(old,'label: 뉴스 대표 사진 (Home·News 목록에 표시, 선택)',1)
    elif 'label: 뉴스 대표 사진 (Home·News 목록에 표시, 선택)' not in original:
        print('WARN: CMS detailImage label not found; left CMS unchanged',file=sys.stderr)
    old2='label: 상세 사진 설명 (선택)'
    if old2 in original:
        original = original.replace(old2,'label: 대표 사진 설명 (선택)',1)
    return original


def patch_html(original):
    if 'news-main-images.css' not in original:
        found=re.search(r'<link\b(?=[^>]*\bhref=["\']styles\.css[^"\']*["\'])[^>]*>', original)
        if not found:
            raise RuntimeError('HTML: styles.css link missing; nothing modified')
        original=original[:found.end()] + '<link href="news-main-images.css?v='+VERSION+'" rel="stylesheet"/>' + original[found.end():]
    # Change script query only on affected pages to avoid stale cached JavaScript.
    pat=r'(<script\b[^>]*\bsrc=["\']site\.js)(?:\?[^"\']*)?(["\'])'
    original,count=re.subn(pat,lambda m: m.group(1)+'?v='+VERSION+m.group(2),original,count=1)
    if count != 1:
        raise RuntimeError('HTML: site.js script include missing; nothing modified')
    return original


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--mode',choices=('plan','apply'),default='plan')
    args=ap.parse_args()
    css_path=BASE/'news-main-images.css'
    if not css_path.is_file():
        raise RuntimeError('news-main-images.css is missing; upload it with this updater')
    changes={}
    for filename,fn in [('site.js',patch_js),('.pages.yml',patch_cms),('index.html',patch_html),('news.html',patch_html)]:
        f=BASE/filename
        if not f.is_file():raise RuntimeError(f'{filename} missing; nothing modified')
        before=f.read_text(encoding='utf-8')
        after=fn(before)
        if before!=after:changes[f]=after
    print('News image patch mode:',args.mode)
    print('Will edit:', ', '.join(f.name for f in changes) or 'nothing; patch already applied')
    print('Will NOT touch data/*.json, media/, Students, Gallery, other page templates')
    if args.mode == 'apply':
        # all files verified / transformed before any writes
        for f,contents in changes.items(): f.write_text(contents,encoding='utf-8')
        print('Patch applied')
    else:
        print('Dry run; no files changed')

if __name__=='__main__':main()
