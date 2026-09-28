import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrolled } from '../hooks/useScrolled';
import ProfileDropdown from './ProfileDropdown';
import { ArrowLeft } from 'lucide-react';

export default function TopBar({ title, isWordmark = true, showBack = false, backUrl }) {
  const navigate = useNavigate();
  const scrolled = useScrolled(6);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface h-16 shadow-[0_2px_8px_rgba(20,20,15,0.06)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-colors">
        <div className="max-w-md mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))}
                className="h-8 px-3 -ml-1 rounded-full bg-[#ECEAE4] dark:bg-[#262626] hover:bg-[#E0DDD5] dark:hover:bg-[#323232] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out text-text flex items-center gap-1.5 border-0 outline-none select-none shadow-xs"
              >
                <ArrowLeft size={13} className="text-text/80" />
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">BACK</span>
              </button>
            )}

            {isWordmark ? (
              <div className="text-xl font-extrabold tracking-tight text-accent select-none notranslate" translate="no">
                AdiSetu
              </div>
            ) : (
              <h1 className="text-lg font-bold tracking-tight text-text">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ProfileDropdown />
          </div>
        </div>
      </header>
      {/* Pinned top gradient fade mask directly under nav */}
      <div 
        className={`fade-mask ${scrolled ? 'visible' : ''} fixed top-16 left-0 right-0 z-20 w-full h-10 pointer-events-none bg-gradient-to-b from-bg to-transparent`} 
        aria-hidden="true" 
      />
    </>
  );
}
