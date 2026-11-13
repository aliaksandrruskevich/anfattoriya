import { Buyer, Property } from '../types';

export interface MatchResult {
  buyer: Buyer;
  property: Property;
  score: number; // 0 to 100
  breakdown: {
    propertyType: { match: boolean; points: number; label: string };
    district: { match: boolean; points: number; label: string };
    budget: { match: boolean; points: number; label: string };
    rooms: { match: boolean; points: number; label: string };
    area: { match: boolean; points: number; label: string };
    floor?: { match: boolean; points: number; label: string };
  };
  matchedAt: string;
}

/**
 * Calculates match percentage score (0-100%) between a buyer and a property
 * according to the АН Фаттория CRM specification:
 * - Property Type (Strict qualifier: 0 if mismatch)
 * - Budget (Strict qualifier: 0 if exceeds by > 8%)
 * - Rooms (Strict for apartments if specified)
 * - District (Location match)
 * - Area (Area range match)
 * - Floor (Floor preference)
 */
export function checkMatch(buyer: Buyer, property: Property): MatchResult {
  // 1. STRICT DISQUALIFIER: PROPERTY TYPE
  const buyerType = buyer.prefType || (buyer.searchCriteria?.propertyType);
  if (buyerType && buyerType !== 'all') {
    if (property.type !== buyerType) {
      return {
        buyer,
        property,
        score: 0,
        breakdown: {
          propertyType: { match: false, points: 0, label: `Требуется ${buyerType === 'apartment' ? 'квартира' : buyerType === 'house' ? 'дом' : buyerType === 'commercial' ? 'коммерция' : 'участок'}` },
          district: { match: false, points: 0, label: '—' },
          budget: { match: false, points: 0, label: '—' },
          rooms: { match: false, points: 0, label: '—' },
          area: { match: false, points: 0, label: '—' }
        },
        matchedAt: new Date().toISOString()
      };
    }
  }

  // 2. BUDGET MATCH (Max 30 points, Disqualifier if price > budget + 8%)
  const buyerBudgetUSD = buyer.budgetUSD || (buyer.budgetBYN ? Math.round(buyer.budgetBYN / 3.27) : 0);
  const propertyPriceUSD = property.priceUSD || (property.priceBYN ? Math.round(property.priceBYN / 3.27) : 0);
  
  let budgetMatch = false;
  let budgetPoints = 0;
  let budgetLabel = 'Бюджет ниже цены';

  if (buyerBudgetUSD > 0 && propertyPriceUSD > 0) {
    if (propertyPriceUSD <= buyerBudgetUSD) {
      budgetMatch = true;
      budgetPoints = 30;
      budgetLabel = `В бюджете ($${propertyPriceUSD.toLocaleString()} <= $${buyerBudgetUSD.toLocaleString()})`;
    } else if (propertyPriceUSD <= buyerBudgetUSD * 1.08) {
      budgetMatch = true;
      budgetPoints = 22;
      budgetLabel = `Торг до 8% ($${propertyPriceUSD.toLocaleString()})`;
    } else {
      // Disqualify if too expensive
      return {
        buyer,
        property,
        score: 0,
        breakdown: {
          propertyType: { match: true, points: 20, label: 'Тип совпадает' },
          district: { match: false, points: 0, label: '—' },
          budget: { match: false, points: 0, label: `Превышает бюджет ($${propertyPriceUSD.toLocaleString()} > $${buyerBudgetUSD.toLocaleString()})` },
          rooms: { match: false, points: 0, label: '—' },
          area: { match: false, points: 0, label: '—' }
        },
        matchedAt: new Date().toISOString()
      };
    }
  } else {
    budgetMatch = true;
    budgetPoints = 25;
    budgetLabel = 'Бюджет не ограничен';
  }

  // 3. ROOMS MATCH (Max 25 points)
  const buyerRooms = buyer.prefRooms || (buyer.searchCriteria?.rooms && buyer.searchCriteria.rooms[0]) || null;
  const propRooms = property.rooms || null;

  let roomsMatch = false;
  let roomsPoints = 0;
  let roomsLabel = 'Не совпадает';

  if (property.type === 'apartment' && buyerRooms) {
    if (propRooms && Number(buyerRooms) === Number(propRooms)) {
      roomsMatch = true;
      roomsPoints = 25;
      roomsLabel = `${propRooms}-комн. совпадает`;
    } else if (!propRooms) {
      roomsMatch = true;
      roomsPoints = 15;
      roomsLabel = 'Комнатность не указана';
    } else {
      // Different rooms for apartment
      roomsMatch = false;
      roomsPoints = 0;
      roomsLabel = `${propRooms}-к вместо ${buyerRooms}-к`;
    }
  } else {
    roomsMatch = true;
    roomsPoints = 25;
    roomsLabel = buyerRooms ? `${buyerRooms}-комн.` : 'Любое число комнат';
  }

  // 4. DISTRICT MATCH (Max 25 points)
  const buyerDistrict = (
    buyer.prefDistrict ||
    buyer.searchCriteria?.district ||
    (buyer.searchCriteria?.districts && buyer.searchCriteria.districts[0]) ||
    ''
  ).trim().toLowerCase();

  const propertyLoc = (
    property.location ||
    property.address ||
    (property.features && property.features.join(' ')) ||
    ''
  ).trim().toLowerCase();

  let districtMatch = false;
  let districtPoints = 0;
  let districtLabel = 'Другой район';

  if (buyerDistrict && buyerDistrict !== 'любой' && buyerDistrict !== 'все' && buyerDistrict !== 'all') {
    const dClean = buyerDistrict.replace(' район', '').replace(' р-н', '').trim();
    if (propertyLoc.includes(dClean) || (property.title && property.title.toLowerCase().includes(dClean))) {
      districtMatch = true;
      districtPoints = 25;
      districtLabel = `${buyer.prefDistrict || dClean} (совпадает)`;
    } else {
      districtMatch = false;
      districtPoints = 5;
      districtLabel = 'Не в целевом районе';
    }
  } else {
    districtMatch = true;
    districtPoints = 25;
    districtLabel = 'Любой район';
  }

  // 5. AREA MATCH (Max 20 points)
  const minArea = buyer.minArea || buyer.searchCriteria?.minArea || buyer.searchCriteria?.areaMin || 0;
  const maxArea = buyer.maxArea || buyer.searchCriteria?.maxArea || buyer.searchCriteria?.areaMax || 9999;
  const propArea = property.area || 0;

  let areaMatch = false;
  let areaPoints = 0;
  let areaLabel = 'Не в диапазоне';

  if (propArea > 0) {
    if (propArea >= minArea * 0.95 && (maxArea === 9999 || propArea <= maxArea * 1.05)) {
      areaMatch = true;
      areaPoints = 20;
      areaLabel = `${propArea} м² (подходит)`;
    } else {
      areaMatch = false;
      areaPoints = 5;
      areaLabel = `${propArea} м² (меньше мин. ${minArea} м²)`;
    }
  } else {
    areaMatch = true;
    areaPoints = 15;
    areaLabel = 'Площадь не указана';
  }

  // 6. FLOOR PREFERENCE (Bonus / Penalty)
  const floorPref = buyer.prefFloor || buyer.searchCriteria?.floorPreference;
  let floorMatch = true;
  let floorPoints = 10;
  let floorLabel = 'Любой этаж';

  if (floorPref && floorPref !== 'any') {
    const f = property.floor;
    const tf = property.totalFloors;
    if (f) {
      if (floorPref === 'not_first' && f === 1) {
        floorMatch = false;
        floorPoints = 0;
        floorLabel = '1-й этаж (не подходит)';
      } else if (floorPref === 'not_last' && tf && f === tf && f > 1) {
        floorMatch = false;
        floorPoints = 0;
        floorLabel = 'Последний этаж (не подходит)';
      } else if (floorPref === 'middle' && (f === 1 || (tf && f === tf))) {
        floorMatch = false;
        floorPoints = 2;
        floorLabel = 'Крайний этаж (желателен средний)';
      } else {
        floorMatch = true;
        floorPoints = 10;
        floorLabel = `Этаж ${f}${tf ? '/' + tf : ''} подходит`;
      }
    }
  }

  // 7. CONDITION / RENOVATION
  const conditionPref = buyer.prefCondition || buyer.searchCriteria?.condition || buyer.searchCriteria?.renovation;
  let conditionMatch = true;
  let conditionPoints = 10;
  let conditionLabel = 'Любое состояние';

  if (conditionPref && conditionPref !== 'any') {
    const featStr = ((property.features || []).join(' ') + ' ' + (property.description || '')).toLowerCase();
    if (conditionPref === 'euro' || conditionPref.includes('евро')) {
      if (featStr.includes('евро') || featStr.includes('дизайн') || featStr.includes('люкс') || featStr.includes('отличный ремонт')) {
        conditionPoints = 10;
        conditionLabel = 'Евроремонт (совпадает)';
      } else {
        conditionMatch = false;
        conditionPoints = 3;
        conditionLabel = 'Не евроремонт';
      }
    } else if (conditionPref === 'raw' || conditionPref.includes('чернов') || conditionPref.includes('отделк')) {
      if (featStr.includes('без отделки') || featStr.includes('чернов') || featStr.includes('чистовая') || featStr.includes('свободная планировка')) {
        conditionPoints = 10;
        conditionLabel = 'Без отделки (совпадает)';
      } else {
        conditionMatch = false;
        conditionPoints = 3;
        conditionLabel = 'С готовой отделкой';
      }
    } else if (conditionPref === 'good' || conditionPref.includes('хорош')) {
      conditionPoints = 10;
      conditionLabel = 'Хорошее состояние';
    }
  }

  const rawSum = budgetPoints + roomsPoints + districtPoints + areaPoints + floorPoints + conditionPoints;
  const totalScore = Math.min(100, Math.round((rawSum / 120) * 100));

  return {
    buyer,
    property,
    score: totalScore,
    breakdown: {
      propertyType: { match: true, points: 20, label: 'Тип совпадает' },
      district: { match: districtMatch, points: districtPoints, label: districtLabel },
      budget: { match: budgetMatch, points: budgetPoints, label: budgetLabel },
      rooms: { match: roomsMatch, points: roomsPoints, label: roomsLabel },
      area: { match: areaMatch, points: areaPoints, label: areaLabel },
      floor: { match: floorMatch, points: floorPoints, label: floorLabel }
    },
    matchedAt: new Date().toISOString()
  };
}

/**
 * Finds all matches with score >= minScore (default 70%)
 * between a list of buyers and a list of properties.
 */
export function findMatches(
  buyers: Buyer[],
  properties: Property[],
  minScore = 70
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const buyer of buyers) {
    for (const property of properties) {
      const match = checkMatch(buyer, property);
      if (match.score >= minScore) {
        results.push(match);
      }
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}
