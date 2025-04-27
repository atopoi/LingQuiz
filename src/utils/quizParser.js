export function parseQuizFile(content) {
  console.log('Starting to parse quiz file')
  const quizzes = []
  const lines = content.split('\n')
  console.log('Split into lines:', lines)
  let currentQuiz = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    console.log(`Processing line ${i}:`, line)
    
    if (line === '<quiz>') {
      console.log('Found new quiz marker')
      if (currentQuiz) {
        console.log('Pushing previous quiz:', currentQuiz)
        quizzes.push(currentQuiz)
      }
      currentQuiz = {
        id: quizzes.length + 1,
        question: '',
        options: [],
        correctAnswer: -1,
        explanation: '',
        completed: false,
        points: 0,
        firstAttempt: null
      }
      console.log('Created new quiz object:', currentQuiz)
    } else if (line.startsWith('-')) {
      console.log('Found option line:', line)
      const option = line.substring(1).trim()
      if (line.startsWith('-*')) {
        console.log('Found correct answer:', option.substring(1))
        currentQuiz.correctAnswer = currentQuiz.options.length
        currentQuiz.options.push(option.substring(1))
      } else {
        console.log('Found regular option:', option)
        currentQuiz.options.push(option)
      }
      console.log('Current quiz options:', currentQuiz.options)
    } else if (line && !line.startsWith('-') && currentQuiz) {
      if (!currentQuiz.question) {
        console.log('Found question:', line)
        currentQuiz.question = line
      }
    }
  }

  // Add the last quiz if exists
  if (currentQuiz) {
    console.log('Pushing final quiz:', currentQuiz)
    quizzes.push(currentQuiz)
  }

  console.log('Final parsed quizzes:', quizzes)
  return { questions: quizzes }
} 