import React, { useState, useEffect } from "react";
import "../Css/Educationsection.css";
import { useStateValue } from "../StateProvider";

function Educationsection() {
  const [{ user }] = useStateValue();
  const [currentSection, setCurrentSection] = useState('overview');
  const [educationalContent, setEducationalContent] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionTopic, setQuestionTopic] = useState('');
  const [userLevel, setUserLevel] = useState('beginner');
  const [impactPoints, setImpactPoints] = useState(user?.impactPoints || 150);

  // Sample topics for quick access
  const sustainabilityTopics = [
    { id: 'circular-economy', name: 'Circular Economy', difficulty: 'medium', icon: '♻️' },
    { id: 'renewable-energy', name: 'Renewable Energy', difficulty: 'beginner', icon: '🌞' },
    { id: 'sustainable-fashion', name: 'Sustainable Fashion', difficulty: 'medium', icon: '👕' },
    { id: 'zero-waste', name: 'Zero Waste Living', difficulty: 'beginner', icon: '🗑️' },
    { id: 'carbon-footprint', name: 'Carbon Footprint', difficulty: 'medium', icon: '🌍' },
    { id: 'biodiversity', name: 'Biodiversity Conservation', difficulty: 'advanced', icon: '🦋' },
    { id: 'ocean-plastic', name: 'Ocean Plastic Crisis', difficulty: 'medium', icon: '🌊' },
    { id: 'sustainable-food', name: 'Sustainable Food Systems', difficulty: 'beginner', icon: '🌱' }
  ];  const fetchEducationalContent = async (topic) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/educational-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, userLevel })
      });
      const result = await response.json();
      
      console.log('Educational Content:', result);
      
      if (result.success && result.data) {
        setEducationalContent(result.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching educational content:', error);
      // Fallback content
      setEducationalContent({
        title: `Understanding ${topic}`,
        content: `Learn about ${topic} and its impact on our environment. This topic is crucial for building a sustainable future.`,
        actionItems: [`Research ${topic} products`, 'Make sustainable choices', 'Share knowledge with others'],
        funFacts: [`${topic} can significantly reduce environmental impact`, 'Small changes make big differences']
      });
    } finally {
      setLoading(false);
    }
  };  const fetchQuiz = async (topic) => {
    setLoading(true);
    try {
      const selectedTopic = sustainabilityTopics.find(t => t.id === topic);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/sustainability-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic?.name || topic, 
          difficulty: selectedTopic?.difficulty || 'medium',
          questionCount: 5 
        })
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        setCurrentQuiz(result.data);
      } else {
        throw new Error('Invalid quiz response structure');
      }
      setQuizAnswers({});
      setQuizResults(null);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Fallback quiz
      setCurrentQuiz({
        title: 'Sustainability Basics Quiz',
        description: 'Test your knowledge and earn impact points!',
        totalPossiblePoints: 75,
        questions: [
          {
            id: 1,
            question: 'What is the main goal of sustainable living?',
            options: [
              'To reduce environmental impact while meeting current needs',
              'To eliminate all modern conveniences',
              'To live completely off-grid',
              'To only buy expensive products'
            ],
            correctAnswer: 0,
            explanation: 'Sustainable living aims to reduce environmental impact while meeting our needs.',
            points: 15,
            difficulty: 'easy'
          }
        ],
        completionBonus: 25
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answerIndex
    });
  };
  const submitQuiz = () => {
    if (!currentQuiz || !currentQuiz.questions) return;

    let totalPoints = 0;
    let correctAnswers = 0;

    const results = currentQuiz.questions.map(question => {
      const userAnswer = quizAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points || 0;
      }

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        pointsEarned: isCorrect ? (question.points || 0) : 0
      };
    });

    // Add completion bonus if all questions answered
    if (Object.keys(quizAnswers).length === currentQuiz.questions.length) {
      totalPoints += currentQuiz.completionBonus || 0;
    }

    setQuizResults({
      totalPoints,
      correctAnswers,
      totalQuestions: currentQuiz.questions.length,
      results,
      completionBonus: currentQuiz.completionBonus || 0
    });

    // Update user's impact points
    setImpactPoints(prev => prev + totalPoints);
  };

  const handleCustomQuestion = async () => {
    if (!questionTopic.trim()) return;
    
    await fetchEducationalContent(questionTopic);
    setCurrentSection('content');
  };

  return (
    <div className="education-container">
      {/* Hero Section */}
      <div className="education-hero">
        <div className="hero-content">
          <h1>🌱 EcoSphere Learn</h1>
          <p>Discover, Learn, and Earn Impact Points Through Sustainability Education</p>
          <div className="impact-display">
            <span className="impact-points">💎 {impactPoints} Impact Points</span>
            <span className="eco-level">🌿 {user?.ecoTier || 'EcoEntry'} Level</span>
          </div>
        </div>
        <div className="hero-animation">
          <div className="floating-elements">
            <span className="float-1">🌍</span>
            <span className="float-2">♻️</span>
            <span className="float-3">🌱</span>
            <span className="float-4">💧</span>
            <span className="float-5">🌞</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="education-nav">
        <button 
          className={`nav-btn ${currentSection === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentSection('overview')}
        >
          🏠 Overview
        </button>
        <button 
          className={`nav-btn ${currentSection === 'topics' ? 'active' : ''}`}
          onClick={() => setCurrentSection('topics')}
        >
          📚 Learn Topics
        </button>
        <button 
          className={`nav-btn ${currentSection === 'quiz' ? 'active' : ''}`}
          onClick={() => setCurrentSection('quiz')}
        >
          🎯 Take Quiz
        </button>
        <button 
          className={`nav-btn ${currentSection === 'ask' ? 'active' : ''}`}
          onClick={() => setCurrentSection('ask')}
        >
          ❓ Ask AI
        </button>
      </div>

      {/* Content Sections */}
      <div className="education-content">
        {/* Overview Section */}
        {currentSection === 'overview' && (
          <div className="overview-section">
            <div className="ecosphere-intro">
              <h2>🌍 Welcome to EcoSphere</h2>
              <div className="intro-grid">
                <div className="intro-card">
                  <div className="card-icon">🛒</div>
                  <h3>Sustainable Marketplace</h3>
                  <p>Discover eco-friendly products with verified environmental impact scores. Every purchase contributes to a greener planet.</p>
                </div>
                <div className="intro-card">
                  <div className="card-icon">💎</div>
                  <h3>Impact Points System</h3>
                  <p>Earn points for sustainable choices, learning, and quiz completion. Progress through eco-tiers and unlock exclusive rewards.</p>
                </div>
                <div className="intro-card">
                  <div className="card-icon">📊</div>
                  <h3>Real Impact Tracking</h3>
                  <p>See your actual environmental impact: CO2 saved, water conserved, waste prevented. Your choices make a measurable difference.</p>
                </div>
                <div className="intro-card">
                  <div className="card-icon">🤝</div>
                  <h3>Community Learning</h3>
                  <p>Join group purchases, participate in challenges, and learn from a community committed to sustainability.</p>
                </div>
              </div>
            </div>

            <div className="how-it-works">
              <h2>🔄 How EcoSphere Works</h2>
              <div className="process-flow">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <h4>🔍 Discover</h4>
                  <p>Browse AI-verified eco-friendly products with detailed sustainability scores</p>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <h4>📖 Learn</h4>
                  <p>Understand environmental impact and make informed sustainable choices</p>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <h4>🛍️ Purchase</h4>
                  <p>Buy eco-friendly alternatives and earn impact points for every sustainable choice</p>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">4</div>
                  <h4>📈 Track</h4>
                  <p>Monitor your environmental impact and watch your positive contribution grow</p>
                </div>
              </div>
            </div>

            <div className="impact-showcase">
              <h2>🌟 Our Community Impact</h2>
              <div className="impact-stats">
                <div className="stat-card">
                  <div className="stat-icon">🌍</div>
                  <div className="stat-number">2,847 kg</div>
                  <div className="stat-label">CO2 Prevented</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💧</div>
                  <div className="stat-number">45,239 L</div>
                  <div className="stat-label">Water Saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">♻️</div>
                  <div className="stat-number">1,256 kg</div>
                  <div className="stat-label">Waste Diverted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌱</div>
                  <div className="stat-number">3,847</div>
                  <div className="stat-label">Products Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topics Section */}
        {currentSection === 'topics' && (
          <div className="topics-section">
            <h2>🌱 Sustainability Learning Topics</h2>
            <div className="level-selector">
              <span>Choose your level:</span>
              <select value={userLevel} onChange={(e) => setUserLevel(e.target.value)}>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🌿 Intermediate</option>
                <option value="advanced">🌳 Advanced</option>
              </select>
            </div>
            
            <div className="topics-grid">
              {sustainabilityTopics.map(topic => (
                <div key={topic.id} className="topic-card" onClick={() => fetchEducationalContent(topic.name)}>
                  <div className="topic-icon">{topic.icon}</div>
                  <h3>{topic.name}</h3>
                  <div className="topic-difficulty">{topic.difficulty}</div>
                  <button className="learn-btn">Learn More</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Display */}
        {currentSection === 'content' && educationalContent && (
          <div className="content-display">
            <button className="back-btn" onClick={() => setCurrentSection('topics')}>
              ← Back to Topics
            </button>
            <div className="content-card">
              <h2>{educationalContent.title}</h2>
              <div className="content-body">{educationalContent.content}</div>
                {educationalContent.actionItems && (
                <div className="action-items">
                  <h3>🎯 Take Action</h3>
                  <ul>
                    {educationalContent.actionItems.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'object' ? (
                          <div>
                            <strong>{item.title}</strong>
                            {item.description && <p>{item.description}</p>}
                          </div>
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}              {educationalContent.funFacts && (
                <div className="fun-facts">
                  <h3>🔥 Did You Know?</h3>
                  <ul>
                    {educationalContent.funFacts.map((fact, index) => (
                      <li key={index}>
                        {typeof fact === 'object' ? (
                          <div>
                            <strong>{fact.title}</strong>
                            {fact.description && <p>{fact.description}</p>}
                          </div>
                        ) : (
                          fact
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {currentSection === 'quiz' && (
          <div className="quiz-section">
            {!currentQuiz ? (
              <div className="quiz-selection">
                <h2>🎯 Test Your Knowledge</h2>
                <p>Choose a topic for your sustainability quiz and earn impact points!</p>
                
                <div className="quiz-topics-grid">
                  {sustainabilityTopics.map(topic => (
                    <div key={topic.id} className="quiz-topic-card" onClick={() => fetchQuiz(topic.id)}>
                      <div className="topic-icon">{topic.icon}</div>
                      <h3>{topic.name}</h3>
                      <div className="topic-points">+{topic.difficulty === 'beginner' ? '50' : topic.difficulty === 'medium' ? '75' : '100'} points</div>
                      <div className="topic-difficulty">{topic.difficulty}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="quiz-container">
                {!quizResults ? (
                  <div className="quiz-active">
                    <div className="quiz-header">
                      <h2>{currentQuiz.title}</h2>
                      <p>{currentQuiz.description}</p>                      <div className="quiz-progress">
                        Progress: {Object.keys(quizAnswers).length}/{currentQuiz.questions?.length || 0}
                      </div>
                    </div>                    <div className="quiz-questions">
                      {currentQuiz.questions?.map((question, index) => (
                        <div key={question.id} className="question-card">
                          <h3>Question {index + 1}</h3>
                          <p className="question-text">{question.question}</p>
                          <div className="question-options">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="option-label">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={optionIndex}
                                  checked={quizAnswers[question.id] === optionIndex}
                                  onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                />
                                <span className="option-text">{option}</span>
                              </label>
                            ))}                          </div>
                          <div className="question-points">💎 {question.points} points</div>
                        </div>
                      ))}
                    </div>

                    <div className="quiz-actions">                      <button 
                        className="submit-quiz-btn"
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length !== (currentQuiz.questions?.length || 0)}
                      >
                        Submit Quiz 🚀
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="quiz-results">
                    <h2>🎉 Quiz Complete!</h2>
                    <div className="results-summary">
                      <div className="score-display">
                        <div className="points-earned">+{quizResults.totalPoints} Points!</div>
                        <div className="score-details">
                          {quizResults.correctAnswers}/{quizResults.totalQuestions} Correct
                        </div>
                      </div>
                    </div>

                    <div className="results-breakdown">
                      {quizResults.results.map((result, index) => (
                        <div key={result.questionId} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                          <h4>Question {index + 1}</h4>
                          <p>{result.question}</p>
                          <div className="result-status">
                            {result.isCorrect ? '✅ Correct' : '❌ Incorrect'} 
                            {result.isCorrect && <span className="points">+{result.pointsEarned} points</span>}
                          </div>
                          <p className="explanation">{result.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="new-quiz-btn"
                      onClick={() => {
                        setCurrentQuiz(null);
                        setQuizResults(null);
                        setQuizAnswers({});
                      }}
                    >
                      Take Another Quiz 🎯
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ask AI Section */}
        {currentSection === 'ask' && (
          <div className="ask-section">
            <h2>🤖 Ask Our Sustainability AI</h2>
            <div className="ask-container">
              <div className="ask-input-section">
                <p>Have a question about sustainability? Ask our AI expert and get personalized educational content!</p>
                
                <div className="input-group">
                  <input
                    type="text"
                    value={questionTopic}
                    onChange={(e) => setQuestionTopic(e.target.value)}
                    placeholder="Ask about any sustainability topic..."
                    className="question-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
                  />
                  <button 
                    className="ask-btn"
                    onClick={handleCustomQuestion}
                    disabled={loading || !questionTopic.trim()}
                  >
                    {loading ? '🔄' : '🚀'} Ask AI
                  </button>
                </div>

                <div className="suggestion-topics">
                  <p>💡 Popular questions:</p>
                  <div className="suggestion-chips">
                    {['How to reduce plastic waste?', 'Benefits of renewable energy', 'Sustainable fashion tips', 'Carbon footprint reduction', 'Zero waste lifestyle'].map(suggestion => (
                      <button 
                        key={suggestion}
                        className="suggestion-chip"
                        onClick={() => setQuestionTopic(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="loading-animation">
                  <div className="loading-spinner">🌱</div>
                  <p>AI is generating your personalized content...</p>
                </div>
              )}

              {educationalContent && !loading && (
                <div className="ai-response">
                  <div className="response-header">
                    <h3>🎓 AI Educational Response</h3>
                    <div className="content-badge">Personalized for {userLevel} level</div>
                  </div>
                  
                  <div className="response-content">
                    <h4>{educationalContent.title}</h4>
                    <div className="content-text">{educationalContent.content}</div>
                      {educationalContent.actionItems && (
                      <div className="action-section">
                        <h5>🎯 What You Can Do:</h5>
                        <ul>
                          {educationalContent.actionItems.map((item, index) => (
                            <li key={index}>
                              {typeof item === 'object' ? (
                                <div>
                                  <strong>{item.title}</strong>
                                  {item.description && <p>{item.description}</p>}
                                </div>
                              ) : (
                                item
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}                    {educationalContent.funFacts && (
                      <div className="facts-section">
                        <h5>🌟 Interesting Facts:</h5>
                        <ul>
                          {educationalContent.funFacts.map((fact, index) => (
                            <li key={index}>
                              {typeof fact === 'object' ? (
                                <div>
                                  <strong>{fact.title}</strong>
                                  {fact.description && <p>{fact.description}</p>}
                                </div>
                              ) : (
                                fact
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Educationsection;
