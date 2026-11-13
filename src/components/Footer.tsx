'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Shield,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Instagram,
  ArrowUpRight,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react';
import { PageId } from '../types';
import CompanyLogo from './CompanyLogo';

const PHONE = '+375 29 638-00-53';
const PHONE_LINK = PHONE.replace(/[^\d+]/g, '');

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

interface FooterProps {
  handleAddLead: (
    name: string,
    phone: string,
    extra: string,
    source: string
  ) => void;
  pageId?: string;
}

const FORM_TEXTS: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: 'Хотите продать выгодно?',
    subtitle: 'Оставьте заявку — перезвоним в течение 10 минут и бесплатно оценим вашу недвижимость.',
  },
  catalog: {
    title: 'Не нашли подходящий объект?',
    subtitle: 'Подберём вариант из закрытой базы за 30 минут.',
  },
  'vybrat-agenta': {
    title: 'Нужна помощь в выборе риэлтера?',
    subtitle: 'Подберём специалиста под вашу задачу.',
  },
  'prodazha-kvartiry': {
    title: 'Хотите продать квартиру выгодно?',
    subtitle: 'Бесплатная оценка и консультация аттестованного риэлтера.',
  },
  'prodazha-doma-dachi': {
    title: 'Продадим ваш дом или дачу',
    subtitle: 'Профессиональная оценка загородной недвижимости за 1 день.',
  },
  'prodazha-pomescheniya': {
    title: 'Продайте коммерческое помещение',
    subtitle: 'Оценка и поиск покупателей.',
  },
  'arenda-nedvizhimosti': {
    title: 'Сдать или снять недвижимость?',
    subtitle: 'Офисы, склады, помещения — подберём вариант.',
  },
  'obmen-nedvizhimosti': {
    title: 'Хотите обменять недвижимость?',
    subtitle: 'Подберём оптимальную схему обмена без рисков.',
  },
  'ocenka-kvartiry': {
    title: 'Узнайте стоимость квартиры',
    subtitle: 'Бесплатная оценка по базе реальных сделок.',
  },
  kontakty: {
    title: 'Свяжитесь с нами',
    subtitle: 'Оставьте заявку — перезвоним в течение 10 минут.',
  },
};

const SOCIALS = [
  { icon: Send, href: 'https://t.me/fattoriaby', label: 'Telegram' },
  { icon: MessageCircle, href: `viber://chat?number=${PHONE_LINK}`, label: 'Viber' },
  { icon: Instagram, href: 'https://instagram.com/fattoria.by', label: 'Instagram' },
];

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Продажа квартиры', href: '/prodazha-kvartiry' },
  { label: 'Дома и участки', href: '/prodazha-doma-dachi' },
  { label: 'Коммерческая', href: '/prodazha-pomescheniya' },
  { label: 'Оценка', href: '/ocenka-kvartiry' },
  { label: 'Районы Минска', href: '/#catalog-root' },
  { label: 'База знаний & Статьи', href: '/novosti-nedvizhimosti' },
  { label: 'Наша команда', href: '/nasha-komanda' },
  { label: 'Отзывы', href: '/otzyvy-klientov' },
  { label: 'О нас', href: '/ob-agentstve' },
  { label: 'Контакты', href: '/kontakty' },
];

