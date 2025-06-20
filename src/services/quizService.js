import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug function to check environment variables
const checkEnvironmentVariables = () => {
  // Safely access environment variables
  const envVars = {
    apiKey: window._env_?.REACT_APP_GEMINI_API_KEY || process.env?.REACT_APP_GEMINI_API_KEY,
    model: window._env_?.REACT_APP_GEMINI_MODEL || process.env?.REACT_APP_GEMINI_MODEL,
  };
  
  console.log('Environment Variables Check:', {
    apiKeyPresent: !!envVars.apiKey,
    apiKeyLength: envVars.apiKey ? envVars.apiKey.length : 0,
    apiKeyFirstChars: envVars.apiKey ? envVars.apiKey.substring(0, 4) + '...' : 'none',
    model: envVars.model || 'gemini-2.0-flash'
  });
  
  return envVars;
};

// Initialize Gemini AI with the same configuration as backend
const envVars = checkEnvironmentVariables();

if (!envVars.apiKey) {
  console.error('CRITICAL: REACT_APP_GEMINI_API_KEY is not set!');
  console.error('Please ensure you have a .env file in your project root with:');
  console.error('REACT_APP_GEMINI_API_KEY=your_api_key_here');
  console.error('REACT_APP_GEMINI_MODEL=gemini-2.0-flash');
}

const genAI = new GoogleGenerativeAI(envVars.apiKey);
const model = genAI.getGenerativeModel({ 
  model: envVars.model || 'gemini-2.0-flash' 
});

// Debug function to test API key configuration
export const testGeminiConnection = async () => {
  try {
    console.log('Testing Gemini API connection...');
    const envCheck = checkEnvironmentVariables();
    
    if (!envCheck.apiKey) {
      throw new Error(
        'REACT_APP_GEMINI_API_KEY is not set in environment variables.\n' +
        'Please check:\n' +
        '1. .env file exists in project root\n' +
        '2. File contains REACT_APP_GEMINI_API_KEY=your_api_key\n' +
        '3. Development server was restarted after adding .env\n' +
        '4. No spaces or quotes around the API key'
      );
    }

    // Simple test prompt
    const prompt = 'Say "Hello, this is a test" if you can read this.';
    
    console.log('Sending test request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Success! Gemini API Response:', text);
    return {
      success: true,
      message: 'Gemini API connection successful',
      response: text
    };
  } catch (error) {
    console.error('Gemini API Test Failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

export const generateQuizQuestions = async () => {
  try {
    const prompt = `
      As an AI sustainability educator for EcoSphere, generate 3 multiple choice questions about eco-friendly practices, sustainability, and environmental conservation.
      
      Requirements:
      - Each question should have 4 options
      - One correct answer per question
      - Questions should be educational and relevant to eco-friendly shopping and sustainability
      - Include topics like: sustainable shopping, waste reduction, eco-friendly certifications, carbon footprint, water conservation
      - Make questions engaging and practical
      
      Format the response as a JSON array with the following structure:
      [
        {
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": index_of_correct_option
        }
      ]
      
      Ensure the questions are clear, accurate, and help users understand eco-friendly practices better.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse AI response as JSON, using fallback questions');
    }
    
    // Fallback questions in case of API failure or parsing error
    return [
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
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error('Failed to generate quiz questions');
  }
}; 