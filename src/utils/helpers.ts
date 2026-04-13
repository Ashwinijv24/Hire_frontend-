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

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF, DOC, or DOCX file' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}

export function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${type === 'success' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'linear-gradient(135deg,#f5576c,#f093fb)'};
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function createConfetti(): void {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#11998e', '#38ef7d'];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        border-radius: 50%;
        animation: confetti-fall ${3 + Math.random() * 2}s linear;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }, i * 100);
  }
}
