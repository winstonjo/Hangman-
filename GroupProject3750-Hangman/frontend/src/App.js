import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Hangman from './components/Hangman.js'
import Scores from './components/Scores.js'
import Login from './components/login.js'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/hangman' element={<Hangman />} />
        <Route path='/scores' element={<Scores />} />
      </Routes>
    </div>
  )
}

export default App
