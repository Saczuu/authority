import React from 'react';

const CommitsButton = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // Get current month in YYYY-MM format

    const fetchCommits = () => {
        const url = `/get_commits?month=${currentMonth}`; // API endpoint with current month as query param

        fetch(url, {
            method: 'GET',
            credentials: 'include', // Include cookies (to send GitHub_user cookie)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Commits:', data);
            // Handle commits data here (you can update the state or display the result)
        })
        .catch(error => {
            console.error('Error fetching commits:', error);
        });
    };

    return (
        <button onClick={fetchCommits}>
            Fetch Commits for {currentMonth}
        </button>
    );
};

export default CommitsButton;
