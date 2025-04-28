# LingQuiz Application Specification

## Overview
LingQuiz is a single-page Vue.js application that presents a linguistics quiz with multiple-choice questions. The application features a modern, arcade-style UI with interactive feedback and score tracking.

## Core Features

### 1. User Interface
- Start screen with welcome message and start button
- Quiz screen with:
  - User name display (uppercase, dark blue)
  - Progress indicator (current question/total)
  - Score display (correct answers/total)
  - Points display (earned/total possible)
  - Question text
  - Multiple choice options
  - Feedback section with explanations
  - Next and Reset buttons
- Results screen with:
  - Final score
  - Points earned
  - Performance feedback message
  - Try Again button
- Debug panel (toggle with 'Z' key) showing:
  - Current quiz state
  - Current quiz details
  - All quizzes data

### 2. Quiz Mechanics
- Two attempts per question
- Scoring system:
  - 2 points for correct answer on first attempt
  - 1 point for correct answer on second attempt
  - 0 points for incorrect answer after two attempts
- Random option shuffling for each question
- Immediate feedback after each attempt
- Explanation displayed after question completion
- Persistent quiz state management
- Proper option shuffling and correct answer tracking

### 3. Data Management
- Quiz data stored in external text file (Quiz.txt)
- Format:
  ```
  <quiz>
  Question text
  -Option 1
  -*Correct Option
  -Option 3
  -Option 4
  =Explanation in French
  </quiz>
  ```
- User progress saved in localStorage
- Score and points tracking
- Attempt counting
- Original quiz data preservation for reset functionality

### 4. Styling Requirements
- Modern, arcade-style UI
- Responsive design
- Color scheme:
  - Dark blue for user name
  - Green for correct answers
  - Orange for first incorrect attempt
  - Red for second incorrect attempt
  - Light gray background for explanations
- Font: Bangers for user name
- Proper spacing and padding
- Mobile-friendly layout
- Debug panel with dark theme

### 5. Technical Requirements
- Vue.js 3.4+
- Vite for build and development
- GitHub Pages deployment
- Base URL configuration for GitHub Pages
- Local storage for user data
- Responsive design
- Error handling for data loading
- Debug mode (press 'Z' key)
- Proper state management and data flow

### 6. User Experience
- Clear feedback messages
- Smooth transitions
- Intuitive navigation
- Persistent user data
- Debug mode for development
- Birthday message for specific user
- Explanations for learning
- Proper reset functionality

### 7. Performance Requirements
- Fast loading times
- Smooth animations
- Efficient data handling
- Proper error handling
- Mobile optimization
- Optimized state management
- Efficient option shuffling

### 8. Deployment
- GitHub Pages hosting
- Automatic deployment workflow
- Base URL configuration
- Build optimization
- Version tagging
- Regular updates

## File Structure
```
LingQuiz/
├── public/
│   └── data/
│       └── Quiz.txt
├── src/
│   ├── components/
│   │   ├── App.vue
│   │   ├── Quiz.vue
│   │   └── UserInput.vue
│   ├── utils/
│   │   └── quizParser.js
│   ├── assets/
│   └── main.js
├── vite.config.js
└── package.json
```

## Dependencies
- Vue.js 3.4+
- Vite 5.4+
- gh-pages for deployment

## Development Workflow
1. Local development with Vite
2. Testing on multiple devices
3. Build for production
4. Deploy to GitHub Pages
5. Version tagging
6. Regular updates

## Future Enhancements
- Additional quiz categories
- User statistics
- Sound effects
- Animations
- Multi-language support
- User accounts
- Enhanced debug features
- Performance optimizations 