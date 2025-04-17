import React from 'react'
import LoginForm from './components/Auth/LoginForm'
import Tabs from './components/Tabs'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <div className="app">
      <h1>Payment Approval System</h1>
      <LoginForm />
      {user && <Tabs />}
    </div>
  )
}

export default App