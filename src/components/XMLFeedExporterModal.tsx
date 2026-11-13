"use client";
import React, { useState } from 'react';
import { Property } from '../types';
import { Rss, Copy, Download, Check, AlertCircle, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface XMLFeedExporterModalProps {
  propertiesList: Property[];
  onClose: () => void;
}

export const XMLFeedExporterModal: React.FC<XMLFeedExporterModalProps> = ({
  propertiesList,
  onClose,
}) => {
  const [targetPlatform, setTargetPlatform] = useState<'realt' | 'kufar' | 'yandex'>('realt');
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Generate XML Feed string according to real estate aggregator standards
  const generateXMLFeed = () => {
    const activeProperties = propertiesList.filter((p) => p.priceBYN && p.priceBYN > 0);
    const dateNow = new Date().toISOString();

    if (targetPlatform === 'realt') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<realt-feed version="2.0" updated="${dateNow}">
  <agency>
    <name>АН Фаттория</name>
    <phone>+375 29 638-00-53</phone>
    <email>fattoria1900088@gmail.com</email>
    <website>https://fattoria.by</website>
  </agency>
  <offers>
${activeProperties
  .map(
    (p) => `    <offer internal-id="${p.id}">
      <type>${p.type}</type>
      <category>sale</category>
      <title><![CDATA[${p.title}]]></title>
      <location>
        <country>Беларусь</country>
        <region>Минская область</region>
        <locality>Минск</locality>
        <address><![CDATA[${p.address}]]></address>
      </location>
      <price>
        <value>${p.priceBYN}</value>
        <currency>BYN</currency>
        <value-usd>${p.priceUSD || Math.round(p.priceBYN / 3.27)}</value-usd>
      </price>
      <area>
        <value>${p.area}</value>
        <unit>sq.m</unit>
      </area>
      ${p.rooms ? `<rooms>${p.rooms}</rooms>` : ''}
      ${p.floor ? `<floor>${p.floor}</floor>` : ''}
      ${p.totalFloors ? `<floors-total>${p.totalFloors}</floors-total>` : ''}
      <photo>${p.photo}</photo>
      <agent>
        <name>${p.agentName || 'АН Фаттория'}</name>
        <phone>+375 29 638-00-53</phone>
      </agent>
    </offer>`
  )
  .join('\n')}
  </offers>
</realt-feed>`;
    } else if (targetPlatform === 'kufar') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<kufar-realty-feed date="${dateNow}">
${activeProperties
  .map(
    (p) => `  <ad id="${p.id}">
    <category>realty</category>
    <subject><![CDATA[${p.title}]]></subject>
    <address><![CDATA[${p.address}]]></address>
    <price_byn>${p.priceBYN}</price_byn>
    <area_total>${p.area}</area_total>
    <rooms>${p.rooms || 1}</rooms>
    <photo_url>${p.photo}</photo_url>
  </ad>`
  )
  .join('\n')}
</kufar-realty-feed>`;
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>
<realty-feed xmlns="http://webmaster.yandex.ru/schemas/feed/realty/1.0">
  <generation-date>${dateNow}</generation-date>
${activeProperties
  .map(
    (p) => `  <offer internal-id="${p.id}">
    <type>продажа</type>
    <property-type>жилая</property-type>
    <category>${p.type === 'house' ? 'дом' : p.type === 'commercial' ? 'коммерческая' : 'квартира'}</category>
    <creation-date>${dateNow}</creation-date>
    <location>
      <country>Беларусь</country>
      <locality-name>Минск</locality-name>
      <address>${p.address}</address>
    </location>
    <sales-agent>
      <name>${p.agentName || 'Агентство АН Фаттория'}</name>
      <phone>+375 29 638-00-53</phone>
      <category>agency</category>
      <organization>АН Фаттория</organization>
    </sales-agent>
    <price>
      <value>${p.priceBYN}</value>
      <currency>BYN</currency>
    </price>
    <image>${p.photo}</image>
    <area>
      <value>${p.area}</value>
      <unit>кв. м</unit>
    </area>
  </offer>`
  )
  .join('\n')}
</realty-feed>`;
    }
  };

  const xmlOutput = generateXMLFeed();

  const handleCopyXML = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadXML = () => {
    const blob = new Blob([xmlOutput], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${targetPlatform}_feed_fattoria.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Rss className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Экспорт XML-Фидов для Площадок Недвижимости
              </h3>
              <p className="text-[11px] text-neutral-400">
                Автоматическая выгрузка в Realt.by, Kufar.by и Яндекс.Недвижимость
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target selector */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTargetPlatform('realt')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                targetPlatform === 'realt'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider">Realt.by</div>
              <p className="text-[10px] opacity-70 mt-1">Главная площадка Беларуси (XML v2.0)</p>
            </button>

            <button
              onClick={() => setTargetPlatform('kufar')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                targetPlatform === 'kufar'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider">Kufar.by Недвижимость</div>
              <p className="text-[10px] opacity-70 mt-1">Крупнейший портал объявлений</p>
            </button>

            <button
              onClick={() => setTargetPlatform('yandex')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                targetPlatform === 'yandex'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider">Яндекс.Недвижимость</div>
              <p className="text-[10px] opacity-70 mt-1">Международный формат Яндекс</p>
            </button>
          </div>

          {/* Validation stats */}
          <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Готово к выгрузке объектов: <strong>{propertiesList.length}</strong>
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Обновление: {new Date().toLocaleTimeString('ru-RU')}
            </div>
          </div>

          {/* Code View */}
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleCopyXML}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано!' : 'Копировать XML'}
              </button>
              <button
                onClick={handleDownloadXML}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                Скачать .xml
              </button>
            </div>

            <pre className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-[11px] text-stone-300 font-mono overflow-auto leading-relaxed">
              {xmlOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
