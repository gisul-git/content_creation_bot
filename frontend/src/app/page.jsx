import dynamic from 'next/dynamic'

// Dynamically import ChatBot with code splitting
const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false, // ChatBot requires client-side only (uses browser APIs)
  loading: () => (
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
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{ color: '#667eea', fontSize: '1rem', margin: 0 }}>Loading AI Assistant...</p>
    </div>
  ),
})

export default function Home() {
  return <ChatBot />
}
