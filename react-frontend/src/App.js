import React, { useState, useEffect } from 'react';
import Container from './components/Container/Container';
import GithubContainer from './components/GitHub/GithubContainer/GithubContainer';

import './App.css';

function App() {

  const [selectedMonth, setSelectedMonth] = useState('');

  const handleMonthSelect = (month) => {
      setSelectedMonth(month); // Store the selected month
      console.log('Selected Month:', month);
      // You can also make an API call or handle other logic here based on the selected month
  };

  // Function to reset the cookie
  const resetCookie = async () => {
    try {
      await fetch('/private/reset');
      fetchCookie(); // Refresh the cookie value after resetting
    } catch (error) {
      console.error("Error resetting cookie:", error);
    }
  };

  // Conditionally render GitHub or "Commits here" based on githubState

  return (
    <div className="App">
      <button onClick={resetCookie}>Reset Cookies</button>
      <Container backgroundColor="#e0f7fa">
        <h1> Github </h1>
        <GithubContainer />
      </Container>
    </div>
  );
}

export default App;
