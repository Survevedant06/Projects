import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Activity, Zap, Clock, Trophy, ChevronRight } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/workouts/today');
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 400) {
        window.location.href = '/plans';
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await axios.post('/api/workouts/start', { workoutId: id });
      fetchDashboard();
    } catch (err) {
      alert('Error starting workout');
    }
  };

  const handleFinish = async (id) => {
    try {
      await axios.post('/api/workouts/finish', { workoutId: id });
      fetchDashboard();
    } catch (err) {
      alert('Error finishing workout');
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="header fade-in">
        <div className="user-info">
          <h1>Fit<span>Hub</span></h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <div className="nav-actions">
          <button className="btn-outline">Progress</button>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="stats-grid fade-in">
        <div className="glass-card stat-card">
          <Zap size={24} color="var(--primary)" />
          <div>
            <h3>Current Streak</h3>
            <p className="big">{user?.currentStreak || 0} Days</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Clock size={24} color="#4ade80" />
          <div>
            <h3>Hours Trained</h3>
            <p className="big">12.4 hrs</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <Trophy size={24} color="#fbbf24" />
          <div>
            <h3>Level</h3>
            <p className="big">Pro</p>
          </div>
        </div>
      </div>

      <div className="main-content fade-in">
        <div className="glass-card today-workouts">
          <div className="card-header">
            <h2>Today's Routine (Day {data?.currentDay})</h2>
            <span>3 Exercises</span>
          </div>
          
          <div className="workouts-list">
            {data?.workouts?.map(workout => (
              <div key={workout._id} className="workout-item">
                <div className="workout-info">
                  <h4>{workout.workoutName}</h4>
                  <p>{workout.sets} Sets x {workout.reps} Reps</p>
                </div>
                <div className="workout-actions">
                  <a href={workout.workoutLink} target="_blank" rel="noreferrer" className="guide-link">Guide</a>
                  <button className="btn-primary start-btn" onClick={() => handleStart(workout._id)}>Start</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card plan-info">
            <h2>Your Plan</h2>
            <div className="plan-badge">Intermediate</div>
            <p>Next milestone: 5 days</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: '65%'}}></div>
            </div>
            <p className="progress-status">65% of monthly goal</p>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        h1 span { color: var(--primary); }
        .user-info p { opacity: 0.6; }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          margin-left: 12px;
          cursor: pointer;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .stat-card h3 { font-size: 14px; opacity: 0.6; }
        .stat-card .big { font-size: 24px; font-weight: 700; }

        .main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .today-workouts h2 { margin-bottom: 24px; }
        .workouts-list { display: flex; flex-direction: column; gap: 16px; }
        .workout-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .workout-info h4 { margin-bottom: 4px; }
        .workout-info p { font-size: 13px; opacity: 0.6; }
        .workout-actions { display: flex; align-items: center; gap: 16px; }
        .guide-link { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 500; }
        .start-btn { padding: 8px 20px; font-size: 14px; }

        .plan-badge {
            background: var(--primary);
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin: 12px 0;
            font-weight: 600;
        }
        .progress-bar-container {
            height: 8px;
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
            margin: 20px 0 8px 0;
            overflow: hidden;
        }
        .progress-bar-fill {
            height: 100%;
            background: var(--primary);
        }
        .progress-status { font-size: 12px; opacity: 0.6; }

        @media (max-width: 768px) {
          .stats-grid, .main-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
