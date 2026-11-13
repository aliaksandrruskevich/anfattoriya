"use client";
import React, { useState } from 'react';
import { ColdSeller, SellerFileAttachment, SellerStageComment, Agent, Property } from '../types';
import { 
  Plus, Clock, FileText, Paperclip, MessageSquare, Phone, MapPin, 
  DollarSign, Calendar, CheckCircle, AlertCircle, X, ChevronRight, 
  User, UploadCloud, Trash2, Eye, Sparkles, Send, Tag, Share2, 
  CheckCircle2, AlertTriangle, ArrowRight, MessageCircle, ExternalLink
} from 'lucide-react';
import { PublishSellerPropertyModal } from './PublishSellerPropertyModal';

interface SellerKanbanPipelineProps {
  sellersList: ColdSeller[];
  agentsList: Agent[];
  onUpdateSellers: (sellers: ColdSeller[]) => void;
  onConvertSellerToProperty?: (seller: ColdSeller) => void;
  onPublishSellerProperty?: (property: Property, updatedSeller: ColdSeller) => void;
  loggedInAgent?: Agent | null;
  onAssignAgent?: (sellerId: string, agentName: string) => void;
  canAssignAgent?: boolean;
  onDeleteSeller?: (sellerId: string) => void;
  canDeleteSeller?: (seller: ColdSeller) => boolean;
}

