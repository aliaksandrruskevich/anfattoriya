"use client";
import React, { useState } from 'react';
import { ColdSeller, Property, Agent } from '../types';
import { X, Sparkles, Building, MapPin, DollarSign, FileSignature, CheckCircle, ExternalLink, Image, Tag, Eye } from 'lucide-react';
import { getNbrbRate } from '../utils/exchangeRate';

interface PublishSellerPropertyModalProps {
  seller: ColdSeller;
  onClose: () => void;
  onPublish: (property: Property, updatedSeller: ColdSeller) => void;
  loggedInAgent?: Agent | null;
  agentsList?: Agent[];
}

export const PublishSellerPropertyModal: React.FC<PublishSellerPropertyModalProps> = ({
  seller,
  onClose,
  onPublish,
  loggedInAgent,
  agentsList = []
}) => {
  const currentRate = getNbrbRate() || 3.27;
  const initialUSD = seller.askingPriceUSD ?? Math.round((seller.askingPriceBYN || 0) / currentRate);
  const initialBYN = seller.askingPriceBYN || Math.round(initialUSD * currentRate);

  const [title, setTitle] = useState(() => {
    const typeLabel = seller.propertyType === 'apartment' ? 'Квартира' :
                     seller.propertyType === 'house' ? 'Дом / Коттедж' :
                     seller.propertyType === 'commercial' ? 'Коммерческое помещение' : 'Земельный участок';
    return `${typeLabel}, ${seller.address || 'г. Минск'}`;
  });

  const [propertyType, setPropertyType] = useState<Property['type']>(seller.propertyType || 'apartment');
  const [address, setAddress] = useState(seller.address || '');
  const [priceUSD, setPriceUSD] = useState<number>(initialUSD);
  const [priceBYN, setPriceBYN] = useState<number>(initialBYN);
  const [rooms, setRooms] = useState<number>(seller.rooms || 2);
  const [area, setArea] = useState<number>(seller.area || 65);
  const [floor, setFloor] = useState<number>(seller.floor || 5);
  const [totalFloors, setTotalFloors] = useState<number>(seller.totalFloors || 9);
  const [contractNumber, setContractNumber] = useState(seller.contractNumber || `ФАТ-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  const [contractDate, setContractDate] = useState(seller.contractDate || new Date().toISOString().split('T')[0]);
  const [assignedAgentName, setAssignedAgentName] = useState(seller.assignedAgentName || loggedInAgent?.name || 'Гордович Кирилл');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [description, setDescription] = useState(
    seller.notes 
      ? `Эксклюзивное предложение от агентства недвижимости «Фаттория». ${seller.notes}`
      : 'Светлая, просторная недвижимость с отличной планировкой. Чистая продажа, быстрое оформление.'
  );

  const getPhotosByType = (type: string) => {
    switch (type) {
      case 'house':
        return [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ];
      case 'commercial':
        return [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
        ];
      case 'plot':
        return [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
        ];
      case 'apartment':
      default:
        return [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ];
    }
  };

  const defaultPhotos = getPhotosByType(propertyType);

  const [selectedPhoto, setSelectedPhoto] = useState<string>(() => {
    const photoAttachment = seller.attachments?.find(a => a.type === 'photo');
    return photoAttachment ? photoAttachment.url : defaultPhotos[0];
  });

  const handlePriceUSDChange = (val: number) => {
    setPriceUSD(val);
    setPriceBYN(Math.round(val * currentRate));
  };

  const handlePriceBYNChange = (val: number) => {
    setPriceBYN(val);
    setPriceUSD(Math.round(val / currentRate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Пожалуйста, укажите точный адрес объекта.');
      return;
    }
    if (!priceUSD || priceUSD <= 0) {
      alert('Пожалуйста, укажите стоимость объекта.');
      return;
    }

    const assignedAgentObj = agentsList.find(a => a.name === assignedAgentName);
    const newPropertyId = `prop-seller-${Date.now()}`;

    const newProperty: Property = {
      id: newPropertyId,
      title: title.trim(),
      type: propertyType,
      address: address.trim(),
      priceUSD: Number(priceUSD),
      priceBYN: Number(priceBYN),
      rooms: propertyType === 'apartment' ? Number(rooms) : undefined,
      area: Number(area) || 60,
      floor: propertyType === 'apartment' ? Number(floor) : undefined,
      totalFloors: propertyType === 'apartment' ? Number(totalFloors) : undefined,
      photo: selectedPhoto,
      features: [
        'Эксклюзивный договор АН Фаттория',
        `Договор № ${contractNumber}`,
        propertyType === 'apartment' ? `${rooms}-комнатная` : 'Готов к проживанию',
        'Юридическая чистота сделки'
      ],
      description: description.trim(),
      agentName: assignedAgentName,
      assignedAgentId: assignedAgentObj?.id || seller.assignedAgentId || loggedInAgent?.id,
      assignedAgentName: assignedAgentName,
      sellerPhone: seller.phone,
      isPublished: isPublished,
      isClosedBase: !isPublished,
      crmOnly: false,
      contractStatus: 'signed',
      contractNumber: contractNumber,
      contractDate: contractDate,
      source: 'crm_seller_contract',
      lat: 53.9045 + (Math.random() - 0.5) * 0.05,
      lng: 27.5615 + (Math.random() - 0.5) * 0.05
    };

    const updatedSeller: ColdSeller = {
      ...seller,
      status: 'contract_signed',
      kanbanStage: 'listing',
      contractNumber: contractNumber,
      contractDate: contractDate,
      publishedPropertyId: newPropertyId,
      assignedAgentName: assignedAgentName,
      assignedAgentId: assignedAgentObj?.id || seller.assignedAgentId,
      commentsHistory: [
        {
          id: `cmt-${Date.now()}`,
          date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          stage: 'listing',
          text: `🔥 Заключен договор № ${contractNumber} от ${contractDate}. Объект успешно создан и ${isPublished ? 'опубликован на сайте' : 'добавлен в базу объектов'} (ID: ${newPropertyId})`,
          author: loggedInAgent?.name || 'Система'
        },
        ...(seller.commentsHistory || [])
      ]
    };

    onPublish(newProperty, updatedSeller);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950 text-white p-5 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                1-Клик: Публикация на сайте
              </div>
              <h3 className="font-extrabold text-base text-white">
                Создать объект недвижимости из продавца
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-neutral-900 font-sans">
          {/* Seller Banner */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-amber-950 block">Продавец: {seller.name}</span>
              <span className="text-stone-500 text-[11px] font-mono">{seller.phone} • {seller.address}</span>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] uppercase rounded-lg border border-amber-300">
              Договор готов к публикации
            </span>
          </div>

          {/* Contract Details */}
          <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-indigo-600" /> Реквизиты риэлтерского договора
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Номер договора</label>
                <input
                  type="text"
                  required
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Дата заключения</label>
                <input
                  type="date"
                  required
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Object Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-500" /> Параметры объекта для сайта
            </h4>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Заголовок объявления</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Тип недвижимости</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 font-bold text-neutral-900 outline-none"
                >
                  <option value="apartment">🏢 Квартира</option>
                  <option value="house">🏡 Дом / Коттедж</option>
                  <option value="commercial">🏬 Коммерческая</option>
                  <option value="plot">🌲 Земельный участок</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Точный адрес</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 font-bold text-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Стоимость в USD ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={priceUSD}
                    onChange={(e) => handlePriceUSDChange(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl pl-7 pr-3 py-2 font-mono font-black text-neutral-900 outline-none"
                  />
                  <span className="absolute left-2.5 top-2 font-bold text-stone-400">$</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Стоимость в BYN (НБРБ)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={priceBYN}
                    onChange={(e) => handlePriceBYNChange(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl pl-3 pr-10 py-2 font-mono font-black text-neutral-900 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-stone-400 font-mono">BYN</span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            {propertyType === 'apartment' && (
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Комнат</label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-250 rounded-xl px-2 py-2 font-bold text-neutral-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}-комн.</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Площадь м²</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-250 rounded-xl px-2 py-2 font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Этаж</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-250 rounded-xl px-2 py-2 font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Этажность</label>
                  <input
                    type="number"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-250 rounded-xl px-2 py-2 font-bold text-neutral-900"
                  />
                </div>
              </div>
            )}

            {/* Realtor & Publishing Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Ответственный риэлтер</label>
                <select
                  value={assignedAgentName}
                  onChange={(e) => setAssignedAgentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 font-bold text-neutral-900 outline-none"
                >
                  {agentsList.filter(a => !a.isDismissed && !a.isAdmin && a.id !== 'admin' && a.id !== 'call-center').map(a => (
                    <option key={a.id} value={a.name}>👤 {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="pub-check" className="text-xs font-bold text-neutral-900 cursor-pointer select-none">
                  Сразу опубликовать на сайте в каталоге
                </label>
              </div>
            </div>

            {/* Photo Selection */}
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-stone-400" /> Главная фотография объекта
              </label>
              <div className="grid grid-cols-4 gap-2">
                {defaultPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                      selectedPhoto === url ? 'border-amber-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Вариант фото" className="w-full h-full object-cover" />
                    {selectedPhoto === url && (
                      <div className="absolute top-1 right-1 bg-amber-500 text-neutral-950 p-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Описание для сайта</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-stone-50 border border-stone-250 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-extrabold text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
            >
              Отмена
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Создать и опубликовать</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
