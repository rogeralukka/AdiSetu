import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutGrid, Bell, FolderCheck } from 'lucide-react';

export default function BottomNav() {
  const { hasUnreadUpdates, setHasUnreadUpdates, t } = useApp();
  const location = useLocation();

  const handleUpdatesClick = () => {
    // Clear unread dot once opened
    setHasUnreadUpdates(false);
  };

  const navItems = [
    {
      to: '/',
      label: t('schemes'),
      icon: LayoutGrid,
      isExact: true,
      onClick: undefined,
    },
    {
      to: '/updates',
      label: t('updates'),
      icon: Bell,
      hasDot: hasUnreadUpdates && location.pathname !== '/updates',
      onClick: handleUpdatesClick,
    },
    {
      to: '/documents',
      label: t('documents'),
      icon: FolderCheck,
      onClick: undefined,
    },
  ];

  return (
    <>
      {/* Bottom gradient fade mask behind floating pill: ~60px tall, pointer-events: none */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-16 pointer-events-none z-30" 
        style={{
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        }}
        aria-hidden="true" 
      />

      {/* Floating Pill Navigation Bar (True capsule: 56px height, 28px radius, tight 16px end padding matching 16px inter-tab gap) */}
      <nav 
        aria-label="Main navigation"
        className="bottom-nav fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface flex items-center justify-center gap-4 border-0 floating-nav-pill transition-all select-none w-max"
      >
        {navItems.map((item) => {
          const isActive = item.isExact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);

          const IconComponent = item.icon;

          if (isActive) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={item.onClick}
                aria-label={item.label}
                className="flex items-center gap-2 bg-accent text-white rounded-full px-4 py-2 shadow-xs transition-all duration-150 ease-out select-none active:scale-95 group flex-shrink-0"
              >
                <div className="relative flex items-center justify-center">
                  <IconComponent size={18} strokeWidth={2.2} className="text-white flex-shrink-0" />
                </div>
                <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={item.onClick}
              aria-label={item.label}
              className="flex items-center gap-2 rounded-full px-2 py-2 text-muted hover:text-text hover:bg-bg/50 active:scale-95 transition-all duration-150 ease-out select-none group flex-shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <IconComponent size={18} strokeWidth={2} className="text-muted group-hover:text-text transition-colors duration-150 flex-shrink-0" />
                
                {/* Unread indicator dot on Updates tab */}
                {item.hasDot && (
                  <span 
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-surface" 
                    aria-label="New updates available"
                  />
                )}
              </div>

              <span className="text-xs font-normal text-muted group-hover:text-text tracking-wide whitespace-nowrap transition-colors duration-150">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
