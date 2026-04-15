import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { NotificationAPI } from '../utils/api';
import { getTimeAgo, escapeHtml } from '../utils/helpers';
import '../styles/notification-new.css';

export const NotificationWidgetNew: React.FC = () => {
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
      const count = await NotificationAPI.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const data = await NotificationAPI.getNotifications();
      setNotifications(data.slice(0, 8));
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

  const handleViewAll = () => {
    window.location.href = '/notifications';
  };

  return (
    <div className="notification-widget">
      <button className="notification-bell" onClick={handleBellClick} title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <button className="view-all" onClick={handleViewAll}>
              View All
            </button>
          </div>

          <div className="dropdown-content">
            {notifications.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🔔</div>
                <p className="empty-text">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h4 className="notification-title">
                    {escapeHtml(notification.title)}
                  </h4>
                  <p className="notification-preview">
                    {escapeHtml(notification.message.substring(0, 70))}
                    {notification.message.length > 70 ? '...' : ''}
                  </p>
                  <p className="notification-time">
                    {getTimeAgo(new Date(notification.created_at))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
