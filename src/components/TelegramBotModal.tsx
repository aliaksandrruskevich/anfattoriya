"use client";
import React, { useState, useEffect } from 'react';
import { Send, Check, X, Bell, ShieldCheck, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Property, Buyer, ColdSeller } from '../types';
import { getNbrbRate } from '../utils/exchangeRate';

interface TelegramBotModalProps {
  propertiesList?: Property[];
  buyersList?: Buyer[];
  sellersList?: ColdSeller[];
  onClose: () => void;
  isOpen?: boolean;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  propertiesList = [],
  buyersList = [],
  sellersList = [],
  onClose,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  const DEFAULT_TOKEN = '';
  const DEFAULT_CHAT_ID = '';
  const DEFAULT_BOT_USER = '@anfattoria_bot';

  const [botToken, setBotToken] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_TOKEN;
    return localStorage.getItem('fp_tg_bot_token') || DEFAULT_TOKEN;
  });
  const [chatId, setChatId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_CHAT_ID;
    return localStorage.getItem('fp_tg_chat_id') || DEFAULT_CHAT_ID;
  });
  const [botUsername, setBotUsername] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_BOT_USER;
    return localStorage.getItem('fp_tg_bot_user') || DEFAULT_BOT_USER;
  });
  const [autoNotifyNewLeads, setAutoNotifyNewLeads] = useState<boolean>(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [selectedPropId, setSelectedPropId] = useState<string>(propertiesList[0]?.id || '');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load current configuration from server
  useEffect(() => {
    fetch('/api/telegram-config')
      .then(res => res.json())
      .then(data => {
        if (data?.botToken && (!botToken || botToken === '')) {
          setBotToken(data.botToken);
        }
        if (data?.chatId && (!chatId || chatId === '')) {
          setChatId(data.chatId);
        }
        if (data?.botUsername) {
          setBotUsername(data.botUsername);
        }
        if (data?.enabled !== undefined) {
          setAutoNotifyNewLeads(data.enabled);
        }
      })
      .catch(err => console.warn('Could not fetch server tg config:', err));
  }, []);

  const saveSettings = async () => {
    localStorage.setItem('fp_tg_bot_token', botToken);
    localStorage.setItem('fp_tg_chat_id', chatId);
    localStorage.setItem('fp_tg_bot_user', botUsername);

    try {
      const res = await fetch('/api/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          botUsername: botUsername.trim(),
          enabled: autoNotifyNewLeads
        })
      });
      const data = await res.json();
      if (data?.success) {
        setStatusMessage('Настройки Telegram успешно сохранены на сервере!');
      }
    } catch (e) {
      console.warn('Config save error:', e);
    }
  };

  const handleSendTestMessage = async () => {
    await saveSettings();
    setTestStatus('sending');
    setStatusMessage('Отправка тестового уведомления...');

    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim()
        })
      });
      const data = await res.json();

      if (data?.success) {
        setTestStatus('success');
        setStatusMessage('✅ Тестовое уведомление успешно отправлено в Telegram!');
      } else {
        setTestStatus('error');
        setStatusMessage(`Ошибка: ${data?.error || 'Проверьте токен бота и Chat ID'}`);
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setStatusMessage('Ошибка связи с сервером при отправке в Telegram.');
    }
  };

  const handleSharePropertyToTelegram = (prop: Property) => {
    const priceBYN = prop.priceBYN || Math.round((prop.priceUSD || 0) * getNbrbRate());
    const text = `🏢 *${prop.title}*\n📍 *Адрес*: ${prop.address}\n💰 *Цена*: ${priceBYN.toLocaleString()} BYN (≈ $${(prop.priceUSD || 0).toLocaleString()})\n📐 *Площадь*: ${prop.area} м²\n\n📞 Колл-центр «АН Фаттория»: +375 29 638-00-53\n💬 Telegram: @anfattoria_bot | Viber: +375296380053\n🌐 Подробнее: https://fplus.by`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://fattoriaminsk')}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const handleSharePropertyToViber = (prop: Property) => {
    const priceBYN = prop.priceBYN || Math.round((prop.priceUSD || 0) * getNbrbRate());
    const text = `🏢 ${prop.title}\n📍 Адрес: ${prop.address}\n💰 Цена: ${priceBYN.toLocaleString()} BYN (≈ $${(prop.priceUSD || 0).toLocaleString()})\n📐 Площадь: ${prop.area} м²\n\n📞 Колл-центр «АН Фаттория»: +375 29 638-00-53\n🌐 https://fplus.by`;

    const viberUrl = `viber://forward?text=${encodeURIComponent(text)}`;
    window.open(viberUrl, '_blank');
  };

  const handleSharePropertyToWhatsApp = (prop: Property) => {
    const priceBYN = prop.priceBYN || Math.round((prop.priceUSD || 0) * getNbrbRate());
    const text = `🏢 *${prop.title}*\n📍 *Адрес*: ${prop.address}\n💰 *Цена*: ${priceBYN.toLocaleString()} BYN (≈ $${(prop.priceUSD || 0).toLocaleString()})\n📐 *Площадь*: ${prop.area} м²\n\n📞 Колл-центр «АН Фаттория»: +375 29 638-00-53\n🌐 https://fplus.by`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Интеграция с Telegram (Уведомления о Заявках)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Мгновенная отправка лидов с сайта и форм в ваш Telegram-чат или канал
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-neutral-300">
          {/* Bot credentials setup */}
          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                1. Настройки Telegram Бота
              </h4>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-bold">
                API Отправки активен
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Telegram Bot Token:
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-sky-500 outline-none"
                  placeholder="Токен от @BotFather (напр. 7123456789:AAF...)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Chat ID / Channel ID:
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-sky-500 outline-none"
                  placeholder="-100123456789 или @channel_name"
                />
              </div>
            </div>

            {/* Quick guide & direct bot link */}
            <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 space-y-2 leading-relaxed">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  Подключение бота агентства:
                </p>
                <a
                  href="https://t.me/anfattoria_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg font-mono font-bold text-[11px] border border-sky-500/30 transition-colors"
                >
                  <span>@anfattoria_bot</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p>1. Откройте диалог с ботом <a href="https://t.me/anfattoria_bot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">@anfattoria_bot</a> и нажмите <b>Start / Запустить</b> (или добавьте в рабочий чат).</p>
              <p>2. Токен бота и ID чата подставляется автоматически уже преднастроены в системе. Нажмите «Тестовая отправка» для проверки связи.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 font-semibold">
                <input
                  type="checkbox"
                  checked={autoNotifyNewLeads}
                  onChange={(e) => setAutoNotifyNewLeads(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
                <span>Автоматически отправлять заявки с сайта в Telegram</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveSettings}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleSendTestMessage}
                  disabled={testStatus === 'sending'}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  {testStatus === 'sending' ? (
                    'Отправка...'
                  ) : testStatus === 'success' ? (
                    <>
                      <Check className="w-4 h-4 text-neutral-950" />
                      Отправлено!
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Тестовая отправка
                    </>
                  )}
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                testStatus === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : testStatus === 'error' 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
              }`}>
                {statusMessage}
              </div>
            )}
          </div>

          {/* Share Property directly to Messenger Client */}
          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
            <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              2. Быстрая отправка карточки объекта клиенту (Telegram / Viber / WhatsApp)
            </h4>

            <div className="space-y-3">
              <select
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-sky-500 outline-none cursor-pointer"
              >
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {(p.priceBYN || 0).toLocaleString()} BYN
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const p = propertiesList.find((item) => item.id === selectedPropId);
                    if (p) handleSharePropertyToTelegram(p);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>В Telegram</span>
                </button>

                <button
                  onClick={() => {
                    const p = propertiesList.find((item) => item.id === selectedPropId);
                    if (p) handleSharePropertyToViber(p);
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>💜 В Viber</span>
                </button>

                <button
                  onClick={() => {
                    const p = propertiesList.find((item) => item.id === selectedPropId);
                    if (p) handleSharePropertyToWhatsApp(p);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>🟢 В WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analytics / Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center space-y-1">
              <div className="text-[10px] text-neutral-400 uppercase font-black">Покупателей в CRM</div>
              <div className="text-lg font-black text-sky-400 font-mono">{buyersList.length}</div>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center space-y-1">
              <div className="text-[10px] text-neutral-400 uppercase font-black">Продавцов в базе</div>
              <div className="text-lg font-black text-purple-400 font-mono">{sellersList.length}</div>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-center space-y-1">
              <div className="text-[10px] text-neutral-400 uppercase font-black">Статус интеграции</div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {botToken && chatId ? '🟢 Подключен' : '🟡 Готов к настройке'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
