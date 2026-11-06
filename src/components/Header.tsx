import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, Language, getUIText } from '../i18n/languages.ts';
import { UserAuth } from '../types.ts';
import { Globe, Search, ChevronDown, Check, LogIn, User } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserAuth | null;
  onOpenLogin: () => void;
  location: string;
  langCode: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentUser,
  onOpenLogin,
  location,
  langCode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-[#0b7a45] to-[#0e9f5c] text-white text-xs sm:text-sm font-semibold select-none shadow-sm z-50">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b8f5cf] animate-pulse inline-block" />
          <span className="hidden md:inline font-bold">{getUIText('ps07Badge', langCode)}</span>
        </span>
        <span className="text-emerald-200">|</span>
        <span className="truncate">📍 {langCode === 'or' ? 'ସମ୍ବଲପୁର, ଓଡ଼ିଶା' : location}</span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* User Status / Login Button */}
        {currentUser ? (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-full px-2.5 py-1 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Switch User / View Account"
          >
            <span className="w-4 h-4 rounded-full bg-white text-emerald-900 grid place-items-center text-[10px]">
              {currentUser.avatarIcon || '🧑‍🌾'}
            </span>
            <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
            <span className="text-[10px] opacity-75 font-normal">({currentUser.role})</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-3 py-1 rounded-full text-xs transition shadow-sm cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{getUIText('login', langCode)}</span>
          </button>
        )}

        {/* 30+ Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 border border-white/25 rounded-full px-2.5 py-1 text-xs font-bold transition-all shadow-inner cursor-pointer"
            title="Translate website into 34+ languages"
            aria-label="Select application language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-200" />
            <span>{currentLanguage.flag}</span>
            <span className="max-w-[70px] truncate">{currentLanguage.nativeName}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 max-h-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-emerald-100 p-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-1.5 border-b border-slate-100 flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={getUIText('searchLangPlaceholder', langCode)}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs font-medium outline-none bg-transparent placeholder-slate-400"
                  autoFocus
                />
              </div>

              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 py-1">
                {getUIText('regionalGlobalLanguages', langCode)}
              </div>

              <div className="overflow-y-auto max-h-64 divide-y divide-slate-50">
                {filteredLanguages.map(lang => {
                  const isSelected = lang.code === currentLanguage.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-[#0b7a45] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <div className="font-semibold text-slate-900">{lang.nativeName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {lang.name} • {lang.region}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0e9f5c]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
