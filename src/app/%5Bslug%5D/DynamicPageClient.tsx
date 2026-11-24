'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useApp } from '../Providers';
import CatalogPage from '@/components/CatalogPage';
import HomePage from '@/components/HomePage';
import NewsPage from '@/components/NewsPage';
import AboutPage from '@/components/AboutPage';
import OurTeamPage from '@/components/OurTeamPage';
import ServicesPage from '@/components/ServicesPage';
import LegalConsultationPage from '@/components/LegalConsultationPage';
import ConsultationCostPage from '@/components/ConsultationCostPage';
import CheckTransactionPage from '@/components/CheckTransactionPage';
import RedevelopmentPage from '@/components/RedevelopmentPage';
import ObmenNedvizhimostiPage from '@/components/ObmenNedvizhimostiPage';
import ProdazhaNedvizhimostiPage from '@/components/ProdazhaNedvizhimostiPage';
import ProdazhaKvartiryPage from '@/components/ProdazhaKvartiryPage';
import ProdazhaDomaPage from '@/components/ProdazhaDomaPage';
import ProdazhaKomnatyPage from '@/components/ProdazhaKomnatyPage';
import ProdazhaPomescheniyaPage from '@/components/ProdazhaPomescheniyaPage';
import OcenkaPage from '@/components/OcenkaPage';
import ReviewsPage from '@/components/ReviewsPage';
import NewsPageDetailed from '@/components/NewsPage';
import ContactsPage from '@/components/ContactsPage';
import BuyersDatabasePage from '@/components/BuyersDatabasePage';
import TrialPeriodPage from '@/components/TrialPeriodPage';
import BesplatnyjVyezdAgentaPage from '@/components/BesplatnyjVyezdAgentaPage';
import ContractConsultationPage from '@/components/ContractConsultationPage';
import EffectiveToolsPage from '@/components/EffectiveToolsPage';
import QualityControlPage from '@/components/QualityControlPage';
import UsefulInfoPage from '@/components/UsefulInfoPage';
import SeoLandingsPage from '@/components/SeoLandingsPage';
import RieltorPage from '@/components/RieltorPage';
import KorporativnayaArendaPage from '@/components/KorporativnayaArendaPage';
import ArendodatelyuPage from '@/components/ArendodatelyuPage';
import ArendatoruPage from '@/components/ArendatoruPage';
import PokupkaPage from '@/components/PokupkaPage';
import PokupkaDlyaArendyPage from '@/components/PokupkaDlyaArendyPage';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import SeoLandingPage from '@/components/SeoLandingPage';

const AgentCabinetPage = dynamic(
  () => import('@/components/AgentCabinetPage'),
  { ssr: false, loading: () => <div className="p-8 text-center">Загрузка кабинета...</div> }
);

import { INITIAL_CRM_BUYERS } from '@/data/buyers';
import { resolveArticleFromSlug, PATH_ALIASES, getAgentUrl } from '@/lib/routes';
import {
  parseLandingType,
  filterProperties,
  findDisplayName,
  generateLandingTitle,
  generateLandingDescription,
} from '@/lib/seoLandings';
import { PageId } from '@/types';

