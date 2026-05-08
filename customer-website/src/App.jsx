import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import OrderDetailPage from './pages/OrderDetailPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/track/:serialNumber" element={<OrderDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
