# LingQuiz Specification

## Overview
LingQuiz is a simple, static single-page application built with Vue.js that presents users with linguistics quizzes. The application will be client-side only, with no server requirements.

## Features

### Core Features
1. **Quiz Display**
   - Display one question at a time
   - Show multiple choice options for each question
   - Provide immediate feedback on answer selection
   - Show final score at the end of the quiz

2. **Quiz Navigation**
   - Start quiz button on the home page
   - Next question button after answering
   - Restart quiz option after completion

3. **Data Structure**
   - Quiz questions and answers will be stored in a separate JSON file
   - Each question will include:
     - Question text
     - Multiple choice options
     - Correct answer
     - Optional explanation

### Technical Requirements
1. **Frontend**
   - Vue.js 3
   - Vite as build tool
   - No external CSS frameworks
   - Responsive design

2. **Data Management**
   - Static JSON file for quiz data
   - No database required
   - No API calls

3. **User Experience**
   - Clean, intuitive interface
   - Clear feedback on answers
   - Progress indication
   - Mobile-friendly design

## File Structure
```
src/
  ├── main.js
  ├── App.vue
  ├── components/
  │   ├── Quiz.vue
  │   ├── Question.vue
  │   └── Results.vue
  ├── data/
  │   └── quiz-data.json
  └── assets/
      └── styles.css
```

## Quiz Data Format
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is the study of language sounds called?",
      "options": ["Phonology", "Morphology", "Syntax", "Semantics"],
      "correctAnswer": 0,
      "explanation": "Phonology is the study of the sound system of a language."
    }
  ]
}
``` 