import React, { useState, useEffect } from 'react';
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
import { conflictWith, recommendNext, bundleValue, formatINR, kindOf, componentsOf, valueOf } from '../data/schemeRules';

export default function SchemesScreen() {
  const navigate = useNavigate();
  const { schemes, applications, selectedSchemeIds, toggleSchemeSelection, clearSchemeSelection, currentStudent, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const hidden = useScrollDirection();
  const scrolled = useScrolled(6);

  // AdiSetu Advisor run state: idle -> running (steps tick one by one) -> done (ranking revealed)
  const [advisor, setAdvisor] = useState({ phase: 'idle', step: 0 });
  const ADVISOR_STEPS = 4;
  useEffect(() => {
    if (advisor.phase !== 'running') return undefined;
    const delay = advisor.step >= ADVISOR_STEPS ? 600 : 750;
    const timer = setTimeout(() => {
      setAdvisor((a) => (a.step >= ADVISOR_STEPS ? { phase: 'done', step: a.step } : { ...a, step: a.step + 1 }));
    }, delay);
    return () => clearTimeout(timer);
  }, [advisor]);
  const runAdvisor = () => setAdvisor({ phase: 'running', step: 0 });

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

  // Exclude schemes that have already been applied to BY THIS STUDENT (Fix 1)
  const appliedSchemeIds = applications.filter((a) => a.studentId === currentStudent?.id).map((a) => a.schemeId);
  const unappliedSchemes = schemes.filter((scheme) => !appliedSchemeIds.includes(scheme.id));

  // AdiSetu Advisor: sequential one-at-a-time optimizer (rule-based, deterministic)
  const recommendation = recommendNext(currentStudent, schemes, appliedSchemeIds);
  const nameOf = (id) => {
    const sc = schemes.find((x) => x.id === id);
    return sc ? sc.shortName || sc.name : id;
  };

  // Advisor-triggered single-scheme apply modal
  const [advisorApplySchemeId, setAdvisorApplySchemeId] = useState(null);
  const openAdvisorApply = (schemeId) => setAdvisorApplySchemeId(schemeId);
  const closeAdvisorApply = () => {
    setAdvisorApplySchemeId(null);
    setAdvisor({ phase: 'idle', step: 0 }); // reset so re-run shows next
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
        {/* AdiSetu Advisor: recommends the single best scheme to apply for right now,
            considering everything already applied and all conflict rules. Apply it, re-run,
            get the next one — repeat until you've maximized your total benefit.
            Rule-based and deterministic. Figures are indicative sample values. */}
        {recommendation && !searchQuery && (() => {
          const firstName = currentStudent?.name?.split(' ')[0];

          // --- "All done" state: nothing more to recommend ---
          if (recommendation.done) {
            return (
              <section aria-label="Advisor recommendation" className="bg-accent-soft rounded-card p-4 shadow-xs">
                <div className="flex items-center gap-1.5 text-accent-dark">
                  <Sparkles size={14} />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">AdiSetu Advisor</span>
                  <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">Sample values</span>
                </div>
                <p className="text-sm font-bold text-text mt-1.5 leading-snug">
                  You've applied for everything available, {firstName}
                </p>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  {recommendation.totalApplied} of {recommendation.totalEligible} eligible {recommendation.category} schemes applied.
                  {recommendation.alreadyClaimed > 0 && (
                    <> Total claimed so far: <span className="font-semibold text-text">{formatINR(recommendation.alreadyClaimed)}/year</span>.</>
                  )}
                  {' '}Track your applications in the Updates tab.
                </p>
              </section>
            );
          }

          // --- Active recommendation: one scheme to apply for next ---
          const pick = recommendation.pick;
          const steps = [
            `Reading your profile: Class ${currentStudent?.class}, ${recommendation.category} level`,
            `Checking ${recommendation.totalEligible} eligible schemes, ${recommendation.totalApplied} already applied`,
            `Filtering out conflicts: ${recommendation.totalAvailable} still available to you`,
            `Picking the highest-value option from ${recommendation.totalAvailable} schemes`,
          ];

          return (
            <section aria-label="Advisor recommendation" className="bg-accent-soft rounded-card p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-accent-dark">
                <Sparkles size={14} />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">AdiSetu Advisor</span>
                <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">Sample values</span>
              </div>

              {advisor.phase === 'idle' && (
                <>
                  <p className="text-sm font-bold text-text mt-1.5 leading-snug">
                    {recommendation.totalApplied === 0
                      ? `Which scheme should you apply for first, ${firstName}?`
                      : `What should you apply for next, ${firstName}?`}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                    {recommendation.totalApplied === 0
                      ? 'The Advisor checks every scheme you qualify for, applies the rules, and tells you which one to grab first.'
                      : `You've applied for ${recommendation.totalApplied} scheme${recommendation.totalApplied > 1 ? 's' : ''} so far (${formatINR(recommendation.alreadyClaimed)}/yr). The Advisor finds your next best option.`}
                  </p>
                  <button
                    type="button"
                    onClick={runAdvisor}
                    className="mt-3 h-9 px-4 rounded-full bg-accent text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Sparkles size={13} />
                    <span>{recommendation.totalApplied === 0 ? 'Find my best scheme' : 'Find next best scheme'}</span>
                  </button>
                </>
              )}

              {advisor.phase === 'running' && (
                <>
                  <p className="text-sm font-bold text-text mt-1.5 leading-snug">
                    {recommendation.totalApplied === 0 ? `Finding the best scheme for ${firstName}…` : `Finding ${firstName}'s next best scheme…`}
                  </p>
                  <ul className="mt-2.5 space-y-1.5" data-testid="advisor-steps">
                    {steps.map((label, i) => {
                      const done = i < advisor.step;
                      const active = i === advisor.step;
                      return (
                        <li key={label} className={`flex items-start gap-2 text-xs ${done || active ? 'text-text' : 'text-muted/60'}`}>
                          <span className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                            {done ? (
                              <Check size={13} className="text-accent-dark" strokeWidth={3} />
                            ) : active ? (
                              <span className="block w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                            ) : (
                              <span className="block w-1.5 h-1.5 rounded-full bg-muted/40" />
                            )}
                          </span>
                          <span className={active ? 'font-semibold' : ''}>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {advisor.phase === 'done' && (
                <div data-testid="advisor-result">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-accent-dark mt-2">
                    {recommendation.totalApplied === 0 ? 'Apply first' : 'Apply next'}
                  </p>

                  {/* The recommended scheme */}
                  <div className="mt-1.5 rounded-lg bg-white/60 px-3 py-2.5" data-testid="advisor-pick">
                    <div className="flex items-start gap-1.5">
                      <Check size={13} className="text-accent-dark flex-shrink-0 mt-0.5" strokeWidth={3} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text leading-snug">{nameOf(pick.id)}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className={`rounded px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider ${
                            pick.kind === 'addon' ? 'bg-accent/15 text-accent-dark' : 'bg-text/10 text-text'
                          }`}>
                            {pick.kind === 'addon' ? 'Add-on grant' : 'Scholarship'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-lg font-extrabold text-accent-dark flex-shrink-0">
                        {formatINR(pick.value)}
                      </span>
                    </div>

                    {/* Component breakdown */}
                    <ul className="mt-1.5 ml-[18px] space-y-0.5">
                      {componentsOf(pick.id).map((c) => (
                        <li key={c.label} className="flex items-baseline gap-2 text-[11px] text-muted">
                          <span className="truncate">{c.label}</span>
                          <span className="flex-1 border-b border-dotted border-muted/30" />
                          <span className="font-mono flex-shrink-0">{formatINR(c.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why this one — comparison with runner-up */}
                  {recommendation.runnerUp && (
                    <div className="mt-2 rounded-lg bg-white/40 px-2.5 py-2">
                      <p className="text-[11px] text-muted leading-relaxed">
                        <span className="font-semibold text-text">Next best:</span>{' '}
                        {nameOf(recommendation.runnerUp.id)} — {formatINR(recommendation.runnerUp.value)}/yr
                      </p>
                      {recommendation.gain > 0 && (
                        <p className="text-[11px] text-text font-semibold mt-0.5">
                          This one pays {formatINR(recommendation.gain)}/year more.
                        </p>
                      )}
                    </div>
                  )}

                  {/* What it blocks */}
                  {recommendation.wouldBlock.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
                      <span className="font-semibold text-text">Blocks:</span>{' '}
                      {recommendation.wouldBlock.map(nameOf).join(', ')} (can't be held together).
                    </p>
                  )}

                  {/* Running total and what's left */}
                  <div className="mt-2 flex items-baseline gap-2 border-t border-accent-dark/20 pt-2 text-xs">
                    {recommendation.alreadyClaimed > 0 && (
                      <>
                        <span className="text-muted">So far: {formatINR(recommendation.alreadyClaimed)}/yr</span>
                        <span className="text-muted">→</span>
                      </>
                    )}
                    <span className="font-bold text-text">After this: {formatINR(recommendation.afterThisTotal)}/yr</span>
                    <span className="flex-1" />
                    {recommendation.afterThisRemaining > 0 && (
                      <span className="text-[10px] text-muted">{recommendation.afterThisRemaining} more available</span>
                    )}
                  </div>

                  <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
                    Rules are configurable by the Ministry. Values are indicative sample figures.
                  </p>

                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openAdvisorApply(pick.id)}
                      className="h-8 px-3.5 rounded-full bg-accent text-white text-xs font-bold active:scale-95 transition-transform"
                      data-testid="advisor-apply-btn"
                    >
                      Apply for this scheme
                    </button>
                    <button
                      type="button"
                      onClick={runAdvisor}
                      className="text-[11px] font-semibold text-muted underline underline-offset-2 active:opacity-70"
                    >
                      Run again
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })()}

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

      {/* Advisor single-scheme Apply Modal */}
      <ApplyModal
        isOpen={!!advisorApplySchemeId}
        onClose={closeAdvisorApply}
        schemeId={advisorApplySchemeId}
        isBatch={false}
        onSuccessDone={closeAdvisorApply}
      />

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
