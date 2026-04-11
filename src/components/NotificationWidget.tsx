import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/api';
import { getTimeAgo, escapeHtml } from '../utils/helpers';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string;
}

export const NotificationWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = async () => {
    try {
      const response = await fetch('/notifications/api/unread-count/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error updating notification count:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const response = await fetch('/notifications/api/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      loadRecentNotifications();
    }
  };

  return (
    <div className="notification-widget">
      <button className="notification-bell" onClick={handleBellClick}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <a href="/notifications/" className="view-all">View All</a>
          </div>
          <div className="dropdown-content">
            {notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
                  <div className="notification-title">{escapeHtml(n.title)}</div>
                  <div className="notification-preview">
                    {escapeHtml(n.message.substring(0, 60))}...
                  </div>
                  <div className="notification-time">
                    {getTimeAgo(new Date(n.created_at))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
