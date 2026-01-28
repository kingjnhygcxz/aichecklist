import React from 'react';

export function AuthTest() {
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#22c55e', marginBottom: '20px', fontSize: '48px' }}>AICHECKLIST</h1>
        <p style={{ marginBottom: '20px' }}>Auth component test - Can you see this?</p>
        <p style={{ color: '#22c55e', marginBottom: '20px' }}>Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</p>
        <button 
          style={{
            padding: '15px 30px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginTop: '20px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => alert('Button works!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}