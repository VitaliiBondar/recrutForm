import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="bg-gray-100 px-4 py-2 flex justify-between items-center">
      <Link to="/" className="text-blue-600 font-semibold">
        Форма
      </Link>
      <Link to="/admin" className="text-blue-600 font-semibold">
        Адмінка
      </Link>
    </nav>
  );
}
