// Mock Interview JavaScript - MCQ Version
let currentInterview = null;
let currentQuestionIndex = 0;
let questions = [];
let answers = [];
let startTime = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    loadPreviousInterviews();
    setupEventListeners();
});

function setupEventListeners() {
    // Start interview form
    const startForm = document.getElementById('startInterviewForm');
    if (startForm) {
        startForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await startInterview();
        });
    }
    
    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', submitMCQAnswer);
    }
    
    // Skip button
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            submitMCQAnswer(true);
        });
    }
    
    // MCQ option hover effects
    document.addEventListener('change', (e) => {
        if (e.target.name === 'mcq_answer') {
            document.querySelectorAll('.mcq-option').forEach(opt => {
                opt.style.borderColor = 'var(--gray-300)';
                opt.style.background = '#fff';
            });
            e.target.closest('.mcq-option').style.borderColor = '#667eea';
            e.target.closest('.mcq-option').style.background = 'rgba(102,126,234,0.05)';
        }
    });
}

async function startInterview() {
    const jobCategory = document.getElementById('jobCategory').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    if (!jobCategory) {
        showNotification('Please select a job category', 'error');
        return;
    }
    
    // Show loading state
    const startSection = document.getElementById('startSection');
    startSection.style.opacity = '0.5';
    startSection.style.pointerEvents = 'none';
    
    try {
        const response = await fetch('/api/interviews/mock-interviews/start_interview/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                job_category: jobCategory,
                difficulty: difficulty
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to start interview');
        }
        
        const data = await response.json();
        currentInterview = data;
        questions = data.questions || [];
        answers = [];
        currentQuestionIndex = 0;
        
        // Smooth transition
        startSection.style.transition = 'all 0.6s ease';
        startSection.style.transform = 'translateX(-100%)';
        startSection.style.opacity = '0';
        
        setTimeout(() => {
            startSection.style.display = 'none';
            const interviewSection = document.getElementById('interviewSection');
            interviewSection.style.display = 'block';
            interviewSection.style.opacity = '0';
            interviewSection.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                interviewSection.style.transition = 'all 0.6s ease';
                interviewSection.style.opacity = '1';
                interviewSection.style.transform = 'translateX(0)';
            }, 50);
        }, 600);
        
        // Start timer
        startTime = Date.now();
        startTimer();
        
        // Load first question
        loadQuestion();
        
        // Create confetti effect
        createConfetti();
        
    } catch (error) {
        console.error('Error starting interview:', error);
        showNotification('Failed to start interview. Please try again.', 'error');
        startSection.style.opacity = '1';
        startSection.style.pointerEvents = 'auto';
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        completeInterview();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Update question display
    document.getElementById('questionCategory').textContent = question.category || 'General';
    document.getElementById('questionText').textContent = question.text;
    
    // Clear answer input
    document.getElementById('answerInput').value = '';
    document.getElementById('charCount').textContent = '0 characters';
    
    // Update button text
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Submit & Finish 🎉';
    } else {
        nextBtn.textContent = 'Submit & Next →';
    }
}

async function submitAnswer(skipped = false) {
    const answer = document.getElementById('answerInput').value;
    
    if (!skipped && !answer.trim()) {
        alert('Please provide an answer or click Skip');
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    // Save answer
    answers.push({
        question_id: question.id,
        answer: skipped ? '[Skipped]' : answer
    });
    
    // Submit to backend
    try {
        await fetch(`/api/interviews/mock-interviews/${currentInterview.id}/submit_answer/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                question_id: question.id,
                answer: skipped ? '[Skipped]' : answer
            })
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
    
    // Move to next question
    currentQuestionIndex++;
    loadQuestion();
}

async function completeInterview() {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    try {
        const response = await fetch(`/api/interviews/mock-interviews/${currentInterview.id}/complete_interview/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to complete interview');
        }
        
        const data = await response.json();
        
        // Hide interview section, show results
        document.getElementById('interviewSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // Display results
        document.getElementById('finalScore').textContent = data.score || '--';
        document.getElementById('aiFeedback').textContent = data.ai_feedback || 'No feedback available';
        
        // Reload previous interviews
        loadPreviousInterviews();
        
    } catch (error) {
        console.error('Error completing interview:', error);
        alert('Failed to complete interview. Please try again.');
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

async function loadPreviousInterviews() {
    try {
        const response = await fetch('/api/interviews/mock-interviews/');
        
        if (!response.ok) {
            throw new Error('Failed to load interviews');
        }
        
        const data = await response.json();
        const interviews = data.results || data;
        
        const container = document.getElementById('previousInterviews');
        
        if (!interviews || interviews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">📋</div>
                    <p style="color: #999; font-size: 18px;">No previous interviews yet.</p>
                    <p style="color: #666; font-size: 16px;">Start your first one above!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = interviews.map((interview, index) => `
            <div class="history-card stagger-item" style="animation-delay: ${index * 0.1}s;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #2d3748;">
                            ${interview.job_category}
                        </h4>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; color: #666; font-size: 14px;">
                            <span style="display: flex; align-items: center; gap: 5px;">
                                <span style="font-weight: 600;">Difficulty:</span>
                                <span style="padding: 4px 12px; background: ${getDifficultyColor(interview.difficulty)}; color: white; border-radius: 12px; font-weight: 600; font-size: 12px;">
                                    ${interview.difficulty.toUpperCase()}
                                </span>
                            </span>
                            <span>📅 ${new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            ${interview.completed ? 
                                '<span style="color: #28a745; font-weight: 600;">✓ Completed</span>' : 
                                '<span style="color: #ffc107; font-weight: 600;">⏳ In Progress</span>'
                            }
                        </div>
                    </div>
                    <div style="text-align: right;">
                        ${interview.score ? `
                            <div style="display: inline-block; padding: 15px 25px; background: ${getScoreGradient(interview.score)}; border-radius: 12px; color: white;">
                                <div style="font-size: 36px; font-weight: 800; line-height: 1;">${interview.score}</div>
                                <div style="font-size: 12px; opacity: 0.9; font-weight: 600;">SCORE</div>
                            </div>
                        ` : '<div style="color: #999; font-style: italic;">Not completed</div>'}
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading previous interviews:', error);
        document.getElementById('previousInterviews').innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <p style="color: #dc3545; font-size: 18px; font-weight: 600;">Failed to load interview history</p>
                <button onclick="loadPreviousInterviews()" style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Try Again
                </button>
            </div>
        `;
    }
}

function getDifficultyColor(difficulty) {
    const colors = {
        'easy': '#28a745',
        'medium': '#ffc107',
        'hard': '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
}

function getScoreGradient(score) {
    if (score >= 80) return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    if (score >= 60) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.6s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'all 0.6s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 600);
    }, 3000);
}

// Confetti effect
function createConfetti() {
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

// Enhanced loadQuestion with animations
const originalLoadQuestion = loadQuestion;
loadQuestion = function() {
    const questionCard = document.getElementById('questionCard');
    questionCard.style.transition = 'all 0.4s ease';
    questionCard.style.opacity = '0';
    questionCard.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
        originalLoadQuestion.call(this);
        questionCard.style.opacity = '1';
        questionCard.style.transform = 'translateX(0)';
    }, 400);
};
