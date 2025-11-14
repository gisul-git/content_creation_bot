'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#2d3748',
        margin: 0 
      }}>
        Something went wrong!
      </h1>
      <p style={{ 
        color: '#718096',
        fontSize: '1rem',
        maxWidth: '500px'
      }}>
        We encountered an unexpected error. Please try again or refresh the page.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#5568d3'}
          onMouseOut={(e) => e.target.style.background = '#667eea'}
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            border: '1px solid #667eea',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f7fafc'
            e.target.style.borderColor = '#5568d3'
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'white'
            e.target.style.borderColor = '#667eea'
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

