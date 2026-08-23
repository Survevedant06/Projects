import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Zap } from 'lucide-react';

function Plans() {
  const [plans, setPlans] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await axios.get('/api/plans');
    setPlans(res.data);
  };

  const selectPlan = async (id) => {
    try {
      await axios.post('/api/plans/select', { planId: id });
      window.location.href = '/';
    } catch (err) {
      alert('Selection failed');
    }
  };

  const icons = [<Shield />, <Zap />, <Trophy />];

  return (
    <div className="plans-page fade-in">
      <h1>Select Your <span>Workout Plan</span></h1>
      <p className="subtitle">Choose a plan that fits your current fitness level</p>

      <div className="plans-grid">
        {plans.map((plan, i) => (
          <div key={plan._id} className="glass-card plan-card">
            <div className={`plan-icon icon-${i}`}>{icons[i]}</div>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <button className="btn-primary" onClick={() => selectPlan(plan._id)}>Choose Plan</button>
          </div>
        ))}
      </div>

      <style>{`
        .plans-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 20px;
          text-align: center;
        }
        h1 span { color: var(--primary); }
        .subtitle { opacity: 0.6; margin: 12px 0 60px; }
        
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .plan-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          transition: all 0.3s ease;
        }
        .plan-card:hover {
          transform: translateY(-10px);
          border-color: var(--primary);
        }
        .plan-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.05);
        }
        .icon-0 { color: #4ade80; }
        .icon-1 { color: #fbbf24; }
        .icon-2 { color: var(--primary); }
        
        .plan-card h2 { margin-bottom: 16px; }
        .plan-card p { opacity: 0.6; font-size: 14px; line-height: 1.6; margin-bottom: 30px; height: 60px; }
        .plan-card button { width: 100%; }

        @media (max-width: 768px) {
          .plans-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Plans;
