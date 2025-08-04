import React from 'react';

const Loading = () => {
  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  };

  const spinnerStyle: React.CSSProperties = {
    border: '4px solid rgba(255, 255, 255, 0.2)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    borderLeftColor: 'white',
    animation: 'spin 1s linear infinite',
    marginRight: '16px'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        Loading Golf Society Dashboard...
      </div>
    </>
  );
};

export default Loading;

