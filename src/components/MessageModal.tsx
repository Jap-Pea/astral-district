// src/components/MessageModal.tsx
import { useContext, useState } from 'react'
import { MessageContext } from '../context/messageCore'
import type { Message } from '../context/messageCore'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MessageModal = ({ isOpen, onClose }: MessageModalProps) => {
  const context = useContext(MessageContext)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  if (!isOpen || !context) return null

  const {
    messages,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    deleteAll,
  } = context

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleMessageClick = (msg: Message) => {
    if (!msg.read) {
      markAsRead(msg.id)
    }
    setSelectedMessage(msg)
  }

  const handleBackToList = () => {
    setSelectedMessage(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          pointerEvents: 'auto',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, #0a1929 0%, #061829 100%)',
          border: '2px solid rgba(74, 158, 255, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                color: '#4a9eff',
                marginBottom: '0.25rem',
              }}
            >
              Messages
            </h2>
            {unreadCount > 0 && (
              <div style={{ fontSize: '0.9rem', color: '#6ba3bf' }}>
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6ba3bf',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        {messages.length > 0 && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(74, 158, 255, 0.1)',
              display: 'flex',
              gap: '1rem',
            }}
          >
            <button
              onClick={markAllAsRead}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(74, 158, 255, 0.2)',
                border: '1px solid rgba(74, 158, 255, 0.4)',
                borderRadius: '6px',
                color: '#4a9eff',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Mark All Read
            </button>
            <button
              onClick={deleteAll}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          {selectedMessage ? (
            // Detailed Message View
            <div>
              {/* Back button */}
              <button
                onClick={handleBackToList}
                style={{
                  background: 'rgba(74, 158, 255, 0.2)',
                  border: '1px solid rgba(74, 158, 255, 0.4)',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  color: '#4a9eff',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                ← Back to Messages
              </button>

              {/* Message Header */}
              <div
                style={{
                  background: 'rgba(74, 158, 255, 0.1)',
                  border: '2px solid rgba(74, 158, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  {selectedMessage.isSystemMessage ? (
                    <img
                      src="/images/icons/astralboss.png"
                      alt={selectedMessage.from}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid #fbbf24',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'rgba(74, 158, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                      }}
                    ></div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: selectedMessage.isSystemMessage
                          ? '#fbbf24'
                          : '#4a9eff',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {selectedMessage.from}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                      {formatTime(selectedMessage.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMessage(selectedMessage.id)
                      setSelectedMessage(null)
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {selectedMessage.subject}
                </div>
              </div>

              {/* Message Body */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontSize: '1rem',
                  color: '#6ba3bf',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-line',
                }}
              >
                {selectedMessage.message}
              </div>
            </div>
          ) : messages.length === 0 ? (
            // Empty State
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6ba3bf',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontSize: '1.1rem' }}>No messages yet</div>
              <div
                style={{
                  fontSize: '0.9rem',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                }}
              >
                Check back later for messages from other players and the
                District Commander
              </div>
            </div>
          ) : (
            // Message Preview List
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleMessageClick(msg)}
                  style={{
                    background: msg.read
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(74, 158, 255, 0.1)',
                    border: msg.read
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '2px solid rgba(74, 158, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'rgba(74, 158, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = msg.read
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(74, 158, 255, 0.1)'
                  }}
                >
                  {/* Unread badge */}
                  {!msg.read && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      NEW
                    </div>
                  )}

                  {/* From */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {msg.isSystemMessage ? (
                      <img
                        src="/images/icons/astralboss.png"
                        alt={msg.from}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '2px solid #fbbf24',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(74, 158, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                        }}
                      ></div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 'bold',
                          color: msg.isSystemMessage ? '#fbbf24' : '#4a9eff',
                        }}
                      >
                        {msg.from}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: msg.read ? 'normal' : 'bold',
                      color: '#fff',
                    }}
                  >
                    {msg.subject}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
