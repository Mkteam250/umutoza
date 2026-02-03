'use client';

// src/pages/QuizTestPage.jsx (Controller)
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { selectSmartQuestions } from '../utils/questionSelector.js';
import Toast from './Toast';

// Sub-components
import QuizLanding from './QuizLanding';
import QuizActive from './QuizActive';

import QuizResult from './QuizResult';
import PromotionDisplay from './PromotionDisplay';

const QuizTestPage = () => {
  const QUIZ_DURATION_SECONDS = 20 * 60; // 20 minutes
  const QUESTIONS_PER_QUIZ = 20;

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umutoza-umutoza.hf.space';

  // App States
  const [quizState, setQuizState] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Session & Profile Data
  const [session, setSession] = useState(() => {
    const savedId = localStorage.getItem('umutoza_session_id');
    return savedId ? { id: savedId } : null;
  });
  const [userData, setUserData] = useState({
    name: localStorage.getItem('umutoza_user_name') || '',
    image: null,
    persistedImageUrl: localStorage.getItem('umutoza_user_image') || null
  });
  const [imagePreview, setImagePreview] = useState(localStorage.getItem('umutoza_user_image') || null);

  // Quiz States
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [userResults, setUserResults] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, correctAnswer: '' });

  // Timer Ref
  const timerRef = useRef(null);

  // Helpers
  const showToast = (message, type = 'error') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!userData.name.trim()) return showToast('Izina rirakenewe');

    setIsLoading(true);
    try {
      const quizRes = await axios.get(`${apiUrl}/api/admin/quiz`);
      const smartQuestions = selectSmartQuestions(quizRes.data, [], QUESTIONS_PER_QUIZ);

      if (smartQuestions.length === 0) {
        showToast('Nta bibazo bihari ubu.');
        return;
      }

      const existingSessionId = localStorage.getItem('umutoza_session_id');
      const existingUserName = localStorage.getItem('umutoza_user_name');

      const isUpdatingName = existingSessionId && existingUserName &&
        existingUserName.toLowerCase() !== userData.name.trim().toLowerCase();

      let sessionData;

      if (isUpdatingName) {
        try {
          const updateRes = await axios.put(`${apiUrl}/api/sessions/${existingSessionId}`, {
            userName: userData.name.trim(),
            activity: 'Yahinduye izina'
          });
          sessionData = updateRes.data;
          localStorage.setItem('umutoza_user_name', userData.name.trim());
        } catch (updateErr) {
          if (updateErr.response && updateErr.response.status === 409) {
            showToast('Iri zina ryamaze gukoreshwa nundi muntu. Hitamo irindi.', 'error');
            return;
          }
          throw updateErr;
        }
      } else {
        const formData = new FormData();
        formData.append('name', userData.name);
        if (existingSessionId) {
          formData.append('sessionId', existingSessionId);
        }

        const sessionRes = await axios.post(`${apiUrl}/api/sessions/start`, formData);
        sessionData = sessionRes.data;

        localStorage.setItem('umutoza_user_name', userData.name);
        localStorage.setItem('umutoza_session_id', sessionRes.data.id);
      }

      setSession(sessionData);

      // Reset state for new quiz
      setUserResults([]);
      setSelectedAnswerIndex(null);
      setCurrentQuestion(0);
      setTimeLeft(QUIZ_DURATION_SECONDS);
      setFeedback({ show: false, isCorrect: false, correctAnswer: '' });

      if (sessionData.status === 'completed') {
        setQuizState('result');
      } else {
        setQuestions(smartQuestions);
        setQuizState('quiz');
        startTimer();
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        showToast('Iri zina ryamaze gukoreshwa nundi muntu.', 'error');
      } else {
        console.error(err);
        showToast('Ntibishoboye gufungura ikizamini.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleQuizCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = async (optionIndex) => {
    if (selectedAnswerIndex !== null) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = optionIndex === currentQ.correctAnswerIndex;

    setSelectedAnswerIndex(optionIndex);

    // Track results for review
    const newResults = [...userResults, {
      id: currentQ.id,
      isCorrect,
      userChoice: optionIndex,
      correctChoice: currentQ.correctAnswerIndex
    }];
    setUserResults(newResults);

    // Calculate progress
    const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);
    const isLastQuestion = currentQuestion >= questions.length - 1;

    // Sync with backend
    try {
      await axios.put(`${apiUrl}/api/sessions/${session.id}`, {
        progress: progress,
        status: isLastQuestion ? 'completed' : 'active',
        activity: 'Ari mu Kizamini'
      });
    } catch (err) {
      console.error('Sync failed', err);
    }

    // Move to next question or finish
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswerIndex(null);
        setFeedback({ show: false, isCorrect: false, correctAnswer: '' });
      } else {
        handleQuizCompletion();
      }
    }, 1000);
  };

  const handleQuizCompletion = () => {
    setQuizState('result');
    if (timerRef.current) clearInterval(timerRef.current);

    // Final sync - ensure completed status
    if (session) {
      axios.put(`${apiUrl}/api/sessions/${session.id}`, {
        status: 'completed',
        activity: 'Yarangije Ikizamini'
      }).catch(e => console.error(e));
    }
  };

  return (
    <div>
      {(quizState === 'landing' || quizState === 'editing') && (
        <QuizLanding
          userData={userData}
          setUserData={setUserData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          handleStartQuiz={handleStartQuiz}
          isLoading={isLoading}
          quizState={quizState}
          setQuizState={setQuizState}
          apiUrl={apiUrl}
        />
      )}

      {quizState === 'quiz' && (
        <QuizActive
          questions={questions}
          currentQuestion={currentQuestion}
          timeLeft={timeLeft}
          formatTime={formatTime}
          userData={userData}
          apiUrl={apiUrl}
          selectedAnswerIndex={selectedAnswerIndex}
          handleAnswerSelect={handleAnswerSelect}
        />
      )}

      {quizState === 'result' && (
        <QuizResult
          questions={questions}
          userResults={userResults}
          userData={userData}
          apiUrl={apiUrl}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default QuizTestPage;