export default function DynamicPage({ initialArticle }: { initialArticle?: any } = {}) {
  const { slug } = useParams();
  const router = useRouter();
  const {
    agents, properties, articles, addLead, favorites, toggleFavorite,
    reviews, loggedInAgent, setLoggedInAgent, isSyncing,
    leads, saveLeadsToStore, handleClearLeads,
    buyers, setBuyersList,
    setAgentsList, setPropertiesList, setArticlesList,
    syncWithRealt, loadCabinetData,
  } = useApp();

  const normalizedSlug = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : '';
  const fullPath = `/${normalizedSlug}`;

  // ============================================================
  // Публичные объекты — единый фильтр для всех разделов.
  // Исключаем: неопубликованные, закрытую базу, архив.
  // ============================================================
  const publicProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.isPublished !== false &&
          !p.isClosedBase &&
          p.status !== 'archived' &&
          p.status !== 'archive'
      ),
    [properties]
  );

  // ============================================================
  // Статья — SSR (initialArticle) + fallback на API (articles).
  // initialArticle приходит с сервера через [slug]/page.tsx.
  // ============================================================
  const article = useMemo(() => {
    // 1. Если статья пришла с сервера (SSR) — используем сразу
    if (initialArticle && (initialArticle.slug === normalizedSlug || initialArticle.id === normalizedSlug)) {
      return initialArticle;
    }
    // 2. Иначе ищем в статьях из API
    return resolveArticleFromSlug(normalizedSlug, articles);
  }, [normalizedSlug, articles, initialArticle]);

  // Пока статьи нет НИ с сервера, НИ из API — показываем лоадер
  if (!article && !initialArticle && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50" style={{ paddingTop: '190px' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-neutral-900">Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (article) {
    return (
      <NewsPage
        activePage="novosti-nedvizhimosti"
        navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)}
        handleAddLead={addLead}
        articlesList={articles}
        selectedArticle={article}
        onSelectArticle={(art) => router.push(art ? `/${art.slug || art.id}` : '/novosti-nedvizhimosti')}
      />
    );
  }

  const landingType = parseLandingType(normalizedSlug);
  if (landingType) {
    if (publicProperties.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50" style={{ paddingTop: '190px' }}>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-neutral-900">Загрузка...</h1>
            <p className="text-stone-600">Загружаем объекты</p>
          </div>
        </div>
      );
    }

    const filtered = filterProperties(publicProperties, landingType, normalizedSlug);
    const displayName = findDisplayName(publicProperties, landingType, normalizedSlug);
    const title = generateLandingTitle(landingType, normalizedSlug, filtered.length, displayName, filtered);
    const description = generateLandingDescription(landingType, normalizedSlug, filtered.length, displayName, filtered);
    const filterLabel =
      landingType === 'zhk' ? 'ЖК' :
      landingType === 'metro' ? 'Метро' :
      landingType === 'ulica' ? 'Улица' : 'Район';

    return (
      <SeoLandingPage
        title={title}
        description={description}
        properties={filtered}
        filterLabel={filterLabel}
        onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')}
        navigateTo={(path) => router.push(path)}
      />
    );
  }

  const pageId = (PATH_ALIASES[fullPath] || normalizedSlug) as PageId;
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  const staticPages: Record<string, React.ReactNode> = {
    'home': <HomePage navigateTo={nav} handleAddLead={addLead} agentsList={agents} propertiesList={publicProperties} favorites={favorites} toggleFavorite={toggleFavorite} currency="BYN" clientsReviews={reviews} articlesList={articles} onViewProfile={(agent) => router.push(getAgentUrl(agent))} onSelectArticle={(article) => router.push(`/${article.slug || article.id}`)} />,
    'catalog': <CatalogPage activePage="catalog" navigateTo={nav} handleAddLead={addLead} favorites={favorites} toggleFavorite={toggleFavorite} comparisonIds={[]} toggleComparison={() => {}} properties={publicProperties} selectedProperty={null} onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')} onViewProfile={(agent) => router.push(getAgentUrl(agent))} agentsList={agents} />,
    'ob-agentstve': <AboutPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} agentsList={agents} onViewProfile={(a) => router.push(getAgentUrl(a))} />,
    'nasha-komanda': <OurTeamPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} agentsList={agents} onViewProfile={(a) => router.push(getAgentUrl(a))} />,
    'vybrat-agenta': <OurTeamPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} agentsList={agents} onViewProfile={(a) => router.push(getAgentUrl(a))} />,
    'services-root': <ServicesPage activePage="services-agentstva" navigateTo={nav} handleAddLead={addLead} />,
    'services-agentstva': <ServicesPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'yuridicheskaya-konsultaciya': <LegalConsultationPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'konsultaciya-stoimost-rieltor': <ConsultationCostPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'oformit-sdelku': <CheckTransactionPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'soglasovanie-pereplanirovki': <RedevelopmentPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'prodazha-nedvizhimosti': <ProdazhaNedvizhimostiPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'all-sale-services': <ProdazhaNedvizhimostiPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'prodazha-kvartiry': <ProdazhaKvartiryPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'prodazha-doma-dachi': <ProdazhaDomaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'prodazha-komnaty-doli': <ProdazhaKomnatyPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'prodazha-pomescheniya': <ProdazhaPomescheniyaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} properties={publicProperties} agents={agents} />,
    'ocenka-kvartiry': <OcenkaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'all-evaluation-services': <OcenkaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'otzyvy-klientov': <ReviewsPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} clientsReviews={reviews} onAddReview={() => {}} />,
    'novosti-nedvizhimosti': <NewsPageDetailed activePage={pageId} navigateTo={nav} handleAddLead={addLead} articlesList={articles} selectedArticle={null} onSelectArticle={(art) => router.push(art ? `/${art.slug || art.id}` : '/novosti-nedvizhimosti')} />,
    'agent-cabinet': (
      <AgentCabinetPage
        loggedInAgent={loggedInAgent}
        setLoggedInAgent={setLoggedInAgent}
        agentsList={agents}
        setAgentsList={setAgentsList}
        propertiesList={properties}
        setPropertiesList={setPropertiesList}
        leads={leads}
        handleAddLead={addLead}
        saveLeadsToStore={saveLeadsToStore}
        handleClearLeads={handleClearLeads}
        buyersList={buyers}
        setBuyersList={setBuyersList}
        articlesList={articles}
        setArticlesList={setArticlesList}
        syncWithRealt={syncWithRealt}
        isSyncingRealt={isSyncing}
        navigateTo={nav}
        onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')}
        loadCabinetData={loadCabinetData}
      />
    ),
    'kontakty': <ContactsPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'baza-pokupatelej': <BuyersDatabasePage activePage={pageId} navigateTo={nav} handleAddLead={addLead} buyersList={INITIAL_CRM_BUYERS} setBuyersList={() => {}} agentsList={agents} propertiesList={publicProperties} />,
    '10-dnej-probnogo-perioda': <TrialPeriodPage navigateTo={nav} handleAddLead={addLead} />,
    'obmen-nedvizhimosti': <ObmenNedvizhimostiPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'besplatnyj-vyezd-agenta': <BesplatnyjVyezdAgentaPage navigateTo={nav} handleAddLead={addLead} />,
    'konsultaciya-dogovor-kupli': <ContractConsultationPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'effektivnye-instrumenty': <EffectiveToolsPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'kontrol-kachestva': <QualityControlPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'poleznaya-informaciya': <UsefulInfoPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'seo-landings': <SeoLandingsPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} propertiesList={publicProperties} onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')} />,
    'rieltor': <RieltorPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'korporativnaya-arenda': <KorporativnayaArendaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'uslugi-arendodatelyu': <ArendodatelyuPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'uslugi-arendodatelyu-pomescheniya': <ArendodatelyuPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'arenda-nedvizhimosti': <ArendatoruPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'uslugi-arendatoru': <ArendatoruPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'uslugi-arendatoru-pomescheniya': <ArendatoruPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'pokupka-kvartiry': <PokupkaPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} agentsList={agents} />,
    'pokupka-dlya-arendy': <PokupkaDlyaArendyPage activePage={pageId} navigateTo={nav} handleAddLead={addLead} />,
    'privacy-policy': <PrivacyPolicyModal isOpen={true} onClose={() => router.push('/')} />,
    'cookies-policy': <PrivacyPolicyModal isOpen={true} onClose={() => router.push('/')} />,
  };

  if (staticPages[pageId]) {
    return staticPages[pageId];
  }

  notFound();
}