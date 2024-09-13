import React, { useState, useEffect } from 'react';
import GitHub from './components/GitHubButton';
import './App.css';

function App() {
  const [cookieValue, setCookieValue] = useState(null);

  // Function to fetch the cookie value
  const fetchCookie = async () => {
    try {
      const response = await fetch('/private/setup');
      if (response.ok) {
        const text = await response.text();
        setCookieValue(text);
      } else {
        setCookieValue("Cookie not found");
      }
    } catch (error) {
      console.error("Error fetching cookie:", error);
      setCookieValue("Error fetching cookie");
    }
  };

  // Fetch the cookie value when the component mounts
  useEffect(() => {
    fetchCookie();
  });


  // Function to reset the cookie
  const resetCookie = async () => {
    try {
      await fetch('/private/reset');
      fetchCookie(); // Refresh the cookie value after resetting
    } catch (error) {
      console.error("Error resetting cookie:", error);
    }
  };

  return (
    <div className="App">
      <div>
        <p>{cookieValue}</p>
        <GitHub />
        <button onClick={resetCookie}>Reset Cookie</button>
      </div>
    </div>
  );
}

export default App;
