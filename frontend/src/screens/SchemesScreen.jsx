import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useScrolled } from '../hooks/useScrolled';
import { getTranslatedStatus } from '../data/translations';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ChatSheet from '../components/ChatSheet';
import ApplyModal from '../components/ApplyModal';
import { Search, Check, ArrowRight, Sparkles, Ban } from 'lucide-react';
import { conflictWith, recommendBundle, bundleValue, formatINR } from '../data/schemeRules';

export default function SchemesScreen() {
  const navigate = useNavigate();
  const { schemes, applications, selectedSchemeIds, toggleSchemeSelection, clearSchemeSelection, currentStudent, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const hidden = useScrollDirection();
  const scrolled = useScrolled(6);

  const filterOptions = [
    'All',
    'Pre-Matric',
    'Post-Matric',
    'Top Class',
    'NFST',
    'NOS',
  ];

  // Source-tag pill color styling (NOS Portal -> Light Blue #DCEEF9 / #1F5A8C, SFMP -> Gold #F2E8C9 / #5E4A0F, NSP -> Terracotta #FBECE8 / #9E3D24)
  const getSourcePillClass = (source) => {
    const s = source?.toUpperCase() || '';
    if (s.includes('NOS')) {
      return 'bg-[#DCEEF9] text-[#1F5A8C] dark:bg-[#1A334A] dark:text-[#DCEEF9]';
    }
    if (s.includes('SFMP')) {
      return 'bg-[#F2E8C9] text-[#5E4A0F] dark:bg-[#302812] dark:text-[#F2E8C9]';
    }
    // NSP terracotta-tinted
    return 'bg-[#FBECE8] text-[#9E3D24] dark:bg-[#361E18] dark:text-[#F6BBAA]';
  };

  // Exclude schemes that have already been applied to (Fix 1)
  const appliedSchemeIds = applications.map((a) => a.schemeId);
  const unappliedSchemes = schemes.filter((scheme) => !appliedSchemeIds.includes(scheme.id));

  // AdiSetu Advisor: best valid combination for this student (rule-based, deterministic)
  const recommendation = recommendBundle(currentStudent, schemes, appliedSchemeIds);
  const nameOf = (id) => {
    const sc = schemes.find((x) => x.id === id);
    return sc ? sc.shortName || sc.name : id;
  };
  const selectRecommended = () => {
    clearSchemeSelection();
    recommendation.newIds.forEach((id) => toggleSchemeSelection(id));
  };

  // Filter schemes based on search and category
  const filteredSchemes = unappliedSchemes.filter((scheme) => {
    const matchesFilter =
      activeFilter === 'All' || scheme.category === activeFilter;
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBatchApply = () => {
    if (selectedSchemeIds.length > 0) {
      setIsBatchModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* 
        Header block (wordmark + avatar):
        TopBar renders directly as fixed top-0 z-30.
        This NEVER hides.
      */}
      <TopBar isWordmark={true} />

      <div className="page-scroll-wrapper page-scroll-wrapper-with-nav">
        {/* 
          Search bar + filter-chip block, directly below it:
          position: sticky; top: 0; z-index: 20; background white (bg-bg).
          Slides under header on scroll down, reappears on scroll up.
        */}
        <div
          className={`sticky top-0 z-25 bg-bg transition-transform duration-200 ease-out ${
            hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
          }`}
        >
        <div className="max-w-md mx-auto px-4 pt-3 pb-2 space-y-2.5">
          {/* Search Bar with Accessible Hidden Label */}
          <div>
            <label htmlFor="scheme-search" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Search size={18} />
              </div>
              <input
                id="scheme-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-input text-sm text-text placeholder-muted focus:outline-none shadow-search border-0"
              />
            </div>
          </div>

          {/* Filter Chips - Horizontally scrollable row, no visible scrollbar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-accent text-white font-semibold shadow-xs'
                      : 'bg-[#ECECE7] dark:bg-[#2A2926] text-text hover:bg-border/80'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pinned top gradient fade mask directly under search bar */}
        <div 
          className={`fade-mask ${scrolled ? 'visible' : ''} absolute top-full left-0 right-0 h-10 bg-gradient-to-b from-bg to-transparent`} 
          aria-hidden="true" 
        />
      </div>

      {/* Main Content Area: Scheme Cards List scrolling smoothly underneath */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-40 space-y-4">
        {/* AdiSetu Advisor: best combination of schemes that can be held together */}
        {recommendation && !searchQuery && (
          <section
            aria-label="Best scheme combination"
            className="bg-accent-soft rounded-card p-4 shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-accent-dark">
              <Sparkles size={14} />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">AdiSetu Advisor</span>
              <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">Sample values</span>
            </div>
            <p className="text-sm font-bold text-text mt-1.5 leading-snug">
              {recommendation.newIds.length === 0
                ? `You're already on the best option: ${formatINR(recommendation.value)}/year`
                : `Best combination for ${currentStudent?.name?.split(' ')[0]}: ${formatINR(recommendation.value)}/year`}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {recommendation.ids.map((id) => (
                <li key={id} className="text-xs text-text flex items-center gap-1.5">
                  <Check size={12} className="text-accent-dark flex-shrink-0" />
                  <span className="truncate">
                    {nameOf(id)}
                    {recommendation.appliedIn.includes(id) && (
                      <span className="text-muted"> (already applied)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted mt-2 leading-relaxed">
              Compared {recommendation.considered} {recommendation.category} schemes you qualify for, keeping only
              combinations that can be held together. Values are indicative sample figures.
            </p>
            {recommendation.newIds.length > 0 && (
              <button
                type="button"
                onClick={selectRecommended}
                className="mt-2.5 h-8 px-3.5 rounded-full bg-accent text-white text-xs font-bold active:scale-95 transition-transform"
              >
                Select {recommendation.appliedIn.length > 0 ? 'the new ones' : 'these'}
              </button>
            )}
          </section>
        )}

        {/* Recommended for you Section */}
        <div>
          <div className="section-label mb-3">
            {t('recommendedForYou')} ({filteredSchemes.length})
          </div>

          <div className="space-y-3.5">
            {filteredSchemes.map((scheme) => {
              const isSelected = selectedSchemeIds.includes(scheme.id);
              const sourcePillClass = getSourcePillClass(scheme.source);
              const blocked = isSelected ? null : conflictWith(selectedSchemeIds, scheme.id, schemes);

              return (
                <div
                  key={scheme.id}
                  className="bg-surface rounded-card p-4 sm:p-4.5 shadow-card border-0 dark:border dark:border-border/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Always visible Checkbox (22px circle: unselected = solid neutral fill, no border, soft shadow, darken on hover; selected = accent fill + white check) */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Select ${scheme.shortName || scheme.name} for batch application`}
                      aria-disabled={!!blocked}
                      disabled={!!blocked}
                      onClick={() => toggleSchemeSelection(scheme.id)}
                      className={`w-[22px] h-[22px] mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${blocked && !isSelected ? '' : 'shadow-xs'} ${
                        isSelected
                          ? 'bg-accent text-white shadow-sm'
                          : blocked
                            ? 'bg-transparent text-amber cursor-not-allowed'
                            : 'bg-[#ECECE7] dark:bg-[#2A2926] text-transparent hover:bg-[#E0E0DA] dark:hover:bg-[#343330]'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                      {!isSelected && blocked && <Ban size={22} strokeWidth={2} aria-hidden="true" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Top row: Source tag pill & Blocker status pill */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {/* Source Tag pill filled per source system */}
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider ${sourcePillClass}`}>
                          {scheme.source}
                        </span>

                        {/* Status pill ONLY when something blocks full eligibility */}
                        {scheme.eligibilityFlag && (
                          <span className="status-pill bg-amber-soft text-amber">
                            {getTranslatedStatus(scheme.eligibilityFlag.label, t)}
                          </span>
                        )}
                      </div>

                      {/* Scheme Name */}
                      <h3 className="text-[15px] font-bold text-text leading-snug">
                        {scheme.shortName || scheme.name}
                      </h3>

                      {/* One-line description */}
                      <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                        {scheme.desc}
                      </p>

                      {blocked && (
                        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber font-medium leading-snug" data-testid="conflict-note">
                          <Ban size={12} className="mt-0.5 flex-shrink-0" />
                          <span>Can't be held together with {nameOf(blocked.blockerId)}. {blocked.rule.label}.</span>
                        </p>
                      )}

                      {/* View details link - muted text color, orange only on hover/focus */}
                      <div className="mt-3 flex items-center justify-between">
                        <Link
                          to={`/scheme/${scheme.id}`}
                          className="text-xs font-medium text-muted hover:text-accent focus:text-accent flex items-center gap-1 group transition-colors"
                        >
                          <span>{t('viewDetails')}</span>
                          <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSchemes.length === 0 && (
              <div className="text-center py-10 bg-surface rounded-card p-6 border border-border">
                <p className="text-sm text-muted">
                  {unappliedSchemes.length === 0
                    ? "All eligible scholarships have been applied to! Track them in your Updates tab."
                    : `No unapplied schemes found matching "${searchQuery}"`}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                    className="mt-3 text-xs font-semibold text-accent underline"
                  >
                    Clear search filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Batch Apply Floating Action Bar (clear of the 56px floating bottom nav) */}
      {selectedSchemeIds.length > 0 && (
        <aside 
          aria-label="Batch application actions"
          className="fixed bottom-[96px] sm:bottom-[100px] left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-150"
        >
          <div className="bg-accent text-white rounded-card px-4 py-3 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center">
                {selectedSchemeIds.length}
              </span>
              <span className="text-xs font-semibold">
                {selectedSchemeIds.length === 1 ? '1 scheme selected' : `${selectedSchemeIds.length} schemes selected`}
                <span className="font-normal opacity-90"> · ~{formatINR(bundleValue(selectedSchemeIds))}/yr (sample)</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleBatchApply}
              className="text-xs font-bold text-white hover:underline flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>{t('applyToSelected')}</span>
              <span>→</span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating Batch Apply Modal */}
      <ApplyModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        isBatch={true}
        onSuccessDone={() => clearSchemeSelection()}
      />

      {/* Floating Ask AdiSetu Chat Button */}
      <ChatSheet />

      {/* Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}
