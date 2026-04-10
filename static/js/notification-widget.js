/**
 * Notification Widget - Shows unread count and recent notifications in header
 * Add this to your base.html header
 */

class NotificationWidget {
    constructor() {
        this.init();
    }

    async init() {
        this.createWidget();
        this.updateUnreadCount();
        this.setupEventListeners();
        // Refresh every 10 seconds
        setInterval(() => this.updateUnreadCount(), 10000);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'notificationWidget';
        widget.className = 'notification-widget';
        widget.innerHTML = `
            <button class="notification-bell" id="notificationBell">
                <span class="bell-icon">🔔</span>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="dropdown-header">
                    <h3>Notifications</h3>
                    <a href="/notifications/" class="view-all">View All</a>
                </div>
                <div class="dropdown-content" id="dropdownContent">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        `;

        // Insert into header or create one
        const header = document.querySelector('header') || document.querySelector('nav');
        if (header) {
            header.appendChild(widget);
        } else {
            document.body.insertBefore(widget, document.body.firstChild);
        }

        this.addStyles();
    }

    setupEventListeners() {
        const bell = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');

        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
                if (dropdown.classList.contains('show')) {
                    this.loadRecentNotifications();
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (dropdown) dropdown.classList.remove('show');
        });
    }

    async updateUnreadCount() {
        try {
            const response = await fetch('/notifications/api/unread-count/', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    if (data.unread_count > 0) {
                        badge.textContent = data.unread_count;
                        badge.style.display = 'inline-block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error('Error updating notification count:', error);
        }
    }

    async loadRecentNotifications() {
        try {
            const response = await fetch('/notifications/api/', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                const notifications = await response.json();
                const recent = notifications.slice(0, 5);
                this.renderDropdownContent(recent);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderDropdownContent(notifications) {
        const content = document.getElementById('dropdownContent');
        if (!content) return;

        if (notifications.length === 0) {
            content.innerHTML = '<div class="empty">No notifications</div>';
            return;
        }

        content.innerHTML = notifications.map(n => `
            <div class="notification-item ${!n.is_read ? 'unread' : ''}">
                <div class="notification-title">${this.escapeHtml(n.title)}</div>
                <div class="notification-preview">${this.escapeHtml(n.message.substring(0, 60))}...</div>
                <div class="notification-time">${this.getTimeAgo(new Date(n.created_at))}</div>
            </div>
        `).join('');
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getToken() {
        return localStorage.getItem('token') || this.getCookie('token') || '';
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-widget {
                position: relative;
                display: inline-block;
            }

            .notification-bell {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 24px;
                position: relative;
                padding: 8px;
                transition: transform 0.2s;
            }

            .notification-bell:hover {
                transform: scale(1.1);
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }

            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                width: 350px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                margin-top: 8px;
            }

            .notification-dropdown.show {
                display: block;
            }

            .dropdown-header {
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dropdown-header h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            .view-all {
                color: #007bff;
                text-decoration: none;
                font-size: 12px;
                font-weight: 600;
            }

            .view-all:hover {
                text-decoration: underline;
            }

            .dropdown-content {
                padding: 8px 0;
            }

            .notification-item {
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.2s;
            }

            .notification-item:hover {
                background: #f9f9f9;
            }

            .notification-item.unread {
                background: #f0f7ff;
            }

            .notification-title {
                font-weight: 600;
                color: #333;
                margin: 0 0 4px 0;
                font-size: 14px;
            }

            .notification-preview {
                color: #666;
                font-size: 12px;
                margin: 4px 0;
                line-height: 1.4;
            }

            .notification-time {
                color: #999;
                font-size: 11px;
            }

            .empty {
                padding: 20px;
                text-align: center;
                color: #999;
            }

            .loading {
                padding: 20px;
                text-align: center;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NotificationWidget();
});
