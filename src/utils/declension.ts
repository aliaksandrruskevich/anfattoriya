// Utilities for declension of Russian names and real estate terms

export type GrammaticalCase = 'nominative' | 'genitive' | 'dative' | 'accusative' | 'instrumental' | 'prepositional';

export function declinePropertyType(type: string, targetCase: GrammaticalCase): string {
  const clean = (type || 'квартира').toLowerCase().trim();
  
  if (clean.includes('квартир')) {
    switch (targetCase) {
      case 'nominative': return 'квартира';
      case 'genitive': return 'квартиры';
      case 'dative': return 'квартире';
      case 'accusative': return 'квартиру';
      case 'instrumental': return 'квартирой';
      case 'prepositional': return 'квартире';
    }
  }

  if (clean.includes('дом') || clean.includes('коттедж')) {
    switch (targetCase) {
      case 'nominative': return 'жилой дом';
      case 'genitive': return 'жилого дома';
      case 'dative': return 'жилому дому';
      case 'accusative': return 'жилой дом';
      case 'instrumental': return 'жилым домом';
      case 'prepositional': return 'жилом доме';
    }
  }

  if (clean.includes('комнат')) {
    switch (targetCase) {
      case 'nominative': return 'комната';
      case 'genitive': return 'комнаты';
      case 'dative': return 'комнате';
      case 'accusative': return 'комнату';
      case 'instrumental': return 'комнатой';
      case 'prepositional': return 'комнате';
    }
  }

  if (clean.includes('помещен')) {
    switch (targetCase) {
      case 'nominative': return 'изолированное помещение';
      case 'genitive': return 'изолированного помещения';
      case 'dative': return 'изолированному помещению';
      case 'accusative': return 'изолированное помещение';
      case 'instrumental': return 'изолированным помещением';
      case 'prepositional': return 'изолированном помещении';
    }
  }

  if (clean.includes('участ')) {
    switch (targetCase) {
      case 'nominative': return 'земельный участок';
      case 'genitive': return 'земельного участка';
      case 'dative': return 'земельному участку';
      case 'accusative': return 'земельный участок';
      case 'instrumental': return 'земельным участком';
      case 'prepositional': return 'земельном участке';
    }
  }

  return clean;
}

// Helper to decline patronymic
function declinePatronymic(patronymic: string, targetCase: GrammaticalCase): string {
  const p = patronymic.trim();
  if (!p) return '';
  const isFemale = p.endsWith('на');

  if (isFemale) {
    // Ивановна, Сергеевна, Никитична
    switch (targetCase) {
      case 'nominative': return p;
      case 'genitive': return p.slice(0, -1) + 'ы';
      case 'dative': return p.slice(0, -1) + 'е';
      case 'accusative': return p.slice(0, -1) + 'у';
      case 'instrumental': return p.slice(0, -1) + 'ой';
      case 'prepositional': return p.slice(0, -1) + 'е';
    }
  } else {
    // Иванович, Сергеевич, Ильич
    switch (targetCase) {
      case 'nominative': return p;
      case 'genitive': return p + 'а';
      case 'dative': return p + 'у';
      case 'accusative': return p + 'а';
      case 'instrumental': return p + 'ем';
      case 'prepositional': return p + 'е';
    }
  }
}

// Helper to decline first name
function declineFirstName(name: string, isFemale: boolean, targetCase: GrammaticalCase): string {
  const n = name.trim();
  if (!n) return '';

  if (isFemale) {
    if (n.endsWith('ия')) { // Юлия, Мария
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return n.slice(0, -1) + 'и';
        case 'dative': return n.slice(0, -1) + 'и';
        case 'accusative': return n.slice(0, -1) + 'ю';
        case 'instrumental': return n.slice(0, -1) + 'ей';
        case 'prepositional': return n.slice(0, -1) + 'и';
      }
    }
    if (n.endsWith('ья')) { // Дарья
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return n.slice(0, -1) + 'и';
        case 'dative': return n.slice(0, -1) + 'е';
        case 'accusative': return n.slice(0, -1) + 'ю';
        case 'instrumental': return n.slice(0, -1) + 'ей';
        case 'prepositional': return n.slice(0, -1) + 'е';
      }
    }
    if (n.endsWith('а')) { // Елена, Ольга, Анна
      const stem = n.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + (['г', 'к', 'х', 'ж', 'ч', 'ш', 'щ'].includes(stem.slice(-1).toLowerCase()) ? 'и' : 'ы');
        case 'dative': return stem + 'е';
        case 'accusative': return stem + 'у';
        case 'instrumental': return stem + 'ой';
        case 'prepositional': return stem + 'е';
      }
    }
    if (n.endsWith('я')) { // Надежда, Зоя
      const stem = n.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + 'и';
        case 'dative': return stem + 'е';
        case 'accusative': return stem + 'ю';
        case 'instrumental': return stem + 'ей';
        case 'prepositional': return stem + 'е';
      }
    }
    if (n.endsWith('ь')) { // Любовь
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return n.slice(0, -1) + 'и';
        case 'dative': return n.slice(0, -1) + 'и';
        case 'accusative': return n;
        case 'instrumental': return n.slice(0, -1) + 'ью';
        case 'prepositional': return n.slice(0, -1) + 'и';
      }
    }
    return n;
  } else {
    // Male names
    if (n.endsWith('й')) { // Андрей, Сергей, Юрий
      const stem = n.slice(0, -1);
      const isI = n.endsWith('ий');
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + 'я';
        case 'dative': return stem + 'ю';
        case 'accusative': return stem + 'я';
        case 'instrumental': return stem + 'ем';
        case 'prepositional': return isI ? stem + 'и' : stem + 'е';
      }
    }
    if (n.endsWith('ь')) { // Игорь
      const stem = n.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + 'я';
        case 'dative': return stem + 'ю';
        case 'accusative': return stem + 'я';
        case 'instrumental': return stem + 'ем';
        case 'prepositional': return stem + 'е';
      }
    }
    if (n.endsWith('а')) { // Никита, Илья
      const stem = n.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + 'ы';
        case 'dative': return stem + 'е';
        case 'accusative': return stem + 'у';
        case 'instrumental': return stem + 'ой';
        case 'prepositional': return stem + 'е';
      }
    }
    if (n.endsWith('я')) { // Илья
      const stem = n.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return stem + 'и';
        case 'dative': return stem + 'е';
        case 'accusative': return stem + 'ю';
        case 'instrumental': return stem + 'ей';
        case 'prepositional': return stem + 'е';
      }
    }
    // Consonant ending (Иван, Максим, Александр, Марк, Павел -> Павла)
    if (n.toLowerCase() === 'павел') {
      switch (targetCase) {
        case 'nominative': return n;
        case 'genitive': return 'Павла';
        case 'dative': return 'Павлу';
        case 'accusative': return 'Павла';
        case 'instrumental': return 'Павлом';
        case 'prepositional': return 'Павле';
      }
    }
    switch (targetCase) {
      case 'nominative': return n;
      case 'genitive': return n + 'а';
      case 'dative': return n + 'у';
      case 'accusative': return n + 'а';
      case 'instrumental': return n + 'ом';
      case 'prepositional': return n + 'е';
    }
  }
}

