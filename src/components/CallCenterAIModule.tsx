"use client";
import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Sparkles, Bot, User, CheckCircle2, Clock, Calendar, AlertCircle, Plus, Send, RefreshCw, MessageSquare, Shield, Play, Pause, ChevronRight } from 'lucide-react';
import { Lead, Agent } from '../types';

interface CallCenterAIModuleProps {
  leads: Lead[];
  agentsList?: Agent[];
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  loggedInAgent?: Agent | null;
}

const SAMPLE_CALL_SCRIPTS = [
  {
    name: 'Елена Викторовна',
    phone: '+375 (29) 812-34-56',
    source: 'Холодная база Kufar',
    intent: 'Продажа 2-комнатной квартиры (Минск-Мир)',
    transcript: '— Алло, здравствуйте! Да, продаю квартиру в Минск-Мире, 2 комнаты, 54 метра, 12 этаж. Хочу $78,000.\n— Подскажите, когда вам удобно принять нашего эксперта для бесплатной оценки?\n— Завтра в 18:00 смогу показать.',
    agentAssistHints: ['Запросите точный адрес и литер дома', 'Предложите бесплатный выезд эксперта с подарком-экспертизой', 'Уточните наличие обременений или чистую продажу']
  },
  {
    name: 'Александр Петрович',
    phone: '+375 (44) 765-43-21',
    source: 'Входящий звонок с сайта',
    intent: 'Покупка дома под Минском до $120,000',
    transcript: '— Здравствуйте, ищу коттедж или готовый дом до 15 км от МКАД, бюджет до $120k.\n— Отлично! У нас есть 3 подходящих дома в Колодищах и Ратомке.\n— Пришлите предложения на WhatsApp.',
    agentAssistHints: ['Уточните требуемый размер участка (сотки)', 'Зафиксируйте номер для авторассылки WhatsApp КП', 'Предложите организовать показ в субботу']
  }
];

