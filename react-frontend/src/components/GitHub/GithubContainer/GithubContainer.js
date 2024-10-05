import React, { useState, useEffect } from 'react';
import GitHubAuthButton from '../GithubButton/GitHubButton';
import CommitButton from '../../CommitButton/CommitButton';

import './GithubContainer.css';

function GithubContainer() {
  const [githubVerified, setGithubVerified] = useState(false);

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

  let content;
  if (githubVerified) {
    content = (
      <div>
        <h2>Welcome, GitHub User!</h2>
        <CommitButton /> 
      </div>
    );
  } else {
    content = (
      <div>
        <h2>Connect to GitHub</h2>
        <GitHubAuthButton />
      </div>
    );
  }

  return (
    <div className="github-container">
      {content}
    </div>
  );
}

export default GithubContainer;