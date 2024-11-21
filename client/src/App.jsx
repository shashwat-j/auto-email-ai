import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Home'
import TaskPage from './TaskPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Home/>} />
        <Route path="/task" element={<TaskPage/>} />
      </Routes>

    </>
  )
}

export default App
