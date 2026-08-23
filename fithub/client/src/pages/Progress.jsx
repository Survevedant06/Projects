import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Progress() {
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const res = await axios.get('/api/progress');
    setHistory(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/progress', { weight, bodyFat, notes });
      setWeight('');
      setBodyFat('');
      setNotes('');
      fetchProgress();
    } catch (err) {
      alert('Failed to add progress');
    }
  };

  const chartData = {
    labels: history.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: history.map(h => h.weight),
        borderColor: '#ff2d2d',
        backgroundColor: 'rgba(255, 45, 45, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'white' } },
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    }
  };

  return (
    <div className="progress-page fade-in">
      <h1>Track Your <span>Evolution</span></h1>
      
      <div className="progress-grid">
        <div className="glass-card form-card">
          <h2>Add New Entry</h2>
          <form onSubmit={handleSubmit}>
            <input 
              className="input-field"
              type="number" 
              placeholder="Weight (kg)" 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              required 
            />
            <input 
              className="input-field" 
              type="number" 
              placeholder="Body Fat %" 
              value={bodyFat} 
              onChange={e => setBodyFat(e.target.value)} 
            />
            <textarea 
              className="input-field" 
              placeholder="Notes..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows="3"
            />
            <button type="submit" className="btn-primary">Update Progress</button>
          </form>
        </div>

        <div className="glass-card chart-card">
          <h2>Weight History</h2>
          <div className="chart-container">
            {history.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>No data yet</p>}
          </div>
        </div>
      </div>

      <div className="glass-card history-card">
        <h2>History Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Body Fat</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map(log => (
              <tr key={log._id}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.weight} kg</td>
                <td>{log.bodyFat || '-'} %</td>
                <td>{log.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .progress-page { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
        h1 { margin-bottom: 40px; }
        h1 span { color: var(--primary); }
        
        .progress-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px; }
        .form-card form { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
        .btn-primary { margin-top: 10px; }
        
        .chart-container { margin-top: 24px; height: 300px; }
        
        .history-card { margin-top: 24px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 16px; text-align: left; border-bottom: 1px solid var(--border); }
        th { opacity: 0.6; font-size: 14px; }
        tr:hover { background: rgba(255,255,255,0.02); }

        @media (max-width: 992px) { .progress-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default Progress;
