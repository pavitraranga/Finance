import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentDetails from './pages/AgentDetails';
import ClientDetails from './pages/ClientDetails';
import ProfitList from './pages/ProfitList';
import MonthlyReport from './pages/MonthlyReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agent/:id" element={<AgentDetails />} />
        <Route path="/client/:id" element={<ClientDetails />} />
        <Route path="/profit" element={<ProfitList />} />
        <Route path="/monthly-report" element={<MonthlyReport />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
