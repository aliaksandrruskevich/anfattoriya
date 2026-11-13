"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Property, Agent } from '../types';
import { getNbrbRate } from '../utils/exchangeRate';
import { FileText, Download, Printer, X, Check, Building2, Phone, Mail, MapPin, Award, ShieldCheck, Calculator, Share2, UserCheck, Send, MessageCircle, QrCode, Sparkles, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import { safeHtml2Canvas } from '../utils/html2canvasSafe';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { WatermarkedImage } from './WatermarkedImage';
import { printElement } from '../utils/printHelper';

interface PDFOfferGeneratorModalProps {
  property?: Property | null;
  propertiesList: Property[];
  agentName?: string;
  agentsList?: Agent[];
  onClose: () => void;
}

export type PDFTemplateStyle = 'minimal' | 'presentation';

// Заглушка, если ни одного агента нет — чтобы модалка не падала
const FALLBACK_AGENT: Agent = {
  id: 'unknown',
  name: 'АН Фаттория',
  phone: '+375 29 638-00-53',
  photo: '',
  role: 'Аттестованный риэлтер ООО «АН Фаттория»',
  rating: 5,
  specialization: 'all',
  isApproved: true,
};

export const PDFOfferGeneratorModal: React.FC<PDFOfferGeneratorModalProps> = ({
  property: initialProperty,
  propertiesList,
  agentName: initialAgentName,
  agentsList = [],
  onClose,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    initialProperty || (propertiesList.length > 0 ? propertiesList[0] : null)
  );

  const [templateStyle, setTemplateStyle] = useState<PDFTemplateStyle>('minimal');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  // Агенты — только из props, без хардкода из src/data.ts
  const availableAgents: Agent[] = Array.isArray(agentsList) ? agentsList : [];

  // Resolve initial agent
  const getInitialAgentId = () => {
    if (selectedProperty?.assignedAgentId) {
      const match = availableAgents.find((a) => a.id === selectedProperty.assignedAgentId);
      if (match) return match.id;
    }
    if (selectedProperty?.agentName) {
      const match = availableAgents.find((a) =>
        a.name.toLowerCase().includes(selectedProperty.agentName!.toLowerCase())
      );
      if (match) return match.id;
    }
    if (initialAgentName) {
      const match = availableAgents.find((a) =>
        a.name.toLowerCase().includes(initialAgentName.toLowerCase())
      );
      if (match) return match.id;
    }
    return availableAgents[0]?.id || FALLBACK_AGENT.id;
  };

  const [selectedAgentId, setSelectedAgentId] = useState<string>(getInitialAgentId);

  const currentAgent =
    availableAgents.find((a) => a.id === selectedAgentId) || availableAgents[0] || FALLBACK_AGENT;
  const activeAgentName =
    currentAgent.name ||
    initialAgentName ||
    selectedProperty?.agentName ||
    'Черник Юлия Александровна';
  const activeAgentPhone = currentAgent.phone || selectedProperty?.agentPhone || '+375 29 638-00-53';
  const activeAgentRole = currentAgent.role || 'Аттестованный риэлтер ООО «АН Фаттория»';

  const [customNotes, setCustomNotes] = useState<string>(
    'Объект прошёл полную юридическую проверку. Готов к быстрой сделке.'
  );
  const [clientName, setClientName] = useState<string>('Уважаемый Клиент');
  const [clientPhone, setClientPhone] = useState<string>('+375 ');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedProperty) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <h3 className="text-lg font-bold text-neutral-900">Объекты не найдены</h3>
          <p className="text-xs text-neutral-500">
            Добавьте хотя бы один объект в базу для формирования КП.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const rate = getNbrbRate();
  const priceBYN = selectedProperty.priceBYN || Math.round((selectedProperty.priceUSD || 0) * rate);
  const priceUSD = selectedProperty.priceUSD || Math.round(priceBYN / rate);
  const pricePerM2 = selectedProperty.area ? Math.round(priceBYN / selectedProperty.area) : 0;

  const photos =
    selectedProperty.photos && selectedProperty.photos.length > 0
      ? selectedProperty.photos
      : [
          selectedProperty.photo ||
            selectedProperty.image ||
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `${typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by'}/?propertyId=${
      selectedProperty.id
    }#catalog`
  )}&margin=1&format=png`;

  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [mobileViewTab, setMobileViewTab] = useState<'settings' | 'preview'>('settings');

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    setSentMessage(null);
    try {
      const canvas = await safeHtml2Canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `КП_Фаттория_${selectedProperty.id}.pdf`;
      pdf.save(fileName);
      setSentMessage(`✓ PDF успешно сохранён (${fileName})`);
    } catch (err) {
      console.warn('PDF generation error, switching to print dialog:', err);
      setSentMessage('Открываем диалог печати в PDF...');
      handlePrint();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const safeTitle = `КП_Фаттория_${(selectedProperty?.title || 'объект').replace(
      /[^a-zA-Z0-9а-яА-ЯёЁ_-]/g,
      '_'
    )}`;
    printElement(printRef.current, safeTitle);
    setSentMessage('✓ Открыт прямой диалог печати КП в формате A4');
  };

  const getPitchText = () => {
    const offerUrl = `${
      typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by'
    }/?propertyId=${selectedProperty.id}#catalog`;
    return `Здравствуйте, ${clientName}!\n\nПерсональное предложение по недвижимости от ООО «АН Фаттория»:\n🏢 ${
      selectedProperty.title
    }\n📍 Адрес: ${selectedProperty.address}\n💰 Стоимость: ${priceBYN.toLocaleString()} BYN (~ $${priceUSD.toLocaleString()} USD)\n📐 Площадь: ${
      selectedProperty.area
    } м²\n\n🔗 Подробная карточка с фото: ${offerUrl}\n\nВаш риэлтер: ${activeAgentName} (${activeAgentPhone})\nООО «АН Фаттория»`;
  };

  const handleShareTelegram = () => {
    const pitch = getPitchText();
    try {
      navigator.clipboard.writeText(pitch);
    } catch (e) {}
    const offerUrl = `${
      typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by'
    }/?propertyId=${selectedProperty.id}#catalog`;
    const shortText = `Предложение по недвижимости от ООО «АН Фаттория»:\n🏢 ${
      selectedProperty.title
    }\n📍 ${selectedProperty.address}\n💰 ${priceBYN.toLocaleString()} BYN (~ $${priceUSD.toLocaleString()} USD)\n📐 ${
      selectedProperty.area
    } м²\n\nПодробнее: ${offerUrl}\nРиэлтер: ${activeAgentName} (${activeAgentPhone})`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(offerUrl)}&text=${encodeURIComponent(shortText)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setSentMessage('✓ Текст КП скопирован в буфер и открывается Telegram');
  };

  const handleShareWhatsApp = () => {
    const pitch = getPitchText();
    try {
      navigator.clipboard.writeText(pitch);
    } catch (e) {}
    const cleanPhone = clientPhone.replace(/[^\d]/g, '');
    const waUrl =
      cleanPhone.length >= 9
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitch)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(pitch)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSentMessage('✓ Текст КП скопирован в буфер и открывается WhatsApp');
  };

  const handleShareViber = () => {
    const pitch = getPitchText();
    try {
      navigator.clipboard.writeText(pitch);
    } catch (e) {}
    const cleanPhone = clientPhone.replace(/[^\d]/g, '');
    const offerUrl = `${
      typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by'
    }/?propertyId=${selectedProperty.id}#catalog`;
    const shortText = `Предложение от АН Фаттория: ${selectedProperty.title} (${priceBYN.toLocaleString()} BYN). Ссылка: ${offerUrl}`;
    if (cleanPhone.length >= 9) {
      window.open(`viber://chat?number=%2B${cleanPhone}`, '_blank');
    } else {
      window.open(`viber://forward?text=${encodeURIComponent(shortText)}`, '_blank');
    }
    setSentMessage('✓ Текст скопирован! Вставьте в чат Viber (Ctrl+V)');
  };

  const handleCopyAll = () => {
    const pitch = getPitchText();
    navigator.clipboard.writeText(pitch);
    setSentMessage('✓ Полный текст коммерческого предложения скопирован!');
    setTimeout(() => setSentMessage(null), 3000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] my-auto">
        {/* Header toolbar */}
        <div className="px-4 sm:px-6 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                Генератор КП (PDF)
              </h3>
              <p className="text-[10px] text-neutral-400 truncate hidden sm:block">
                Фирменный бланк агентства «АН Фаттория»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Генерация...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    Скачать <span className="hidden sm:inline">PDF</span>
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-extrabold rounded-xl text-xs items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Печать</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Закрыть (Esc)"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex border-b border-neutral-800 bg-neutral-950 px-4 py-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileViewTab('settings')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileViewTab === 'settings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Параметры КП</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileViewTab === 'preview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Предпросмотр A4</span>
          </button>
        </div>

        {/* Modal Body with Settings & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Settings Panel */}
          <div
            className={`${
              mobileViewTab === 'settings' ? 'block' : 'hidden'
            } lg:block lg:col-span-4 p-4 sm:p-5 bg-neutral-900 border-r border-neutral-800 space-y-4 text-xs text-neutral-300`}
          >
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Выберите объект недвижимости:
              </label>
              <select
                value={selectedProperty.id}
                onChange={(e) => {
                  const p = propertiesList.find((item) => item.id === e.target.value);
                  if (p) {
                    setSelectedProperty(p);
                    if (p.assignedAgentId) {
                      const match = availableAgents.find((a) => a.id === p.assignedAgentId);
                      if (match) setSelectedAgentId(match.id);
                    }
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer"
              >
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {(p.priceBYN || 0).toLocaleString()} BYN
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                Ответственный риэлтер (ООО «АН Фаттория»):
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer font-bold"
              >
                {availableAgents.length === 0 && (
                  <option value={FALLBACK_AGENT.id}>
                    {FALLBACK_AGENT.name} ({FALLBACK_AGENT.phone})
                  </option>
                )}
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Style Selector */}
            <div className="space-y-2 p-3 bg-neutral-950/90 rounded-2xl border border-neutral-800">
              <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Стиль оформления КП:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTemplateStyle('minimal')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    templateStyle === 'minimal'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Минимал (1 стр.)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateStyle('presentation')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    templateStyle === 'presentation'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Глянцевый</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Имя Клиента (для Персонализации):
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-purple-500 outline-none"
                placeholder="Иван Иванович"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Телефон Клиента (WhatsApp/Telegram):
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-purple-500 outline-none"
                placeholder="+375 29 123-45-67"
              />
            </div>

            {/* Quick Messengers Share Buttons */}
            <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-purple-400 block tracking-wider">
                  Отправить клиенту:
                </span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="text-[10px] text-purple-300 hover:text-white underline cursor-pointer font-bold"
                >
                  Копировать текст
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="py-2 px-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> TG
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WA
                </button>
                <button
                  type="button"
                  onClick={handleShareViber}
                  className="py-2 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> Viber
                </button>
              </div>

              {sentMessage && (
                <div className="p-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-lg text-center">
                  {sentMessage}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Особые примечания / условия сделки:
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 text-xs focus:border-purple-500 outline-none resize-none"
                placeholder="Например: Чистая продажа, возможна ипотека от Беларусбанка под 12.5%..."
              />
            </div>

            <div className="p-4 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Гарантии агентства</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                КП автоматически формируется на официальном бланке риэлтерской организации ООО «АН
                Фаттория» с контактами аттестованного специалиста.
              </p>
            </div>
          </div>

          {/* Right Live A4 PDF Preview Area */}
          <div
            className={`${
              mobileViewTab === 'preview' ? 'flex' : 'hidden'
            } lg:flex lg:col-span-8 p-3 sm:p-6 bg-stone-900 overflow-x-auto overflow-y-auto justify-start sm:justify-center`}
          >
            <div
              ref={printRef}
              className="w-[210mm] min-h-[297mm] bg-white text-neutral-900 p-8 shadow-2xl flex flex-col justify-between font-sans relative"
              style={{ boxSizing: 'border-box' }}
            >
              {/* STYLE 1: MINIMAL */}
              {templateStyle === 'minimal' && (
                <>
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b-2 border-purple-500 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-950 text-purple-500 font-black flex items-center justify-center text-sm font-mono">
                            Ф+
                          </div>
                          <span className="text-lg font-black tracking-tight text-neutral-950 uppercase">
                            ООО «АН ФАТТОРИЯ»
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                          Аттестованное агентство недвижимости • ул. Репина, 4 • Минск • Лицензия №
                          02240/446 МЮ РБ
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="inline-block bg-purple-100 text-purple-900 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                          КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                        </span>
                        <p className="text-[10px] text-stone-400 font-mono">
                          Дата: {new Date().toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50/60 border border-purple-200/60 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                        Персонально для: {clientName}
                      </h4>
                      <p className="text-[11px] text-stone-700 leading-relaxed">
                        Предлагаем Вашему вниманию эксклюзивный объект недвижимости из актуальной
                        базы ООО «АН Фаттория». Объект прошёл первичную юридическую экспертизу и
                        готов к быстрой сделке.
                      </p>
                    </div>

                    <div className="grid grid-cols-12 gap-5 items-stretch">
                      <div className="col-span-5 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 min-h-[160px] relative">
                        <WatermarkedImage
                          src={photos[0]}
                          alt={selectedProperty.title}
                          showWatermark={showWatermark}
                          watermarkSize="sm"
                          watermarkPosition="bottom-right"
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-neutral-950/80 text-purple-400 text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono z-20">
                          {selectedProperty.type === 'apartment' && 'Квартира'}
                          {selectedProperty.type === 'commercial' && 'Коммерческое'}
                          {selectedProperty.type === 'house' && 'Дом'}
                          {selectedProperty.type === 'plot' && 'Участок'}
                        </div>
                      </div>

                      <div className="col-span-7 flex flex-col justify-between space-y-3">
                        <div>
                          <h2 className="text-base font-black text-neutral-950 leading-snug">
                            {selectedProperty.title}
                          </h2>
                          <p className="text-xs text-stone-600 font-semibold flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            {selectedProperty.address}
                          </p>
                        </div>

                        <div className="bg-purple-50/50 border border-purple-200/70 rounded-2xl p-3.5 space-y-1">
                          <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                            Стоимость объекта:
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-purple-700 font-mono">
                              {priceBYN.toLocaleString()} BYN
                            </span>
                            <span className="text-xs font-extrabold text-stone-500 font-mono">
                              (~ ${priceUSD.toLocaleString()} USD)
                            </span>
                          </div>
                          {pricePerM2 > 0 && (
                            <p className="text-[10px] text-stone-500 font-medium">
                              Цена за 1 м²:{' '}
                              <strong className="text-stone-800 font-mono">
                                {pricePerM2.toLocaleString()} BYN
                              </strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[9px] text-stone-400 uppercase font-black">Площадь</div>
                        <div className="text-sm font-black text-stone-900 font-mono mt-0.5">
                          {selectedProperty.area} м²
                        </div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[9px] text-stone-400 uppercase font-black">Комнат</div>
                        <div className="text-sm font-black text-stone-900 font-mono mt-0.5">
                          {selectedProperty.rooms || '—'}
                        </div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[9px] text-stone-400 uppercase font-black">Этаж</div>
                        <div className="text-sm font-black text-stone-900 font-mono mt-0.5">
                          {selectedProperty.floor
                            ? `${selectedProperty.floor}/${selectedProperty.totalFloors || '—'}`
                            : '—'}
                        </div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="text-[9px] text-stone-400 uppercase font-black">Статус</div>
                        <div className="text-xs font-bold text-emerald-700 mt-0.5">
                          Готов к сделке
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b pb-1">
                        Описание и особенности:
                      </h4>
                      <p className="text-[11px] text-stone-700 leading-relaxed">{customNotes}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center gap-2 text-[10px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Юридическая чистота</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-semibold">
                        <Award className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Лицензия Минюста</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-semibold">
                        <Calculator className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Помощь с ипотекой</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-stone-200 pt-4 mt-6 flex justify-between items-end gap-4">
                    <div className="flex items-center gap-3">
                      <AgentBrandAvatar
                        photo={currentAgent.photo}
                        name={activeAgentName}
                        size="md"
                        showBadge={false}
                      />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Ваш ответственный риэлтер:
                        </p>
                        <p className="text-xs font-black text-purple-700">{activeAgentName}</p>
                        <p className="text-[10px] text-stone-600 font-medium">
                          Риэлтер ООО «АН Фаттория»
                        </p>
                        <p className="text-[9px] text-stone-400">
                          Лицензия № 02240/446 МЮ РБ • г. Минск, ул. Репина, 4
                        </p>
                        <p className="text-xs font-black font-mono text-neutral-900 mt-1">
                          {activeAgentPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-200 p-2 rounded-xl shrink-0">
                      <img
                        src={qrCodeUrl}
                        alt="QR-код"
                        className="w-14 h-14 object-contain rounded bg-white shrink-0 border border-stone-200"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left space-y-0.5 max-w-[110px]">
                        <span className="text-[9px] font-black uppercase text-purple-700 block leading-tight">
                          📱 Фотогалерея
                        </span>
                        <p className="text-[8px] text-stone-600 font-medium leading-tight">
                          Сканируйте для просмотра галереи онлайн
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STYLE 2: PRESENTATION */}
              {templateStyle === 'presentation' && (
                <>
                  <div className="space-y-5">
                    <div className="bg-neutral-950 text-white rounded-2xl p-4 flex justify-between items-center border border-purple-500/40 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md">
                          Ф+
                        </div>
                        <div>
                          <h1 className="text-base font-black uppercase tracking-wider text-purple-400">
                            ООО «АН ФАТТОРИЯ»
                          </h1>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                            Агентство Недвижимости Минска • Лицензия Минюста РБ № 02240/446
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">
                          Персональное КП
                        </span>
                        <span className="text-xs font-bold text-purple-300 font-mono">
                          № {selectedProperty.id.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-stone-50 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-purple-700 block">
                          Презентация объекта для:
                        </span>
                        <h3 className="text-sm font-black text-neutral-950">{clientName}</h3>
                      </div>
                      <span className="text-xs font-mono text-stone-500">
                        {new Date().toLocaleDateString('ru-RU')}
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
                      <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-1">
                            {selectedProperty.type === 'apartment'
                              ? 'Квартира'
                              : selectedProperty.type === 'house'
                              ? 'Дом'
                              : 'Объект'}
                          </span>
                          <h2 className="text-lg font-black text-neutral-950 leading-tight">
                            {selectedProperty.title}
                          </h2>
                          <p className="text-xs text-stone-600 font-semibold flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />{' '}
                            {selectedProperty.address}
                          </p>
                        </div>

                        <div className="text-right bg-stone-50 p-3 rounded-xl border border-stone-200/80 shrink-0">
                          <div className="text-xl font-black text-purple-700 font-mono">
                            {priceBYN.toLocaleString()} BYN
                          </div>
                          <div className="text-xs font-bold text-stone-600 font-mono">
                            ≈ ${priceUSD.toLocaleString()} USD
                          </div>
                          {pricePerM2 > 0 && (
                            <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                              {pricePerM2.toLocaleString()} BYN / м²
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/60">
                          <span className="text-[9px] font-bold text-stone-400 uppercase block">
                            Площадь
                          </span>
                          <span className="text-xs font-black text-neutral-900 font-mono">
                            {selectedProperty.area} м²
                          </span>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/60">
                          <span className="text-[9px] font-bold text-stone-400 uppercase block">
                            Комнат
                          </span>
                          <span className="text-xs font-black text-neutral-900 font-mono">
                            {selectedProperty.rooms || '—'}
                          </span>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/60">
                          <span className="text-[9px] font-bold text-stone-400 uppercase block">
                            Этаж
                          </span>
                          <span className="text-xs font-black text-neutral-900 font-mono">
                            {selectedProperty.floor
                              ? `${selectedProperty.floor}/${selectedProperty.totalFloors || '—'}`
                              : '—'}
                          </span>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/60">
                          <span className="text-[9px] font-bold text-stone-400 uppercase block">
                            Юр. статус
                          </span>
                          <span className="text-xs font-black text-emerald-600 uppercase">
                            Экспертиза 100%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-8 relative rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-stone-200">
                        <WatermarkedImage
                          src={photos[activePhotoIdx] || photos[0]}
                          alt={selectedProperty.title}
                          showWatermark={showWatermark}
                          watermarkSize="md"
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="col-span-4 flex flex-col gap-2">
                        {photos.slice(0, 3).map((p: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`rounded-lg overflow-hidden flex-1 border-2 cursor-pointer relative ${
                              activePhotoIdx === idx
                                ? 'border-purple-600'
                                : 'border-stone-200 opacity-80'
                            }`}
                          >
                            <img
                              src={p}
                              alt="thumb"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
                      <h4 className="text-xs font-black uppercase text-neutral-900 tracking-wider">
                        Особые преимущества объекта:
                      </h4>
                      <p className="text-[11px] text-stone-700 leading-relaxed font-medium">
                        {customNotes}
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-950 text-white rounded-2xl p-4 border border-purple-500/30 flex items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-3">
                      <AgentBrandAvatar
                        photo={currentAgent.photo}
                        name={activeAgentName}
                        size="md"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-purple-400 uppercase font-black block">
                          Ведущий риэлтер-консультант
                        </span>
                        <h4 className="text-xs font-black text-white">{activeAgentName}</h4>
                        <p className="text-[10px] text-stone-400">{activeAgentRole}</p>
                        <a
                          href={`tel:${activeAgentPhone}`}
                          className="text-xs font-mono font-black text-purple-400 hover:underline inline-block"
                        >
                          {activeAgentPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white text-neutral-900 p-2 rounded-xl border border-stone-200 shrink-0">
                      <img
                        src={qrCodeUrl}
                        alt="QR код"
                        className="w-14 h-14 object-contain rounded-lg bg-white shrink-0"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left space-y-0.5 max-w-[110px]">
                        <span className="text-[9px] font-black uppercase text-purple-700 flex items-center gap-1 leading-tight">
                          <QrCode className="w-3.5 h-3.5" /> Фотогалерея
                        </span>
                        <p className="text-[8px] text-stone-600 font-medium leading-tight">
                          Отсканируйте смартфоном для просмотра онлайн
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};