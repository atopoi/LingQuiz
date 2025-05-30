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
    <div v-else-if="currentQuizIndex < quizzes.length" class="quiz-screen">
      <h3><span>{{ userName.toUpperCase() }}</span> <span class="score-box"><span class="score-number">{{ currentQuizIndex + 1 }}</span><span class="divider">/</span><span class="score-number">{{ quizzes.length }}</span></span> <span class="score-box"><span class="score-label">SCORE</span> <span class="score-number">{{ score }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes }}</span></span> <span class="score-box"><span class="score-label">POINTS</span> <span class="score-number">{{ points }}</span><span class="divider">/</span><span class="score-number">{{ completedQuizzes * 2 }}</span></span></h3>
      <p class="quiz-text">{{ currentQuiz.question }}</p>
      <div class="options">
        <button
          v-for="(option, index) in currentQuiz.options"
          :key="index"
          @click="selectAnswer(index)"
          :class="{
            'option': true,
            'selected': selectedAnswer === index,
            'correct': showFeedback && isCorrectAnswer(index),
            'incorrect': showFeedback && selectedAnswer === index && !isCorrectAnswer(index),
            'first-attempt': currentQuiz.firstAttempt === index && !isCorrectAnswer(index),
            'second-attempt': attempts === 2 && selectedAnswer === index && !isCorrectAnswer(index)
          }"
          :disabled="showFeedback || currentQuiz.completed"
        >
          {{ option }}
        </button>
      </div>
      <div v-if="showFeedback" class="feedback">
        <p v-if="isCorrectAnswer(selectedAnswer)" class="success-message">Bravo!</p>
        <p v-else-if="attempts === 1" class="try-again-message">Try again!</p>
        <p v-else class="incorrect-message">Incorrect!</p>
        <p class="explanation">{{ currentQuiz.explanation }}</p>
        <div class="button-group">
          <button @click="resetQuiz" class="reset-button">Reset Quiz</button>
          <button @click="nextQuiz" class="next-button">Next</button>
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
        <p v-if="pointRate > 0.85" class="excellent">You are a real linguist! 🍾🎉</p>
        <p v-else-if="pointRate >= 0.70" class="good">Not bad! 👍</p>
        <p v-else class="needs-improvement">Sorry, you need a linguistics course! Ask Houman :) 📚</p>
      </div>
      <button @click="restartQuiz" class="restart-button">Try Again</button>
    </div>
    <div v-if="showDebug" class="debug-panel">
      <h3>Debug Info</h3>
      <div class="debug-section">
        <h4>Current Quiz State</h4>
        <pre>{{ JSON.stringify({
          currentQuizIndex,
          selectedAnswer,
          showFeedback,
          score,
          points,
          attempts,
          quizStarted,
          completedQuizzes,
          totalAttempts
        }, null, 2) }}</pre>
      </div>
      <div class="debug-section">
        <h4>Current Quiz</h4>
        <pre>{{ JSON.stringify(currentQuiz, null, 2) }}</pre>
      </div>
      <div class="debug-section">
        <h4>All Quizzes</h4>
        <pre>{{ JSON.stringify(quizzes, null, 2) }}</pre>
      </div>
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
      quizzes: [],
      quizData: null,
      currentQuizIndex: 0,
      currentQuiz: null,
      selectedAnswer: null,
      showFeedback: false,
      score: 0,
      points: 0,
      quizStarted: false,
      attempts: 0,
      completedQuizzes: 0,
      debug: false,
      debugInfo: '',
      showBirthday: false,
      totalAttempts: 0,
      showDebug: false
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
      }, 3000)
    }
    await this.initializeQuiz()
  },
  methods: {
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    isCorrectAnswer(index) {
      return index === this.currentQuiz.correctAnswer;
    },
    handleKeyPress(event) {
      if (event.key.toLowerCase() === 'd') {
        this.debug = !this.debug
      }
      if (event.key.toLowerCase() === 'z') {
        this.showDebug = !this.showDebug
      }
    },
    setupQuizzes(quizData) {
      this.quizzes = quizData.quizzes.map(q => {
        const shuffledOptions = this.shuffleArray([...q.options])
        const correctAnswerIndex = shuffledOptions.indexOf(q.correctAnswer)
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: correctAnswerIndex,
          completed: false,
          points: 0,
          firstAttempt: null
        }
      })
      this.currentQuiz = this.quizzes[this.currentQuizIndex]
    },
    async initializeQuiz() {
      try {
        this.debugInfo = 'Attempting to load quiz data...\n'
        const response = await fetch('/LingQuiz/data/Quiz.txt', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const content = await response.text()
        this.debugInfo += `Raw quiz content:\n${content}\n`
        if (!content) {
          throw new Error('Empty quiz content')
        }
        this.quizData = parseQuizFile(content)
        this.debugInfo += `Parsed quiz data:\n${JSON.stringify(this.quizData, null, 2)}\n`
        if (!this.quizData.quizzes || this.quizData.quizzes.length === 0) {
          throw new Error('No quizzes parsed from quiz data')
        }
        
        this.setupQuizzes(this.quizData)
        this.debugInfo += `Final quizzes array:\n${JSON.stringify(this.quizzes, null, 2)}\n`

        this.score = 0
        this.points = 0
        this.completedQuizzes = 0
        this.totalAttempts = 0
      } catch (error) {
        this.debugInfo += `Error loading quiz data: ${error.message}\n`
        console.error('Error loading quiz data:', error)
        this.quizzes = []
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
        this.currentQuiz.firstAttempt = index
      }
      
      if (this.isCorrectAnswer(index)) {
        if (this.attempts === 1) {
          this.points += 2
          this.currentQuiz.points = 2
        } else if (this.attempts === 2) {
          this.points += 1
          this.currentQuiz.points = 1
        }
        this.score++
        this.currentQuiz.completed = true
        this.completedQuizzes++
        this.showFeedback = true
      } else if (this.attempts >= 2) {
        this.currentQuiz.completed = true
        this.completedQuizzes++
        this.showFeedback = true
      }
      
      this.saveUserData()
    },
    nextQuiz() {
      this.currentQuizIndex++
      this.currentQuiz = this.quizzes[this.currentQuizIndex]
      this.selectedAnswer = null
      this.showFeedback = false
      this.attempts = 0
    },
    restartQuiz() {
      this.resetQuiz()
    },
    resetQuiz() {
      this.currentQuizIndex = 0
      this.selectedAnswer = null
      this.showFeedback = false
      this.score = 0
      this.points = 0
      this.attempts = 0
      this.quizStarted = false
      this.completedQuizzes = 0
      this.totalAttempts = 0

      if (this.quizData) {
        this.setupQuizzes(this.quizData)
      }
      
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
      return this.userName.toLowerCase() === 'roya' || this.userName.toLowerCase() === 'r'
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

.start-screen, .quiz-screen, .results-screen {
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

.quiz-text {
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
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: #4CAF50;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.try-again-message {
  color: #f39c12;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.incorrect-message {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.explanation {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-left: 4px solid #4CAF50;
  border-radius: 4px;
  font-style: italic;
  color: #2c3e50;
  line-height: 1.4;
}

.button-group {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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
  position: fixed;
  bottom: 0;
  right: 0;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 1rem;
  font-family: monospace;
  font-size: 12px;
  z-index: 1000;
  border-top-left-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.debug-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.debug-section h4 {
  margin: 0 0 0.5rem 0;
  color: #4CAF50;
}

.debug-section pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
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
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
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
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.birthday-content {
  text-align: center;
  color: #2c3e50;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
  animation: fadeIn 0.3s ease-out;
}

.birthday-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.birthday-message {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.fireworks {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.2;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
    opacity: 0.3;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style> 