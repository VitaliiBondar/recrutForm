import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isAdmin', 'true');
    navigate('/admin');
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-xl mb-4">Вхід для рекрутера</h2>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Увійти
      </button>
    </div>
  );
}
