import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === correctPassword) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Неправильний пароль');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Вхід в адмінку</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введіть пароль"
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Увійти
        </button>
      </form>
    </div>
  );
}
