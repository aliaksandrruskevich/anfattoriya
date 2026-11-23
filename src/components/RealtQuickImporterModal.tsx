"use client";
import React, { useState } from 'react';
import { X, Link, Search, Save, AlertCircle, Building, MapPin, Maximize, Layers, DollarSign, Camera, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Property, Agent } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RealtQuickImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (prop: Property) => void;
  loggedInAgent?: Agent | null;
}

export default function RealtQuickImporterModal({ isOpen, onClose, onImport, loggedInAgent }: RealtQuickImporterModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Property | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleParse = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const response = await fetch('/api/parse-realt-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      if (data.success && data.property) {
        setParsedData(data.property);
      } else {
        setError(data.error || "Не удалось распознать объект по этой ссылке.");
      }
    } catch (err) {
      setError("Ошибка при подключении к серверу парсинга.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!parsedData) return;
    setIsSaving(true);
    
    // Enrich with current agent info
    const enrichedProp: Property = {
      ...parsedData,
      assignedAgentId: loggedInAgent?.id,
      assignedAgentName: loggedInAgent?.name,
      agentName: loggedInAgent?.name,
      agentPhone: loggedInAgent?.phone,
      isPublished: false,
      isClosedBase: true,
      contractStatus: 'not_signed',
      status: 'draft',
      id: `draft-${Date.now()}`
    };

    setTimeout(() => {
      onImport(enrichedProp);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">Импорт с Realt.by</h2>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Автоматическое распознавание объекта</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Input Area */}
          <div className="space-y-4 mb-6">
            <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-1.5 ml-1">
              Ссылка на объявление (Realt / Kufar)
            </label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="https://realt.by/flat-for-sale/object/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-stone-50 border-2 border-stone-100 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-all font-medium text-stone-900"
              />
              <button
                onClick={handleParse}
                disabled={isLoading || !url.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Распознать
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </motion.div>
            )}

            {parsedData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={parsedData.photo} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-stone-900/80 backdrop-blur-md rounded-md text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Camera className="w-3 h-3" /> Фото распознано
                    </div>
                  </div>

                  {/* Main Stats */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-stone-900 leading-tight">{parsedData.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-stone-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{parsedData.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <span className="block text-[9px] font-black text-stone-400 uppercase mb-1">Стоимость</span>
                        <span className="text-lg font-black text-stone-900">${parsedData.priceUSD?.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="block text-[9px] font-black text-emerald-600/70 uppercase mb-1">В рублях</span>
                        <span className="text-lg font-black text-emerald-700">{parsedData.priceBYN?.toLocaleString()} р.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase">Комнат</span>
                      <span className="text-sm font-bold text-stone-800">{parsedData.rooms}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                      <Maximize className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase">Площадь</span>
                      <span className="text-sm font-bold text-stone-800">{parsedData.area} м²</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                      <Building className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase">Этаж</span>
                      <span className="text-sm font-bold text-stone-800">{parsedData.floor}/{parsedData.totalFloors}</span>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="block text-[9px] font-black text-stone-400 uppercase mb-2">Описание объекта</span>
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 italic">
                    "{parsedData.description}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Сохранить в черновики CRM
                  </button>
                  <button
                    onClick={() => { setParsedData(null); setUrl(''); }}
                    className="px-6 py-4 border-2 border-stone-100 text-stone-500 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-stone-50 transition-all"
                  >
                    Сбросить
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!parsedData && !isLoading && !error && (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-stone-400" />
              </div>
              <p className="text-sm font-medium text-stone-500 max-w-xs uppercase tracking-widest">
                Вставьте ссылку на Realt.by, чтобы мгновенно импортировать все параметры объекта
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
