// src/components/NotificationModal.tsx
import { useContext } from 'react'
import { NotificationContext } from '../context/notificationCore'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationModal = ({
  isOpen,
  onClose,
}: NotificationModalProps) => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'NotificationModal must be used within NotificationProvider'
    )
  }

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = context

  if (!isOpen) return null

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#22c55e'
      case 'error':
        return '#ef4444'
      case 'alert':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      case 'docking':
        return '#8b5cf6'
      case 'travel':
        return '#06b6d4'
      default:
        return '#6b7280'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'alert':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'docking':
        return '🚀'
      case 'travel':
        return '🌌'
      default:
        return '📢'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
          backdropFilter: 'blur(4px)',
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
          maxWidth: '600px',
          maxHeight: '80vh',
          background: 'linear-gradient(180deg, #0a1929 0%, #061829 100%)',
          border: '2px solid rgba(74, 158, 255, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '2px solid rgba(74, 158, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#4a9eff',
                letterSpacing: '1px',
              }}
            >
              🔔 NOTIFICATIONS
            </h2>
            {unreadCount > 0 && (
              <p
                style={{
                  margin: '5px 0 0 0',
                  fontSize: '12px',
                  color: '#888',
                }}
              >
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid #22c55e',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#22c55e',
                cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                opacity: unreadCount === 0 ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (unreadCount > 0) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
              }}
            >
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px',
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                No notifications
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  !notification.read && markAsRead(notification.id)
                }
                style={{
                  background: notification.read
                    ? 'rgba(10, 25, 41, 0.5)'
                    : 'rgba(30, 77, 122, 0.3)',
                  border: `2px solid ${getNotificationColor(
                    notification.type
                  )}40`,
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  cursor: notification.read ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: notification.read ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!notification.read) {
                    e.currentTarget.style.borderColor = getNotificationColor(
                      notification.type
                    )
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${getNotificationColor(
                    notification.type
                  )}40`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: getNotificationColor(notification.type),
                          marginBottom: '4px',
                        }}
                      >
                        {notification.title}
                        {!notification.read && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              background: '#ef4444',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              color: '#fff',
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#888',
                        }}
                      >
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '0 5px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#666'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p
                  style={{
                    margin: '0 0 0 30px',
                    fontSize: '14px',
                    color: '#ddd',
                    lineHeight: '1.5',
                  }}
                >
                  {notification.message}
                </p>
                {notification.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      notification.action?.callback()
                      markAsRead(notification.id)
                    }}
                    style={{
                      marginTop: '10px',
                      marginLeft: '30px',
                      background: getNotificationColor(notification.type),
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
