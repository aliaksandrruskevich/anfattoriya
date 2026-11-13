"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Printer, Share2, Phone, Mail, Building, CheckCircle2,
  User, Sparkles, MapPin, DollarSign, Calendar, ChevronLeft,
  ChevronRight, FileText, UserCheck, Download, Loader2, Copy, Shield,
  ShieldCheck, MessageCircle, Layers, Compass, Award,
  Check, Info, ExternalLink, HelpCircle, QrCode, SlidersHorizontal, Eye
} from 'lucide-react';
import { Property, Buyer, Agent } from '../types';
import { getNbrbRate } from '../utils/exchangeRate';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { WatermarkedImage } from './WatermarkedImage';
import jsPDF from 'jspdf';
import { safeHtml2Canvas } from '../utils/html2canvasSafe';
import { printElement } from '../utils/printHelper';

interface CommercialOfferModalProps {
  property: Property;
  buyer?: Buyer | any;
  agent?: Agent;
  agentsList?: Agent[];
  onClose: () => void;
}

export type KPTemplateType = 'minimal' | 'presentation';

// Заглушка, если ни одного агента нет — чтобы модалка не падала
const FALLBACK_AGENT: Agent = {
  id: 'unknown',
  name: 'АН Фаттория',
  phone: '+375 29 638-00-53',
  photo: '',
  role: 'Агентство недвижимости',
  rating: 5,
  specialization: 'all',
  isApproved: true,
};

