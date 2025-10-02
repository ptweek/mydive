import React, { useState, useRef, useEffect } from "react";

interface DropZoneDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[]; // Pass in Object.values(DropZone)
  label?: string;
  placeholder?: string;
}

export const DropZoneDropdown: React.FC<DropZoneDropdownProps> = ({
  value,
  onChange,
  options,
  label = "Select Drop Zone",
  placeholder = "Choose an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown mb-4 sm:mb-6" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-bold text-gray-800 sm:text-base">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white p-3 text-left text-sm transition-colors hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-xl">
            <div className="overflow-auto py-1" style={{ maxHeight: "200px" }}>
              {options.map((option) => {
                const isSelected = value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none sm:text-base ${
                      isSelected
                        ? "bg-blue-100 font-medium text-blue-900"
                        : "text-gray-900 hover:text-blue-900"
                    }`}
                  >
                    {option}
                    {isSelected && (
                      <span className="float-right text-blue-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
