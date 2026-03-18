"use client";

import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search papers...",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 300);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
