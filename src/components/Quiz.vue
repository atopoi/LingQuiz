<template>
  <div class="quiz-container">
    <div v-if="showBirthday" class="birthday-overlay">
      <div class="birthday-content">
        <h2>Alles Gute zum Geburtstag, Roya! 🎂</h2>
        <p class="birthday-message">Viel Glück und Erfolg im neuen Lebensjahr! 🍾✨</p>
        <div class="fireworks"></div>
      </div>
    </div>
    <div v-if="!quizStarted" class="start-screen">
      <h2>So you think you are a linguist?</h2>
      <button @click="startQuiz" class="start-button">Start Quiz</button>
    </div>
    <div v-else-if="currentQuestion < questions.length" class="question-screen">
      <h3><span>{{ userName.toUpperCase() }}</span> <span class="score-box"><span class="score-number">{{ currentQuestion + 1 }}</span><span class="divider">/</span><span class="score-number">{{ questions.length }}</span></span> <span class="score-box"><span class="score-label">SCORE</span> <span class="score-number">{{ score }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes }}</span></span> <span class="score-box"><span class="score-label">POINTS</span> <span class="score-number">{{ points }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes * 2 }}</span></span></h3>
      <p class="question-text">{{ questions[currentQuestion].question }}</p>
      <div class="options">
        <button
          v-for="(option, index) in questions[currentQuestion].options"
          :key="index"
          @click="selectAnswer(index)"
          :class="{
            'option': true,
            'selected': selectedAnswer === index,
            'correct': showFeedback && index === questions[currentQuestion].correctAnswer,
            'incorrect': showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer,
            'first-attempt': questions[currentQuestion].firstAttempt === index && index !== questions[currentQuestion].correctAnswer,
            'second-attempt': attempts === 2 && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer
          }"
          :disabled="showFeedback || questions[currentQuestion].completed"
        >
          {{ option }}
        </button>
      </div>
      <div v-if="showFeedback" class="feedback">
        <p v-if="selectedAnswer === questions[currentQuestion].correctAnswer" class="success-message">Bravo!</p>
        <p v-else-if="attempts === 1" class="try-again-message">Try again!</p>
        <p v-else class="explanation">{{ questions[currentQuestion].explanation }}</p>
        <div class="button-group">
          <button @click="resetQuiz" class="reset-button">Reset Quiz</button>
          <button @click="nextQuestion" class="next-button">Next</button>
        </div>
      </div>
    </div>
    <div v-else class="results-screen">
      <h2>Quiz Complete!</h2>
      <div class="score-display">
        <span class="score-box"><span class="score-label">SCORE</span> <span class="score-number">{{ score }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes }}</span></span>
        <span class="score-box"><span class="score-label">POINTS</span> <span class="score-number">{{ points }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes * 2 }}</span></span>
      </div>
      <div class="feedback-message" :class="feedbackClass">
        <p v-if="pointRate > 0.9" class="excellent">You are a real linguist! 🍾🎉</p>
        <p v-else-if="pointRate >= 0.75" class="good">Not bad! 👍</p>
        <p v-else class="needs-improvement">Sorry, you need a linguistics course! Ask Houman :) 📚</p>
      </div>
      <button @click="restartQuiz" class="restart-button">Try Again</button>
    </div>
    <div v-if="debug" class="debug-panel">
      <h3>Debug Info</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { parseQuizFile } from '../utils/quizParser'

