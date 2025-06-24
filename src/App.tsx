import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import CandidatePage from './pages/CandidatePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CandidateDetails from './pages/CandidateDetails';
import CandidateEdit from './pages/CandidateEdit';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CandidatePage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/admin/:id" element={<CandidateDetails />} />
        <Route path="/admin/:id/edit" element={<CandidateEdit />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

// https://api.telegram.org/bot7863500667:AAGF4ro0LOrHYPBxo-GLzfE40nKwZY7Vhqg/getUpdates