export default function CommercialOfferModal({
  property,
  buyer,
  agent: propAgent,
  agentsList = [],
  onClose,
}: CommercialOfferModalProps) {
  const [templateStyle, setTemplateStyle] = useState<KPTemplateType>('presentation');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [mobileViewTab, setMobileViewTab] = useState<'params' | 'preview'>('params');
  const printableRef = useRef<HTMLDivElement>(null);

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

  // Доступные агенты — только из props, без хардкода из src/data.ts
  const availableAgents: Agent[] = Array.isArray(agentsList) ? agentsList : [];

  // Resolve initial responsible realtor
  const resolveInitialAgent = (): Agent => {
    if (propAgent) return propAgent;

    if (property.assignedAgentId) {
      const match = availableAgents.find((a) => a.id === property.assignedAgentId);
      if (match) return match;
    }

    if (property.agentName) {
      const match = availableAgents.find(
        (a) =>
          a.name.toLowerCase().includes(property.agentName!.toLowerCase()) ||
          property.agentName!.toLowerCase().includes(a.name.toLowerCase())
      );
      if (match) return match;
    }

    if (property.agentName) {
      return {
        id: property.assignedAgentId || 'agent-property-assigned',
        name: property.agentName,
        phone: property.agentPhone || '+375 29 638-00-53',
        photo: property.agentPhoto || '',
        role: 'Риэлтер',
        experience: '10 лет',
        rating: 5.0,
        specialization: 'all',
        isApproved: true,
      };
    }

    if (buyer?.assignedAgentId) {
      const match = availableAgents.find((a) => a.id === buyer.assignedAgentId);
      if (match) return match;
    }
    if (buyer?.assignedAgentName) {
      const match = availableAgents.find((a) =>
        a.name.toLowerCase().includes(buyer.assignedAgentName.toLowerCase())
      );
      if (match) return match;
    }

    if (availableAgents.length > 0) return availableAgents[0];

    return FALLBACK_AGENT;
  };

  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => resolveInitialAgent().id);

  // Custom manual recipient details
  const [clientName, setClientName] = useState<string>(buyer?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(buyer?.phone || '+375 ');

  // Active realtor details
  const activeAgent = availableAgents.find((a) => a.id === selectedAgentId) || resolveInitialAgent();
  const agentName = activeAgent.name;
  const agentPhone = activeAgent.phone || property.agentPhone || '+375 29 638-00-53';
  const agentPhoto = activeAgent.photo || property.agentPhoto || '';
  const agentRole = 'Аттестованный риэлтер ООО «АН Фаттория»';

  // Photos resolution from property
  const photos =
    property.photos && property.photos.length > 0
      ? property.photos
      : [
          property.photo ||
            property.image ||
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        ];

  const recipientName = clientName.trim() || 'Уважаемый клиент';

  const rate = getNbrbRate();
  const priceBYN = property.priceBYN || Math.round((property.priceUSD || 0) * rate);
  const priceUSD = property.priceUSD || Math.round(priceBYN / rate);
  const pricePerM2BYN = Math.round((priceBYN || 0) / (property.area || 1));
  const pricePerM2USD = Math.round((priceUSD || 0) / (property.area || 1));

  // Rental and investment yield estimates
  const estMonthlyRentUSD = Math.round((priceUSD || 100000) * 0.0055);
  const estMonthlyRentBYN = Math.round(estMonthlyRentUSD * rate);
  const estAnnualYieldPercent = (((estMonthlyRentUSD * 12) / (priceUSD || 1)) * 100).toFixed(1);
  const paybackYears = (priceUSD / (estMonthlyRentUSD * 12)).toFixed(1);

  const offerUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?propertyId=${encodeURIComponent(property.id)}#catalog`
      : `https://fattoria.by/?propertyId=${property.id}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    offerUrl
  )}&margin=1&format=png`;

  const sellingPitch = `Здравствуйте, ${recipientName}!

Подготовили для Вас персональное коммерческое предложение по объекту от ООО «АН Фаттория»:

🏢 ${property.title}
📍 Адрес: ${property.address}
💰 Стоимость: ${(priceBYN || 0).toLocaleString()} BYN (~ $${(priceUSD || 0).toLocaleString()} USD)
📐 Площадь: ${property.area} м² ${property.rooms ? `• Комнат: ${property.rooms}` : ''} ${
    property.floor ? `• Этаж: ${property.floor}/${property.totalFloors || '—'}` : ''
  }
🛡 Юридический статус: Полная экспертиза документов проведена агентством

🔗 Подробная интерактивная карточка с фото: ${offerUrl}

Ваш персональный риэлтер: ${agentName}
📞 Телефон / Мессенджеры: ${agentPhone}
🏢 АН «Фаттория» (Минск, ул. Репина, д. 4, пом. 458 • Лицензия Минюста РБ № 02240/446)`;

  const handlePrint = () => {
    if (!printableRef.current) return;
    const safeTitle = `КП_Фаттория_${(property.title || 'объект').replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_')}`;
    printElement(printableRef.current, safeTitle);
    setSentSuccess('✓ Запущен прямой диалог печати КП в формате A4');
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    setSentSuccess(null);
    try {
      const canvas = await safeHtml2Canvas(printableRef.current, {
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

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const safeId = (property.id || 'объект').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `КП_Фаттория_${safeId}_${templateStyle}.pdf`;
      pdf.save(fileName);
      setSentSuccess(`✓ PDF успешно сформирован и скачан (${fileName})`);
    } catch (err) {
      console.warn('PDF export error, falling back to direct print dialog:', err);
      setSentSuccess('Перенаправляем в диалог печати/сохранения в PDF...');
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(offerUrl);
    setCopied(true);
    setSentSuccess('✓ Ссылка на интерактивную карточку скопирована в буфер обмена');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(sellingPitch);
    setCopiedText(true);
    setSentSuccess('✓ Готовый текст коммерческого предложения скопирован в буфер обмена');
    setTimeout(() => setCopiedText(false), 3000);
  };

  const cleanPhone = clientPhone.replace(/[^\d]/g, '');

  const handleShareWhatsApp = () => {
    try {
      navigator.clipboard.writeText(sellingPitch);
    } catch (e) {}
    const targetUrl =
      cleanPhone.length >= 9
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(sellingPitch)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(sellingPitch)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setSentSuccess('✓ Текст КП скопирован в буфер и открывается WhatsApp');
  };

  const handleShareTelegram = () => {
    try {
      navigator.clipboard.writeText(sellingPitch);
    } catch (e) {}

    const shortPitch = `Предложение по недвижимости от ООО «АН Фаттория»:\n🏢 ${property.title}\n📍 ${
      property.address
    }\n💰 ${(priceBYN || 0).toLocaleString()} BYN (~ $${(priceUSD || 0).toLocaleString()} USD)\n📐 ${
      property.area
    } м²\n\nПодробная карточка с фото: ${offerUrl}\n\nРиэлтер: ${agentName} (${agentPhone})`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(offerUrl)}&text=${encodeURIComponent(shortPitch)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
    setSentSuccess('✓ Текст КП скопирован в буфер и открывается Telegram');
  };

  const handleShareViber = () => {
    try {
      navigator.clipboard.writeText(sellingPitch);
    } catch (e) {}

    const shortPitch = `Предложение от АН Фаттория: ${property.title}, ${
      property.address
    } — ${(priceBYN || 0).toLocaleString()} BYN. Ссылка: ${offerUrl}`;

    if (cleanPhone.length >= 9) {
      window.open(`viber://chat?number=%2B${cleanPhone}`, '_blank');
    } else {
      window.open(`viber://forward?text=${encodeURIComponent(shortPitch)}`, '_blank');
    }
    setSentSuccess('✓ Текст КП скопирован! Вы можете сразу вставить его в Viber (Ctrl+V)');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Коммерческое предложение: ${property.title} — ООО «АН Фаттория»`);
    const body = encodeURIComponent(sellingPitch);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setSentSuccess('✓ Открыта почтовая программа для отправки Email');
  };

  return (
    <div
      id="printable-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[96vh] sm:max-h-[94vh] font-sans print:shadow-none print:border-none print:max-h-none print:my-0">
        {/* Top Header Toolbar */}
        <div className="bg-neutral-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-stone-800 print:hidden shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-purple-400 flex items-center gap-1.5 truncate">
                <span>КП (Коммерческое Предложение)</span>
              </h3>
              <p className="text-[11px] text-stone-400 truncate">
                Клиент: <strong className="text-white">{recipientName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-neutral-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              title="Скачать в PDF"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">Скачать PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition-all items-center gap-2 cursor-pointer border border-stone-700"
              title="Распечатать на принтере"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Печать</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-800 hover:bg-neutral-700 text-stone-300 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer border border-neutral-700"
              aria-label="Закрыть окно КП"
              title="Закрыть (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-stone-200 bg-stone-100 px-3 py-1.5 gap-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={() => setMobileViewTab('params')}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === 'params'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Параметры и отправка</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewTab('preview')}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === 'preview'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Предпросмотр бланка</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 bg-stone-50 print:p-0 print:bg-white flex-1">
          {/* Style Template Selector */}
          <div
            className={`${
              mobileViewTab === 'params' ? 'block' : 'hidden'
            } sm:block bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3.5 print:hidden`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" /> Шаблон оформления КП:
              </span>

              <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTemplateStyle('minimal')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    templateStyle === 'minimal'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Минималистичный (1 стр.)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateStyle('presentation')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    templateStyle === 'presentation'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Глянцевый (2 стр.)</span>
                </button>
              </div>
            </div>

            {/* Realtor & Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                  Ответственный риэлтер:
                </label>
                <select
                  value={activeAgent.id}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-neutral-900 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {availableAgents.length === 0 && (
                    <option value={activeAgent.id}>{activeAgent.name}</option>
                  )}
                  {availableAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} • {ag.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                  Имя клиента:
                </label>
                <input
                  type="text"
                  placeholder="Имя клиента (напр. Александр)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-neutral-900 font-semibold text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                  Телефон клиента (WhatsApp/Viber):
                </label>
                <input
                  type="tel"
                  placeholder="+375 29 123-45-67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-neutral-900 font-semibold text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Watermark & Copy Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Водяной знак «АН Фаттория» на фото</span>
              </label>

              <button
                onClick={handleCopyPitch}
                className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedText ? 'Текст КП скопирован!' : 'Скопировать продающий текст'}</span>
              </button>
            </div>
          </div>

          {/* Printable Container */}
          <div
            ref={printableRef}
            className={`${
              mobileViewTab === 'preview' ? 'block' : 'hidden'
            } sm:block space-y-5 bg-white p-3 sm:p-6 rounded-2xl border border-stone-200 print:border-none print:p-0 print:block overflow-x-auto`}
          >
            {/* TEMPLATE 1: MINIMALIST */}
            {templateStyle === 'minimal' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-purple-600 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-950 flex items-center justify-center text-purple-400 font-black text-lg">
                      Ф+
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-wider text-neutral-950">
                        ООО «АН ФАТТОРИЯ»
                      </h1>
                      <p className="text-[10px] text-stone-500 font-semibold uppercase">
                        Лицензия Минюста РБ № 02240/446 • Минск
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-stone-400 block">
                      КП № {property.id?.toUpperCase() || 'FP-2026'}
                    </span>
                    <span className="text-xs font-black text-purple-700 font-mono">
                      {new Date().toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-neutral-900 border border-stone-200">
                    <WatermarkedImage
                      src={photos[0]}
                      alt={property.title}
                      showWatermark={showWatermark}
                      watermarkSize="sm"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-extrabold rounded-md uppercase">
                        {property.type === 'apartment' ? 'Квартира' : property.type === 'house' ? 'Дом' : 'Коммерция'}
                      </span>
                      <h2 className="text-lg font-black text-neutral-950 leading-snug">{property.title}</h2>
                      <p className="text-xs text-stone-600 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" /> {property.address}
                      </p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-purple-600 font-mono">
                          {(priceBYN || 0).toLocaleString()} BYN
                        </div>
                        <div className="text-xs font-bold text-stone-600 font-mono">
                          ≈ ${(priceUSD || 0).toLocaleString()} USD
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-bold text-stone-500 font-mono">
                        {pricePerM2BYN.toLocaleString()} BYN / м²
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <span className="text-[9px] text-stone-400 uppercase block font-bold">Площадь</span>
                        <span className="font-black text-neutral-900">{property.area} м²</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <span className="text-[9px] text-stone-400 uppercase block font-bold">Комнат</span>
                        <span className="font-black text-neutral-900">{property.rooms || '1'}</span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <span className="text-[9px] text-stone-400 uppercase block font-bold">Этаж</span>
                        <span className="font-black text-neutral-900">
                          {property.floor ? `${property.floor}/${property.totalFloors || '—'}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {property.features && property.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {property.features.slice(0, 5).map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-stone-100 text-stone-800 text-[11px] font-bold rounded-md flex items-center gap-1 border border-stone-200"
                      >
                        <Check className="w-3 h-3 text-emerald-600" /> {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-neutral-950 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AgentBrandAvatar photo={agentPhoto} name={agentName} size="md" />
                    <div>
                      <span className="text-[9px] font-mono text-purple-400 uppercase block">
                        Персональный риэлтер
                      </span>
                      <h4 className="text-xs font-black text-white">{agentName}</h4>
                      <a
                        href={`tel:${agentPhone}`}
                        className="text-xs font-mono font-bold text-purple-400 hover:underline"
                      >
                        {agentPhone}
                      </a>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        г. Минск, ул. Репина, 4 • ООО «АН Фаттория»
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white text-neutral-900 px-3 py-2 rounded-xl border border-stone-200 shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="QR-код объекта"
                      className="w-14 h-14 object-contain rounded bg-white shrink-0"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left space-y-0.5 max-w-[120px]">
                      <span className="text-[9px] font-black uppercase text-purple-700 block leading-tight">
                        📱 Фотогалерея
                      </span>
                      <p className="text-[8.5px] text-stone-600 font-medium leading-tight">
                        Наведите камеру смартфона для просмотра
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATE 2: PRESENTATION */}
            {templateStyle === 'presentation' && (
              <div className="space-y-5">
                <div className="bg-neutral-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/30 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg">
                      Ф+
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-wider text-purple-400">
                        ООО «АН ФАТТОРИЯ»
                      </h1>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">
                        Агентство Недвижимости Минска • Лицензия Минюста РБ № 02240/446
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                      Персональное КП
                    </span>
                    <span className="text-xs font-bold text-purple-300 block font-mono">
                      № {property.id ? property.id.toUpperCase() : 'FP-2026'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {new Date().toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-900 text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
                        {property.type === 'apartment'
                          ? 'Квартира'
                          : property.type === 'house'
                          ? 'Дом / Коттедж'
                          : property.type === 'commercial'
                          ? 'Коммерция'
                          : 'Объект недвижимости'}
                      </span>
                      <h2 className="text-2xl font-black text-neutral-950 leading-tight">{property.title}</h2>
                      <p className="text-sm text-stone-600 font-semibold flex items-center gap-1.5 mt-1">
                        <MapPin className="w-4 h-4 text-purple-600 shrink-0" /> {property.address}
                      </p>
                    </div>

                    <div className="text-left md:text-right bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                      <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">
                        {(priceBYN || 0).toLocaleString()} BYN
                      </div>
                      <div className="text-sm font-extrabold text-stone-600 font-mono mt-0.5">
                        ≈ ${(priceUSD || 0).toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
                        {pricePerM2BYN.toLocaleString()} BYN / м² (${pricePerM2USD} / м²)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-200/60">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Общая площадь</span>
                      <span className="text-base font-black text-neutral-900 font-mono">{property.area} м²</span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-200/60">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Комнат</span>
                      <span className="text-base font-black text-neutral-900 font-mono">
                        {property.rooms || '—'}
                      </span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-200/60">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Этажность</span>
                      <span className="text-base font-black text-neutral-900 font-mono">
                        {property.floor ? `${property.floor}/${property.totalFloors || '—'}` : '—'}
                      </span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-200/60">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Юр. статус</span>
                      <span className="text-base font-black text-emerald-600 uppercase">Экспертиза 100%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-stone-200">
                    <WatermarkedImage
                      src={photos[activePhotoIndex]}
                      alt={property.title}
                      showWatermark={showWatermark}
                      watermarkSize="md"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length)
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full transition-all cursor-pointer print:hidden"
                          aria-label="Предыдущее фото"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex((activePhotoIndex + 1) % photos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-full transition-all cursor-pointer print:hidden"
                          aria-label="Следующее фото"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                          {activePhotoIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 print:grid-cols-4">
                      {photos.map((p: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`rounded-lg overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                            activePhotoIndex === idx
                              ? 'border-purple-500 scale-95 shadow-md'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={p}
                            alt="thumb"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                    <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" /> Описание объекта
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {property.description ||
                        'Уютный и светлый объект недвижимости в престижной локации Минска. Продуманная планировка, качественная отделка, развитая инфраструктура района и отличная транспортная доступность.'}
                    </p>
                    {property.features && property.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {property.features.map((feat, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-stone-100 text-stone-800 text-xs font-bold rounded-lg flex items-center gap-1 border border-stone-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                    <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                      <Compass className="w-4 h-4 text-purple-600" /> Район & Инфраструктура
                    </h4>
                    <div className="space-y-2.5 text-xs text-stone-700">
                      <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-150">
                        <span className="font-bold flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-stone-500" /> Метро & Транспорт
                        </span>
                        <span className="font-extrabold text-purple-700">5-10 мин. пешком</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-150">
                        <span className="font-bold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" /> Школы и гимназии
                        </span>
                        <span className="font-extrabold text-neutral-900">В шаговой доступности</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-150">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Парки и зоны отдыха
                        </span>
                        <span className="font-extrabold text-neutral-900">Экологичный район</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-150">
                        <span className="font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Юридическая чистота
                        </span>
                        <span className="font-extrabold text-emerald-600">Экспертиза 100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 text-white rounded-2xl p-5 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
                  <div className="flex items-center gap-4">
                    <AgentBrandAvatar photo={agentPhoto} name={agentName} size="xl" showBadge={true} />
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                        Ваш персональный риэлтер
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white">{agentName}</h3>
                      <p className="text-xs text-stone-300 font-semibold">{agentRole}</p>
                      <p className="text-[11px] text-stone-500">
                        Агентство недвижимости ООО «АН Фаттория» • ул. Репина, 4
                      </p>
                      <a
                        href={`tel:${agentPhone}`}
                        className="inline-flex items-center gap-1.5 text-purple-400 font-mono font-black text-sm hover:underline mt-1 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20"
                      >
                        <Phone className="w-3.5 h-3.5" /> {agentPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white text-neutral-900 p-3 rounded-xl border border-stone-200 shadow-md shrink-0 w-full md:w-auto">
                    <img
                      src={qrCodeUrl}
                      alt="QR код объекта"
                      className="w-16 h-16 object-contain rounded-lg bg-white shrink-0"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left space-y-0.5 max-w-[140px]">
                      <span className="text-[10px] font-black uppercase text-purple-700 flex items-center gap-1 leading-tight">
                        <QrCode className="w-3.5 h-3.5" /> Фотогалерея
                      </span>
                      <p className="text-[9px] text-stone-600 font-medium leading-tight">
                        Отсканируйте смартфоном для просмотра онлайн
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-extrabold text-center print:hidden flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {sentSuccess}
            </div>
          )}
        </div>

        {/* Direct Send Actions Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden shrink-0">
          <div className="text-xs font-bold text-stone-600 flex items-center justify-between">
            <span>
              Отправить клиенту <strong className="text-neutral-900">{recipientName}</strong>:
            </span>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Закрыть</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-stone-100 hover:bg-stone-200 text-neutral-800 border-stone-300'
              }`}
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-purple-600" />
              )}
              <span>{copied ? 'Скопировано' : 'Ссылка'}</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Telegram
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={handleShareViber}
              className="hidden md:flex px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-all items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Viber
            </button>
            <button
              onClick={handleShareEmail}
              className="hidden md:flex px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-xs rounded-xl transition-all items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Email
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Закрыть окно (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Закрыть</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}