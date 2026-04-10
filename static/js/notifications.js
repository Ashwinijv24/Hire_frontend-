class NotificationManager {
    constructor() {
        this.notifications = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadNotifications();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Mark all as read button
        const markAllBtn = document.getElementById('markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderNotifications();
            });
        });
    }

    async loadNotifications() {
        try {
            const response = await fetch('/notifications/api/', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (response.ok) {
                this.notifications = await response.json();
                this.renderNotifications();
                this.updateUnreadBadge();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Failed to load notifications');
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        let filtered = this.notifications;

        if (this.currentFilter === 'unread') {
            filtered = this.notifications.filter(n => !n.is_read);
        } else if (this.currentFilter !== 'all') {
            filtered = this.notifications.filter(n => n.notification_type === this.currentFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(notification => this.createNotificationHTML(notification)).join('');

        // Add event listeners to notification items
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => this.markAsRead(item.dataset.id));
        });

        container.querySelectorAll('.btn-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAsRead(btn.dataset.id);
            });
        });
    }

    createNotificationHTML(notification) {
        const date = new Date(notification.created_at);
        const timeAgo = this.getTimeAgo(date);
        const typeLabel = this.getTypeLabel(notification.notification_type);

        return `
            <div class="notification-item ${!notification.is_read ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-header">
                    <h3 class="notification-title">${this.escapeHtml(notification.title)}</h3>
                    <span class="notification-type">${typeLabel}</span>
                </div>
                <p class="notification-message">${this.escapeHtml(notification.message)}</p>
                <div class="notification-time">${timeAgo}</div>
                <div class="notification-actions">
                    ${!notification.is_read ? `<button class="btn-read" data-id="${notification.id}">Mark as Read</button>` : ''}
                </div>
            </div>
        `;
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/notifications/api/${notificationId}/mark-as-read/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const notification = this.notifications.find(n => n.id == notificationId);
                if (notification) {
                    notification.is_read = true;
                    this.renderNotifications();
                    this.updateUnreadBadge();
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('/notifications/api/mark-all-as-read/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.notifications.forEach(n => n.is_read = true);
                this.renderNotifications();
                this.updateUnreadBadge();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    async updateUnreadBadge() {
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
            console.error('Error updating unread badge:', error);
        }
    }

    startAutoRefresh() {
        // Refresh notifications every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    getTypeLabel(type) {
        const labels = {
            'application_status': 'Application',
            'application_received': 'Application',
            'job_match': 'Job Match',
            'saved_job_update': 'Job Update',
            'message': 'Message',
            'interview_scheduled': 'Interview',
            'job_posted': 'New Job'
        };
        return labels[type] || type;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getToken() {
        // Get token from localStorage or cookie
        return localStorage.getItem('token') || this.getCookie('token') || '';
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    showError(message) {
        const container = document.getElementById('notificationsList');
        if (container) {
            container.innerHTML = `<div class="empty-state"><p style="color: #d32f2f;">${message}</p></div>`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NotificationManager();
});
