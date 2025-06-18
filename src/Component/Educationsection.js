import React, { useState, useRef } from "react";
import "../Css/Educationsection.css";
import { Link } from "react-router-dom";

function Educationsection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  // Refs for smooth scrolling
  const coursesRef = useRef(null);
  const docsRef = useRef(null);
  const quizRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const faqItems = [
    {
      question: "Why did we create EcoSphere?",
      answer:
        "The Amazon EcoSphere was created to make it easier for customers to find and buy eco-friendly products. This promotes conscious shopping, reduces environmental impact, enhances the customer experience",
    },
    {
      question: "What criteria are used to certify products as eco-friendly?",
      answer:
        "Products are certified as eco-friendly based on criteria like eco-friendly certificates, carbon emissions, material sourcing, recyclability, plastic usage, energy efficiency, water conservation, non-toxicity, and packaging. These certifications are awarded by reputable eco-friendly organizations and verified by Amazon.",
    },
    {
      question:
        "Can I provide feedback or report any concerns about a product's eco-friendly claims?",
      answer:
        "Yes, you can provide feedback and report any concerns about a product's eco-friendly claims. We have a customer feedback system in place to ensure that your opinions and concerns are heard, allowing us to continuously improve the accuracy and reliability of eco-friendly claims within the 'EcoSphere.'",
    },
    {
      question:
      "How does the box returning system work?",
      answer:
      "After sufficient number of customers click on the RETURN BOX option and the number of boxes from a specific area cross a pre-decided threshold, a pickup will be scheduled and the customers will be notified about the date and time. They can also check the website to get an idea of how much longer it will take to reach the threshold, thus making the procedure much more transparent.",
    },
  ];

  const educationalResources = [
    {
      title: "EcoSphere Documentation",
      description: "Comprehensive guides and documentation about sustainable practices",
      icon: "📚",
      categories: [
        "Getting Started",
        "Best Practices",
        "Certification Process",
        "Sustainability Guidelines"
      ],
      ref: docsRef
    },
    {
      title: "Expert-Led Courses",
      description: "Access our curated courses on sustainability and eco-friendly practices",
      icon: "🎓",
      categories: [
        "Sustainable Shopping",
        "Waste Reduction",
        "Eco-Friendly Living",
        "Green Technology"
      ],
      ref: coursesRef
    },
    {
      title: "Interactive Learning",
      description: "Engage with interactive content and test your knowledge",
      icon: "✍️",
      categories: [
        "Quizzes",
        "Case Studies",
        "Interactive Guides",
        "Progress Tracking"
      ],
      ref: quizRef
    }
  ];

  const quickQuizzes = [
    {
      question: "What is the primary goal of EcoSphere?",
      options: [
        "To increase Amazon's profits",
        "To promote eco-friendly shopping and reduce environmental impact",
        "To compete with other e-commerce platforms",
        "To reduce shipping costs"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of these is NOT a criterion for eco-friendly certification?",
      options: [
        "Carbon emissions",
        "Material sourcing",
        "Product popularity",
        "Recyclability"
      ],
      correctAnswer: 2
    },
    {
      question: "What is the purpose of the box return system?",
      options: [
        "To reduce shipping costs",
        "To promote zero waste and recycling",
        "To speed up delivery",
        "To increase customer satisfaction"
      ],
      correctAnswer: 1
    }
  ];

  const handleItemClick = (index) => {
    if (index === activeIndex) {
      // Clicking the active item again will close it
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  const handleLinkClick = () => {
    // Scroll to the top of the page when the link is clicked
    window.scrollTo(0, 0, { behavior: "instant" });
  };

  const handleQuizSubmit = (quizIndex, selectedAnswer) => {
    if (selectedAnswer === quickQuizzes[quizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    setActiveQuiz(quizIndex);
  };

  const courses = [
    {
      title: "Sustainable Shopping 101",
      instructor: "Dr. Sarah Green",
      duration: "4 weeks",
      level: "Beginner",
      description: "Learn the fundamentals of sustainable shopping and making eco-friendly choices."
    },
    {
      title: "Advanced Waste Reduction",
      instructor: "Prof. Michael Brown",
      duration: "6 weeks",
      level: "Intermediate",
      description: "Deep dive into waste reduction techniques and sustainable practices."
    },
    {
      title: "Green Technology Integration",
      instructor: "Dr. Lisa Chen",
      duration: "8 weeks",
      level: "Advanced",
      description: "Explore cutting-edge green technologies and their implementation."
    }
  ];

  const documentation = [
    {
      title: "Getting Started Guide",
      category: "Basics",
      description: "Essential information for new users of EcoSphere",
      link: "/docs/getting-started"
    },
    {
      title: "Certification Process",
      category: "Process",
      description: "Detailed guide on how products get certified as eco-friendly",
      link: "/docs/certification"
    },
    {
      title: "Best Practices",
      category: "Guidelines",
      description: "Recommended practices for sustainable shopping",
      link: "/docs/best-practices"
    }
  ];

  return (
    <div className="education-container">
      <div className="education-header">
        <h1>EcoSphere Learning Center</h1>
        <p>Expand your knowledge about sustainable practices and eco-friendly living</p>
      </div>

      <div className="education-grid">
        {educationalResources.map((resource, index) => (
          <div key={index} className="education-card">
            <div className="card-header">
              <span className="resource-icon">{resource.icon}</span>
              <h2>{resource.title}</h2>
            </div>
            <p className="card-description">{resource.description}</p>
            <div className="card-categories">
              {resource.categories.map((category, catIndex) => (
                <span key={catIndex} className="category-tag">{category}</span>
              ))}
            </div>
            <button 
              onClick={() => scrollToSection(resource.ref)}
              className="card-link"
            >
              Explore {resource.title}
            </button>
          </div>
        ))}
      </div>

      <div ref={docsRef} className="documentation-section">
        <div className="section-header">
          <h2>Documentation & Guides</h2>
          <p>Comprehensive resources to help you understand EcoSphere better</p>
        </div>
        <div className="docs-grid">
          {documentation.map((doc, index) => (
            <div key={index} className="doc-card">
              <span className="doc-category">{doc.category}</span>
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
              <Link to={doc.link} className="doc-link">Read More</Link>
            </div>
          ))}
        </div>
      </div>

      <div ref={coursesRef} className="courses-section">
        <div className="section-header">
          <h2>Expert-Led Courses</h2>
          <p>Learn from industry experts about sustainability and eco-friendly practices</p>
        </div>
        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className="course-level">{course.level}</span>
              </div>
              <div className="course-details">
                <p className="instructor">Instructor: {course.instructor}</p>
                <p className="duration">Duration: {course.duration}</p>
              </div>
              <p className="course-description">{course.description}</p>
              <button className="enroll-button">Enroll Now</button>
            </div>
          ))}
        </div>
      </div>

      <div ref={quizRef} className="knowledge-check-section">
        <div className="section-header">
          <h2>Test Your Knowledge</h2>
          <p>Take our quick quiz to assess your understanding of eco-friendly practices</p>
        </div>
        
        <div className="quiz-container">
          {quickQuizzes.map((quiz, index) => (
            <div key={index} className="quiz-card">
              <div className="quiz-header">
                <h3>Question {index + 1}</h3>
                {activeQuiz === index && (
                  <span className="quiz-feedback">
                    {quizScore > 0 ? "✓ Correct!" : "✗ Try again"}
                  </span>
                )}
              </div>
              <p className="quiz-question">{quiz.question}</p>
              <div className="quiz-options">
                {quiz.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className={`quiz-option ${
                      activeQuiz === index && optionIndex === quiz.correctAnswer
                        ? 'correct'
                        : activeQuiz === index && optionIndex === activeQuiz
                        ? 'incorrect'
                        : ''
                    }`}
                    onClick={() => handleQuizSubmit(index, optionIndex)}
                    disabled={activeQuiz === index}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-section">
        <h2>Your Learning Progress</h2>
        <div className="progress-stats">
          <div className="stat-card">
            <span className="stat-number">{quizScore}</span>
            <span className="stat-label">Quiz Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{quickQuizzes.length}</span>
            <span className="stat-label">Total Questions</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Educationsection;