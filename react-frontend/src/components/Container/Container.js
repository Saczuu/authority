import React from 'react';
import PropTypes from 'prop-types';

const Container = ({ backgroundColor, children }) => {
  const containerStyle = {
    backgroundColor: backgroundColor || '#f0f0f0', // Default color if not provided
    borderRadius: '15px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column', // Stack items vertically
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px', // Add spacing between children (adjust as needed)
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={containerStyle}>
      {children}
    </div>
  );
};

Container.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Container;
