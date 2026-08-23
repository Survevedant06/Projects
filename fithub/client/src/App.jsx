import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Progress from './pages/Progress';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <><Navbar />{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/plans" element={
          <PrivateRoute>
            <Plans />
          </PrivateRoute>
        } />
        <Route path="/progress" element={
          <PrivateRoute>
            <Progress />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