export default function Footer({ handleAddLead, pageId: propPageId }: FooterProps) {
  const pathname = usePathname();
  
  // Determine pageId for form texts if not provided
  const getPageIdFromPath = (path: string): string => {
    if (path === '/') return 'home';
    const clean = path.replace(/^\//, '');
    return clean || 'home';
  };

  const effectivePageId = propPageId || getPageIdFromPath(pathname);
  const formText = FORM_TEXTS[effectivePageId] || FORM_TEXTS.home;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || '';
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value || '';
    if (!phone.trim()) return;
    handleAddLead(name.trim(), phone.trim(), formText.title, 'Футер');
    form.reset();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full overflow-hidden text-white">
      {/* ФОТО НА ВЕСЬ ФУТЕР */}
      <div className="absolute inset-0 z-0">
        <img
          src="/photo/futer.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
        {/* Лёгкое затемнение для читаемости текста */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Градиент снизу для плавного перехода */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Top line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent" />

        {/* CTA Form */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 lg:pt-20 pb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#8B5CF6]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#DDD6FE]">
                АН Фаттория
              </span>
            </div>

            <h2
              className="text-white leading-tight"
              style={{ 
                fontFamily: displayFont, 
                fontWeight: 400, 
                fontSize: 'clamp(28px, 4vw, 42px)',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              {formText.title}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {formText.subtitle}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col sm:flex-row gap-3 w-full">
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                autoComplete="name"
                className="flex-1 px-4 py-3 bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#8B5CF6] text-sm rounded-xl transition-all"
              />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Номер телефона *"
                autoComplete="tel"
                className="flex-1 px-4 py-3 bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#8B5CF6] text-sm rounded-xl transition-all"
              />
              <button
                type="submit"
                className="px-7 py-3 bg-[#8B5CF6] text-white font-semibold rounded-xl text-sm transition-all hover:bg-[#7C4DE8] whitespace-nowrap shadow-lg"
              >
                Получить консультацию
              </button>
            </form>

            <div className="flex items-center gap-2 mt-4 text-[11px] text-white/60">
              <Shield className="w-3.5 h-3.5" />
              Мы бережно относимся к вашим данным
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 border-t border-white/15">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {/* Brand & Contacts */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CompanyLogo className="w-9 h-9 shrink-0" variant="purple" />
                <div>
                  <div className="text-2xl font-bold tracking-wide" style={{ fontFamily: displayFont, fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    АН Фаттория
                  </div>
                  <p className="text-[11px] text-white/60">Недвижимость. Сделки. Результат.</p>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <a href={`tel:${PHONE_LINK}`} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-[#8B5CF6]/30 transition-all">
                    <Phone className="w-4 h-4 text-[#DDD6FE]" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-[#DDD6FE] transition-colors">{PHONE}</span>
                </a>

                <div className="flex items-start gap-3 text-xs text-white/70 leading-relaxed">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#8B5CF6]" />
                  <span>г. Минск, ул. Репина, д. 4, пом. 458</span>
                </div>

                <a href="mailto:fattoria1900088@gmail.com" className="flex items-center gap-3 text-xs text-white/70 hover:text-[#DDD6FE] transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                  fattoria1900088@gmail.com
                </a>
              </div>

              {/* Socials */}
              <div className="flex gap-2 pt-2">
                {SOCIALS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-[#8B5CF6]/30 transition-all"
                    >
                      <Icon className="w-4 h-4 text-white/70" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-2">
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Навигация</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-1 text-left text-xs text-white/70 hover:text-[#DDD6FE] transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="space-y-4">
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Гарантии</h4>
              <div className="space-y-3">
                {[
                  'Аттестованные риэлтеры',
                  'Лицензия №02240/446',
                  'Страховка Белгосстрах',
                  'Гос. тарифы П№754',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Shield className="w-8 h-8 text-[#8B5CF6]/50" />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom bar */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-6">
          <div className="pt-5 border-t border-white/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-white/60">
              <span>© {new Date().getFullYear()} ООО «АН Фаттория». Лицензия №02240/446 от 11.07.2022г. УНП 193625457.</span>
              <span className="hidden sm:inline text-white/30">|</span>
              <div className="flex items-center gap-3">
                <Link
                  href="/privacy-policy"
                  className="hover:text-[#DDD6FE] transition-colors underline underline-offset-2"
                >
                  Политика конфиденциальности
                </Link>
                <span className="text-white/30">|</span>
                <Link
                  href="/cookies-policy"
                  className="hover:text-[#DDD6FE] transition-colors underline underline-offset-2"
                >
                  Файлы cookie
                </Link>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/50 hover:text-[#DDD6FE] transition-colors self-start md:self-auto"
            >
              Наверх
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-[#8B5CF6]/30 transition-all">
                <ChevronUp className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </section>
      </div>
    </footer>
  );
}
