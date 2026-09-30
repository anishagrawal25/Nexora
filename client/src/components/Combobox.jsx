import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

/**
 * Reusable Combobox Component
 * Allows free-form typing or picking from a filtered suggestion list.
 * Styled with Nexora's warm editorial design tokens.
 *
 * @param {string} value - Current value (string)
 * @param {function} onChange - Callback (newValue, selectedOptionObjectOrNull) => void
 * @param {Array<Object|string>} options - List of options: [{ id, name }] or ["Apple", "Google"]
 * @param {string} placeholder - Input placeholder text
 * @param {boolean} disabled - Whether the input is disabled
 * @param {string} className - Additional CSS classes for outer container
 * @param {string} inputClassName - Additional CSS classes for input element
 * @param {string} id - HTML ID for the input
 */
function Combobox({
  value = '',
  onChange,
  options = [],
  placeholder = 'Type freely or pick a suggestion...',
  disabled = false,
  className = '',
  inputClassName = '',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options array to [{ id, name }]
  const normalizedOptions = options.map((opt, idx) => {
    if (typeof opt === 'string') {
      return { id: idx + 1, name: opt };
    }
    return { id: opt.id ?? idx + 1, name: opt.name || String(opt) };
  });

  // Sync internal input value when external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter options based on typed input
  const query = inputValue.trim().toLowerCase();
  const filteredOptions = query
    ? normalizedOptions.filter((opt) => opt.name.toLowerCase().includes(query))
    : normalizedOptions;

  // Check if current typed input has an exact match
  const exactMatch = normalizedOptions.find(
    (opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  // Close dropdown on click outside and commit typed value
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isOpen) {
          setIsOpen(false);
          // Commit current typed input on blur if different
          if (inputValue !== value && onChange) {
            const matched = normalizedOptions.find(
              (opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase()
            );
            onChange(inputValue, matched || null);
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, inputValue, value, onChange, normalizedOptions]);

  function handleInputChange(e) {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    setIsOpen(true);
    setHighlightedIndex(0);
    if (onChange) {
      const matched = normalizedOptions.find(
        (opt) => opt.name.toLowerCase() === nextVal.trim().toLowerCase()
      );
      onChange(nextVal, matched || null);
    }
  }

  function handleSelectOption(option) {
    setInputValue(option.name);
    setIsOpen(false);
    if (onChange) {
      onChange(option.name, option);
    }
  }

  function handleKeyDown(e) {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (isOpen) {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function toggleDropdown() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full border border-[#D8D5CA] rounded-xl px-3.5 py-2.5 pr-9 text-sm bg-[#FBFAF6] text-[#12181B] placeholder-[#5B6670] focus:outline-none focus:border-[#1F6F5C] focus:ring-1 focus:ring-[#1F6F5C] transition disabled:opacity-60 disabled:cursor-not-allowed ${inputClassName}`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Toggle options list"
          className="absolute right-2.5 p-1 text-[#5B6670] hover:text-[#12181B] transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-[#1F6F5C]' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu Overlay */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E4E1D8] rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => {
              const isSelected =
                inputValue.trim().toLowerCase() === opt.name.toLowerCase();
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={opt.id || opt.name}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                    isHighlighted ? 'bg-[#F4F2EB]' : 'bg-transparent'
                  } ${isSelected ? 'text-[#1F6F5C] font-semibold bg-[#EFECE2]/70' : 'text-[#12181B]'}`}
                >
                  <span className="truncate">{opt.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#1F6F5C] shrink-0 ml-2" />}
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-3 text-xs text-[#5B6670] flex items-center justify-between">
              <span>No seeded matches found</span>
            </div>
          )}

          {/* Custom typed option prompt if user entered text that is not an exact match */}
          {inputValue.trim() && !exactMatch && (
            <div className="border-t border-[#E4E1D8] mt-1 pt-1 px-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onChange) onChange(inputValue, null);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg bg-[#FBFAF6] hover:bg-[#F4F2EB] text-[#1F6F5C] font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Use custom: <strong>&quot;{inputValue.trim()}&quot;</strong> (with fallback guidance)
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
