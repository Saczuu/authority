import React, { useState, useEffect } from 'react';
import './GitHubButton.css';

function GitHubAuthButton() {
  const [popupClosed, setPopupClosed] = useState(false);

  const handleAuthClick = () => {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      `http://127.0.0.1:5000/authorize/github`, // Adjust the URL if your Flask app runs on a different port
      'GitHub Authorization',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      // Polling to check if the popup has been closed
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          setPopupClosed(true); // Update state when popup is closed
        }
      }, 10);
    }
  };

  useEffect(() => {
    if (popupClosed) {
      window.location.reload();
    }
  }, [popupClosed]);

  return (
    <div className="github-button-container">
      <button className="github-button" onClick={handleAuthClick}>
        <img 
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
          alt="GitHub Logo" 
          className="github-logo" 
        />
        GitHub
      </button>
      </div>
  );
}

export default GitHubAuthButton;

