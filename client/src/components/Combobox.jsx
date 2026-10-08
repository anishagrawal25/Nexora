import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

function Combobox({
  value,
  onChange,
  options = [],
  placeholder = 'Type freely or pick a suggestion...',
  disabled = false,
  className = '',
  inputClassName = '',
  id,
}) {
  const [draftValue, setDraftValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedOptions = options.map((option, index) =>
    typeof option === 'string'
      ? { id: index + 1, name: option }
      : { id: option.id ?? index + 1, name: option.name || String(option) }
  );
  const inputValue = isOpen || value === undefined ? draftValue : value || '';
  const query = inputValue.trim().toLowerCase();
  const filteredOptions = query
    ? normalizedOptions.filter((option) => option.name.toLowerCase().includes(query))
    : normalizedOptions;
  const exactMatch = normalizedOptions.find(
    (option) => option.name.toLowerCase() === query
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target) && isOpen) {
        setIsOpen(false);
        const matched = normalizedOptions.find(
          (option) => option.name.toLowerCase() === draftValue.trim().toLowerCase()
        );
        if (draftValue !== value && onChange) onChange(draftValue, matched || null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, draftValue, value, onChange, normalizedOptions]);

  function handleSelectOption(option) {
    setDraftValue(option.name);
    setIsOpen(false);
    onChange?.(option.name, option);
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((previous) =>
        previous < filteredOptions.length - 1 ? previous + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((previous) =>
        previous > 0 ? previous - 1 : filteredOptions.length - 1
      );
    } else if (event.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        event.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (isOpen) {
        setIsOpen(false);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function toggleDropdown() {
    if (disabled) return;
    setIsOpen((previous) => !previous);
    if (!isOpen) inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(event) => {
            setDraftValue(event.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (!isOpen && value !== undefined) setDraftValue(value || '');
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-white border border-[#E4E1D8] text-[#12181B] placeholder:text-[#5B6670]/60 rounded-xl px-3.5 py-2 pr-8 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15 transition disabled:bg-[#F2EFE9] disabled:text-[#5B6670] disabled:cursor-not-allowed ${inputClassName}`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Toggle options list"
          className="absolute right-2 p-1 text-[#5B6670] hover:text-[#12181B] transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronDown className={`w-3.5 h-3.5 ${isOpen ? 'rotate-180 text-[#1F6F5C]' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E4E1D8] rounded-xl shadow-lg max-h-56 overflow-y-auto py-1 divide-y divide-[#E4E1D8]/60">
          <div className="p-1 space-y-0.5">
            {filteredOptions.length ? (
              filteredOptions.map((option, index) => {
                const isSelected = query === option.name.toLowerCase();
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={option.id || option.name}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg flex items-center justify-between transition cursor-pointer ${isHighlighted ? 'bg-[#EBF3F0]/60 text-[#12181B]' : 'text-[#12181B]'} ${isSelected ? 'font-medium bg-[#EBF3F0] text-[#1F6F5C]' : ''}`}
                  >
                    <span className="truncate">{option.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1F6F5C] shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-[#5B6670]">No matching suggestions</div>
            )}
          </div>

          {query && !exactMatch && (
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setDraftValue(inputValue);
                  onChange?.(inputValue, null);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg bg-[#F2EFE9] hover:bg-[#EAE6DD] text-[#12181B] font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#1F6F5C] shrink-0" />
                <span className="truncate">
                  Custom: <strong>&quot;{inputValue.trim()}&quot;</strong> (estimate guidance)
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Combobox;

