import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { NotificationAPI } from '../utils/api';
import { getTimeAgo } from '../utils/helpers';
import '../styles/notifications.css';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await NotificationAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await NotificationAPI.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button onClick={markAllAsRead} className="btn-secondary">Mark All as Read</button>
      </div>

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={filter === 'unread' ? 'active' : ''} 
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      <div className="notifications-list">
        {filtered.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
          >
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className="notification-time">{getTimeAgo(new Date(notification.created_at))}</span>
            </div>
            {!notification.is_read && (
              <button 
                onClick={() => markAsRead(notification.id)}
                className="btn-small"
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
};
