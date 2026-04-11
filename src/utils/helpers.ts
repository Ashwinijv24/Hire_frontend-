// Helper utilities

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    'easy': '#28a745',
    'medium': '#ffc107',
    'hard': '#dc3545'
  };
  return colors[difficulty] || '#6c757d';
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  if (score >= 60) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

export function getScoreColor(score: number): { start: string; end: string } {
  if (score >= 90) {
    return { start: '#10b981', end: '#059669' };
  } else if (score >= 80) {
    return { start: '#4facfe', end: '#00f2fe' };
  } else if (score >= 70) {
    return { start: '#667eea', end: '#764ba2' };
  } else if (score >= 60) {
    return { start: '#fbbf24', end: '#f59e0b' };
  } else {
    return { start: '#f093fb', end: '#f5576c' };
  }
}
