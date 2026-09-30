import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

/**
 * Reusable Combobox Component
 * Allows free-form typing or picking from a filtered suggestion list.
 * Styled with clean, modern SaaS design tokens.
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
          className={`w-full bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg px-3 py-2 pr-8 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed ${inputClassName}`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Toggle options list"
          className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu Overlay */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1 divide-y divide-zinc-100">
          <div className="p-1 space-y-0.5">
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
                    className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-md flex items-center justify-between transition cursor-pointer ${
                      isHighlighted ? 'bg-indigo-50/70 text-indigo-950' : 'text-zinc-700'
                    } ${isSelected ? 'font-medium bg-indigo-50 text-indigo-900' : ''}`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-500">
                No matching suggestions
              </div>
            )}
          </div>

          {/* Custom typed option prompt */}
          {inputValue.trim() && !exactMatch && (
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onChange) onChange(inputValue, null);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-zinc-500 shrink-0" />
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

