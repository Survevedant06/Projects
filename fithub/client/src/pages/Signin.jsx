import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card fade-in">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            className="input-field"
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            className="input-field"
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      <style>{`
        .auth-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .auth-card {
          width: 400px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }
        .auth-footer {
          margin-top: 24px;
          font-size: 14px;
          opacity: 0.8;
          text-align: center;
        }
        a { color: var(--primary); text-decoration: none; }
      `}</style>
    </div>
  );
}

export default Signin;
