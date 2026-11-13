"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  ArrowRight, Search, ArrowLeft, Clock, Calendar,
  CheckCircle, Bookmark, Share2, Plus, Phone, Info,
} from 'lucide-react';
import { Article, PageId } from '../types';
import { getArticleFullUrl, resolveArticleFromSlug, getArticleUrl } from '../lib/routes';
import { ARTICLE_DISCLAIMER } from '../data';

/* ============================================================
   Премиальная дизайн-система роскошного журнала недвижимости
   ============================================================ */
const brandAccent = '#92400E';
const brandAccentDark = '#78350F';
const brandAccentSoft = '#FEF3C7';
const paper = '#FBF9F5';
const paperCard = '#FFFFFF';
const ink = '#171412';
const inkSoft = '#473F3A';
const inkMuted = '#786F68';
const borderLine = '#E7E2D8';
const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HEADER_SPACE = 'pt-36 sm:pt-40 lg:pt-48';
const STICKY_TOP = 'lg:top-36';

/* ⚠️ БАННЕР — НЕ ТРОГАЕМ */
const HERO_PHOTO = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1920';

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;

/* ============================================================
   ФОТО ДЛЯ КАЖДОЙ СТАТЬИ (все 48, тематические)
   ============================================================ */
const ARTICLE_PHOTOS: Record<string, string> = {
  'art-1': u('photo-1560518883-ce09059eeffa'),
  'art-2': u('photo-1502672260266-1c1ef2d93688'),
  'art-16': u('photo-1600596542815-ffad4c1539a9'),
  'art-3': u('photo-1582407947304-fd86f028f716'),
  'art-4': u('photo-1560448204-e02f11c3d0e2'),
  'art-17': u('photo-1564013799919-ab600027ffc6'),
  'art-5': u('photo-1545324418-cc1a3fa10c00'),
  'art-6': u('photo-1512917774080-9991f1c4c750'),
  'art-18': u('photo-1559526324-4b87b5e36e44'),
  'art-7': u('photo-1600585154340-be6161a56a0c'),
  'art-8': u('photo-1450133064473-71024230f91b'),
  'art-19': u('photo-1522071820081-009f0129c71c'),
  'art-9': u('photo-1486406146926-c627a92ad1ab'),
  'art-10': u('photo-1513694203232-719a280e022f'),
  'art-20': u('photo-1554224155-8d04cb21cd6c'),
  'art-11': u('photo-1518780664697-55e3ad937233'),
  'art-12': u('photo-1556911220-e15b29be8c8f'),
  'art-21': u('photo-1573496359142-b8d87734a5a2'),
  'art-13': u('photo-1460317442991-0ec209397118'),
  'art-14': u('photo-1521791136064-7986c2920216'),
  'art-22': u('photo-1577495508048-b635879837f1'),
  'art-15': u('photo-1500382017468-9049fed747ef'),
  'art-23': u('photo-1551288049-bebda4e38f71'),
  'art-24': u('photo-1589829545856-d10d557cf95f'),
  'art-25': u('photo-1496568816309-51d7c20e3b21'),
  'art-26': u('photo-1477959858617-67f30bc75b82'),
  'art-27': u('photo-1444723121867-7a241cacace9'),
  'art-28': u('photo-1503387762-592deb58ef4e'),
  'art-29': u('photo-1574691250077-03a929faece5'),
  'art-30': u('photo-1558036117-15d82a90b9b1'),
  'art-31': u('photo-1493809842364-78817add7ffb'),
  'art-32': u('photo-1556742049-0a67c5574f73'),
  'art-33': u('photo-1555396273-367ea4eb4db5'),
  'art-34': u('photo-1524813686514-a57563d77d61'),
  'art-35': u('photo-1436491865332-7a61a109cc05'),
  'art-36': u('photo-1600585154526-990dced4db0d'),
  'art-37': u('photo-1600607687939-ce8a6c25118c'),
  'art-38': u('photo-1541888946425-d0fbb186156f'),
  'art-39': u('photo-1581094794329-c8112a89af12'),
  'art-40': u('photo-1522708323590-d24dbb6b0267'),
  'art-41': u('photo-1510798831971-661eb04b3739'),
  'art-42': u('photo-1595526114035-0d45ed16cfbf'),
  'art-43': u('photo-1511895426328-dc8714191300'),
  'art-44': u('photo-1563013544-824ae1b704d3'),
  'art-45': u('photo-1455390582262-044cdead277a'),
  'art-46': u('photo-1519501025264-65ba15a82390'),
  'art-47': u('photo-1593508512255-86ab42a8e620'),
  'art-48': u('photo-1454165804606-c3d57bc86b40'),
};