// Helper to decline surname
function declineSurname(surname: string, isFemale: boolean, targetCase: GrammaticalCase): string {
  const s = surname.trim();
  if (!s) return '';

  if (isFemale) {
    // -ова, -ева, -ина, -ына
    if (s.endsWith('ова') || s.endsWith('ева') || s.endsWith('ёва') || s.endsWith('ина') || s.endsWith('ына')) {
      const stem = s.slice(0, -1);
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return stem + 'ой';
        case 'dative': return stem + 'ой';
        case 'accusative': return stem + 'у';
        case 'instrumental': return stem + 'ой';
        case 'prepositional': return stem + 'ой';
      }
    }
    // -ская, -цкая
    if (s.endsWith('ая')) {
      const stem = s.slice(0, -2);
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return stem + 'ой';
        case 'dative': return stem + 'ой';
        case 'accusative': return stem + 'ую';
        case 'instrumental': return stem + 'ой';
        case 'prepositional': return stem + 'ой';
      }
    }
    // Other female surnames (Касянюк, Васюкович, Цодова - if Цодова handled above, Черных, etc.) do NOT decline
    return s;
  } else {
    // Male surnames
    // -ов, -ев, -ин, -ын
    if (s.endsWith('ов') || s.endsWith('ев') || s.endsWith('ёв') || s.endsWith('ин') || s.endsWith('ын')) {
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return s + 'а';
        case 'dative': return s + 'у';
        case 'accusative': return s + 'а';
        case 'instrumental': return s + 'ым';
        case 'prepositional': return s + 'е';
      }
    }
    // -ский, -цкий
    if (s.endsWith('ий') || s.endsWith('ый')) {
      const stem = s.slice(0, -2);
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return stem + 'ого';
        case 'dative': return stem + 'ому';
        case 'accusative': return stem + 'ого';
        case 'instrumental': return stem + 'им';
        case 'prepositional': return stem + 'ом';
      }
    }
    // -ич, -ак, -ек, -ок, -ук, -юк (Васюкович, Гордович, Касянюк, Чернов)
    if (s.endsWith('ич') || s.endsWith('ук') || s.endsWith('юк') || s.endsWith('ак') || s.endsWith('ец')) {
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return s + 'а';
        case 'dative': return s + 'у';
        case 'accusative': return s + 'а';
        case 'instrumental': return s.endsWith('ич') ? s + 'ем' : s + 'ом';
        case 'prepositional': return s + 'е';
      }
    }
    // Other male surnames on consonant
    const lastChar = s.slice(-1).toLowerCase();
    if (!['а', 'я', 'о', 'е', 'и', 'ы', 'у', 'ю', 'э'].includes(lastChar)) {
      switch (targetCase) {
        case 'nominative': return s;
        case 'genitive': return s + 'а';
        case 'dative': return s + 'у';
        case 'accusative': return s + 'а';
        case 'instrumental': return s + 'ом';
        case 'prepositional': return s + 'е';
      }
    }
    return s;
  }
}

/**
 * Main declineFullName function
 * Accepts full name: "Козлова Ольга Васильевна" or "Васюкович Андрей Александрович"
 */
export function declineFullName(fullName: string, targetCase: GrammaticalCase): string {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (targetCase === 'nominative') return fullName.trim();

  let surname = parts[0] || '';
  let firstName = parts[1] || '';
  let patronymic = parts[2] || '';

  // Determine gender by patronymic or name or surname
  let isFemale = false;
  if (patronymic) {
    isFemale = patronymic.endsWith('на');
  } else if (firstName) {
    isFemale = firstName.endsWith('а') || firstName.endsWith('я') || firstName.endsWith('ь');
  } else if (surname) {
    isFemale = surname.endsWith('а') || surname.endsWith('ая');
  }

  const declinedSurname = declineSurname(surname, isFemale, targetCase);
  const declinedFirstName = firstName ? declineFirstName(firstName, isFemale, targetCase) : '';
  const declinedPatronymic = patronymic ? declinePatronymic(patronymic, targetCase) : '';

  return [declinedSurname, declinedFirstName, declinedPatronymic].filter(Boolean).join(' ');
}
