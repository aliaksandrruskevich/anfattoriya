"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const paper = '#F6F3EC';

export default function FAQAccordion({ 
  items, 
  title = "Часто задаваемые вопросы клиентов", 
  subtitle = "Актуальные ответы аттестованных риэлтеров и юристов «АН Фаттория»",
  className = "", 
  variant = 'light' 
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <section className={`py-12 ${className}`} aria-label="FAQ Accordion">
      <div className="w-full space-y-6">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px" style={{ backgroundColor: brass }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-700">
              База знаний и ответы экспертов
            </span>
          </div>

          <h3 
            className={`text-2xl md:text-3xl font-normal leading-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {title}
          </h3>

          {subtitle && (
            <p className={`text-xs md:text-sm font-light leading-relaxed max-w-2xl ${isDark ? 'text-white/60' : 'text-stone-500'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5 pt-2">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                  isDark 
                    ? `bg-white/[0.03] border-white/10 hover:border-purple-500/40` 
                    : isOpen 
                      ? `bg-white shadow-sm border-purple-300` 
                      : `bg-stone-50/70 border-stone-200/80 hover:bg-white hover:border-stone-300`
                }`}
                itemScope 
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <span 
                    className={`text-sm md:text-base font-bold transition-colors leading-snug ${
                      isOpen 
                        ? (isDark ? 'text-purple-300' : 'text-purple-900') 
                        : (isDark ? 'text-white/90' : 'text-neutral-900')
                    }`} 
                    itemProp="name"
                  >
                    {item.question}
                  </span>
                  
                  <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen 
                        ? 'bg-purple-500 text-neutral-950 rotate-180 shadow-xs' 
                        : (isDark ? 'bg-white/10 text-white/60' : 'bg-stone-100 text-stone-500')
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div 
                        className={`px-5 pb-6 md:px-6 md:pb-6 text-xs md:text-sm leading-relaxed border-t pt-4 font-light ${
                          isDark 
                            ? 'text-stone-300 border-white/10' 
                            : 'text-stone-600 border-stone-100'
                        }`}
                        itemScope 
                        itemType="https://schema.org/Answer"
                        itemProp="acceptedAnswer"
                      >
                        <div itemProp="text">
                          {item.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Structured Data JSON-LD for Google / Yandex SEO */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": items.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }} />

      </div>
    </section>
  );
}