const photoFor = (a: Article): string => a.photo || a.image || ARTICLE_PHOTOS[a.id] || HERO_PHOTO;

function useFonts() {
  useEffect(() => {
    if (document.getElementById('hp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hp-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);
}

const RANKING: Record<string, number> = {
  'art-1': 1, 'art-3': 2, 'art-2': 3, 'art-14': 4, 'art-4': 5, 'art-30': 6,
  'art-24': 7, 'art-12': 8, 'art-15': 9, 'art-5': 10, 'art-13': 11, 'art-7': 12,
  'art-8': 13, 'art-29': 14, 'art-16': 15, 'art-9': 16, 'art-6': 17, 'art-11': 18,
  'art-10': 19, 'art-20': 20, 'art-23': 21, 'art-28': 22, 'art-22': 23, 'art-18': 24,
  'art-17': 25, 'art-21': 26, 'art-25': 27, 'art-26': 28, 'art-27': 29, 'art-19': 30,
  'art-31': 31, 'art-32': 32, 'art-33': 33, 'art-34': 34, 'art-35': 35, 'art-36': 36,
  'art-37': 37, 'art-38': 38, 'art-39': 39, 'art-40': 40, 'art-41': 41, 'art-42': 42,
  'art-43': 43, 'art-44': 44, 'art-45': 45, 'art-46': 46, 'art-47': 47, 'art-48': 48,
};

const QUICK_TAGS = [
  { label: 'Ипотека', query: 'ипотек' },
  { label: 'Комиссия 1.5% – 6%', query: '1.5' },
  { label: 'Оценка', query: 'оценк' },
  { label: 'Безопасная сделка', query: 'безопасн' },
  { label: 'Хоум-стейджинг', query: 'хоум-стейджинг' },
  { label: 'Юридическая проверка', query: 'проверк' },
  { label: 'Доверенность', query: 'доверенност' },
  { label: 'Земля и дачи', query: 'земл' },
];

const readingMinutes = (text: string) =>
  Math.max(2, Math.round(text.trim().split(/\s+/).length / 190));

const categoryLabel = (c: string, long = false) =>
  c === 'legal' ? 'Законодательство' : long ? 'Практика и советы' : 'Практика';

interface NewsPageProps {
  activePage?: PageId;
  navigateTo?: (pageId: PageId, searchQuery?: string) => void;
  handleAddLead?: (name: string, phone: string, extra: string, source: string) => void;
  articlesList?: Article[];
  selectedArticle?: Article | null;
  onSelectArticle?: (article: Article | null) => void;
}

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

function Cover({
  src, className = '', style, overlay = 'soft', children,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  overlay?: 'soft' | 'hero' | 'none';
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  const overlays = {
    none: 'none',
    soft: 'linear-gradient(180deg, transparent 40%, rgba(10, 10, 10, 0.65) 100%)',
    hero: 'linear-gradient(180deg, rgba(14, 13, 11, 0.35) 0%, rgba(14, 13, 11, 0.48) 45%, rgba(14, 13, 11, 0.82) 100%)',
  };

  return (
    <div className={`relative overflow-hidden bg-stone-900 ${className}`} style={style}>
      {!failed && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: overlays[overlay] }} />
      {children}
    </div>
  );
}

export default function NewsPage({
  activePage = 'novosti-nedvizhimosti',
  navigateTo = () => {},
  handleAddLead = () => {},
  articlesList = [],
  selectedArticle: propsSelectedArticle,
  onSelectArticle,
}: NewsPageProps) {
  useFonts();
  const router = useRouter();

  const [internalSelectedArticle, setInternalSelectedArticle] = useState<Article | null>(() => propsSelectedArticle || null);

  useEffect(() => {
    if (propsSelectedArticle !== undefined) {
      setInternalSelectedArticle(propsSelectedArticle);
    }
  }, [propsSelectedArticle]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !internalSelectedArticle && !propsSelectedArticle) {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (path && path !== 'novosti-nedvizhimosti' && path !== 'stati' && path !== 'articles' && path !== 'zhurnal') {
        const found = resolveArticleFromSlug(path, articlesList);
        if (found) setInternalSelectedArticle(found);
      }
    }
  }, [articlesList, internalSelectedArticle, propsSelectedArticle]);

  const selectedArticle = propsSelectedArticle !== undefined ? (propsSelectedArticle || internalSelectedArticle) : internalSelectedArticle;

  const handleSelectArticle = (art: Article | null) => {
    setInternalSelectedArticle(art);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetUrl = art ? getArticleUrl(art) : '/novosti-nedvizhimosti';
    if (onSelectArticle) onSelectArticle(art);
    else router.push(targetUrl);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'legal' | 'tips'>('all');
  const [sortBy, setSortBy] = useState<'curated' | 'newest' | 'reading-short' | 'reading-deep'>('curated');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [shareCopied, setShareCopied] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    if (selectedArticle) window.scrollTo({ top: 0 });
  }, [selectedArticle?.id]);

  useEffect(() => {
    if (!selectedArticle) { setScrollPercent(0); return; }
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) setScrollPercent(Math.min((window.scrollY / totalHeight) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedArticle]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleShare = () => {
    if (!selectedArticle) return;
    try { navigator.clipboard.writeText(getArticleFullUrl(selectedArticle)); } catch {}
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const filtered = articlesList.filter((art) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.snippet.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    const matchesBookmarks = !showOnlyBookmarks || bookmarkedIds.includes(art.id);
    return matchesSearch && matchesCategory && matchesBookmarks;
  });

  const sorted = (() => {
    const result = [...filtered];
    if (sortBy === 'curated') result.sort((a, b) => (RANKING[a.id] || 99) - (RANKING[b.id] || 99));
    else if (sortBy === 'newest') {
      const parse = (d: string) => { const [dd, m, y] = d.split('.'); return new Date(`${y}-${m}-${dd}`).getTime(); };
      result.sort((a, b) => parse(b.date) - parse(a.date));
    } else if (sortBy === 'reading-short') result.sort((a, b) => a.content.length - b.content.length);
    else if (sortBy === 'reading-deep') result.sort((a, b) => b.content.length - a.content.length);
    return result;
  })();

  const spotlight = sorted.length > 0 && !searchQuery && !showOnlyBookmarks && activeCategory === 'all' ? sorted[0] : null;
  const grid = spotlight ? sorted.slice(1) : sorted;

  const fontStyles: Record<FontSize, string> = {
    sm: 'text-[16px] md:text-[17px] leading-[1.8]',
    base: 'text-[17px] md:text-[19px] leading-[1.85]',
    lg: 'text-[18px] md:text-[20px] leading-[1.85]',
    xl: 'text-[20px] md:text-[22px] leading-[1.8]',
  };

  const getTOC = () => {
    if (!selectedArticle) return [];
    const items: { label: string; id: string }[] = [];
    let idx = 0;
    for (const ln of selectedArticle.content.split('\n')) {
      const t = ln.trim();
      const m = t.match(/^#{2,3}\s+(.*)/);
      if (m) { items.push({ label: m[1].replace(/[*_`#]/g, '').trim(), id: `section-${idx++}` }); continue; }
      const h = t.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      if (h) items.push({ label: h[1].replace(/<[^>]+>/g, '').trim(), id: `section-${idx++}` });
    }
    return items;
  };

  const renderContent = (content: string) => {
    let hIdx = 0;
    return (
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <H id={`section-${hIdx++}`} level={1}>{children}</H>,
            h2: ({ children }) => <H id={`section-${hIdx++}`} level={2}>{children}</H>,
            h3: ({ children }) => <H id={`section-${hIdx++}`} level={3}>{children}</H>,
            h4: ({ children }) => <H level={4}>{children}</H>,
            p: ({ children }) => <p className={`${fontStyles[fontSize]} mb-7`}>{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="my-6 space-y-3 pl-2">{children}</ul>,
            ol: ({ children }) => <ol className="my-6 space-y-3 list-decimal pl-6 marker:text-amber-800 marker:font-semibold">{children}</ol>,
            li: ({ children }) => (
              <li className={`${fontStyles[fontSize]} flex items-start gap-3`}>
                <span className="mt-[11px] w-2 h-2 rounded-full shrink-0 bg-amber-800" aria-hidden />
                <div className="flex-1 min-w-0">{children}</div>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-10 relative pl-7 pr-6 py-6 rounded-2xl bg-amber-50/80 border-l-4 border-amber-700 shadow-sm">
                <div className="italic text-[18px] md:text-[21px] leading-relaxed text-stone-900 m-0" style={{ fontFamily: displayFont }}>
                  {children}
                </div>
              </blockquote>
            ),
            hr: () => (
              <div className="my-12 flex items-center justify-center gap-3">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                <span className="w-2 h-2 rounded-full opacity-60 bg-stone-400" />
                <span className="w-2 h-2 rounded-full opacity-30 bg-stone-400" />
              </div>
            ),
            table: ({ children }) => (
              <div className="my-8 overflow-x-auto rounded-xl border bg-white shadow-sm" style={{ borderColor: borderLine }}>
                <table className="w-full text-left border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-stone-100 border-b border-stone-200">{children}</thead>,
            tbody: ({ children }) => <tbody className="divide-y divide-stone-200">{children}</tbody>,
            tr: ({ children }) => <tr className="transition-colors hover:bg-stone-50">{children}</tr>,
            th: ({ children }) => <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-stone-700">{children}</th>,
            td: ({ children }) => <td className="py-3 px-4 text-[14px] leading-relaxed text-stone-700">{children}</td>,
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 decoration-1 transition-colors text-amber-900 hover:text-amber-700">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="hp-root min-h-screen" style={{ backgroundColor: paper, fontFamily: bodyFont, color: inkSoft }}>
      <style>{`
        .hp-root ::selection { background: #FEF3C7; color: #171412; }
        .article-content p, .article-content li { color: #2D2723; }
        .article-content > p:first-child::first-letter {
          font-family: ${displayFont};
          font-weight: 500;
          float: left;
          font-size: 4.2em;
          line-height: 0.8;
          padding: 0.08em 0.12em 0 0;
          color: ${brandAccent};
        }
        .hp-fade-in { animation: hpFade .35s ease both; }
        @keyframes hpFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .hp-glass { background: rgba(20,18,16,0.55); border: 1px solid rgba(255,255,255,0.22); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>

      {selectedArticle && (
        <div className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none z-50 bg-stone-200">
          <div className="h-full transition-all duration-100 bg-amber-700" style={{ width: `${scrollPercent}%` }} />
        </div>
      )}

      {selectedArticle ? (
        <ArticleView
          article={selectedArticle}
          onBack={() => handleSelectArticle(null)}
          onShare={handleShare}
          shareCopied={shareCopied}
          bookmarked={bookmarkedIds.includes(selectedArticle.id)}
          onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          toc={getTOC()}
          renderContent={renderContent}
          related={articlesList.filter((a) => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 3)}
          onSelect={handleSelectArticle}
          handleAddLead={handleAddLead}
        />
      ) : (
        <div>
          {/* ⚠️ БАННЕР — НЕ ТРОГАЕМ */}
          <Cover src={HERO_PHOTO} overlay="hero">
            <div className={`relative max-w-[1400px] mx-auto px-6 lg:px-10 ${HEADER_SPACE} pb-20 lg:pb-28`}>
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-12 h-px bg-white/70" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/90">
                    Экспертный вестник недвижимости
                  </span>
                </div>

                <h1 className="text-white mb-6" style={{ fontFamily: displayFont, fontWeight: 300, fontSize: 'clamp(36px, 5.5vw, 68px)', lineHeight: 1.08, letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.7)' }}>
                  Журнал «АН Фаттория»:<br />
                  <em className="text-amber-200" style={{ fontStyle: 'italic' }}>Законы, практика</em> и аналитика рынка
                </h1>

                <p className="text-[17px] lg:text-[19px] font-light leading-relaxed max-w-2xl text-white/90 mb-6" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                  Официальное регулирование: риэлтерская комиссия составляет <strong className="font-semibold text-white">от 1.5% до 6%</strong> по новому постановлению. Архивные проверки, сложные альтернативные цепочки, новостройки и практические рекомендации экспертов Минска с 2024 года.
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.25em] text-white/85 mb-8">
                  <span><b className="font-semibold text-white">{articlesList.length || 48}</b> материалов в архиве</span>
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span>Комиссия от 1.5% до 6%</span>
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span>Без налоговых консультаций</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value || '';
                    if (phone) {
                      handleAddLead(name, phone, `Тип: ${type}`, 'Баннер статей');
                      form.reset();
                      alert('Спасибо! Ваш вопрос передан аттестованному риэлтеру.');
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl"
                >
                  <input name="name" type="text" placeholder="Ваше имя" className="hp-glass px-4 py-3.5 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-[14px] rounded-xl" />
                  <input name="phone" type="tel" required placeholder="Номер телефона *" className="hp-glass px-4 py-3.5 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-[14px] rounded-xl" />
                  <select name="type" className="hp-glass px-4 py-3.5 text-white focus:outline-none focus:border-white transition-colors text-[14px] rounded-xl appearance-none bg-stone-900/80">
                    <option value="Комиссия (от 1.5% до 6%)">Комиссия (от 1.5% до 6%)</option>
                    <option value="Оценка">Оценка недвижимости</option>
                    <option value="Проверка">Юридическая проверка</option>
                    <option value="Продажа">Продажа объекта</option>
                    <option value="Покупка">Покупка новостройки</option>
                  </select>
                  <button type="submit" className="px-6 py-3.5 font-semibold text-[14px] rounded-xl bg-white text-stone-900 transition-all hover:bg-stone-100 hover:scale-[1.02] shadow-lg">
                    Задать вопрос
                  </button>
                </form>
              </div>
            </div>
          </Cover>

          <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-14 lg:pt-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b" style={{ borderColor: borderLine }}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                  Все {articlesList.length || 48} публикаций
                </div>
                <h2 className="text-[30px] lg:text-[40px] leading-tight text-stone-900" style={{ fontFamily: displayFont, fontWeight: 400, letterSpacing: '-0.01em' }}>
                  Каталог статей «АН Фаттория»
                </h2>
              </div>

              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по статьям, комиссии, темам..."
                  className="w-full pl-11 pr-10 py-3 bg-white rounded-full border text-[14px] focus:outline-none transition-all focus:border-stone-500 shadow-sm text-stone-900"
                  style={{ borderColor: borderLine }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-6 pb-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] mr-3 text-stone-400">Популярное:</span>
              {QUICK_TAGS.map((t) => (
                <button
                  key={t.query}
                  onClick={() => setSearchQuery(searchQuery === t.query ? '' : t.query)}
                  className={`text-[12px] px-3.5 py-1.5 rounded-full border transition-all ${
                    searchQuery === t.query
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-100 hover:border-stone-400'
                  }`}
                  style={{ borderColor: borderLine }}
                >
                  #{t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 pb-8">
              <div className="flex flex-wrap gap-2">
                <Chip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>Все материалы ({articlesList.length})</Chip>
                <Chip active={activeCategory === 'legal'} onClick={() => setActiveCategory('legal')}>Законодательство</Chip>
                <Chip active={activeCategory === 'tips'} onClick={() => setActiveCategory('tips')}>Практика и советы</Chip>
                {bookmarkedIds.length > 0 && (
                  <Chip active={showOnlyBookmarks} onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}>
                    Закладки ({bookmarkedIds.length})
                  </Chip>
                )}
              </div>

              <div className="flex items-center gap-2 text-[12px] text-stone-500">
                <span>Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border rounded-full px-3 py-1.5 text-stone-900 text-[12px] focus:outline-none shadow-sm cursor-pointer"
                  style={{ borderColor: borderLine }}
                >
                  <option value="curated">Рекомендованные</option>
                  <option value="newest">Сначала новые (с 2024)</option>
                  <option value="reading-short">Короткие (~2-4 мин)</option>
                  <option value="reading-deep">Подробные разборы</option>
                </select>
              </div>
            </div>
          </section>

          {spotlight && (
            <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-4 pb-4">
              <Link
                href={getArticleUrl(spotlight)}
                onClick={(e) => { e.preventDefault(); handleSelectArticle(spotlight); }}
                className="group cursor-pointer rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-2xl block text-left"
                style={{ borderColor: borderLine }}
              >
                <Cover src={photoFor(spotlight)} overlay="hero" className="min-h-[460px] p-8 sm:p-12 lg:p-16 flex flex-col justify-end">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="bg-white/95 text-stone-900 text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full shadow-sm">
                        ★ Главный материал номера
                      </span>
                      <span className="bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-medium uppercase tracking-[0.2em] text-white px-3.5 py-1.5 rounded-full">
                        {categoryLabel(spotlight.category, true)}
                      </span>
                    </div>
                    <h3 className="text-white mb-4 transition-colors group-hover:text-amber-200" style={{ fontFamily: displayFont, fontWeight: 300, fontSize: 'clamp(26px, 3.5vw, 44px)', lineHeight: 1.15, textShadow: '0 4px 16px rgba(0,0,0,0.8)' }}>
                      {spotlight.title}
                    </h3>
                    <p className="text-[15px] lg:text-[17px] font-light leading-relaxed max-w-2xl text-white/90 mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                      {spotlight.snippet}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.2em] text-white/85">
                      <span>{spotlight.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/70" />
                      <span>{readingMinutes(spotlight.content)} мин чтения</span>
                      <span className="w-1 h-1 rounded-full bg-white/70" />
                      <span>{categoryLabel(spotlight.category)}</span>
                      <span className="ml-auto inline-flex items-center gap-2 font-bold text-white transition-transform group-hover:translate-x-1.5">
                        Читать статью <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Cover>
              </Link>
            </section>
          )}

          <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
            {grid.length === 0 && !spotlight ? (
              <div className="py-24 text-center bg-white rounded-3xl border p-8" style={{ borderColor: borderLine }}>
                <p className="text-[15px] mb-6 text-stone-600">По вашему запросу ничего не найдено</p>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setShowOnlyBookmarks(false); }} className="text-[12px] font-medium uppercase tracking-[0.2em] underline text-stone-900">
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {grid.map((art, i) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    index={i + (spotlight ? 2 : 1)}
                    bookmarked={bookmarkedIds.includes(art.id)}
                    onToggleBookmark={(e) => toggleBookmark(art.id, e)}
                    onClick={() => handleSelectArticle(art)}
                    ranking={RANKING[art.id]}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */

function H({ children, id, level }: { children: React.ReactNode; id?: string; level: 1 | 2 | 3 | 4 }) {
  if (level === 4) {
    return (
      <h4 className="mt-10 mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-amber-900">
        {children}
      </h4>
    );
  }
  const sizes = {
    1: 'clamp(28px, 3.5vw, 40px)',
    2: 'clamp(24px, 3vw, 34px)',
    3: 'clamp(20px, 2.5vw, 26px)',
  };
  return (
    <h2 id={id} className="mt-14 mb-6 scroll-mt-36 flex items-start gap-3.5 text-stone-900" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: sizes[level], lineHeight: 1.2, letterSpacing: '-0.01em' }}>
      <span className="mt-[0.55em] h-[3px] w-8 shrink-0 rounded-full bg-amber-800" />
      <span>{children}</span>
    </h2>
  );
}

function Chip({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-all duration-200 border rounded-full hover:-translate-y-0.5 ${small ? 'px-3.5 py-1.5 text-[11px]' : 'px-5 py-2.5 text-[12px]'}`}
      style={active
        ? { backgroundColor: ink, color: '#fff', borderColor: ink }
        : { color: inkSoft, borderColor: borderLine, backgroundColor: '#fff' }}
    >
      {children}
    </button>
  );
}

function ArticleCard({ article, index, bookmarked, onToggleBookmark, onClick, ranking }: {
  article: Article;
  index: number;
  bookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onClick: () => void;
  ranking?: number;
}) {
  const isTop = ranking && ranking <= 5;
  return (
    <Link
      href={getArticleUrl(article)}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="group cursor-pointer flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl block text-left"
      style={{ borderColor: borderLine }}
    >
      <Cover src={photoFor(article)} overlay="soft" className="h-56">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-medium uppercase tracking-[0.2em] text-white px-3 py-1.5 rounded-full">
            {categoryLabel(article.category)}
          </span>
          <button
            onClick={onToggleBookmark}
            className="bg-black/60 backdrop-blur-md border border-white/20 w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
            aria-label="В закладки"
          >
            <Bookmark className="w-3.5 h-3.5" style={bookmarked ? { fill: '#fff', color: '#fff' } : undefined} />
          </button>
        </div>
        <div className="absolute bottom-3 left-5 text-[38px] leading-none font-light text-white/80" style={{ fontFamily: displayFont }}>
          {String(index).padStart(2, '0')}
        </div>
        {isTop && (
          <span className="absolute bottom-4 right-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white px-3 py-1.5 rounded-full bg-stone-900/90 backdrop-blur-sm border border-white/20">
            Рекомендуем
          </span>
        )}
      </Cover>

      <div className="flex flex-col flex-1 p-7">
        <h3 className="mb-3 transition-colors duration-300 group-hover:text-amber-800 text-stone-900" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: '21px', lineHeight: 1.28, letterSpacing: '-0.005em' }}>
          {article.title}
        </h3>
        <p className="text-[14px] leading-relaxed mb-6 flex-1 line-clamp-3 text-stone-600 font-light">
          {article.snippet}
        </p>
        <div className="flex items-center justify-between pt-5 border-t text-[11px] uppercase tracking-[0.15em]" style={{ borderColor: borderLine, color: inkMuted }}>
          <span className="opacity-80">{article.date} · ~{readingMinutes(article.content)} мин</span>
          <span className="inline-flex items-center gap-1.5 font-bold transition-transform group-hover:translate-x-1 text-stone-900">
            Читать <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleView({
  article, onBack, onShare, shareCopied, bookmarked, onToggleBookmark,
  fontSize, setFontSize, toc, renderContent, related, onSelect, handleAddLead,
}: any) {
  const minutes = readingMinutes(article.content);
  const sizes: Record<FontSize, string> = { sm: 'text-[10px]', base: 'text-[12px]', lg: 'text-[14px]', xl: 'text-[16px]' };
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const els = toc.map((t: any) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { rootMargin: '-15% 0px -70% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [article.id, toc.length]);

  return (
    <div className="hp-fade-in">
      <Cover src={photoFor(article)} overlay="hero">
        <div className={`relative max-w-[1400px] mx-auto px-6 lg:px-10 ${HEADER_SPACE} pb-24 lg:pb-32`}>
          <button
            type="button"
            onClick={onBack}
            className="bg-black/60 backdrop-blur-md border border-white/20 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] mb-10 px-5 py-2.5 rounded-full text-white transition-all hover:bg-black/80 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Назад к журналу
          </button>

          <div className="max-w-5xl">
            <span className="bg-black/60 backdrop-blur-md border border-white/20 inline-block text-[10px] font-medium uppercase tracking-[0.3em] text-white px-4 py-2 rounded-full mb-6">
              {categoryLabel(article.category, true)}
            </span>
            <h1 className="text-white mb-6" style={{ fontFamily: displayFont, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 58px)', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              {article.title}
            </h1>

            {/* ⚠️ СНОСКА-ДИСКЛЕЙМЕР (сверху, под заголовком) */}
            <div className="mb-5 inline-flex items-start gap-3 max-w-3xl px-4 py-3 rounded-xl bg-amber-100/15 border border-amber-200/30 backdrop-blur-sm">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-200" aria-hidden />
              <p className="text-[12px] md:text-[13px] leading-relaxed text-white/85 m-0" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {ARTICLE_DISCLAIMER}
              </p>
            </div>

            <p className="text-[17px] lg:text-[20px] font-light leading-relaxed max-w-3xl mb-8 text-white/90" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {article.snippet}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.2em] text-white/85">
              <span className="inline-flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span className="inline-flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {minutes} мин чтения</span>
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span>Комиссия от 1.5% до 6%</span>
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span>Редакция «АН Фаттория»</span>
            </div>
          </div>
        </div>
      </Cover>

      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t" style={{ borderColor: borderLine, boxShadow: '0 -15px 40px rgba(0,0,0,0.06)' }}>
        <div className="max-w-[1520px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_320px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-10">
          <aside className={`lg:sticky ${STICKY_TOP} lg:h-fit lg:row-span-2 xl:row-span-1 space-y-6 order-1`}>
            {toc.length > 0 && (
              <div className="hidden lg:block bg-stone-50/80 p-5 rounded-2xl border" style={{ borderColor: borderLine }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b text-stone-900" style={{ borderColor: borderLine }}>
                  Содержание статьи
                </div>
                <nav className="space-y-1">
                  {toc.map((item: any, i: number) => {
                    const on = activeId === item.id;
                    return (
                      <button
                        key={i}
                        onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900"
                        style={on ? { color: '#171412', background: '#F3EFEA', fontWeight: 600 } : { color: inkSoft }}
                      >
                        <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-amber-800">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-0.5 border rounded-full px-1.5 py-1 bg-white shadow-sm" style={{ borderColor: borderLine }} title="Размер шрифта">
                {(['sm', 'base', 'lg', 'xl'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setFontSize(v)}
                    className={`w-7 h-7 flex items-center justify-center font-semibold rounded-full transition-all ${sizes[v]}`}
                    style={fontSize === v ? { background: ink, color: '#fff' } : { color: inkSoft }}
                    aria-label={`Размер текста: ${v}`}
                  >
                    А
                  </button>
                ))}
              </div>
              <button
                onClick={onToggleBookmark}
                className="w-9 h-9 flex items-center justify-center rounded-full border bg-white shadow-sm transition-all hover:border-stone-500"
                style={{ borderColor: borderLine, color: bookmarked ? brandAccent : inkSoft }}
                aria-label="В закладки"
              >
                <Bookmark className="w-4 h-4" style={bookmarked ? { fill: brandAccent } : undefined} />
              </button>
              <button
                onClick={onShare}
                className="inline-flex items-center gap-2 h-9 px-4 text-[11px] font-medium uppercase tracking-[0.15em] rounded-full border bg-white shadow-sm transition-all hover:border-stone-500 text-stone-900"
                style={{ borderColor: borderLine }}
              >
                <Share2 className="w-3.5 h-3.5" /> {shareCopied ? 'Скопировано' : 'Поделиться'}
              </button>
            </div>
          </aside>

          <article className="order-2 lg:col-start-2 lg:row-start-1 min-w-0 max-w-[860px]">
            {renderContent(article.content)}

            <div className="mt-14 p-8 lg:p-10 rounded-3xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                Бесплатная консультация
              </div>
              <h3 className="text-stone-900 mb-3" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: '28px' }}>
                Остались вопросы по этому материалу?
              </h3>
              <p className="text-[15px] leading-relaxed mb-6 text-stone-600 max-w-xl font-light">
                Аттестованные риэлтеры и юристы «АН Фаттория» проконсультируют вас по всем нюансам. Комиссия строго регламентирована — от 1.5% до 6% в соответствии с нормативным постановлением.
              </p>
              <button
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white rounded-full transition-all bg-stone-900 hover:bg-stone-800 shadow-md"
              >
                <Phone className="w-4 h-4" /> Задать вопрос юристу
              </button>
            </div>
          </article>

          <aside className={`order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky ${STICKY_TOP} xl:h-fit space-y-6`}>
            <div id="lead-form" className="p-7 bg-white rounded-3xl border shadow-sm" style={{ borderColor: borderLine }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] mb-2 text-amber-800">
                Задать вопрос
              </div>
              <h4 className="text-base font-semibold text-stone-900 mb-2">Консультация риэлтера</h4>
              <p className="text-[13px] leading-relaxed mb-5 text-stone-600">
                Оставьте контактный номер — специалист свяжется с вами и разберет вашу ситуацию.
              </p>
              <ArticleLeadForm articleTitle={article.title} handleAddLead={handleAddLead} />
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] mb-2 text-amber-900">
                АН Фаттория
              </div>
              <p className="text-[12px] leading-relaxed text-amber-950">
                Государственная лицензия №02240/446. Страхование профессиональной ответственности. Регулируемая комиссия от 1.5% до 6%.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-24 border-t" style={{ borderColor: borderLine }}>
            <div className="flex items-end justify-between mb-8 pb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                  Продолжить чтение
                </div>
                <h2 style={{ fontFamily: displayFont, fontWeight: 400, fontSize: '30px', color: ink }}>
                  Читайте также
                </h2>
              </div>
              <button onClick={onBack} className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900 hover:text-amber-800">
                Все материалы <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {related.map((art: Article, i: number) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  index={i + 1}
                  bookmarked={false}
                  onToggleBookmark={() => {}}
                  onClick={() => onSelect(art)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ArticleLeadForm({ articleTitle, handleAddLead }: { articleTitle: string; handleAddLead: (name: string, phone: string, extra: string, source: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    handleAddLead(name, phone, `Заявка со статьи: «${articleTitle}»`, `Статья: ${articleTitle}`);
    setSent(true);
    setName(''); setPhone('');
  };

  if (sent) {
    return (
      <div className="text-center py-4 bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <CheckCircle className="w-7 h-7 mx-auto mb-2 text-amber-700" />
        <p className="text-[14px] font-semibold text-stone-900">Заявка отправлена</p>
        <p className="text-[12px] text-stone-600 mt-1">Мы свяжемся с вами в течение 15 минут</p>
        <button onClick={() => setSent(false)} className="text-[11px] underline mt-3 text-amber-800 font-medium">
          Отправить ещё
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        className="w-full px-4 py-3 rounded-xl border text-[14px] focus:outline-none focus:border-stone-500 transition-colors bg-stone-50 text-stone-900"
        style={{ borderColor: borderLine }}
      />
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+375 (__) ___-__-__"
        className="w-full px-4 py-3 rounded-xl border text-[14px] focus:outline-none focus:border-stone-500 transition-colors bg-stone-50 text-stone-900"
        style={{ borderColor: borderLine }}
      />
      <button
        type="submit"
        className="w-full py-3.5 mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white rounded-xl transition-all bg-stone-900 hover:bg-stone-800 shadow-md cursor-pointer"
      >
        Отправить заявку
      </button>
    </form>
  );
}