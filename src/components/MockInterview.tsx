import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/api';
import { getDifficultyColor, getScoreGradient } from '../utils/helpers';

interface Interview {
  id: number;
  job_category: string;
  difficulty: string;
  score?: number;
  created_at: string;
  completed: boolean;
}

interface Question {
  id: number;
  text: string;
  category: string;
}

export const MockInterview: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentInterview, setCurrentInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState('00:00');

  useEffect(() => {
    loadPreviousInterviews();
  }, []);

  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimer(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const loadPreviousInterviews = async () => {
    try {
      const response = await fetch('/api/interviews/mock-interviews/', {
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.results || data);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
    }
  };

  const startInterview = async (jobCategory: string, difficulty: string) => {
    try {
      const response = await fetch('/api/interviews/mock-interviews/start_interview/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({ job_category: jobCategory, difficulty })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentInterview(data);
        setQuestions(data.questions || []);
        setCurrentQuestionIndex(0);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!currentInterview || currentQuestionIndex >= questions.length) return;

    try {
      await fetch(`/api/interviews/mock-interviews/${currentInterview.id}/submit_answer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({
          question_id: questions[currentQuestionIndex].id,
          answer
        })
      });

      if (currentQuestionIndex + 1 >= questions.length) {
        completeInterview();
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const completeInterview = async () => {
    try {
      await fetch(`/api/interviews/mock-interviews/${currentInterview.id}/complete_interview/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      
      setCurrentInterview(null);
      loadPreviousInterviews();
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  if (currentInterview && questions.length > 0) {
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="interview-container">
        <div className="interview-header">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="interview-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="timer">{timer}</span>
          </div>
        </div>

        <div className="question-card">
          <h3>{question.text}</h3>
          <textarea
            placeholder="Type your answer here..."
            rows={6}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                submitAnswer(e.currentTarget.value);
              }
            }}
          />
          <div className="button-group">
            <button
              onClick={(e) => {
                const textarea = (e.target as HTMLElement).previousElementSibling as HTMLTextAreaElement;
                submitAnswer(textarea.value);
              }}
              className="btn-primary"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
            <button
              onClick={() => submitAnswer('[Skipped]')}
              className="btn-secondary"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-interview-container">
      <div className="start-section">
        <h2>Mock Interview</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startInterview(
              formData.get('jobCategory') as string,
              formData.get('difficulty') as string
            );
          }}
        >
          <select name="jobCategory" required>
            <option value="">Select Job Category</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Developer</option>
            <option value="fullstack">Full Stack Developer</option>
          </select>

          <div className="difficulty-options">
            <label>
              <input type="radio" name="difficulty" value="easy" defaultChecked />
              Easy
            </label>
            <label>
              <input type="radio" name="difficulty" value="medium" />
              Medium
            </label>
            <label>
              <input type="radio" name="difficulty" value="hard" />
              Hard
            </label>
          </div>

          <button type="submit" className="btn-primary">Start Interview</button>
        </form>
      </div>

      <div className="previous-interviews">
        <h3>Previous Interviews</h3>
        {interviews.map((interview, index) => (
          <div key={interview.id} className="history-card">
            <div>
              <h4>{interview.job_category}</h4>
              <div className="interview-meta">
                <span style={{
                  background: getDifficultyColor(interview.difficulty),
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {interview.difficulty.toUpperCase()}
                </span>
                <span>📅 {new Date(interview.created_at).toLocaleDateString()}</span>
                {interview.completed && <span style={{ color: '#28a745', fontWeight: '600' }}>✓ Completed</span>}
              </div>
            </div>
            {interview.score && (
              <div style={{
                background: getScoreGradient(interview.score),
                color: '#fff',
                padding: '15px 25px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800' }}>{interview.score}</div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>SCORE</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