const STAGES = [
  { id: 'primary_contact', title: '1. Первичный контакт', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { id: 'evaluation', title: '2. Выезд на оценку', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'contract', title: '3. Подписание договора', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'listing', title: '4. Размещение на сайтах', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'showing', title: '5. Показы объекта', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'negotiation', title: '6. Торг / Согласование', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'deal', title: '7. Сделка (Завершено)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'rejected', title: '8. Отказ', color: 'bg-rose-100 text-rose-900 border-rose-300' },
];

const PREDEFINED_TAGS = ['🔥 Срочно', '⭐ Эксклюзив', '🔑 Чистая продажа', '🔄 Встречка', '🏦 Ипотека'];

export default function SellerKanbanPipeline({
  sellersList,
  agentsList,
  onUpdateSellers,
  onConvertSellerToProperty,
  onPublishSellerProperty,
  loggedInAgent,
  onAssignAgent,
  canAssignAgent = false,
  onDeleteSeller,
  canDeleteSeller
}: SellerKanbanPipelineProps) {
  const [selectedSeller, setSelectedSeller] = useState<ColdSeller | null>(null);
  const [sellerToPublish, setSellerToPublish] = useState<ColdSeller | null>(null);
  const [newComment, setNewComment] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('14:00');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'contract' | 'photo' | 'doc'>('contract');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4500);
  };

  // Move card to new stage
  const handleMoveStage = (sellerId: string, newStage: string) => {
    const target = sellersList.find(s => s.id === sellerId);
    let status = target?.status || 'active';
    if (newStage === 'deal') status = 'completed';
    if (newStage === 'rejected') status = 'rejected';
    if (newStage === 'evaluation' || newStage === 'contract' || newStage === 'listing') status = 'active';

    const stageTitle = STAGES.find(st => st.id === newStage)?.title || newStage;
    const comment: SellerStageComment = {
      id: `cmt-${Date.now()}`,
      date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      stage: newStage,
      text: `Этап изменен на: ${stageTitle}`,
      author: loggedInAgent?.name || 'Риэлтор'
    };

    const updated = sellersList.map(s => {
      if (s.id === sellerId) {
        return {
          ...s,
          kanbanStage: newStage as any,
          status: status,
          commentsHistory: [comment, ...(s.commentsHistory || [])]
        };
      }
      return s;
    });

    onUpdateSellers(updated);

    if (selectedSeller && selectedSeller.id === sellerId) {
      setSelectedSeller({
        ...selectedSeller,
        kanbanStage: newStage as any,
        status: status,
        commentsHistory: [comment, ...(selectedSeller.commentsHistory || [])]
      });
    }

    // If moved to contract stage, prompt to publish on site!
    if (newStage === 'contract' && target) {
      if (window.confirm(`Договор с продавцом ${target.name} подписан! Опубликовать объект недвижимости на сайте прямо сейчас?`)) {
        setSellerToPublish(target);
      }
    }
  };

  // Point 2: One-Tap Call Logging Actions
  const handleQuickCallLog = (seller: ColdSeller, type: 'no_answer' | 'thinking' | 'meeting' | 'contract') => {
    let nextDate = '';
    let nextTime = '11:00';
    let commentText = '';
    let nextStage = seller.kanbanStage || 'primary_contact';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const in3DaysStr = in3Days.toISOString().split('T')[0];

    if (type === 'no_answer') {
      nextDate = tomorrowStr;
      nextTime = '11:00';
      commentText = '📞 Звонок: Не дозвонился. Установлен авто-перезвон на завтра в 11:00.';
      showToast(`Напоминание установлено: Перезвонить ${seller.name} завтра в 11:00`);
    } else if (type === 'thinking') {
      nextDate = in3DaysStr;
      nextTime = '14:00';
      commentText = '⏳ Продавец думает, уточняет детали с семьей. Перезвонить через 3 дня.';
      showToast(`Напоминание: Звонок ${seller.name} запланирован через 3 дня`);
    } else if (type === 'meeting') {
      nextDate = tomorrowStr;
      nextTime = '16:00';
      nextStage = 'evaluation';
      commentText = '🤝 Назначена встреча и выезд эксперта для оценки объекта на объекте!';
      showToast(`Встреча зафиксирована! Этап переведен в «Выезд на оценку»`);
    } else if (type === 'contract') {
      nextStage = 'contract';
      commentText = '📜 Договор согласован и подписан! Готов к публикации на витрине сайта.';
      setSellerToPublish(seller);
    }

    const comment: SellerStageComment = {
      id: `cmt-${Date.now()}`,
      date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      stage: nextStage,
      text: commentText,
      author: loggedInAgent?.name || 'Специалист'
    };

    const updated = sellersList.map(s => {
      if (s.id === seller.id) {
        return {
          ...s,
          kanbanStage: nextStage,
          nextContactDate: nextDate || s.nextContactDate,
          nextContactTime: nextTime || s.nextContactTime,
          commentsHistory: [comment, ...(s.commentsHistory || [])]
        };
      }
      return s;
    });

    onUpdateSellers(updated);

    if (selectedSeller && selectedSeller.id === seller.id) {
      setSelectedSeller({
        ...selectedSeller,
        kanbanStage: nextStage,
        nextContactDate: nextDate || selectedSeller.nextContactDate,
        nextContactTime: nextTime || selectedSeller.nextContactTime,
        commentsHistory: [comment, ...(selectedSeller.commentsHistory || [])]
      });
    }
  };

  // Add Comment
  const handleAddComment = () => {
    if (!selectedSeller || !newComment.trim()) return;
    const comment: SellerStageComment = {
      id: `cmt-${Date.now()}`,
      date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      stage: selectedSeller.kanbanStage || 'primary_contact',
      text: newComment.trim(),
      author: loggedInAgent?.name || 'Риэлтор'
    };

    const updated = sellersList.map(s => {
      if (s.id === selectedSeller.id) {
        return {
          ...s,
          commentsHistory: [comment, ...(s.commentsHistory || [])]
        };
      }
      return s;
    });

    onUpdateSellers(updated);
    setSelectedSeller({
      ...selectedSeller,
      commentsHistory: [comment, ...(selectedSeller.commentsHistory || [])]
    });
    setNewComment('');
  };

  // Set Callback Date & Time
  const handleSetCallback = () => {
    if (!selectedSeller || !callbackDate) return;
    const updated = sellersList.map(s => {
      if (s.id === selectedSeller.id) {
        return {
          ...s,
          nextContactDate: callbackDate,
          nextContactTime: callbackTime,
        };
      }
      return s;
    });

    onUpdateSellers(updated);
    setSelectedSeller({
      ...selectedSeller,
      nextContactDate: callbackDate,
      nextContactTime: callbackTime
    });
    showToast(`Напоминание о звонке на ${callbackDate} в ${callbackTime} успешно установлено!`);
  };

  // Upload File Attachment
  const handleAttachFile = () => {
    if (!selectedSeller || !uploadFileName.trim()) return;

    const attachment: SellerFileAttachment = {
      id: `att-${Date.now()}`,
      name: uploadFileName.trim(),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} МБ`,
      type: uploadFileType,
      url: uploadFileType === 'photo' 
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        : '#',
      uploadedAt: new Date().toLocaleDateString('ru-RU')
    };

    const updated = sellersList.map(s => {
      if (s.id === selectedSeller.id) {
        return {
          ...s,
          attachments: [attachment, ...(s.attachments || [])]
        };
      }
      return s;
    });

    onUpdateSellers(updated);
    setSelectedSeller({
      ...selectedSeller,
      attachments: [attachment, ...(selectedSeller.attachments || [])]
    });
    setUploadFileName('');
  };

  // Toggle Tag on Seller
  const handleToggleTag = (seller: ColdSeller, tag: string) => {
    const currentTags = seller.tags || [];
    const exists = currentTags.includes(tag);
    const updatedTags = exists ? currentTags.filter(t => t !== tag) : [...currentTags, tag];

    const updated = sellersList.map(s => s.id === seller.id ? { ...s, tags: updatedTags } : s);
    onUpdateSellers(updated);
    if (selectedSeller && selectedSeller.id === seller.id) {
      setSelectedSeller({ ...selectedSeller, tags: updatedTags });
    }
  };

  // Instant Telegram/WhatsApp message to Seller
  const handleOpenMessenger = (seller: ColdSeller, channel: 'telegram' | 'whatsapp') => {
    const agentName = loggedInAgent?.name || 'Гордович Кирилл';
    const message = `Здравствуйте, ${seller.name}! Меня зовут ${agentName}, агентство недвижимости «Фаттория». Я назначен вашим персональным экспертом по объекту (${seller.address}). Когда вам удобно обсудить вопросы по продаже и оценке?`;

    const cleanPhone = seller.phone.replace(/[^\d]/g, '');

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent('https://fattoriaminsk')}&text=${encodeURIComponent(message)}`, '_blank');
    }
    showToast(`Сообщение подготовлено для отправки через ${channel.toUpperCase()}!`);
  };

  // Filter sellers by tag
  const filteredSellers = sellersList.filter(s => {
    if (filterTag === 'all') return true;
    return s.tags?.includes(filterTag);
  });

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      
      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-amber-400 border border-amber-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Pipeline Filter Bar & Quick Stats */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-stone-600 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-500" /> Фильтр по тегам:
          </span>
          <button
            type="button"
            onClick={() => setFilterTag('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              filterTag === 'all' ? 'bg-neutral-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Все ({sellersList.length})
          </button>
          {PREDEFINED_TAGS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterTag(filterTag === t ? 'all' : t)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                filterTag === t ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 font-bold">
          <span>Всего в воронке: <strong className="text-neutral-900">{sellersList.length}</strong></span>
          <span>•</span>
          <span>Общая сумма: <strong className="text-amber-600 font-black">
            ${sellersList.reduce((acc, s) => acc + (s.askingPriceUSD || Math.round((s.askingPriceBYN || 0) / 3.27)), 0).toLocaleString()}
          </strong></span>
        </div>
      </div>

      {/* Kanban Board Horizontal Scrolling Canvas */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar min-h-[550px]">
        {STAGES.map(stage => {
          const stageSellers = filteredSellers.filter(s => (s.kanbanStage || 'primary_contact') === stage.id);
          const stageTotalUSD = stageSellers.reduce((acc, s) => acc + (s.askingPriceUSD || Math.round((s.askingPriceBYN || 0) / 3.27)), 0);

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 bg-stone-100/90 border border-stone-250 rounded-2xl p-3 flex flex-col justify-between max-h-[750px]"
            >
              {/* Column Header with Stage Sum and Count */}
              <div className="pb-2.5 border-b border-stone-250 mb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${stage.color}`}>
                    {stage.title}
                  </span>
                  <span className="text-xs font-mono font-black text-stone-600 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                    {stageSellers.length}
                  </span>
                </div>
                {stageSellers.length > 0 && (
                  <div className="text-[10px] font-mono font-bold text-stone-500 px-1">
                    Сумма: <span className="text-amber-700 font-extrabold">${stageTotalUSD.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Cards Container */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {stageSellers.length === 0 ? (
                  <div className="p-5 text-center text-stone-400 text-xs font-semibold italic border border-dashed border-stone-300 rounded-xl">
                    Нет продавцов на этом этапе
                  </div>
                ) : (
                  stageSellers.map(seller => {
                    const isOverdue = seller.nextContactDate && seller.nextContactDate < todayStr;
                    const isToday = seller.nextContactDate && seller.nextContactDate === todayStr;

                    return (
                      <div
                        key={seller.id}
                        onClick={() => setSelectedSeller(seller)}
                        className={`bg-white hover:bg-stone-50 border rounded-2xl p-3.5 shadow-xs cursor-pointer transition-all space-y-2.5 group ${
                          isOverdue 
                            ? 'border-rose-400 ring-2 ring-rose-300/40 bg-rose-50/20' 
                            : isToday 
                              ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/20' 
                              : 'border-stone-200 hover:border-amber-500'
                        }`}
                      >
                        {/* Header: Name, Price, Type */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h5 className="font-extrabold text-xs text-neutral-950 group-hover:text-amber-600 transition-colors">
                              {seller.name}
                            </h5>
                            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" /> {seller.address || 'Адрес не указан'}
                            </p>
                          </div>

                          <span className="text-xs font-black font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                            ${(seller.askingPriceUSD || Math.round((seller.askingPriceBYN || 0) / 3.27)).toLocaleString()}
                          </span>
                        </div>

                        {/* Overdue / Callback Alert Badge */}
                        {isOverdue && (
                          <div className="p-1.5 bg-rose-100/90 border border-rose-300 text-rose-900 rounded-xl text-[10px] font-black flex items-center gap-1.5 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>ПРОСРОЧЕН ЗВОНОК! ({seller.nextContactDate})</span>
                          </div>
                        )}
                        {!isOverdue && isToday && (
                          <div className="p-1.5 bg-amber-100/90 border border-amber-300 text-amber-950 rounded-xl text-[10px] font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Звонок сегодня в {seller.nextContactTime || '14:00'}</span>
                          </div>
                        )}

                        {/* Tags Pill */}
                        {seller.tags && seller.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {seller.tags.map(t => (
                              <span key={t} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Responsible Agent Badge */}
                        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                          <span className="font-bold flex items-center gap-1">
                            <User className="w-3 h-3 text-stone-400" />
                            {seller.assignedAgentName || 'В общем пуле'}
                          </span>
                          <span className="font-mono text-stone-400">
                            {seller.dateAdded}
                          </span>
                        </div>

                        {/* Point 2: One-Tap Quick Actions Bar */}
                        <div className="pt-2 border-t border-stone-100 grid grid-cols-4 gap-1">
                          <button
                            type="button"
                            title="Не дозвонился (авто-перезвон на завтра)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCallLog(seller, 'no_answer');
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black border border-rose-200 text-center transition-all cursor-pointer"
                          >
                            📞 Сброс
                          </button>

                          <button
                            type="button"
                            title="Клиент думает (перезвонить через 3 дня)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCallLog(seller, 'thinking');
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[9px] font-black border border-amber-200 text-center transition-all cursor-pointer"
                          >
                            ⏳ Думает
                          </button>

                          <button
                            type="button"
                            title="Назначить встречу на объекте"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCallLog(seller, 'meeting');
                            }}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[9px] font-black border border-indigo-200 text-center transition-all cursor-pointer"
                          >
                            🤝 Встреча
                          </button>

                          <button
                            type="button"
                            title="Договор подписан / Создать объект"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSellerToPublish(seller);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-black border border-emerald-200 text-center transition-all cursor-pointer"
                          >
                            🔥 Договор
                          </button>
                        </div>

                        {/* Point 1: Prominent "Publish to Website" Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSellerToPublish(seller);
                          }}
                          className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-[10px] uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                          <span>{seller.publishedPropertyId ? 'Обновить объект на сайте' : 'Опубликовать на сайте'}</span>
                        </button>

                        {/* Quick Stage Move Dropdown */}
                        <div className="pt-0.5">
                          <select
                            value={seller.kanbanStage || 'primary_contact'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleMoveStage(seller.id, e.target.value)}
                            className="w-full bg-stone-50 border border-stone-250 text-[10px] font-bold text-neutral-800 rounded-xl px-2 py-1 outline-none cursor-pointer hover:bg-stone-100"
                          >
                            {STAGES.map(st => (
                              <option key={st.id} value={st.id}>{st.title}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seller Modal Details */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-neutral-950 text-white p-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white">{selectedSeller.name}</h3>
                    {selectedSeller.publishedPropertyId && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded border border-emerald-500/30">
                        Опубликован на сайте
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{selectedSeller.phone}</span> • <span>{selectedSeller.address}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Point 1: Create / Publish Property from Seller CTA */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Публикация объекта на сайте
                  </div>
                  <p className="text-xs text-stone-600 font-medium">
                    {selectedSeller.publishedPropertyId 
                      ? 'Объект уже размещен на сайте. Нажмите для редактирования параметров.'
                      : 'Перенесите данные продавца в каталог недвижимости агентства в 1 клик!'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSellerToPublish(selectedSeller);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedSeller.publishedPropertyId ? 'Редактировать на сайте' : 'Создать объект на сайте'}</span>
                </button>
              </div>

              {/* Point 4: Messenger Action Bar */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-indigo-600" /> Связаться с продавцом в мессенджере:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMessenger(selectedSeller, 'telegram')}
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Telegram</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMessenger(selectedSeller, 'whatsapp')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Responsible Realtor Assignment */}
              <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-black text-purple-900 tracking-wider block">
                    Ответственный риэлтер
                  </span>
                  <span className="text-xs font-bold text-stone-700">
                    {selectedSeller.assignedAgentName 
                      ? `Закреплен: ${selectedSeller.assignedAgentName}`
                      : 'В общем пуле (риэлтер пока не назначен)'}
                  </span>
                </div>

                {canAssignAgent ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSeller.assignedAgentName || ''}
                      onChange={(e) => {
                        const newAgName = e.target.value;
                        if (onAssignAgent) {
                          onAssignAgent(selectedSeller.id, newAgName);
                        } else {
                          const updated = sellersList.map(s => s.id === selectedSeller.id ? {
                            ...s,
                            assignedAgentName: newAgName || '',
                            assignedAgentId: agentsList.find(a => a.name === newAgName)?.id || ''
                          } : s);
                          onUpdateSellers(updated);
                        }
                        setSelectedSeller({
                          ...selectedSeller,
                          assignedAgentName: newAgName || '',
                          assignedAgentId: agentsList.find(a => a.name === newAgName)?.id || ''
                        });
                        showToast(`🔔 Уведомление отправлено риэлтеру ${newAgName || 'в общий пул'}!`);
                      }}
                      className="bg-white border border-purple-300 text-xs font-bold text-purple-950 rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">📥 Без назначения (в общий пул)</option>
                      {agentsList.filter(a => !a.isDismissed && a.status !== 'dismissed' && !a.isAdmin && a.id !== 'admin' && a.id !== 'call-center').map(ag => (
                        <option key={ag.id} value={ag.name}>
                          👤 {ag.name} ({ag.role || 'Риэлтер'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs font-bold rounded-lg shadow-2xs">
                    {selectedSeller.assignedAgentName || 'Назначен вам'}
                  </span>
                )}
              </div>

              {/* Tags Editor */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Теги продавца</span>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => {
                    const active = selectedSeller.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(selectedSeller, tag)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          active 
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-black' 
                            : 'bg-stone-50 text-stone-600 border-stone-250 hover:bg-stone-100'
                        }`}
                      >
                        {active ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage & Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Этап воронки</label>
                  <select
                    value={selectedSeller.kanbanStage || 'primary_contact'}
                    onChange={(e) => handleMoveStage(selectedSeller.id, e.target.value)}
                    className="w-full bg-white border border-stone-300 font-extrabold text-xs text-neutral-900 rounded-xl p-2.5 outline-none"
                  >
                    {STAGES.map(st => (
                      <option key={st.id} value={st.id}>{st.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Статус продавца</label>
                  <select
                    value={selectedSeller.status}
                    onChange={(e) => {
                      const st = e.target.value;
                      const updated = sellersList.map(s => s.id === selectedSeller.id ? { ...s, status: st } : s);
                      onUpdateSellers(updated);
                      setSelectedSeller({ ...selectedSeller, status: st });
                    }}
                    className="w-full bg-white border border-stone-300 font-extrabold text-xs text-neutral-900 rounded-xl p-2.5 outline-none"
                  >
                    <option value="active">🟢 Активный (объект в работе)</option>
                    <option value="deferred">🟡 Отложенный (клиент думает)</option>
                    <option value="rejected">🔴 Отказ (не готовит к продаже)</option>
                    <option value="completed">🎉 Завершено (сделка закрыта)</option>
                  </select>
                </div>
              </div>

              {/* Callback Scheduler */}
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                <h5 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Назначить перезвон / задачу с авто-напоминанием
                </h5>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    value={callbackDate || selectedSeller.nextContactDate || ''}
                    onChange={(e) => setCallbackDate(e.target.value)}
                    className="bg-white border border-indigo-200 text-xs text-neutral-900 rounded-xl px-3 py-2 font-bold outline-none flex-1"
                  />
                  <input
                    type="time"
                    value={callbackTime || selectedSeller.nextContactTime || '14:00'}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="bg-white border border-indigo-200 text-xs text-neutral-900 rounded-xl px-3 py-2 font-mono font-bold outline-none sm:w-32"
                  />
                  <button
                    type="button"
                    onClick={handleSetCallback}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Установить звонок
                  </button>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 border-t border-stone-200 pt-4">
                <h5 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-amber-500" /> Файлы и документы (Google Cloud Storage)
                </h5>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Название файла (например: Скан_договора_2026.pdf)"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="bg-stone-50 border border-stone-250 text-xs text-neutral-900 rounded-xl px-3 py-2 font-medium outline-none flex-1"
                  />
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="bg-stone-50 border border-stone-250 text-xs text-neutral-900 rounded-xl px-3 py-2 font-bold outline-none sm:w-36"
                  >
                    <option value="contract">📄 Договор</option>
                    <option value="photo">📷 Фото объекта</option>
                    <option value="doc">📁 Документы</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAttachFile}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Загрузить
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {selectedSeller.attachments?.map((att) => (
                    <div key={att.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate text-neutral-900">{att.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0 pl-2">{att.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Timeline & Comments */}
              <div className="space-y-3 border-t border-stone-200 pt-4">
                <h5 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" /> История комментариев и этапов
                </h5>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Напишите комментарий по этапу или торгу..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="bg-stone-50 border border-stone-250 text-xs text-neutral-900 rounded-xl px-3 py-2 font-medium outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Добавить
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {selectedSeller.commentsHistory?.map((cmt) => (
                    <div key={cmt.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold">
                        <span>{cmt.author}</span>
                        <span>{cmt.date}</span>
                      </div>
                      <p className="text-neutral-900 font-semibold">{cmt.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Seller Action */}
              {(!canDeleteSeller || canDeleteSeller(selectedSeller)) && (
                <div className="pt-4 border-t border-stone-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Вы уверены, что хотите удалить продавца ${selectedSeller.name} из базы?`)) {
                        if (onDeleteSeller) {
                          onDeleteSeller(selectedSeller.id);
                        } else {
                          const updated = sellersList.filter(s => s.id !== selectedSeller.id);
                          onUpdateSellers(updated);
                        }
                        setSelectedSeller(null);
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Удалить продавца</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Point 1: Publish Property Modal */}
      {sellerToPublish && (
        <PublishSellerPropertyModal
          seller={sellerToPublish}
          onClose={() => setSellerToPublish(null)}
          loggedInAgent={loggedInAgent}
          agentsList={agentsList}
          onPublish={(property, updatedSeller) => {
            if (onPublishSellerProperty) {
              onPublishSellerProperty(property, updatedSeller);
            }
            setSellerToPublish(null);
            showToast(`🔥 Объект "${property.title}" успешно создан и опубликован на сайте!`);
          }}
        />
      )}

    </div>
  );
}