export default function CallCenterAIModule({
  leads,
  agentsList,
  onAddLead,
  onUpdateLead,
  loggedInAgent
}: CallCenterAIModuleProps) {
  // Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeCallSample, setActiveCallSample] = useState(SAMPLE_CALL_SCRIPTS[0]);
  const [isRecording, setIsRecording] = useState(false);

  // Voice Dictation (Web Speech API)
  const [isListeningDictation, setIsListeningDictation] = useState(false);
  const [dictatedText, setDictatedText] = useState('');

  // Quick Lead Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('+375 ');
  const [formSource, setFormSource] = useState('Холодный прозвон');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'new' | 'processing' | 'rejected' | 'converted'>('new');
  const [formIntent, setFormIntent] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('15:00');

  // Timer for active call
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Handle start call simulation
  const handleStartCall = (sample = SAMPLE_CALL_SCRIPTS[0]) => {
    setActiveCallSample(sample);
    setIsCallActive(true);
    setFormName(sample.name);
    setFormPhone(sample.phone);
    setFormSource(sample.source);
    setFormIntent(sample.intent);
    setFormNotes(sample.transcript);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  // Web Speech API Voice Summary Dictation
  const handleToggleVoiceDictation = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = false;

      if (!isListeningDictation) {
        setIsListeningDictation(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setDictatedText(transcript);
          setFormNotes(prev => (prev ? prev + '\n[Голосовое резюме]: ' + transcript : '[Голосовое резюме]: ' + transcript));
          setIsListeningDictation(false);
        };

        recognition.onerror = () => {
          setIsListeningDictation(false);
        };

        recognition.onend = () => {
          setIsListeningDictation(false);
        };
      } else {
        setIsListeningDictation(false);
      }
    } else {
      // Fallback simulation dictation
      const fallbackText = 'Клиент просит перезвонить в четверг в 15:00 после согласования с супругом. Интересует торг.';
      setDictatedText(fallbackText);
      setFormNotes(prev => (prev ? prev + '\n[Голосовое резюме]: ' + fallbackText : '[Голосовое резюме]: ' + fallbackText));
    }
  };

  // Create Lead in 1-click (4.2)
  const handleCreateLeadFromCall = () => {
    if (!formName.trim() || !formPhone.trim()) {
      alert('Пожалуйста, заполните ФИО и телефон лида.');
      return;
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      typeOrPrice: formIntent || 'Консультация по недвижимости',
      formName: formSource,
      date: new Date().toLocaleDateString('ru-RU'),
      status: formStatus,
      notes: formNotes,
      source: formSource,
      voiceSummary: dictatedText,
      callIntent: formIntent,
      nextContactDate: callbackDate || undefined,
      nextContactTime: callbackTime || undefined,
      assignedAgentName: loggedInAgent?.name || 'Оператор Колл-Центра',
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          text: `Лид зарегистрирован оператором колл-центра. Источник: ${formSource}`,
          author: loggedInAgent?.name || 'Оператор'
        }
      ]
    };

    onAddLead(newLead);
    alert(`Лид "${formName}" успешно добавлен в базу CRM со статусом "${formStatus.toUpperCase()}"!`);
    
    // Reset form
    setFormName('');
    setFormPhone('+375 ');
    setFormNotes('');
    setDictatedText('');
    setFormIntent('');
  };

  return (
    <div className="space-y-6 font-sans text-neutral-900">
      
      {/* IP Telephony Active Call Bar & CCAI Assistant (4.1) */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl flex items-center justify-center text-white font-mono ${
              isCallActive ? 'bg-emerald-600 animate-pulse' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                Google Cloud Contact Center AI (CCAI) Telephony
              </span>
              <h3 className="text-lg font-black text-white">
                {isCallActive ? `Идет разговор с: ${activeCallSample.name}` : 'Модуль прозвона и записи звонков'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCallActive && (
              <span className="text-base font-mono font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/40">
                ⏱ {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
              </span>
            )}

            {!isCallActive ? (
              <button
                onClick={() => handleStartCall(SAMPLE_CALL_SCRIPTS[0])}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" /> Имитировать входящий звонок
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" /> Завершить звонок
              </button>
            )}
          </div>
        </div>

        {/* CCAI Live Agent Assist Box (4.1) */}
        {isCallActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {/* Realtime Intent & Transcript */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Распознавание намерений (Intent Detection)
              </span>
              <div className="p-2.5 bg-neutral-900 rounded-xl text-xs font-bold text-emerald-300 border border-emerald-500/30">
                🎯 Намерение: {activeCallSample.intent}
              </div>
              <div className="text-xs text-stone-300 leading-relaxed font-mono whitespace-pre-line bg-black/40 p-3 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                {activeCallSample.transcript}
              </div>
            </div>

            {/* Agent Assist Realtime Prompts */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Подсказки ИИ в реальном времени (Agent Assist)
              </span>
              <div className="space-y-1.5">
                {activeCallSample.agentAssistHints.map((hint, idx) => (
                  <div key={idx} className="p-2 bg-neutral-900/80 border border-purple-500/20 text-xs font-semibold text-purple-200 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lead Registration Form (4.2, 4.3, 4.4) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-neutral-900 uppercase tracking-wider">
                Быстрое создание лида после звонка
              </h4>
              <p className="text-xs text-stone-500">Автоматическое заполнение данных из транскрипции</p>
            </div>
          </div>

          {/* Voice Dictation Button (Web Speech API) */}
          <button
            type="button"
            onClick={handleToggleVoiceDictation}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              isListeningDictation
                ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                : 'bg-stone-100 hover:bg-stone-200 text-neutral-900 border-stone-300'
            }`}
          >
            {isListeningDictation ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-600" />}
            <span>{isListeningDictation ? 'Слушаю... Говорите' : '🎙 Надиктовать резюме (Speech-to-Text)'}</span>
          </button>
        </div>

        {dictatedText && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold">
            🎙 Надиктованный текст: &ldquo;{dictatedText}&rdquo;
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">ФИО Клиента *</label>
            <input
              type="text"
              placeholder="Иван Иванов"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-250 font-bold text-neutral-900 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Телефон *</label>
            <input
              type="text"
              placeholder="+375 29 123-45-67"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full bg-stone-50 border border-stone-250 font-mono font-bold text-neutral-900 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Источник обращения</label>
            <select
              value={formSource}
              onChange={(e) => setFormSource(e.target.value)}
              className="w-full bg-stone-50 border border-stone-250 font-bold text-neutral-900 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Холодный прозвон">Холодный прозвон</option>
              <option value="Kufar / Авито">Kufar / Авито</option>
              <option value="Входящий звонок с сайта">Входящий звонок с сайта</option>
              <option value="Рекомендация">Рекомендация</option>
            </select>
          </div>

          {/* Lead Statuses (4.3) */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Статус Лида</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full bg-stone-50 border border-stone-250 font-extrabold text-neutral-900 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="new">🆕 Новый</option>
              <option value="processing">⚙️ В обработке</option>
              <option value="rejected">❌ Отказ</option>
              <option value="converted">🚀 Конверсия (В работу)</option>
            </select>
          </div>
        </div>

        {/* Callback Scheduler (4.4) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Дата перезвона</label>
            <input
              type="date"
              value={callbackDate}
              onChange={(e) => setCallbackDate(e.target.value)}
              className="w-full bg-white border border-stone-250 text-xs font-bold rounded-xl p-2 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Время перезвона</label>
            <input
              type="time"
              value={callbackTime}
              onChange={(e) => setCallbackTime(e.target.value)}
              className="w-full bg-white border border-stone-250 text-xs font-mono font-bold rounded-xl p-2 outline-none"
            />
          </div>

          <div className="flex items-end">
            <span className="text-[10px] text-stone-500 font-medium">
              🔔 Напоминание сработает за 15 минут в CRM и Telegram
            </span>
          </div>
        </div>

        {/* Comment field */}
        <div>
          <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Комментарий / Суть обращения</label>
          <textarea
            rows={2}
            placeholder="Суть разговора или надиктованные заметки..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="w-full bg-stone-50 border border-stone-250 text-xs font-medium text-neutral-900 rounded-xl p-3 outline-none"
          />
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleCreateLeadFromCall}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Создать лида в базе
          </button>
        </div>
      </div>

    </div>
  );
}
