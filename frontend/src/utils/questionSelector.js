// src/utils/questionSelector.js

// Always return exactly `count` questions (default 5)
export const selectSmartQuestions = (allQuestions, seenQuestionIds = [], count = 5) => {
  if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
    return [];
  }

  // Filter unseen
  const unseen = allQuestions.filter(q => !seenQuestionIds.includes(q.id));

  // ✅ If not enough unseen, reset pool
  let pool = unseen.length >= count ? unseen : allQuestions;

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // Return exactly `count` (or all if less)
  const selected = shuffled.slice(0, count);

  return selected.map(q => ({
    id: q.id,
    questionText: q.questionText,
    questionImage: q.questionImage || null,
    options: q.options || [],
    correctAnswerIndex: q.correctAnswerIndex,
    difficulty: q.difficulty,
    explanation: q.explanation || `Based on the ${q.difficulty.toLowerCase()} level question.`
  }));
};