export default {
  name: 'Quiz',
  props: {
    userName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      questions: [],
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      score: 0,
      points: 0,
      quizStarted: false,
      attempts: 0,
      completedQuizzes: 0,
      debug: false,
      debugInfo: '',
      showBirthday: false
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress)
  },
  async created() {
    if (this.isRoya) {
      this.showBirthday = true
      setTimeout(() => {
        this.showBirthday = false
      }, 5000)
    }
    try {
      this.debugInfo = 'Attempting to load quiz data...\n'
      const response = await fetch('/data/Quiz.txt')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const content = await response.text()
      this.debugInfo += `Raw quiz content:\n${content}\n`
      if (!content) {
        throw new Error('Empty quiz content')
      }
      const quizData = parseQuizFile(content)
      this.debugInfo += `Parsed quiz data:\n${JSON.stringify(quizData, null, 2)}\n`
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('No questions parsed from quiz data')
      }
      this.questions = quizData.questions.map(q => ({ ...q }))
      this.debugInfo += `Final questions array:\n${JSON.stringify(this.questions, null, 2)}\n`

      // Load user data from localStorage
      const userData = localStorage.getItem(`quiz_user_${this.userName}`)
      if (userData) {
        const { score, totalAttempts, points, completedQuizzes } = JSON.parse(userData)
        this.score = score
        this.totalAttempts = totalAttempts
        this.points = points
        this.completedQuizzes = completedQuizzes
      }
    } catch (error) {
      this.debugInfo += `Error loading quiz data: ${error.message}\n`
      console.error('Error loading quiz data:', error)
      // Fallback to empty questions array
      this.questions = []
    }
  },
  methods: {
    handleKeyPress(event) {
      if (event.key.toLowerCase() === 'd') {
        this.debug = !this.debug
      }
    },
    startQuiz() {
      this.quizStarted = true
    },
    selectAnswer(index) {
      if (this.showFeedback && this.attempts >= 2) return
      
      this.selectedAnswer = index
      this.attempts++
      
      if (this.attempts === 1) {
        this.questions[this.currentQuestion].firstAttempt = index
      }
      
      if (index === this.questions[this.currentQuestion].correctAnswer) {
        // Award points based on attempt number
        if (this.attempts === 1) {
          this.points += 2
          this.questions[this.currentQuestion].points = 2
        } else if (this.attempts === 2) {
          this.points += 1
          this.questions[this.currentQuestion].points = 1
        }
        this.score++
        this.questions[this.currentQuestion].completed = true
        this.completedQuizzes++
        this.showFeedback = true
      } else if (this.attempts >= 2) {
        this.questions[this.currentQuestion].completed = true
        this.completedQuizzes++
        this.showFeedback = true
      }
      
      // Save user data to localStorage
      this.saveUserData()
    },
    nextQuestion() {
      this.currentQuestion++
      this.selectedAnswer = null
      this.showFeedback = false
      this.attempts = 0
    },
    restartQuiz() {
      this.resetQuiz()
    },
    resetQuiz() {
      this.currentQuestion = 0
      this.selectedAnswer = null
      this.showFeedback = false
      this.score = 0
      this.points = 0
      this.attempts = 0
      this.quizStarted = false
      this.completedQuizzes = 0
      // Reset question states
      this.questions.forEach(q => {
        q.completed = false
        q.points = 0
        q.firstAttempt = null
      })
      this.saveUserData()
    },
    saveUserData() {
      const userData = {
        score: this.score,
        totalAttempts: this.totalAttempts,
        points: this.points,
        completedQuizzes: this.completedQuizzes,
        lastAttempt: new Date().toISOString()
      }
      localStorage.setItem(`quiz_user_${this.userName}`, JSON.stringify(userData))
    }
  },
  computed: {
    pointRate() {
      return this.completedQuizzes > 0 ? this.points / (this.completedQuizzes * 2) : 0
    },
    feedbackClass() {
      if (this.pointRate > 0.9) return 'excellent'
      if (this.pointRate >= 0.75) return 'good'
      return 'needs-improvement'
    },
    isRoya() {
      const specialUsers = ['roya', 'r', 'farceur']
      return specialUsers.includes(this.userName.toLowerCase())
    }
  }
}
</script>

<style scoped>
.quiz-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0.8rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.start-screen, .question-screen, .results-screen {
  text-align: center;
  padding: 1rem 0.8rem;
}

h2 {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  margin-bottom: 0.8rem;
  color: #2c3e50;
  font-weight: 600;
}

h3 {
  font-family: 'Bangers', cursive;
  font-size: clamp(1.4rem, 4vw, 1.6rem);
  margin-bottom: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
}

