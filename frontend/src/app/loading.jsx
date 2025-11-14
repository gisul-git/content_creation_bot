export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
    }}>
      <div 
        className="loading-spinner"
        style={{
          width: '60px',
          height: '60px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} 
      />
      <p style={{ 
        color: '#667eea', 
        fontSize: '1.1rem',
        fontWeight: '500',
        margin: 0
      }}>
        Loading AI Assistant...
      </p>
    </div>
  )
}

