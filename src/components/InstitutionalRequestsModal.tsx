"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Printer, Copy, Check, FileText, Building, 
  Search, CheckCircle2, UserCheck, Trash2, Plus, 
  ChevronRight, Shield, HeartPulse, Scale, Home, Users, 
  FileCheck2, SlidersHorizontal, ArrowLeft, RefreshCw, Eye,
  FileDown, Sparkles, RotateCcw
} from 'lucide-react';
import { Agent, Property, InstitutionalRequest, InstitutionKey } from '../types';
import { INSTITUTIONS_LIST, AGENCY_OFFICIAL_DETAILS, DEFAULT_REALTORS_POOL, InstitutionConfig } from '../data/institutions';
import { declineFullName, declinePropertyType } from '../utils/declension';
import { exportHtmlToWord } from '../utils/wordExport';

interface InstitutionalRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInAgent: Agent;
  agentsList?: Agent[];
  propertiesList?: Property[];
  initialProperty?: Property | null;
}

interface RequestPerson {
  id: string;
  fullName: string;
  birthDate: string;
  registration: string;
  share: string;
}

export const InstitutionalRequestsModal: React.FC<InstitutionalRequestsModalProps> = ({
  isOpen,
  onClose,
  loggedInAgent,
  agentsList = [],
  propertiesList = [],
  initialProperty = null
}) => {
  // Persistence of created requests
  const [requestsList, setRequestsList] = useState<InstitutionalRequest[]>(() => {
    const saved = localStorage.getItem('fp_institutional_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const saveRequests = (list: InstitutionalRequest[]) => {
    setRequestsList(list);
    localStorage.setItem('fp_institutional_requests', JSON.stringify(list));
  };

  // View state
  const [viewMode, setViewMode] = useState<'create' | 'registry'>('create');
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [selectedInstKey, setSelectedInstKey] = useState<InstitutionKey>('rsc_minsk');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'housing' | 'health' | 'protection' | 'registry' | 'notary' | 'consent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent common data (loaded once so user only enters FIO once!)
  const initialCommonData = useMemo(() => {
    const saved = localStorage.getItem('fp_inst_requests_common_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  }, []);

  // REALTOR SELECTION & AUTO-FILL
  const availableRealtors = useMemo(() => {
    const list = [...DEFAULT_REALTORS_POOL];
    agentsList.forEach(a => {
      if (!list.some(r => r.name.toLowerCase() === a.name.toLowerCase())) {
        list.push({
          name: a.name,
          cardNo: a.cardNo || 'АВ 0028022',
          certNo: a.certNo || '1800',
          certDate: a.certDate || '2027 г.',
          role: (a as any).role || 'Риэлтер',
          phone: a.phone || '+375 29 122-00-88'
        });
      }
    });
    return list;
  }, [agentsList]);

  // Current selected realtor details
  const [selectedRealtorName, setSelectedRealtorName] = useState<string>(() => {
    if (loggedInAgent?.name) return loggedInAgent.name;
    if (initialCommonData?.selectedRealtorName) return initialCommonData.selectedRealtorName;
    return availableRealtors[0]?.name || 'Гордович Кирилл';
  });

  const [realtorCard, setRealtorCard] = useState<string>(() => {
    if (initialCommonData?.realtorCard) return initialCommonData.realtorCard;
    const found = availableRealtors.find(r => r.name.toLowerCase() === (loggedInAgent?.name || '').toLowerCase());
    return found?.cardNo || loggedInAgent?.cardNo || 'АВ0028332';
  });

  const [realtorCert, setRealtorCert] = useState<string>(() => {
    if (initialCommonData?.realtorCert) return initialCommonData.realtorCert;
    const found = availableRealtors.find(r => r.name.toLowerCase() === (loggedInAgent?.name || '').toLowerCase());
    return found?.certNo || loggedInAgent?.certNo || '1592';
  });

  const [realtorPhone, setRealtorPhone] = useState<string>(() => {
    if (initialCommonData?.realtorPhone) return initialCommonData.realtorPhone;
    const found = availableRealtors.find(r => r.name.toLowerCase() === (loggedInAgent?.name || '').toLowerCase());
    return found?.phone || loggedInAgent?.phone || '+375 29 122-00-88';
  });

  // Handler when realtor changes from dropdown
  const handleRealtorChange = (name: string) => {
    setSelectedRealtorName(name);
    const found = availableRealtors.find(r => r.name === name);
    if (found) {
      setRealtorCard(found.cardNo);
      setRealtorCert(found.certNo);
      setRealtorPhone(found.phone);
    }
  };

  // OBJECT & CONTRACT STATE
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProperty ? initialProperty.id : '');
  const [propertyType, setPropertyType] = useState<string>(() => {
    if (initialProperty?.type) {
      return initialProperty.type === 'apartment' ? 'квартира' : initialProperty.type === 'house' ? 'жилой дом' : 'квартира';
    }
    return initialCommonData?.propertyType || 'квартира';
  });

  const [objectAddress, setObjectAddress] = useState<string>(() => {
    if (initialProperty) return initialProperty.address;
    return initialCommonData?.objectAddress || 'г. Минск, ул. Голубева, д. 24, кв. 63';
  });

  const [inventoryNo, setInventoryNo] = useState<string>(() => {
    if (initialProperty?.inventoryNo) return initialProperty.inventoryNo;
    return initialCommonData?.inventoryNo || '500/D-152840';
  });

  const [contractNo, setContractNo] = useState<string>(() => {
    if (initialProperty?.contractNumber) return initialProperty.contractNumber;
    return initialCommonData?.contractNo || '823/1';
  });

  const [contractDate, setContractDate] = useState<string>(() => {
    if (initialProperty?.contractDate) return initialProperty.contractDate;
    return initialCommonData?.contractDate || '10 июля 2026 г.';
  });

  const [outNumber, setOutNumber] = useState<string>(() => `${Math.floor(700 + Math.random() * 299)}/1`);
  const [outDate, setOutDate] = useState<string>(() => new Date().toLocaleDateString('ru-RU'));

  // PERSONS / OWNERS (Unified client FIO persistent across ALL requests)
  const [persons, setPersons] = useState<RequestPerson[]>(() => {
    if (initialCommonData?.persons && Array.isArray(initialCommonData.persons) && initialCommonData.persons.length > 0) {
      return initialCommonData.persons;
    }
    return [
      {
        id: '1',
        fullName: 'Козлова Ольга Васильевна',
        birthDate: '20.12.1981',
        registration: initialProperty ? initialProperty.address : 'г. Минск, ул. Голубева, д. 24, кв. 63',
        share: '1/2 (одна вторая)'
      }
    ];
  });

  // Auto-save common data to localStorage whenever user modifies FIO, address, contract, etc.
  useEffect(() => {
    const commonData = {
      persons,
      propertyType,
      objectAddress,
      inventoryNo,
      contractNo,
      contractDate,
      selectedRealtorName,
      realtorCard,
      realtorCert,
      realtorPhone
    };
    try {
      localStorage.setItem('fp_inst_requests_common_data', JSON.stringify(commonData));
    } catch (e) {}
  }, [
    persons, propertyType, objectAddress, inventoryNo, contractNo, contractDate,
    selectedRealtorName, realtorCard, realtorCert, realtorPhone
  ]);

  // Reset to default sample helper
  const handleResetToSample = () => {
    const samplePersons = [
      {
        id: '1',
        fullName: 'Козлова Ольга Васильевна',
        birthDate: '20.12.1981',
        registration: initialProperty ? initialProperty.address : 'г. Минск, ул. Голубева, д. 24, кв. 63',
        share: '1/2 (одна вторая)'
      }
    ];
    setPersons(samplePersons);
    setObjectAddress(initialProperty ? initialProperty.address : 'г. Минск, ул. Голубева, д. 24, кв. 63');
    setInventoryNo(initialProperty?.inventoryNo || '500/D-152840');
    setContractNo(initialProperty?.contractNumber || '823/1');
    setContractDate(initialProperty?.contractDate || '10 июля 2026 г.');
    setPropertyType('квартира');
    setToastMessage('Данные сброшены к стандартному образцу');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SPECIAL FIELDS FOR SPECIFIC REQUESTS
  // SOP / Education
  const [minorName, setMinorName] = useState('Курневич Марк Юрьевич');
  const [minorBirthDate, setMinorBirthDate] = useState('30.11.2016 г.р.');
  const [administrationDistrict, setAdministrationDistrict] = useState('Фрунзенского района г. Минска');

  // Notary Inheritance
  const [deceasedName, setDeceasedName] = useState('Чернова Галина Никитична');
  const [deceasedDate, setDeceasedDate] = useState('04 октября 2025 года');
  const [notaryOfficeName, setNotaryOfficeName] = useState('Нотариальная контора №1 Заводского района г. Минска\n220107, г. Минск, просп. Партизанский, д. 42');

  // Notary Arrest
  const [arrestNotaryOffice, setArrestNotaryOffice] = useState('Нотариальная контора Партизанского района г. Минска\n220034, г. Минск, ул. Фрунзе, д. 3');

  // NKA
  const [nkaUrgency, setNkaUrgency] = useState('обычный порядок');

  // Feedback & Copy state
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeclensionHelper, setShowDeclensionHelper] = useState(false);

  // Sync initialProperty
  useEffect(() => {
    if (initialProperty) {
      setSelectedPropertyId(initialProperty.id);
      setObjectAddress(initialProperty.address);
      setInventoryNo(initialProperty.inventoryNo || '500/D-152840');
      setContractNo(initialProperty.contractNumber || `${Math.floor(700 + Math.random() * 250)}/1`);
      if (initialProperty.contractDate) setContractDate(initialProperty.contractDate);
      if (initialProperty.type) {
        setPropertyType(initialProperty.type === 'apartment' ? 'квартира' : initialProperty.type === 'house' ? 'жилой дом' : 'квартира');
      }
      setPersons(prev => {
        // If user already typed custom names, preserve them! Just update registration to property address
        if (prev.length > 0 && prev[0].fullName && prev[0].fullName !== 'Козлова Ольга Васильевна') {
          return prev.map(p => ({
            ...p,
            registration: p.registration && p.registration !== 'г. Минск, ул. Голубева, д. 24, кв. 63' ? p.registration : initialProperty.address
          }));
        }
        return [
          {
            id: '1',
            fullName: 'Козлова Ольга Васильевна',
            birthDate: '20.12.1981',
            registration: initialProperty.address,
            share: '1/2 (одна вторая)'
          }
        ];
      });
    }
  }, [initialProperty]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Current Institution config
  const currentInst = useMemo(() => {
    return INSTITUTIONS_LIST.find(i => i.key === selectedInstKey) || INSTITUTIONS_LIST[0];
  }, [selectedInstKey]);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return INSTITUTIONS_LIST.filter(inst => {
      const matchCat = categoryFilter === 'all' || inst.category === categoryFilter;
      const matchSearch = inst.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inst.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.defaultSubject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  // Helpers to add/remove persons
  const addPerson = () => {
    setPersons([
      ...persons,
      {
        id: Date.now().toString(),
        fullName: '',
        birthDate: '',
        registration: objectAddress,
        share: '1/2 (одна вторая)'
      }
    ]);
  };

  const removePerson = (id: string) => {
    if (persons.length > 1) {
      setPersons(persons.filter(p => p.id !== id));
    }
  };

  const updatePerson = (id: string, field: keyof RequestPerson, value: string) => {
    setPersons(persons.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Declension computations
  const declObjNominative = declinePropertyType(propertyType, 'nominative'); // квартира
  const declObjGenitive = declinePropertyType(propertyType, 'genitive'); // квартиры
  const declObjAccusative = declinePropertyType(propertyType, 'accusative'); // квартиру
  const declObjPrepositional = declinePropertyType(propertyType, 'prepositional'); // в квартире

  const realtorDative = useMemo(() => {
    return declineFullName(selectedRealtorName, 'dative');
  }, [selectedRealtorName]);

  // Declension of consumers for contract line
  const consumersInstrumental = useMemo(() => {
    if (persons.length === 0) return 'Потребителем';
    if (persons.length === 1) {
      return declineFullName(persons[0].fullName || 'Козлова Ольга Васильевна', 'instrumental');
    }
    return persons.map(p => declineFullName(p.fullName, 'instrumental')).filter(Boolean).join(' и ');
  }, [persons]);

  const consumersGenitive = useMemo(() => {
    if (persons.length === 0) return '';
    return persons.map(p => declineFullName(p.fullName, 'genitive')).filter(Boolean).join(' и ');
  }, [persons]);

  const consumersNominative = useMemo(() => {
    return persons.map(p => p.fullName).filter(Boolean).join(', ');
  }, [persons]);

  // GENERATE DOCUMENT CONTENT BASED ON EXACT USER TEXTS
  const generatedDoc = useMemo(() => {
    const isConsent = currentInst.category === 'consent';

    // 1. CONSENT: МОКЦ «Психиатрия-наркология» (Область, 2 штуки на странице)
    if (selectedInstKey === 'consent_psycho_region') {
      const renderSingleConsent = (p: RequestPerson) => `
        <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.35; font-size: 13px;">
          <div style="text-align: right; font-size: 10px; font-weight: bold; margin-bottom: 8px;">
            ЗАПОЛНЯЕТСЯ ПЕЧАТНЫМИ БУКВАМИ
          </div>
          <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">
            СОГЛАСИЕ
          </div>
          <p style="text-align: justify; margin-bottom: 8px;">
            Я, <strong>${p.fullName || '_______________________________________________________________________'}</strong>,<br/>
            «${p.birthDate ? p.birthDate.slice(0, 2) : '____'}» ${p.birthDate ? p.birthDate.slice(3, 5) : '________________'} ${p.birthDate ? p.birthDate.slice(6) : '________'} г.р., зарегистрирован(-а) по адресу:<br/>
            Минский район: <strong>${p.registration || '_____________________________________________________________'}</strong><br/>
            даю свое согласие на предоставление Учреждением здравоохранения «Минский областной клинический центр «Психиатрия-наркология» сведений о том, что я не состою на диспансерном учёте в данном учреждении и иных сведений, необходимых риэлтерской организации ${AGENCY_OFFICIAL_DETAILS.shortName} для осуществления сделки купли-продажи объекта недвижимости.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px; margin-bottom: 14px;">
            <div>_______________/_______________________</div>
            <div>«___» _____________20___г.</div>
          </div>
          <div style="margin-top: 10px; font-size: 12px;">
            Подписано в моём присутствии, подлинность подписи подтверждаю<br/>
            <strong>Директор ${AGENCY_OFFICIAL_DETAILS.shortName}</strong><br/>
            <div style="display: flex; justify-content: space-between; margin-top: 6px;">
              <span>_________________</span>
              <span>/ ${AGENCY_OFFICIAL_DETAILS.directorInitialsFirst}</span>
            </div>
          </div>
        </div>
      `;

      return {
        isConsent: true,
        header: null,
        title: 'СОГЛАСИЕ',
        bodyHtml: `
          <div style="padding: 10px 0;">
            ${renderSingleConsent(persons[0] || { fullName: '', birthDate: '', registration: '', share: '', id: '1' })}
            <div style="border-bottom: 1px dashed #666; margin: 24px 0; text-align: center; position: relative;">
              <span style="background: #fff; padding: 0 10px; font-size: 10px; color: #777; position: relative; top: 7px;">✂ линия отреза</span>
            </div>
            ${renderSingleConsent(persons[1] || persons[0] || { fullName: '', birthDate: '', registration: '', share: '', id: '2' })}
          </div>
        `
      };
    }

    // 2. CONSENT: МГКЦ психиатрии и психотерапии (Минск)
    if (selectedInstKey === 'consent_psycho_city') {
      const p = persons[0] || { fullName: '', birthDate: '', registration: '' };
      return {
        isConsent: true,
        header: null,
        title: 'СОГЛАСИЕ',
        bodyHtml: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.45; font-size: 14px; padding: 20px 0;">
            <div style="text-align: right; font-size: 10px; font-weight: bold; margin-bottom: 14px;">
              ЗАПОЛНЯЕТСЯ ТОЛЬКО ПЕЧАТНЫМИ БУКВАМИ
            </div>
            <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; letter-spacing: 1px;">
              СОГЛАСИЕ
            </div>
            <p style="text-align: justify; margin-bottom: 14px; text-indent: 25px;">
              Я, <strong>${p.fullName || '_______________________________________________________________________'}</strong>,<br/>
              дата рождения «_____» ______________ __________ г.р., зарегистрирован(-а) по адресу:<br/>
              г. Минск <strong>${p.registration || '________________________________________________________________'}</strong><br/>
              даю свое согласие на предоставление Учреждением здравоохранения «Минский городской клинический центр психиатрии и психотерапии» сведений о том, что я не состою на диспансерном учёте в данном учреждении и иных сведений, необходимых риэлтерской организации ${AGENCY_OFFICIAL_DETAILS.shortName} для осуществления сделки купли-продажи объекта недвижимости.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; margin-bottom: 30px;">
              <div>_______________/_______________________</div>
              <div>«____» _____________20___г.</div>
            </div>
            <div style="margin-top: 35px;">
              <p>Подписано в моём присутствии, подлинность подписи подтверждаю</p>
              <p><strong>Директор ${AGENCY_OFFICIAL_DETAILS.shortName}</strong></p>
              <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <span>_________________</span>
                <span>/ ${AGENCY_OFFICIAL_DETAILS.directorInitialsFirst}</span>
              </div>
            </div>
          </div>
        `
      };
    }

    // 3. CONSENT: МГК наркологический центр (Минск)
    if (selectedInstKey === 'consent_narco_city') {
      const p = persons[0] || { fullName: '', birthDate: '', registration: '' };
      return {
        isConsent: true,
        header: null,
        title: 'СОГЛАСИЕ',
        bodyHtml: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.45; font-size: 14px; padding: 20px 0;">
            <div style="text-align: right; font-size: 10px; font-weight: bold; margin-bottom: 14px;">
              ЗАПОЛНЯЕТСЯ ТОЛЬКО ПЕЧАТНЫМИ БУКВАМИ
            </div>
            <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; letter-spacing: 1px;">
              СОГЛАСИЕ
            </div>
            <p style="text-align: justify; margin-bottom: 14px; text-indent: 25px;">
              Я, <strong>${p.fullName || '_______________________________________________________________________'}</strong>,<br/>
              дата рождения «_____» _____________ __________ г.р., зарегистрирован(-а) по адресу:<br/>
              г. Минск <strong>${p.registration || '_________________________________________________________________'}</strong><br/>
              даю свое согласие на предоставление Учреждением здравоохранения «Минский городской клинический наркологический центр» г. Минска сведений о том, что я не состою на диспансерном учёте в данном учреждении и иных сведений, необходимых риэлтерской организации ${AGENCY_OFFICIAL_DETAILS.shortName} для осуществления сделки купли-продажи объекта недвижимости.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; margin-bottom: 30px;">
              <div>_______________/_______________________</div>
              <div>«____» _____________20___г.</div>
            </div>
            <div style="margin-top: 35px;">
              <p>Подписано в моём присутствии, подлинность подписи подтверждаю</p>
              <p><strong>Директор ${AGENCY_OFFICIAL_DETAILS.shortName}</strong></p>
              <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <span>_________________</span>
                <span>/ ${AGENCY_OFFICIAL_DETAILS.directorInitialsFirst}</span>
              </div>
            </div>
          </div>
        `
      };
    }

    // 4. УПРАВЛЕНИЕ ПО ОБРАЗОВАНИЮ (СОП)
    if (selectedInstKey === 'sop') {
      return {
        isConsent: false,
        recipient: `Начальнику управления по образованию администрации ${administrationDistrict}`,
        title: 'ЗАПРОС',
        outPrefix: `от ${outDate} г. исх. № ${outNumber}`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», «Положением о порядке представления информации риэлтерским организациям, территориальным организациям по государственной регистрации недвижимого имущества, прав на него и сделок с ним», утвержденным Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. N 71-З «О риэлтерской деятельности», в целях исполнения договора оказания риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress},
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            просим предоставить справку (либо иной аналогичный документ) о том, числится ли в банке данных несовершеннолетних, признанных в социально опасном положении:
          </p>
          <p style="margin-left: 20px; text-align: justify; margin-bottom: 14px;">
            - <strong>${minorName} ${minorBirthDate}</strong>, зарегистрированный в ${declObjPrepositional}, расположенной по адресу: ${objectAddress}, принадлежащей ${consumersGenitive}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 14px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Данные сведения необходимы для отчуждения ${declObjGenitive}.
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 5. РСЦ МИНСК (ЛИЦЕВОЙ СЧЕТ)
    if (selectedInstKey === 'rsc_minsk') {
      return {
        isConsent: false,
        recipient: `Расчетно-справочный центр №3\nМосковского района г. Минска филиала "Расчетно-информационный центр Мингорисполкома"\nг. Минск, пр. Независимости, 3-2`,
        title: 'Запрос о предоставлении\nинформации',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, на основании ст. 27 Закона Республики Беларусь от 08.05.2025 №71-З «О риэлтерской деятельности», постановления Совета Министров Республики Беларусь от 02.04.2026 №157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. № 71-З «О риэлтерской деятельности», согласно заключенного договором №983/21 от 21.04.2021 года (с дополнениями и изменениями) с КУП "Расчетно-информационный центр Мингорисполкома", в целях исполнения договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить следующие документы, необходимую для оказания риэлтерских услуг:
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            1. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи (информация с историей по лицевому счёту с момента присвоения жилому помещению номера лицевого счёта о собственниках (нанимателях) жилого помещения, лицах проживающих и проживавших в жилом помещении, их правовом статусе, датах прописки (регистрации) и выписки (снятия с регистрации) из жилого помещения, с указанием места (адрес) и причины выбытия (осуждение, смерть и т.д.), а также о действующих договорах найма(аренды); сведения о наличии закрепления за детьми-сиротами или детьми, оставшимися без попечения родителей и(или) другими категориями граждан, нуждающихся в социальной защите ), а также сведения о наличии, зарегистрированного по данному адресу субъектов хозяйствования (ИП, ЧУП и т.д; сведения о расчетах (задолженности) по плате за жилищно-коммунальные услуги) для предоставления в ${AGENCY_OFFICIAL_DETAILS.shortName}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 14px;">
            2. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 6. РСЦ ООО «ХЭППИ ПЛАНЕТ»
    if (selectedInstKey === 'happy_planet') {
      return {
        isConsent: false,
        recipient: `Расчетно-справочный центр\nООО «Хэппи Планет»`,
        title: 'Запрос о предоставлении\nинформации',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, на основании ст. 27 Закона Республики Беларусь от 08.05.2025 №71-З «О риэлтерской деятельности», постановления Совета Министров Республики Беларусь от 02.04.2026 №157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. № 71-З «О риэлтерской деятельности», согласно заключенного договором №04-23/РА от 29.03.2023 года с ООО «Хэппи Планет», в целях исполнения договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить следующие документы, необходимую для оказания риэлтерских услуг:
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            1. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи (информация с историей по лицевому счёту с момента присвоения жилому помещению номера лицевого счёта о собственниках (нанимателях) жилого помещения, лицах проживающих и проживавших в жилом помещении, их правовом статусе, датах прописки (регистрации) и выписки (снятия с регистрации) из жилого помещения, с указанием места (адрес) и причины выбытия (осуждение, смерть и т.д.), а также о действующих договорах найма(аренды); сведения о наличии закрепления за детьми-сиротами или детьми, оставшимися без попечения родителей и(или) другими категориями граждан, нуждающихся в социальной защите ), а также сведения о наличии, зарегистрированного по данному адресу субъектов хозяйствования (ИП, ЧУП и т.д; сведения о расчетах (задолженности) по плате за жилищно-коммунальные услуги) для предоставления в ${AGENCY_OFFICIAL_DETAILS.shortName}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 14px;">
            2. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 7. РСЦ С ДОЛЯМИ (1/2 доли и т.д.)
    if (selectedInstKey === 'rsc_shares') {
      const sharesItems = persons.map((p, idx) => {
        const genitiveName = declineFullName(p.fullName, 'accusative') || p.fullName;
        return `<p style="text-indent: 25px; text-align: justify; margin-bottom: 8px;">
          ${idx + 2}. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи на <strong>${p.fullName}</strong> ${p.share || '1/2 (одна вторая)'} доли в праве собственности с указанием в абзаце о собственнике жилого помещения (его части) только данных собственника и оснований права собственности.
        </p>`;
      }).join('');

      return {
        isConsent: false,
        recipient: `Расчетно-справочный центр №3\nМосковского района г. Минска филиала "Расчетно-информационный центр Мингорисполкома"\nг. Минск, пр. Независимости, 3-2`,
        title: 'Запрос о предоставлении\nинформации',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, на основании ст. 27 Закона Республики Беларусь от 08.05.2025 №71-З «О риэлтерской деятельности», постановления Совета Министров Республики Беларусь от 02.04.2026 №157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. № 71-З «О риэлтерской деятельности», согласно заключенного договором №983/21 от 21.04.2021 года (с дополнениями и изменениями) с КУП "Расчетно-информационный центр Мингорисполкома", в целях исполнения договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителями: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить следующие документы, необходимую для оказания риэлтерских услуг:
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            1. Справку о занимаемом в данном населенном пункте жилом помещении, месте жительства и составе семьи (информация с историей по лицевому счёту с момента присвоения жилому помещению номера лицевого счёта о собственниках (нанимателях) жилого помещения, лицах проживающих и проживавших в жилом помещении, их правовом статусе, датах прописки (регистрации) и выписки (снятия с регистрации) из жилого помещения, с указанием места (адрес) и причины выбытия (осуждение, смерть и т.д.), а также о действующих договорах найма(аренды); сведения о наличии закрепления за детьми-сиротами или детьми, оставшимися без попечения родителей и(или) другими категориями граждан, нуждающихся в социальной защите ), а также сведения о наличии, зарегистрированного по данному адресу субъектов хозяйствования (ИП, ЧУП и т.д; сведения о расчетах (задолженности) по плате за жилищно-коммунальные услуги) для предоставления в ${AGENCY_OFFICIAL_DETAILS.shortName}.
          </p>
          ${sharesItems}
          <p style="text-indent: 25px; text-align: justify; margin-top: 14px; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 8. ПСИХИАТРИЯ МИНСК (БЕХТЕРЕВА, 5)
    if (selectedInstKey === 'psycho') {
      const tableRows = persons.map((p, idx) => `
        <tr>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${idx + 1}.</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.fullName}</td>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${p.birthDate}</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.registration}</td>
        </tr>
      `).join('');

      return {
        isConsent: false,
        recipient: `Главному врачу\nУчреждения здравоохранения «Минский городской клинический центр психиатрии и психотерапии»\nул. Бехтерева, 5\n220026, г. Минск`,
        title: 'ЗАПРОС',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», «Положением о порядке представления информации риэлтерским организациям, территориальным организациям по государственной регистрации недвижимого имущества, прав на него и сделок с ним», утвержденным Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. N 71-З "О риэлтерской деятельности» согласно заключенного договора №84 от 05.05.2021г. (с дополнениями и изменениями) с УЗ «Минский городской клинический центр психиатрии и психотерапии», в целях исполнения договоров оказания риэлтерских услуг, просит предоставить информацию о том, состоит ли на учете в учреждении здравоохранения «Минский городской клинический центр психиатрии и психотерапии» следующие лица:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 4px 6px; width: 40px;">№ п/п</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Фамилия, имя, отчество</th>
                <th style="border: 1px solid #000; padding: 4px 8px; width: 110px;">Число, месяц, год рождения</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Место регистрации</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            Уведомляем, что в соответствии ст.46, ст.18 Закон Республики Беларусь от 18.06.1993 N 2435-XII (ред. от 08.07.2024) «О здравоохранении» письменное согласие указанных выше лиц нами получено.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            В рамках исполнения договора оказания риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителями: ${consumersInstrumental}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 9. ПСИХИАТРИЯ-НАРКОЛОГИЯ (ОБЛАСТЬ)
    if (selectedInstKey === 'psycho_region') {
      const tableRows = persons.map((p, idx) => `
        <tr>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${idx + 1}.</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.fullName}</td>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${p.birthDate}</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.registration}</td>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;"></td>
        </tr>
      `).join('');

      return {
        isConsent: false,
        recipient: `Главному врачу УЗ «Минский областной клинический центр «Психиатрия-наркология»`,
        title: 'ЗАПРОС',
        outPrefix: `Исх. № ${outNumber}\nот ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии со ст.46, ст.18 Закон Республики Беларусь от 18.06.1993 N 2435-XII (ред. от 08.07.2024) «О здравоохранении», в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», «Положением о порядке представления информации риэлтерским организациям, территориальным организациям по государственной регистрации недвижимого имущества, прав на него и сделок с ним», утвержденным Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. N 71-З «О риэлтерской деятельности» в целях исполнения договоров оказания риэлтерских услуг, просит предоставить информацию о нахождении физических лиц на учете в учреждении здравоохранения «Минский областной клинический центр «Психиатрия-наркология»:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 4px 6px; width: 35px;">№ п/п</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Фамилия, имя, отчество</th>
                <th style="border: 1px solid #000; padding: 4px 8px; width: 100px;">Число, месяц, год рождения</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Место регистрации</th>
                <th style="border: 1px solid #000; padding: 4px 8px; width: 90px;">Отметка о нахождении на учете</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: `Директор ${AGENCY_OFFICIAL_DETAILS.shortName}`,
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 10. ГУП «НАЦИОНАЛЬНОЕ КАДАСТРОВОЕ АГЕНТСТВО» (НКА СТ. 33)
    if (selectedInstKey === 'nka') {
      return {
        isConsent: false,
        recipient: `ГУП «Национальное кадастровое агентство»`,
        title: '',
        outPrefix: `от ${outDate} г. исх. № ${outNumber}`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            В соответствии со статьей 33 Закона Республики Беларусь от 22 июля 2002 г. №133-З «О государственной регистрации недвижимого имущества, прав на него и сделок с ним» на основании договора оказания услуг от 11.12.2025 № 17/25 – Р(Е) просим предоставить информацию, требующую специальной обработки и анализа сведений и документов единого государственного регистра недвижимого имущества, прав на него и сделок с ним в отношении следующего объекта недвижимого имущества (следующих объектов недвижимого имущества):
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 4px 6px; width: 40px;">№ п/п</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Вид объекта недвижимого имущества</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Кадастровый или инвентарный номер</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Отметка о срочности предоставления информации</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">1.</td>
                <td style="border: 1px solid #000; padding: 4px 8px;">${declObjNominative}</td>
                <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${inventoryNo}</td>
                <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${nkaUrgency}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            Настоящий запрос направляется в рамках договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}.
          </p>
          <div style="margin-top: 14px; margin-bottom: 24px; font-size: 13px;">
            <p>Контактное лицо: <strong>${selectedRealtorName}</strong></p>
            <p>Рабочий телефон: <strong>${realtorPhone}</strong></p>
          </div>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 11. НОТАРИУС (НАСЛЕДСТВО)
    if (selectedInstKey === 'notary_inheritance') {
      return {
        isConsent: false,
        recipient: notaryOfficeName,
        title: 'Запрос о предоставлении\nинформации',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», «Положением о порядке представления информации риэлтерским организациям, территориальным организациям по государственной регистрации недвижимого имущества, прав на него и сделок с ним», утвержденным Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. N 71-З «О риэлтерской деятельности» в целях исполнения договора оказания риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить следующую информацию, необходимую для оказания риэлтерских услуг:
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 6px;">
            1. Об открытии наследственного дела после умершей(его) ${deceasedDate} <strong>${deceasedName}</strong>;
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 6px;">
            2. Были ли заявлены в качестве наследственного имущества ${declObjNominative}, расположенная по адресу: ${objectAddress};
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 6px;">
            3. О круге наследников, наследниках, принявших наследство лицах подававших заявления о вступлении в наследство, лицах подававших заявления от отказа от наследства, выданных свидетельствах о праве на наследство и тому подобном по месту открытия наследства в соответствии с законодательством;
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            4. Подавались ли какие-либо заявления от третьих лиц по вопросу принятия наследства по закону либо по завещаниям, подписанным ${deceasedName}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px; font-size: 12px; font-style: italic;">
            Уведомляем, что осведомлены о предусмотренной статьей 9 Закона Республики Беларусь «О нотариате и нотариальной деятельности» необходимости соблюдения нотариальной тайны.
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 12. НОТАРИУС (АРЕСТЫ И ЗАПРЕЩЕНИЯ)
    if (selectedInstKey === 'notary_arrest') {
      return {
        isConsent: false,
        recipient: arrestNotaryOffice,
        title: 'Запрос о предоставлении\nинформации',
        outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», «Положением о порядке представления информации риэлтерским организациям, территориальным организациям по государственной регистрации недвижимого имущества, прав на него и сделок с ним», утвержденным Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. N 71-З «О риэлтерской деятельности» в целях исполнения договора оказания риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить следующую информацию, необходимую для оказания риэлтерских услуг:
          </p>
          <p style="margin-left: 20px; text-align: justify; margin-bottom: 8px;">
            - о наличии или отсутствии ареста и запрещения отчуждения недвижимого имущества в праве собственности на ${declObjAccusative}, расположенную по адресу ${objectAddress}, принадлежащую <strong>${consumersGenitive}</strong>.
          </p>
          <p style="margin-left: 20px; text-align: justify; margin-bottom: 14px;">
            - об отсутствии в алфавитной книге запрещений отчуждения недвижимого имущества и арестов записей в отношении <strong>${consumersGenitive}</strong>.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px; font-size: 12px; font-style: italic;">
            Уведомляем, что осведомлены о предусмотренной статьей 9 Закона Республики Беларусь «О нотариате и нотариальной деятельности» необходимости соблюдения нотариальной тайны.
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 13. НАРКОЛОГИЯ МИНСК (ВАУПШАСОВА, 59)
    if (selectedInstKey === 'narco') {
      const tableRows = persons.map((p, idx) => `
        <tr>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${idx + 1}.</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.fullName}</td>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${p.birthDate}</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${p.registration}</td>
          <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;"></td>
        </tr>
      `).join('');

      return {
        isConsent: false,
        recipient: `Главному врачу Учреждения здравоохранения «Минский городской клинический наркологический центр»\nул. Ваупшасова, 59\n220138, г. Минск`,
        title: 'Запрос на предоставление\nинформации',
        outPrefix: `${outDate} г. № ${outNumber}`,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            Настоящий запрос направляется на основании ст. 27 Закона Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», постановления Совета Министров Республики Беларусь от 02.04.2026 №157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. № 71-З «О риэлтерской деятельности», в целях исполнения договора оказания риэлтерских услуг от «${contractDate}» № ${contractNo}.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            Идентификационная пластиковая карточка риэлтера № <strong>${realtorCard}</strong>.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 10px;">
            В целях оказания риэлтерских услуг просим предоставить информацию о нахождении физических лиц на учете в учреждении здравоохранения «Минский городской клинический наркологический центр»:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 4px 6px; width: 35px;">№ п/п</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Фамилия, имя, отчество</th>
                <th style="border: 1px solid #000; padding: 4px 8px; width: 100px;">Дата рождения</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Место регистрации</th>
                <th style="border: 1px solid #000; padding: 4px 8px; width: 90px;">Отметка о нахождении на учете</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Уведомляем, что в соответствии ст.46, ст.18 Закон Республики Беларусь от 18.06.1993 N 2435-XII (ред. от 08.07.2024) «О здравоохранении» письменное согласие указанных выше лиц нами получено (прилагается).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // 14. БРТИ МИНСК (ВЫПИСКА ИЗ ЕГРНИ)
    if (selectedInstKey === 'brti') {
      return {
        isConsent: false,
        recipient: `РУП «Минское городское агентство по государственной регистрации и земельному кадастру»`,
        title: `Запрос № ${outNumber}\nОт «${outDate}» г.`,
        outPrefix: ``,
        bodyHtml: `
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            На основании ст.27 Закона Республики Беларусь от 08.05.2025 №71-З «О риэлтерской деятельности», постановления Совета Министров Республики Беларусь от 02.04.2026 №157 «О мерах по реализации Закона Республики Беларусь от 8 мая 2025 г. № 71-З «О риэлтерской деятельности» и в целях исполнения договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, ${AGENCY_OFFICIAL_DETAILS.shortName} просит Вас выполнить следующие услуги:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 4px 6px; width: 40px;">№ п/п</th>
                <th style="border: 1px solid #000; padding: 4px 8px;">Наименование услуги</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">1.</td>
                <td style="border: 1px solid #000; padding: 4px 8px;">Выписка из ЕГРНИ для нотариального удостоверения сделки</td>
              </tr>
            </tbody>
          </table>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 8px;">
            Сведения об объекте недвижимости, в отношении которого должны быть выполнены заказываемые услуги: инвентарный номер: <strong>${inventoryNo}</strong>, наименование объекта: <strong>${declObjNominative}</strong>, адрес объекта: <strong>${objectAddress}</strong>.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
            Собственник объекта недвижимости: <strong>${consumersNominative}</strong>.
          </p>
          <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
            Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
          </p>
        `,
        signerTitle: 'Директор',
        signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
      };
    }

    // Default fallback
    return {
      isConsent: false,
      recipient: currentInst.recipientPosition,
      title: currentInst.defaultSubject,
      outPrefix: `Исх. № ${outNumber} от ${outDate} г.`,
      bodyHtml: `
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 12px;">
          ${AGENCY_OFFICIAL_DETAILS.fullName}, в лице директора ${AGENCY_OFFICIAL_DETAILS.directorGenitive}, действующего на основании Устава, в соответствии с Законом Республики Беларусь от 08.05.2025 N 71-З «О риэлтерской деятельности», Постановлением Совета Министров Республики Беларусь от 02.04.2026 N 157 в целях исполнения договора на оказание риэлтерских услуг от «${contractDate}» № ${contractNo}, заключенного с Потребителем: ${consumersInstrumental}, по объекту: ${declObjNominative}, адрес объекта: ${objectAddress}, просит предоставить информацию в отношении указанного объекта.
        </p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 24px;">
          Просим указанную информацию передать риэлтеру <strong>${realtorDative}</strong> (идентификационная пластиковая карточка № ${realtorCard}).
        </p>
      `,
      signerTitle: 'Директор',
      signerName: AGENCY_OFFICIAL_DETAILS.directorInitialsFirst
    };
  }, [
    selectedInstKey, currentInst, persons, objectAddress, propertyType,
    contractNo, contractDate, outNumber, outDate, inventoryNo,
    selectedRealtorName, realtorCard, realtorPhone, realtorDative,
    consumersInstrumental, consumersGenitive, consumersNominative,
    declObjNominative, declObjGenitive, declObjAccusative, declObjPrepositional,
    minorName, minorBirthDate, administrationDistrict, deceasedName, deceasedDate,
    notaryOfficeName, arrestNotaryOffice, nkaUrgency
  ]);

  // Handler to print
  const handlePrint = () => {
    window.print();
  };

  // Handler to export as Microsoft Word (.doc)
  const handleWordExport = () => {
    const cleanTitle = (generatedDoc.title || currentInst.title || 'Запрос')
      .replace(/[\n\r]+/g, ' ')
      .replace(/[\\/*?:"<>|]/g, '')
      .trim();
    const safeOutNo = (outNumber || 'запрос').replace(/[\/\\]/g, '-');
    const safePerson = (persons[0]?.fullName || 'клиент').split(' ')[0].replace(/[\\/*?:"<>|]/g, '');
    const filename = `${safeOutNo}_${currentInst.key}_${safePerson}.doc`;

    exportHtmlToWord('printable-document-content', {
      filename,
      title: cleanTitle
    });
    setToastMessage('Документ успешно экспортирован в Word (.doc)!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler to copy document plain text
  const handleCopyText = () => {
    const el = document.getElementById('printable-document-content');
    if (el) {
      const text = el.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setToastMessage('Текст запроса скопирован в буфер!');
        setTimeout(() => {
          setCopySuccess(false);
          setToastMessage(null);
        }, 3000);
      });
    }
  };

  // Handler to save to local registry
  const handleSaveToRegistry = () => {
    const newReq: InstitutionalRequest = {
      id: 'req-' + Date.now(),
      institutionKey: selectedInstKey,
      institutionTitle: currentInst.title,
      institutionOfficialName: currentInst.officialName,
      addressTo: currentInst.recipientAddress,
      clientName: consumersNominative,
      clientAddress: persons[0]?.registration || objectAddress,
      objectAddress: objectAddress,
      cadastralNumber: inventoryNo,
      requestSubject: currentInst.defaultSubject,
      requestDetails: `${contractNo} от ${contractDate}`,
      outNumber: outNumber,
      outDate: outDate,
      status: 'sent',
      agentId: loggedInAgent.id,
      agentName: selectedRealtorName,
      directorName: AGENCY_OFFICIAL_DETAILS.directorShort,
      licenseNumber: AGENCY_OFFICIAL_DETAILS.license,
      createdAt: new Date().toISOString()
    };
    saveRequests([newReq, ...requestsList]);
    setToastMessage('Запрос сохранен в реестр кабинета!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      {/* Click-outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* MOBILE FLOATING CLOSE BUTTON */}
      <button 
        onClick={onClose} 
        className="sm:hidden fixed top-3 right-3 z-50 p-2.5 bg-neutral-900/90 text-white hover:bg-neutral-800 rounded-full shadow-2xl border border-neutral-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        aria-label="Закрыть окно"
      >
        <X className="w-5 h-5" />
      </button>

      {/* MODAL CONTAINER */}
      <div 
        className="relative z-10 w-full max-w-7xl h-full sm:h-[94vh] bg-stone-100 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP MODAL HEADER */}
        <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  Официальные запросы и согласия
                </h2>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  {AGENCY_OFFICIAL_DETAILS.brandName}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Автозаполнение по Закону № 71-З и Постановлению № 157 с реквизитами ООО «АН Фаттория»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'create' ? 'bg-white text-purple-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Генератор бланка
              </button>
              <button
                onClick={() => setViewMode('registry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'registry' ? 'bg-white text-purple-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Реестр запросов
                <span className="px-1.5 py-0.2 text-[10px] bg-purple-100 text-purple-700 rounded-full font-black">
                  {requestsList.length}
                </span>
              </button>
            </div>

            {/* Print, Word Export & Copy Quick Actions (visible in create mode) */}
            {viewMode === 'create' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleWordExport}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Экспортировать официальный запрос в Microsoft Word (.doc)"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden md:inline">В Word (.doc)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Распечатать документ"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden md:inline">Печать</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-all cursor-pointer"
                  title="Скопировать текст"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* MAIN DESKTOP CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all cursor-pointer ml-1"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shrink-0 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MOBILE MODE SELECTOR TABS */}
        <div className="sm:hidden flex border-b border-stone-200 bg-white">
          <button
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${mobileTab === 'form' ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-stone-500'}`}
          >
            ⚙️ Параметры и риэлтер
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${mobileTab === 'preview' ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-stone-500'}`}
          >
            📄 Предпросмотр бланка
          </button>
        </div>

        {/* MAIN BODY AREA */}
        {viewMode === 'registry' ? (
          /* REGISTRY VIEW */
          <div className="flex-1 p-6 overflow-y-auto bg-stone-50">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900">Журнал исходящих официальных запросов</h3>
                  <p className="text-xs text-stone-500">История сформированных запросов и бланков по объектам агентства</p>
                </div>
                <button
                  onClick={() => setViewMode('create')}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700"
                >
                  + Создать новый запрос
                </button>
              </div>

              {requestsList.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-stone-700">В реестре пока нет сохраненных запросов</h4>
                  <p className="text-xs text-stone-400 mt-1">Сформируйте первый запрос в генераторе и нажмите «Сохранить в реестр»</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {requestsList.map((req) => (
                    <div key={req.id} className="py-4 flex items-center justify-between hover:bg-stone-50 px-3 rounded-xl transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-900">{req.outNumber}</span>
                          <span className="text-xs text-stone-400">от {req.outDate}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
                            {req.institutionTitle}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 mt-1">{req.objectAddress || 'Объект не указан'}</h4>
                        <p className="text-xs text-stone-500">Потребитель: {req.clientName || 'Не указан'} | Риэлтер: {req.agentName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInstKey(req.institutionKey);
                            setObjectAddress(req.objectAddress || '');
                            setOutNumber(req.outNumber);
                            setOutDate(req.outDate);
                            setViewMode('create');
                          }}
                          className="p-2 text-stone-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Открыть в редакторе"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = requestsList.filter(r => r.id !== req.id);
                            saveRequests(updated);
                          }}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Удалить из журнала"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CREATE / GENERATOR 3-COLUMN / SPLIT VIEW */
          <div className="flex-1 flex overflow-hidden">
            {/* COLUMN 1: LEFT NAVIGATION (Templates & Realtor selector) */}
            <div className={`w-full sm:w-72 lg:w-80 bg-white border-r border-stone-200 flex flex-col shrink-0 ${mobileTab === 'preview' ? 'hidden sm:flex' : 'flex'}`}>
              {/* REALTOR SELECTOR CARD */}
              <div className="p-3.5 border-b border-stone-200 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    Ответственный риэлтер:
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">ООО «АН Фаттория»</span>
                </div>

                <select
                  value={selectedRealtorName}
                  onChange={(e) => handleRealtorChange(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                >
                  {availableRealtors.map((r, i) => (
                    <option key={i} value={r.name}>
                      {r.name} ({r.cardNo})
                    </option>
                  ))}
                </select>

                {/* Realtor Details Badge */}
                <div className="mt-2 p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Карточка:</span>
                    <input
                      type="text"
                      value={realtorCard}
                      onChange={(e) => setRealtorCard(e.target.value)}
                      className="text-right font-mono font-bold text-purple-900 bg-transparent border-b border-dotted border-stone-300 w-24 outline-none"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Телефон:</span>
                    <input
                      type="text"
                      value={realtorPhone}
                      onChange={(e) => setRealtorPhone(e.target.value)}
                      className="text-right font-mono text-stone-700 bg-transparent border-b border-dotted border-stone-300 w-32 outline-none"
                    />
                  </div>
                  <div className="text-[10px] text-stone-400 italic pt-0.5">
                    В запросе: передать риэлтеру {realtorDative}
                  </div>
                </div>
              </div>

              {/* SEARCH & CATEGORY FILTER */}
              <div className="p-3 border-b border-stone-200 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Поиск по инстанциям..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-2 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Все ({INSTITUTIONS_LIST.length})
                  </button>
                  <button
                    onClick={() => setCategoryFilter('housing')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'housing' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    РСЦ
                  </button>
                  <button
                    onClick={() => setCategoryFilter('health')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'health' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Медицина
                  </button>
                  <button
                    onClick={() => setCategoryFilter('consent')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'consent' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Согласия
                  </button>
                  <button
                    onClick={() => setCategoryFilter('registry')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'registry' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    БРТИ/НКА
                  </button>
                  <button
                    onClick={() => setCategoryFilter('notary')}
                    className={`px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${categoryFilter === 'notary' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Нотариус
                  </button>
                </div>
              </div>

              {/* LIST OF INSTITUTION TEMPLATES */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {filteredInstitutions.map((inst) => {
                  const isSelected = inst.key === selectedInstKey;
                  return (
                    <button
                      key={inst.key}
                      onClick={() => {
                        setSelectedInstKey(inst.key);
                        if (window.innerWidth < 640) {
                          setMobileTab('form');
                        }
                      }}
                      className={`w-full p-3 text-left transition-all flex items-start justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-50/80 border-l-4 border-purple-600' 
                          : 'hover:bg-stone-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            inst.category === 'consent' ? 'bg-amber-100 text-amber-800' :
                            inst.category === 'health' ? 'bg-rose-100 text-rose-800' :
                            inst.category === 'housing' ? 'bg-blue-100 text-blue-800' :
                            inst.category === 'protection' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {inst.badge}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold truncate leading-snug ${isSelected ? 'text-purple-900' : 'text-stone-800'}`}>
                          {inst.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                          {inst.defaultSubject}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${isSelected ? 'text-purple-600 translate-x-0.5' : 'text-stone-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: FORM / DATA PARAMETERS */}
            <div className={`w-full sm:w-80 lg:w-96 bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-y-auto ${mobileTab === 'preview' ? 'hidden' : 'flex'}`}>
              <div className="p-4 border-b border-stone-200 bg-stone-50/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                  Данные для автозаполнения
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Падежи и формулировки склоняются автоматически
                </p>
              </div>

              <div className="p-4 space-y-4 text-xs">
                {/* UNIFIED CLIENT DATA NOTICE */}
                <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 flex items-start justify-between gap-2 shadow-xs">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-purple-950 text-[11px] uppercase tracking-wide">
                        Единые данные по всем запросам
                      </div>
                      <p className="text-[10.5px] text-purple-800 leading-tight mt-0.5">
                        Внесите ФИО клиента один раз — оно автоматически действует во всех 16 шаблонах запросов (БТИ, ЗАГС, Опека, ПНД, РСЦ и др.).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToSample}
                    className="shrink-0 px-2 py-1 text-purple-700 hover:text-purple-950 hover:bg-purple-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-purple-200/60"
                    title="Сбросить к образцу"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Сбросить</span>
                  </button>
                </div>

                {/* 1. PROPERTY SELECTOR & ADDRESS */}
                <div className="space-y-2">
                  <label className="font-bold text-stone-700 flex items-center justify-between">
                    <span>Объект недвижимости:</span>
                    {propertiesList.length > 0 && (
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => {
                          const propId = e.target.value;
                          setSelectedPropertyId(propId);
                          const p = propertiesList.find(item => item.id === propId);
                          if (p) {
                            setObjectAddress(p.address);
                            if (p.inventoryNo) setInventoryNo(p.inventoryNo);
                            if (p.contractNumber) setContractNo(p.contractNumber);
                            if (p.contractDate) setContractDate(p.contractDate);
                            setPropertyType(p.type === 'apartment' ? 'квартира' : p.type === 'house' ? 'жилой дом' : 'квартира');
                            // Preserve client's entered full names and details, only update registration address if needed
                            setPersons(prev => prev.map(pers => ({
                              ...pers,
                              registration: pers.registration && pers.registration !== 'г. Минск, ул. Голубева, д. 24, кв. 63'
                                ? pers.registration
                                : p.address
                            })));
                          }
                        }}
                        className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 outline-none font-bold"
                      >
                        <option value="">Выбрать из каталога...</option>
                        {propertiesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title || p.address}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>

                  {/* Type of property (declinable!) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400">Тип объекта:</span>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-800 outline-none"
                      >
                        <option value="квартира">Квартира</option>
                        <option value="жилой дом">Жилой дом</option>
                        <option value="комната">Комната</option>
                        <option value="изолированное помещение">Изолированное пом.</option>
                        <option value="земельный участок">Земельный участок</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400">Инв. / кадастр. №:</span>
                      <input
                        type="text"
                        value={inventoryNo}
                        onChange={(e) => setInventoryNo(e.target.value)}
                        placeholder="500/D-152840"
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-mono text-stone-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400">Адрес объекта:</span>
                    <input
                      type="text"
                      value={objectAddress}
                      onChange={(e) => setObjectAddress(e.target.value)}
                      placeholder="г. Минск, ул. Голубева, д. 24, кв. 63"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 outline-none"
                    />
                  </div>
                </div>

                {/* 2. CONTRACT DETAILS */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-700 text-[11px]">Договор на риэлтерские услуги:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400">Номер договора:</span>
                      <input
                        type="text"
                        value={contractNo}
                        onChange={(e) => setContractNo(e.target.value)}
                        placeholder="823/1"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-800 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Дата договора:</span>
                      <input
                        type="text"
                        value={contractDate}
                        onChange={(e) => setContractDate(e.target.value)}
                        placeholder="10 июля 2026 г."
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                    <div>
                      <span className="text-[10px] text-stone-400">Исх. № запроса:</span>
                      <input
                        type="text"
                        value={outNumber}
                        onChange={(e) => setOutNumber(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-mono text-purple-900 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Дата запроса:</span>
                      <input
                        type="text"
                        value={outDate}
                        onChange={(e) => setOutDate(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PERSONS / CLIENTS LIST */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-700">
                      Собственники / Потребители ({persons.length}):
                    </label>
                    <button
                      type="button"
                      onClick={addPerson}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Добавить лицо
                    </button>
                  </div>

                  {persons.map((p, idx) => (
                    <div key={p.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative">
                      {persons.length > 1 && (
                        <button
                          onClick={() => removePerson(p.id)}
                          className="absolute top-2 right-2 text-stone-400 hover:text-rose-600 p-1"
                          title="Удалить лицо"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div>
                        <span className="text-[10px] text-stone-400">ФИО #{idx + 1} (Именительный):</span>
                        <input
                          type="text"
                          value={p.fullName}
                          onChange={(e) => updatePerson(p.id, 'fullName', e.target.value)}
                          placeholder="Козлова Ольга Васильевна"
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400">Дата рождения:</span>
                          <input
                            type="text"
                            value={p.birthDate}
                            onChange={(e) => updatePerson(p.id, 'birthDate', e.target.value)}
                            placeholder="20.12.1981"
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400">Доля (если есть):</span>
                          <input
                            type="text"
                            value={p.share}
                            onChange={(e) => updatePerson(p.id, 'share', e.target.value)}
                            placeholder="1/2 (одна вторая)"
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400">Адрес регистрации:</span>
                        <input
                          type="text"
                          value={p.registration}
                          onChange={(e) => updatePerson(p.id, 'registration', e.target.value)}
                          placeholder="г. Минск, ул. Голубева, д. 24, кв. 63"
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4. SPECIAL DYNAMIC FIELDS PER INSTITUTION */}
                {selectedInstKey === 'sop' && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                    <div className="font-bold text-purple-900 text-[11px]">Данные опеки и ребенка (СОП):</div>
                    <div>
                      <span className="text-[10px] text-stone-500">Администрация района:</span>
                      <input
                        type="text"
                        value={administrationDistrict}
                        onChange={(e) => setAdministrationDistrict(e.target.value)}
                        placeholder="Фрунзенского района г. Минска"
                        className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500">ФИО несовершеннолетнего:</span>
                      <input
                        type="text"
                        value={minorName}
                        onChange={(e) => setMinorName(e.target.value)}
                        placeholder="Курневич Марк Юрьевич"
                        className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500">Дата рождения ребенка:</span>
                      <input
                        type="text"
                        value={minorBirthDate}
                        onChange={(e) => setMinorBirthDate(e.target.value)}
                        placeholder="30.11.2016 г.р."
                        className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedInstKey === 'notary_inheritance' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <div className="font-bold text-amber-900 text-[11px]">Данные наследственного дела:</div>
                    <div>
                      <span className="text-[10px] text-stone-500">Нотариальная контора:</span>
                      <textarea
                        rows={2}
                        value={notaryOfficeName}
                        onChange={(e) => setNotaryOfficeName(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500">ФИО умершего:</span>
                      <input
                        type="text"
                        value={deceasedName}
                        onChange={(e) => setDeceasedName(e.target.value)}
                        placeholder="Чернова Галина Никитична"
                        className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500">Дата смерти:</span>
                      <input
                        type="text"
                        value={deceasedDate}
                        onChange={(e) => setDeceasedDate(e.target.value)}
                        placeholder="04 октября 2025 года"
                        className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedInstKey === 'nka' && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <div className="font-bold text-blue-900 text-[11px]">Срочность НКА:</div>
                    <select
                      value={nkaUrgency}
                      onChange={(e) => setNkaUrgency(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-800 outline-none"
                    >
                      <option value="обычный порядок">Обычный порядок</option>
                      <option value="срочно (1 рабочий день)">Срочно (1 рабочий день)</option>
                    </select>
                  </div>
                )}

                {/* DECLENSION HELPER TOGGLE */}
                <div className="pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowDeclensionHelper(!showDeclensionHelper)}
                    className="text-[11px] text-stone-500 hover:text-purple-600 flex items-center justify-between w-full font-medium"
                  >
                    <span>🔍 Проверить склонение в запросе</span>
                    <span>{showDeclensionHelper ? '▲' : '▼'}</span>
                  </button>

                  {showDeclensionHelper && (
                    <div className="mt-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 text-[11px] text-stone-600">
                      <div>
                        <strong>Творительный (с Потребителем):</strong><br />
                        <span className="text-purple-900 font-bold">{consumersInstrumental}</span>
                      </div>
                      <div>
                        <strong>Родительный (принадлежащей):</strong><br />
                        <span className="text-purple-900 font-bold">{consumersGenitive}</span>
                      </div>
                      <div>
                        <strong>Объект:</strong><br />
                        Им: {declObjNominative}, Вин: {declObjAccusative}, Род: {declObjGenitive}
                      </div>
                      <div>
                        <strong>Риэлтеру:</strong><br />
                        {realtorDative}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM SAVE BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveToRegistry}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    Сохранить запрос в реестр
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 3: LIVE PREVIEW (PRINTABLE OFFICIAL FORM - STRICTLY 1 SHEET A4) */}
            <div className={`flex-1 bg-stone-200/70 p-3 sm:p-6 lg:p-8 overflow-y-auto flex flex-col items-center gap-3 ${mobileTab === 'form' ? 'hidden sm:flex' : 'flex'}`}>
              
              {/* STICKY QUICK ACTION BAR OVER SHEET */}
              <div className="w-full max-w-[794px] bg-white border border-stone-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 text-xs shrink-0 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-stone-700">Формат А4:</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-black text-[11px]">
                    Строго 1 лист
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleWordExport}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Скачать файл в формате Microsoft Word (.doc)"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>В Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Печать на принтере (Ctrl+P)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Копировать текст запроса"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden md:inline">Копировать</span>
                  </button>
                </div>
              </div>

              <div 
                id="printable-document-content"
                className="w-full max-w-[794px] min-h-[960px] bg-white text-black p-6 sm:p-10 shadow-2xl rounded-sm border border-stone-300 font-serif leading-snug text-[12.5px] flex flex-col justify-between"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  lineHeight: '1.3'
                }}
              >
                <div>
                  {/* OFFICIAL LETTERHEAD (IN EXACT ACCORDANCE WITH USER'S PHOTO & REQUISITES) */}
                  {!generatedDoc.isConsent && (
                    <div className="text-center mb-4 pb-1">
                      <h3 className="text-[10.5px] font-sans font-normal tracking-wide uppercase">
                        ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ
                      </h3>
                      <h2 className="text-[13.5px] font-sans font-black tracking-widest uppercase my-0.5">
                        {AGENCY_OFFICIAL_DETAILS.brandName}
                      </h2>
                      <p className="text-[9.5px] font-sans">
                        Лицензия №02240/446 выдана 11 июля 2022 Министерством юстиции Республики Беларусь
                      </p>
                      <p className="text-[9.5px] font-sans">
                        {AGENCY_OFFICIAL_DETAILS.countryAddress} • {AGENCY_OFFICIAL_DETAILS.bankShort}
                      </p>
                      <p className="text-[9.5px] font-sans font-bold">
                        УНП {AGENCY_OFFICIAL_DETAILS.unp} &nbsp;&nbsp;&nbsp;&nbsp; ОКПО {AGENCY_OFFICIAL_DETAILS.okpo} &nbsp;&nbsp;&nbsp;&nbsp; Тел. {AGENCY_OFFICIAL_DETAILS.phone} &nbsp;&nbsp;&nbsp;&nbsp; e-mail: {AGENCY_OFFICIAL_DETAILS.email}
                      </p>
                      <div className="border-b border-black mt-1.5 mb-3 w-full"></div>
                    </div>
                  )}

                  {/* DATE & OUT NUMBER + RECIPIENT HEADER */}
                  {!generatedDoc.isConsent && (
                    <div className="flex justify-between items-start mb-4 text-[12.5px]">
                      <div className="w-1/2 pt-0.5 font-serif whitespace-pre-line font-medium leading-tight">
                        {generatedDoc.outPrefix}
                      </div>
                      <div className="w-1/2 text-right font-serif whitespace-pre-line leading-tight">
                        {generatedDoc.recipient}
                      </div>
                    </div>
                  )}

                  {/* DOCUMENT TITLE */}
                  {generatedDoc.title && !generatedDoc.isConsent && (
                    <div className="text-center font-bold text-[14px] tracking-wide my-3 uppercase whitespace-pre-line font-serif">
                      {generatedDoc.title}
                    </div>
                  )}

                  {/* DOCUMENT BODY */}
                  <div 
                    className="doc-body text-[12.5px] text-justify leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: generatedDoc.bodyHtml }}
                  />
                </div>

                {/* SIGNATURE BLOCK */}
                {!generatedDoc.isConsent && (
                  <div className="mt-8 pt-4 flex justify-between items-end text-[13px] font-serif" style={{ breakInside: 'avoid' }}>
                    <div className="font-bold">
                      {generatedDoc.signerTitle}
                    </div>
                    <div className="font-bold">
                      {generatedDoc.signerName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY CSS */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 12mm 8mm 12mm;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: avoid !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-document-content, #printable-document-content * {
            visibility: visible !important;
          }
          #printable-document-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 186mm !important;
            max-height: 280mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 2mm 4mm !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            font-size: 11.5px !important;
            line-height: 1.25 !important;
          }
          #printable-document-content .doc-body {
            font-size: 11.5px !important;
            line-height: 1.25 !important;
          }
        }
      `}</style>
    </div>
  );
};
