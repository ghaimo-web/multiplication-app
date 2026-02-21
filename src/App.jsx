import { useState, useEffect } from 'react';
import './App.css';

const LEVELS = {
  1: { name: 'Star Beginner', multipliers: [1, 2], color: 'from-yellow-400 to-orange-400' },
  2: { name: 'Rainbow Explorer', multipliers: [3, 4], color: 'from-pink-400 to-purple-400' },
  3: { name: 'Super Counter', multipliers: [5, 6], color: 'from-blue-400 to-cyan-400' },
  4: { name: 'Math Champion', multipliers: [7, 8], color: 'from-green-400 to-teal-400' },
  5: { name: 'Number Wizard', multipliers: [9, 10], color: 'from-red-400 to-pink-500' },
};

const QUESTION_TEMPLATES = [
  { emoji: '🍎', singular: 'apple', plural: 'apples', container: 'basket', containerEmoji: '🧺' },
  { emoji: '🚗', singular: 'toy car', plural: 'toy cars', container: 'box', containerEmoji: '📦' },
  { emoji: '🦋', singular: 'butterfly', plural: 'butterflies', container: 'garden', containerEmoji: '🌸' },
  { emoji: '🍪', singular: 'cookie', plural: 'cookies', container: 'jar', containerEmoji: '🫙' },
  { emoji: '🐶', singular: 'puppy', plural: 'puppies', container: 'park', containerEmoji: '🏞️' },
  { emoji: '⭐', singular: 'star', plural: 'stars', container: 'sky', containerEmoji: '🌙' },
  { emoji: '🎈', singular: 'balloon', plural: 'balloons', container: 'party', containerEmoji: '🎉' },
  { emoji: '🌻', singular: 'flower', plural: 'flowers', container: 'garden', containerEmoji: '🌺' },
  { emoji: '🧸', singular: 'teddy bear', plural: 'teddy bears', container: 'shelf', containerEmoji: '📚' },
  { emoji: '🍓', singular: 'strawberry', plural: 'strawberries', container: 'bowl', containerEmoji: '🥣' },
];

