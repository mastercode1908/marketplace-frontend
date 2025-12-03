import React from 'react';

export default function QuantitySelector({
    value,
    onChange,
    onBlur,
    min = 1,
    max,
    disabled = false,
    className = ""
}) {
    const handleDecrease = () => {
        if (disabled) return;
        const newValue = Number(value) - 1;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleIncrease = () => {
        if (disabled) return;
        const newValue = Number(value) + 1;
        if (!max || newValue <= max) {
            onChange(newValue);
        }
    };

    const handleInputChange = (e) => {
        if (disabled) return;
        const val = e.target.value;
        // Allow empty string for better UX while typing
        if (val === '') {
            onChange('');
            return;
        }
        const numVal = Number(val);
        if (!isNaN(numVal)) {
            onChange(numVal);
        }
    };

    const handleBlur = () => {
        if (onBlur) {
            onBlur();
        } else {
            // Default blur behavior: reset to min if empty or invalid
            if (value === '' || value < min) {
                onChange(min);
            } else if (max && value > max) {
                onChange(max);
            }
        }
    };

    return (
        <div className={`flex items-center border border-gray-200 rounded-lg h-10 bg-white w-fit overflow-hidden ${className}`}>
            <button
                type="button"
                onClick={handleDecrease}
                disabled={disabled || value <= min}
                className="w-10 h-full flex items-center justify-center border-r border-gray-200 bg-gray-50 hover:bg-[#008ecc] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:text-gray-500 transition-colors text-lg font-semibold text-gray-500"
            >
                -
            </button>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                className="w-[60px] h-full border-none text-center text-base font-semibold text-[#212844] focus:outline-none bg-white appearance-none"
            />
            <button
                type="button"
                onClick={handleIncrease}
                disabled={disabled || (max !== undefined && value >= max)}
                className="w-10 h-full flex items-center justify-center border-l border-gray-200 bg-gray-50 hover:bg-[#008ecc] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:text-gray-500 transition-colors text-lg font-semibold text-gray-500"
            >
                +
            </button>
        </div >
    );
}
