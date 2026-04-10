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
    const startForm = document.getElementById('startInterviewForm');
    if (startForm) {
        startForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await startInterview();
        });
    }
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', submitMCQAnswer);
    }
    
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            submitMCQAnswer(true);
        });
    }
    
    // MCQ option styling
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
        alert('Please select a job category');
        return;
    }
    
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
        
        if (!response.ok) throw new Error('Failed to start interview');
        
        const data = await response.json();
        currentInterview = data;
        questions = data.questions || [];
        answers = [];
        currentQuestionIndex = 0;
        
        // Hide start section, show interview section
        document.getElementById('startSection').style.display = 'none';
        document.getElementById('interviewSection').style.display = 'block';
        
        // Start timer
        startTime = Date.now();
        startTimer();
        
        // Load first question
        loadQuestion();
        
    } catch (error) {
        console.error('Error starting interview:', error);
        alert('Failed to start interview. Please try again.');
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
    
    // Update MCQ options
    document.getElementById('optionA').textContent = question.options.A;
    document.getElementById('optionB').textContent = question.options.B;
    document.getElementById('optionC').textContent = question.options.C;
    document.getElementById('optionD').textContent = question.options.D;
    
    // Clear selection
    document.querySelectorAll('input[name="mcq_answer"]').forEach(input => {
        input.checked = false;
    });
    document.querySelectorAll('.mcq-option').forEach(opt => {
        opt.style.borderColor = 'var(--gray-300)';
        opt.style.background = '#fff';
    });
    
    // Update button text
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Submit & Finish 🎉';
    } else {
        nextBtn.textContent = 'Submit & Next →';
    }
}

async function submitMCQAnswer(skip = false) {
    const question = questions[currentQuestionIndex];
    let selectedAnswer = null;
    
    if (!skip) {
        const selectedInput = document.querySelector('input[name="mcq_answer"]:checked');
        if (!selectedInput) {
            alert('Please select an answer');
            return;
        }
        selectedAnswer = selectedInput.value;
    }
    
    try {
        const response = await fetch(`/api/interviews/mock-interviews/${currentInterview.id}/submit_answer/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                question_id: question.id,
                answer: selectedAnswer || 'SKIPPED'
            })
        });
        
        if (!response.ok) throw new Error('Failed to submit answer');
        
        answers.push({
            question_id: question.id,
            answer: selectedAnswer
        });
        
        currentQuestionIndex++;
        loadQuestion();
        
    } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Failed to submit answer. Please try again.');
    }
}

async function completeInterview() {
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
        
        if (!response.ok) throw new Error('Failed to complete interview');
        
        const data = await response.json();
        
        // Hide interview section, show results
        document.getElementById('interviewSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // Display results
        document.getElementById('finalScore').textContent = data.score || 0;
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
        const response = await fetch('/api/interviews/mock-interviews/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (!response.ok) throw new Error('Failed to load interviews');
        
        const interviews = await response.json();
        displayPreviousInterviews(interviews);
        
    } catch (error) {
        console.error('Error loading previous interviews:', error);
        document.getElementById('previousInterviews').innerHTML = 
            '<p style="text-align:center;color:var(--gray-500);padding:2rem;">No previous interviews found.</p>';
    }
}

function displayPreviousInterviews(interviews) {
    const container = document.getElementById('previousInterviews');
    
    if (interviews.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:2rem;">No previous interviews yet. Start your first practice session!</p>';
        return;
    }
    
    container.innerHTML = interviews.map(interview => {
        const date = new Date(interview.created_at).toLocaleDateString();
        const scoreColor = interview.score >= 80 ? '#10b981' : interview.score >= 60 ? '#fbbf24' : '#f87171';
        
        return `
            <div style="border:2px solid var(--gray-200);padding:1.5rem;border-radius:14px;margin-bottom:1rem;transition:all 0.3s;cursor:pointer;" onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='var(--gray-200)'">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <h4 style="margin:0 0 0.5rem 0;font-size:1.2rem;font-weight:700;color:var(--gray-900);">${interview.job_category}</h4>
                        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.9rem;color:var(--gray-600);">
                            <span>📅 ${date}</span>
                            <span>⏱️ ${interview.duration_minutes} min</span>
                            <span style="background:var(--gray-100);padding:0.25rem 0.75rem;border-radius:8px;text-transform:capitalize;">
                                ${interview.difficulty}
                            </span>
                        </div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:2.5rem;font-weight:800;color:${scoreColor};">${interview.score || '--'}</div>
                        <div style="font-size:0.85rem;color:var(--gray-600);">Score</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