function App() {
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem('multiplicationProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setLevel(progress.level || 1);
      setConsecutiveCorrect(progress.consecutiveCorrect || 0);
      setTotalCorrect(progress.totalCorrect || 0);
      setTotalAttempts(progress.totalAttempts || 0);
    }
    generateQuestion(1);
  }, []);

  useEffect(() => {
    if (level > 0) {
      generateQuestion(level);
    }
  }, [level]);

  const saveProgress = (newLevel, consecutive, correct, attempts) => {
    localStorage.setItem('multiplicationProgress', JSON.stringify({
      level: newLevel,
      consecutiveCorrect: consecutive,
      totalCorrect: correct,
      totalAttempts: attempts,
    }));
  };

  const generateQuestion = (currentLevel) => {
    const levelConfig = LEVELS[currentLevel];
    const multipliers = levelConfig.multipliers;
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const multiplicand = Math.floor(Math.random() * 5) + 2;
    const template = QUESTION_TEMPLATES[Math.floor(Math.random() * QUESTION_TEMPLATES.length)];

    const question = {
      multiplier,
      multiplicand,
      answer: multiplier * multiplicand,
      template,
      text: `You have ${multiplicand} ${template.container}s ${template.containerEmoji} with ${multiplier} ${multiplier === 1 ? template.singular : template.plural} ${template.emoji} in each ${template.container}. How many ${template.plural} do you have in total?`
    };

    setCurrentQuestion(question);
    setShowFeedback(false);
    setShowExplanation(false);
    setUserAnswer('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer) return;

    const answer = parseInt(userAnswer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    const newAttempts = totalAttempts + 1;
    setTotalAttempts(newAttempts);

    if (correct) {
      const newConsecutive = consecutiveCorrect + 1;
      const newTotalCorrect = totalCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      setTotalCorrect(newTotalCorrect);
      setCelebrate(true);

      setTimeout(() => setCelebrate(false), 600);

      if (newConsecutive >= 3 && level < 5) {
        setTimeout(() => {
          const newLevel = level + 1;
          setLevel(newLevel);
          setConsecutiveCorrect(0);
          saveProgress(newLevel, 0, newTotalCorrect, newAttempts);
        }, 2000);
      } else {
        saveProgress(level, newConsecutive, newTotalCorrect, newAttempts);
      }
    } else {
      setConsecutiveCorrect(0);
      setShowExplanation(true);
      saveProgress(level, 0, totalCorrect, newAttempts);
    }
  };

  const handleNextQuestion = () => {
    generateQuestion(level);
  };

  const renderVisualExplanation = () => {
    if (!currentQuestion) return null;

    const { multiplier, multiplicand, template } = currentQuestion;
    const groups = [];

    for (let i = 0; i < multiplicand; i++) {
      const items = Array(multiplier).fill(template.emoji);
      groups.push(
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="text-2xl">{template.containerEmoji}</div>
          <div className="flex gap-1 flex-wrap justify-center">
            {items.map((emoji, idx) => (
              <span key={idx} className="text-2xl">{emoji}</span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border-4 border-purple-300">
        <p className="text-lg font-bold text-purple-700 mb-3 text-center">
          Let me show you! 🌟
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {groups}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-gray-700">
            {multiplicand} groups × {multiplier} {multiplier === 1 ? template.singular : template.plural} = {currentQuestion.answer} {template.plural}!
          </p>
          <p className="text-lg text-gray-600 mt-2">
            Count them all: {Array(currentQuestion.answer).fill(template.emoji).join(' ')}
          </p>
        </div>
      </div>
    );
  };

  if (!currentQuestion) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
      <div className="text-white text-2xl">Loading your adventure...</div>
    </div>;
  }

  const levelConfig = LEVELS[level];
  const progress = (consecutiveCorrect / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-4 border-yellow-300">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-shadow">
            ✨ Multiplication Adventure! ✨
          </h1>

          {/* Level Badge */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`bg-gradient-to-r ${levelConfig.color} text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg`}>
              Level {level}: {levelConfig.name}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden border-2 border-gray-300">
            <div
              className={`h-full bg-gradient-to-r ${levelConfig.color} transition-all duration-500 flex items-center justify-center text-white font-bold text-sm`}
              style={{ width: `${progress}%` }}
            >
              {consecutiveCorrect > 0 && `${consecutiveCorrect}/3 ⭐`}
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            {level < 5 ? `Get 3 in a row to reach the next level! 🚀` : `You're at the highest level! Keep practicing! 👑`}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAttempts}</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            {totalAttempts > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((totalCorrect / totalAttempts) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            )}
          </div>
        </div>

        {/* Question Card */}
        <div className={`bg-white rounded-3xl shadow-2xl p-8 border-4 ${celebrate ? 'border-yellow-400 celebration' : 'border-blue-300'}`}>
          <div className="mb-6">
            <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed text-center font-bold">
              {currentQuestion.text}
            </p>
          </div>

          {/* Answer Input */}
          {!showFeedback && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-32 text-4xl text-center border-4 border-purple-300 rounded-2xl p-4 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  placeholder="?"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold py-4 px-12 rounded-full hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  Check Answer! 🎯
                </button>
              </div>
            </form>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`bounce-in space-y-4`}>
              {isCorrect ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <p className="text-4xl font-bold text-green-600">
                    Amazing! You're right! 🌟
                  </p>
                  <p className="text-2xl text-gray-700">
                    {currentQuestion.answer} is correct! Great job!
                  </p>
                  {consecutiveCorrect >= 3 && level < 5 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl font-bold text-2xl">
                      🎊 Level Up! You're moving to Level {level + 1}! 🎊
                    </div>
                  )}
                  {renderVisualExplanation()}
                  <button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold py-4 px-12 rounded-full hover:scale-110 transition-transform shadow-lg mt-4"
                  >
                    Next Question! 🚀
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🤔</div>
                  <p className="text-4xl font-bold text-blue-600">
                    Let's try again! 💪
                  </p>
                  <p className="text-2xl text-gray-700">
                    You said {userAnswer}, but the answer is {currentQuestion.answer}!
                  </p>
                  {showExplanation && renderVisualExplanation()}
                  <button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-4 px-12 rounded-full hover:scale-110 transition-transform shadow-lg mt-4"
                  >
                    Try Another One! 🌈
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-6 text-white text-lg font-bold">
          <p>You're doing great! Keep practicing! 🌟</p>
        </div>
      </div>
    </div>
  );
}

export default App;