h3 span {
  color: #1a237e;
  font-size: clamp(1.6rem, 5vw, 2rem);
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.score-box {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin: 0 0.3rem;
}

.score-number {
  color: #42b983 !important;
  font-size: clamp(1.4rem, 4vw, 1.6rem) !important;
  background: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.score-label {
  color: #666 !important;
  font-size: clamp(0.9rem, 3vw, 1.1rem) !important;
  background: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.divider {
  color: #000 !important;
  font-size: clamp(1.2rem, 4vw, 1.4rem) !important;
  background: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  line-height: 1;
  font-weight: 200;
  font-family: 'Arial', sans-serif;
  transform: none;
}

.question-text {
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin: 0.8rem 0;
  line-height: 1.4;
  color: #2c3e50;
  font-weight: 500;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
  padding: 0 0.8rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.option {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-align: center;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  overflow: hidden;
  color: #2c3e50;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.option:hover:not(:disabled) {
  border-color: #42b983;
  box-shadow: 0 2px 3px rgba(66, 185, 131, 0.1);
}

.option:active:not(:disabled) {
  background: #f8f9fa;
  -webkit-tap-highlight-color: transparent;
}

.option.selected {
  background: #42b983;
  color: white;
  border-color: #42b983;
  box-shadow: 0 2px 3px rgba(66, 185, 131, 0.2);
  transform: none;
  -webkit-tap-highlight-color: transparent;
}

.option.correct {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
  box-shadow: 0 2px 3px rgba(76, 175, 80, 0.2);
  transform: none;
  -webkit-tap-highlight-color: transparent;
}

.option.incorrect {
  background: #f44336;
  color: white;
  border-color: #f44336;
  box-shadow: 0 2px 3px rgba(244, 67, 54, 0.2);
  transform: none;
  -webkit-tap-highlight-color: transparent;
}

.option.first-attempt {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
  box-shadow: 0 2px 3px rgba(255, 152, 0, 0.2);
  transform: none;
  -webkit-tap-highlight-color: transparent;
}

.option.second-attempt {
  background: #f44336;
  color: white;
  border-color: #f44336;
  box-shadow: 0 2px 3px rgba(244, 67, 54, 0.2);
  transform: none;
  -webkit-tap-highlight-color: transparent;
}

.option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.feedback {
  margin-top: 0.8rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  color: #2c3e50;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.reset-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
  min-width: 120px;
  max-width: 160px;
  font-weight: 600;
  box-shadow: 0 2px 3px rgba(244, 67, 54, 0.2);
}

.reset-button:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 3px 4px rgba(244, 67, 54, 0.3);
}

.reset-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(244, 67, 54, 0.2);
}

.start-button, .next-button, .restart-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
  min-width: 120px;
  max-width: 160px;
  font-weight: 600;
  box-shadow: 0 2px 3px rgba(66, 185, 131, 0.2);
}

.start-button:hover, .next-button:hover, .restart-button:hover {
  background-color: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 3px 4px rgba(66, 185, 131, 0.3);
}

.start-button:active, .next-button:active, .restart-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(66, 185, 131, 0.2);
}

.success-message {
  color: #4caf50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

.try-again-message {
  color: #ff9800;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .quiz-container {
    padding: 0.4rem;
    border-radius: 8px;
    margin: 0.4rem;
  }
  
  .options {
    gap: 0.3rem;
    padding: 0 0.4rem;
  }
  
  .option {
    padding: 0.5rem 0.6rem;
  }
  
  .start-button, .next-button, .restart-button {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 140px;
  }
}

.restart-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
  min-width: 120px;
  max-width: 160px;
  font-weight: 600;
  box-shadow: 0 2px 3px rgba(33, 150, 243, 0.2);
}

.restart-button:hover {
  background-color: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 3px 4px rgba(33, 150, 243, 0.3);
}

.restart-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(33, 150, 243, 0.2);
}

.debug-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.debug-panel h3 {
  margin-top: 0;
  color: #666;
  font-size: 1rem;
}

.debug-panel pre {
  margin: 0;
  color: #333;
}

.score-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.results-screen {
  text-align: center;
  padding: 1.5rem 0.8rem;
}

.results-screen h2 {
  margin-bottom: 1.5rem;
}

.feedback-message {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 8px;
  animation: fadeIn 0.5s ease-out;
}

.feedback-message p {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.excellent {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  animation: celebrate 1s ease-in-out;
}

.good {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.needs-improvement {
  background: linear-gradient(135deg, #f44336, #e53935);
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

@keyframes celebrate {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.birthday-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: growOverlay 10s ease-out forwards;
}

.birthday-content {
  text-align: center;
  color: #2c3e50;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
  animation: growContent 10s ease-out forwards;
  transform-origin: center;
}

.birthday-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.birthday-message {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.fireworks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.fireworks::before,
.fireworks::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  box-shadow: 
    -120px -218px #ffd700,
    248px -16px #ffa500,
    190px 16px #ffd700,
    -113px -310px #ffa500,
    -109px -311px #ffd700,
    -50px -313px #ffa500,
    226px -31px #ffd700,
    180px -74px #ffa500,
    -12px -338px #ffd700,
    220px -160px #ffa500,
    -69px -283px #ffd700,
    -111px -309px #ffa500,
    155px -237px #ffd700,
    -152px -380px #ffa500,
    -50px -313px #ffd700,
    -95px -175px #ffa500,
    -88px 10px #ffd700,
    112px -123px #ffa500,
    69px -196px #ffd700,
    168px -259px #ffa500,
    -121px -32px #ffd700,
    -60px -120px #ffa500,
    -27px -164px #ffd700,
    -83px -218px #ffa500;
  animation: fireworks 1s ease-in-out infinite;
}

.fireworks::after {
  animation-delay: 0.5s;
}

@keyframes fireworks {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style> 