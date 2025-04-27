<template>
  <div class="user-input">
    <h2>Welcome to HECK-ZOLF!</h2>
    <div class="input-container">
      <input 
        v-model="userName" 
        type="text" 
        placeholder="Enter your name"
        @keyup.enter="startQuiz"
        class="name-input"
      >
      <button @click="startQuiz" class="start-button">Start Quiz</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInput',
  data() {
    return {
      userName: ''
    }
  },
  methods: {
    startQuiz() {
      if (this.userName.trim()) {
        this.$emit('start-quiz', this.userName.trim())
      }
    }
  }
}
</script>

<style scoped>
.user-input {
  text-align: center;
  padding: 2rem 1rem;
}

.input-container {
  max-width: 300px;
  margin: 1.5rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.name-input {
  padding: 0.8rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.name-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.start-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.start-button:hover {
  background-color: #3aa876;
  transform: translateY(-1px);
}

.start-button:active {
  transform: translateY(0);
}
</style> 