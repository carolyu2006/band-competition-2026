export default function Error() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Error</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Something went wrong</p>
      </div>
    </div>
  )
}
