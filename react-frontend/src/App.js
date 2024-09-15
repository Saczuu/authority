import React, { useState, useEffect } from 'react';
import GitHub from './components/GitHub/GitHubButton';
import Container from './components/Container/Container';
import MonthDropdown from './components/MonthDropdown/MonthDropdown';
import CommitButton from './components/CommitButton/CommitButton';

import './App.css';

function App() {
  const [githubVerified, setGithubVerified] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('');

  const handleMonthSelect = (month) => {
      setSelectedMonth(month); // Store the selected month
      console.log('Selected Month:', month);
      // You can also make an API call or handle other logic here based on the selected month
  };
  

  // Function to fetch the cookie value
  const fetchCookie = async () => {
    try {
      const response = await fetch('/private/setup');
      if (response.ok) {
        const text = await response.text();
        setGithubVerified(true);
      } else {
        setGithubVerified(false);
      }
    } catch (error) {
      console.error("Error fetching cookie:", error);
      setGithubVerified(false);
    }
  };

  // Fetch the cookie value when the component mounts
  useEffect(() => {
    fetchCookie();
  }, []);  // Empty array means this useEffect runs once after mount

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
  let content;
  if (githubVerified) {
    content = <CommitButton />;
  } else {
    content = <GitHub />;
  }

  return (
    <div className="App">
      <button onClick={resetCookie}>Reset Cookies</button>
      <Container backgroundColor="#e0f7fa">
        <div>
          <h1>GitHub</h1>
          {content} {/* Render based on the condition */}
        </div>
      </Container>
    </div>
  );
}

export default App;
