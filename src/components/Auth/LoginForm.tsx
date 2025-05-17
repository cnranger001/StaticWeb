import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LoginForm = () => {
  const [visitorIp, setVisitorIp] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setVisitorIp(data.ip);
      } catch (error) {
        console.error('Failed to fetch IP address:', error);
      }
    };
    fetchIp();
  }, []);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (!success) setError('Invalid credentials')
  }

  if (user) return null

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <div>
        <label>Email:</label>
        <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        />
       <p>IP Address: {visitorIp}</p>
      <div>
        <label>Password:</label>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        />
      </div>
      </div>
      <button type="submit">Login</button>
      </form>
      <div className="visitor-info">
      <h3>Visitor Information</h3>
      <p>IP Address: {visitorIp}</p>
      <p>Browser: {navigator.userAgent}</p>
      <p>Platform: {navigator.platform}</p>
      </div>
    </div>
  )
}

export default LoginForm