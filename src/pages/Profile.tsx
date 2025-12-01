import { useUser } from '../hooks/useUser'

const Profile = () => {
  const { user } = useUser()

  if (!user) {
    return (
      <div style={{ color: '#6ba3bf' }}>No user loaded. Please create one.</div>
    )
  }

  const avatar =
    user.profilePic ||
    (user.gender === 'male'
      ? 'https://placehold.co/240x240?text=Male'
      : 'https://placehold.co/240x240?text=Female')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '1.5rem',
        alignItems: 'center',
        background: 'rgba(10, 37, 64, 0.85)',
        border: '2px solid #1e4d7a',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <img
          src={avatar}
          alt={`${user.username} avatar`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div>
        <h1
          style={{ fontSize: '28px', marginBottom: '0.25rem', color: '#4a9eff' }}
        >
          {user.username}
        </h1>
        <p style={{ color: '#6ba3bf', marginBottom: '0.5rem' }}>
          Gender: <strong style={{ color: '#fff' }}>{user.gender ?? '—'}</strong>
        </p>
        <p style={{ color: '#6ba3bf' }}>
          Level: <strong style={{ color: '#fff' }}>{user.level}</strong>
        </p>
      </div>
    </div>
  )
}

export default Profile
