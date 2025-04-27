<template>
  <div class="container">
    <h1 class="title">HECK-ZOLF --- Ling Quiz!</h1>
    <p class="subtitle">For the real linguists only!</p>
    <UserInput v-if="!userName" @start-quiz="startQuiz" />
    <Quiz v-else :user-name="userName" />
  </div>
</template>

<script>
import Quiz from './components/Quiz.vue'
import UserInput from './components/UserInput.vue'

export default {
  name: 'App',
  components: {
    Quiz,
    UserInput
  },
  data() {
    return {
      userName: ''
    }
  },
  methods: {
    startQuiz(name) {
      this.userName = name
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f0f2f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.title {
  font-family: 'Bangers', cursive;
  font-size: clamp(2.5rem, 8vw, 4rem);
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-shadow: 
    3px 3px 0 #42b983,
    6px 6px 0 rgba(0, 0, 0, 0.1);
  letter-spacing: 2px;
  transform: rotate(-2deg);
  animation: titlePop 0.5s ease-out;
}

.subtitle {
  font-family: 'Permanent Marker', cursive;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  color: #333333;
  margin-bottom: 2rem;
  font-weight: 400;
  text-shadow: 
    2px 2px 0 #42b983,
    -1px -1px 0 rgba(255, 255, 255, 0.5);
  animation: subtitlePop 0.5s ease-out 0.2s both;
  letter-spacing: 1px;
}

@keyframes titlePop {
  0% {
    transform: scale(0.8) rotate(-2deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(-2deg);
    opacity: 1;
  }
}

@keyframes subtitlePop {
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

@media (max-width: 480px) {
  .container {
    padding: 0.5rem;
  }
  
  .title {
    font-size: clamp(2rem, 6vw, 3rem);
  }
  
  .subtitle {
    font-size: clamp(1rem, 3vw, 1.2rem);
  }
}
</style> 