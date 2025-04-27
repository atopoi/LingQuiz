<template>
  <div class="quiz-container">
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
      <p>Your score: {{ score }}/{{ completedQuizzes }}</p>
      <p>Total points: {{ points }}/{{ completedQuizzes * 2 }}</p>
      <button @click="restartQuiz" class="restart-button">Try Again</button>
    </div>
  </div>
</template>

<script>
import quizData from '/data/quizData.json'

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
      questions: quizData.questions.map(q => ({ ...q })),
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      score: 0,
      points: 0,
      quizStarted: false,
      totalAttempts: 0,
      attempts: 0,
      completedQuizzes: 0
    }
  },
  created() {
    // Load user data from localStorage
    const userData = localStorage.getItem(`quiz_user_${this.userName}`)
    if (userData) {
      const { score, totalAttempts, points, completedQuizzes } = JSON.parse(userData)
      this.score = score
      this.totalAttempts = totalAttempts
      this.points = points
      this.completedQuizzes = completedQuizzes
    }
  },
  methods: {
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
</style> 