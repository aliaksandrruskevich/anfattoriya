"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Landmark, HelpCircle, Check, Percent, Calendar } from 'lucide-react';
import { getNbrbRate, fetchNbrbRate, subscribeUsdRate } from '../utils/exchangeRate';

export default function MortgageCalculator() {
  const [objectPrice, setObjectPrice] = useState<number>(75000); // USD
  const [currency, setCurrency] = useState<'USD' | 'BYN'>('USD');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(11.5); // Approx standard Belarus Express Mortgage Rate
  const [paymentType, setPaymentType] = useState<'annuity' | 'differentiated'>('differentiated');

  const [usdToBynRate, setUsdToBynRate] = useState<number>(() => getNbrbRate());

  useEffect(() => {
    const unsubscribe = subscribeUsdRate((rate) => setUsdToBynRate(rate));
    fetchNbrbRate();
    return unsubscribe;
  }, []);

  // Sync converted amounts
  const priceInUSD = currency === 'USD' ? objectPrice : Math.round(objectPrice / usdToBynRate);
  const priceInBYN = currency === 'BYN' ? objectPrice : Math.round(objectPrice * usdToBynRate);

  const downPaymentAmount = useMemo(() => {
    return Math.round((objectPrice * downPaymentPercent) / 100);
  }, [objectPrice, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return objectPrice - downPaymentAmount;
  }, [objectPrice, downPaymentAmount]);

  // Comprehensive Mortgage math
  const calculations = useMemo(() => {
    if (loanAmount <= 0) return { monthlyPayment: 0, totalPaid: 0, overpay: 0, payments: [] };

    const totalMonths = loanTermYears * 12;
    const monthlyRate = (interestRate / 100) / 12;

    if (paymentType === 'annuity') {
      // Annuity Formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
      const x = Math.pow(1 + monthlyRate, totalMonths);
      const monthlyPayment = Math.round(loanAmount * (monthlyRate * x) / (x - 1));
      const totalPaid = monthlyPayment * totalMonths;
      const overpay = totalPaid - loanAmount;

      const payments = [];
      let remainingBalance = loanAmount;
      for (let m = 1; m <= Math.min(totalMonths, 12); m++) {
        const interestAccrued = remainingBalance * monthlyRate;
        const principalRepaid = monthlyPayment - interestAccrued;
        remainingBalance -= principalRepaid;
        payments.push({
          month: m,
          payment: monthlyPayment,
          principal: Math.round(principalRepaid),
          interest: Math.round(interestAccrued),
          balance: Math.max(0, Math.round(remainingBalance)),
        });
      }

      return {
        monthlyPayment,
        totalPaid: Math.round(totalPaid),
        overpay: Math.round(overpay),
        payments,
      };
    } else {
      // Differentiated Formula: principalRepay is equal, interest decreases.
      const monthlyPrincipalRepay = loanAmount / totalMonths;
      let remainingBalance = loanAmount;
      const payments = [];
      let totalPaidSum = 0;

      for (let m = 1; m <= totalMonths; m++) {
        const interestAccrued = remainingBalance * monthlyRate;
        const currentPayment = monthlyPrincipalRepay + interestAccrued;
        totalPaidSum += currentPayment;

        if (m <= 12) {
          payments.push({
            month: m,
            payment: Math.round(currentPayment),
            principal: Math.round(monthlyPrincipalRepay),
            interest: Math.round(interestAccrued),
            balance: Math.max(0, Math.round(remainingBalance - monthlyPrincipalRepay)),
          });
        }
        remainingBalance -= monthlyPrincipalRepay;
      }

      const overpay = totalPaidSum - loanAmount;

      return {
        monthlyPayment: payments[0] ? payments[0].payment : 0, // First (maximum) month
        totalPaid: Math.round(totalPaidSum),
        overpay: Math.round(overpay),
        payments,
      };
    }
  }, [loanAmount, loanTermYears, interestRate, paymentType]);

  const currencySign = currency === 'USD' ? '$' : 'р.';

  return (
    <div id="mortgage-calc-root" className="bg-transparent border border-stone-200 text-neutral-900 overflow-hidden p-6 md:p-8 font-sans rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 mb-6 gap-4">
        <div>
          <h2 id="calc-title" className="text-2xl font-bold tracking-tight text-neutral-900 font-sans flex items-center gap-2">
            <Landmark className="w-6 h-6 text-purple-600" />
            Калькулятор кредита «Ипотека-Экспресс»
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Оцените свои ежемесячные платежи на недвижимость в Минске по актуальным ставкам</p>
        </div>
        <div className="flex items-center border border-stone-200 p-1 rounded-lg self-end md:self-auto">
          <button
            id="currency-usd"
            onClick={() => {
              if (currency === 'BYN') {
                setCurrency('USD');
                setObjectPrice(Math.round(objectPrice / usdToBynRate));
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              currency === 'USD' ? 'bg-purple-500 text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            USD ($)
          </button>
          <button
            id="currency-byn"
            onClick={() => {
              if (currency === 'USD') {
                setCurrency('BYN');
                setObjectPrice(Math.round(objectPrice * usdToBynRate));
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              currency === 'BYN' ? 'bg-purple-500 text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            BYN (р.)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Price */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label id="label-price" className="text-xs font-bold uppercase tracking-wider text-neutral-600">Стоимость недвижимости</label>
              <div className="text-xs text-neutral-500">
                {currency === 'USD' ? `≈ ${(objectPrice * usdToBynRate).toLocaleString()} BYN` : `≈ ${Math.round(objectPrice / usdToBynRate).toLocaleString()} USD`}
              </div>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-mono text-sm leading-none">
                {currencySign}
              </span>
              <input
                id="input-price"
                type="number"
                value={objectPrice}
                onChange={(e) => setObjectPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-base font-semibold pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-transparent border border-stone-300 text-neutral-900 transition-all font-mono"
              />
            </div>
            <input
              id="slider-price"
              type="range"
              min={currency === 'USD' ? 10000 : 30000}
              max={currency === 'USD' ? 500000 : 1500000}
              step={1000}
              value={objectPrice}
              onChange={(e) => setObjectPrice(parseInt(e.target.value))}
              className="w-full accent-purple-600 mt-2 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label id="label-downpayment" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Первоначальный взнос ({downPaymentPercent}%)
              </label>
              <span className="text-xs font-semibold text-neutral-700 font-mono">
                {downPaymentAmount.toLocaleString()} {currencySign}
              </span>
            </div>
            <input
              id="slider-downpayment"
              type="range"
              min="0"
              max="90"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
              <span>0% (Без взноса)</span>
              <span>20% (Рекомендуемый)</span>
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Rate and Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="label-term" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-2">Срок кредита</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <select
                  id="select-term"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-transparent border border-stone-300 text-neutral-900 transition-all font-semibold cursor-pointer"
                >
                  <option value={5}>5 лет (60 мес.)</option>
                  <option value={10}>10 лет (120 мес.)</option>
                  <option value={15}>15 лет (180 мес.)</option>
                  <option value={20}>20 лет (240 мес.)</option>
                  <option value={25}>25 лет (300 мес.)</option>
                </select>
              </div>
            </div>

            <div>
              <label id="label-rate" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-2">Процентная ставка</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Percent className="w-4 h-4" />
                </span>
                <input
                  id="input-rate"
                  type="number"
                  step="0.1"
                  min="1"
                  max="30"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-transparent border border-stone-300 text-neutral-900 transition-all font-semibold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label id="label-paymenttype" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-3">Вид платежа</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                id="btn-annu"
                onClick={() => setPaymentType('annuity')}
                className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all border ${
                  paymentType === 'annuity'
                    ? 'bg-transparent border-purple-500 ring-1 ring-purple-500'
                    : 'bg-transparent border-stone-200 hover:bg-stone-50/50'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  paymentType === 'annuity' ? 'bg-purple-600 text-white' : 'bg-neutral-300'
                }`}>
                  {paymentType === 'annuity' && <Check className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold block text-neutral-900 leading-tight">Аннуитетный</span>
                  <span className="text-[11px] text-neutral-500 leading-normal mt-0.5 block">Ежемесячный платеж одинаков на протяжении всего срока кредита. Легче планировать.</span>
                </div>
              </button>

              <button
                id="btn-diff"
                onClick={() => setPaymentType('differentiated')}
                className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all border ${
                  paymentType === 'differentiated'
                    ? 'bg-transparent border-purple-500 ring-1 ring-purple-500'
                    : 'bg-transparent border-stone-200 hover:bg-stone-50/50'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  paymentType === 'differentiated' ? 'bg-purple-600 text-white' : 'bg-neutral-300'
                }`}>
                  {paymentType === 'differentiated' && <Check className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold block text-neutral-900 leading-tight">Дифференцированный</span>
                  <span className="text-[11px] text-neutral-500 leading-normal mt-0.5 block">Максимальный в первый месяц, планомерно снижается за счет выплат по телу кредита. Переплата меньше.</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right breakdown info */}
        <div className="lg:col-span-5 bg-transparent border border-stone-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 id="calc-result-title" className="text-sm font-bold uppercase tracking-wider text-neutral-500">Результаты расчета</h3>

            <div>
              <div className="text-neutral-500 text-xs">
                {paymentType === 'annuity' ? 'Ежемесячный платеж' : 'Стартовый платеж (макс.)'}
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-purple-700 font-mono mt-1">
                {calculations.monthlyPayment.toLocaleString()} {currencySign}
                <span className="text-xs font-medium text-neutral-400 block mt-0.5">
                  {paymentType === 'differentiated' && `Постепенно снижается до ${Math.round(calculations.payments[calculations.payments.length - 1]?.payment || 0).toLocaleString()} ${currencySign}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <span className="text-neutral-400 text-[11px] block uppercase font-bold tracking-wider leading-none">Сумма кредита</span>
                <span className="text-sm font-bold text-neutral-800 font-mono block mt-1">
                  {loanAmount.toLocaleString()} {currencySign}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block uppercase font-bold tracking-wider leading-none">Общая переплата</span>
                <span className="text-sm font-bold text-neutral-800 font-mono block mt-1">
                  {calculations.overpay.toLocaleString()} {currencySign}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-neutral-400 text-[11px] block uppercase font-bold tracking-wider mb-1">Всего к возврату</span>
              <span className="text-lg font-extrabold text-neutral-900 font-mono">
                {calculations.totalPaid.toLocaleString()} {currencySign}
              </span>
            </div>

            {/* Estimated table - first few months */}
            <div className="pt-4">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">График выплат за 1-й год</span>
              <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar text-xs">
                <div className="grid grid-cols-12 text-[10px] text-neutral-400 font-bold uppercase tracking-wider pb-1">
                  <span className="col-span-2">Мес.</span>
                  <span className="col-span-4 text-right">Платеж</span>
                  <span className="col-span-3 text-right">Тело</span>
                  <span className="col-span-3 text-right">Процент</span>
                </div>
                {calculations.payments.map((p) => (
                  <div key={p.month} className="grid grid-cols-12 font-mono py-1 hover:bg-neutral-100/50 px-1 rounded transition-all">
                    <span className="col-span-2 text-neutral-500 font-semibold">{p.month}</span>
                    <span className="col-span-4 text-right font-bold text-neutral-800">{p.payment}</span>
                    <span className="col-span-3 text-right text-neutral-600">{p.principal}</span>
                    <span className="col-span-3 text-right text-purple-700">{p.interest}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6">
            <p className="text-[11px] text-neutral-400 leading-normal mb-3">
              *Данный расчет является предварительным. Точные условия кредитования зависят от кредитной истории и вашей официальной заработной платы.
            </p>
            <a
              href="#pages/contacts/kontakty"
              className="block w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest text-center rounded-lg transition-all"
            >
              Отправить заявку в БРТИ / Банки
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
