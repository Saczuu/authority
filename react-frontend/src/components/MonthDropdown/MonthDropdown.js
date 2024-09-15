import React, { useState, useEffect } from 'react';

const MonthDropdown = ({ onMonthSelect }) => {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        // Fetch the last 3 months from the Flask backend
        fetch('/last_three_months')
            .then(response => response.json())
            .then(data => setMonths(data));
    }, []);

    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedMonth(selectedValue); // Update local state
        if (onMonthSelect) {
            onMonthSelect(selectedValue); // Pass selected value to parent if a callback is provided
        }
    };

    return (
        <select value={selectedMonth} onChange={handleChange}>
            <option value="" disabled>Select a month</option>
            {months.map((month, index) => (
                <option key={index} value={month}>
                    {month}
                </option>
            ))}
        </select>
    );
};

export default MonthDropdown;
