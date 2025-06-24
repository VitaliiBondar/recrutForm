import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { doc, updateDoc } from 'firebase/firestore';

type Candidate = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  experience: string;
  createdAt?: any;
  processed?: boolean;
};

export default function AdminPanel() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterExperience, setFilterExperience] = useState<string>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUnprocessed, setShowOnlyUnprocessed] = useState(false);

  const total = candidates.length;
  const withExperience = candidates.filter((c) =>
    c.experience.toLowerCase().includes('так')
  ).length;

  const toggleProcessed = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'candidates', id), {
        processed: !current,
      });

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, processed: !current } : c))
      );
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
    }
  };

  // підрахунок спеціальностей
  const specialtyStats = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.specialty] = (acc[c.specialty] || 0) + 1;
    return acc;
  }, {});

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const q = query(
          collection(db, 'candidates'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Candidate[];

        setCandidates(data);
        setLoading(false);
      } catch (error) {
        console.error('Помилка при отриманні анкет:', error);
      }
    };

    fetchCandidates();
  }, []);
  const exportToExcel = () => {
    const filtered = candidates
      .filter((c) =>
        filterSpecialty === 'all' ? true : c.specialty === filterSpecialty
      )
      .filter((c) =>
        filterExperience === 'all'
          ? true
          : filterExperience === 'yes'
            ? c.experience.toLowerCase().includes('так')
            : !c.experience.toLowerCase().includes('так')
      );

    const data = filtered.map((c) => ({
      Імʼя: c.name,
      Телефон: c.phone,
      Спеціальність: c.specialty,
      Досвід: c.experience,
      Дата: c.createdAt?.toDate().toLocaleString('uk-UA') ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Кандидати');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(file, 'ankety_kandydativ.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Анкети кандидатів</h2>
        <div>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
          >
            Експорт в Excel
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Вийти
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
          <p className="text-sm">Усього анкет</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="bg-green-100 text-green-800 p-4 rounded shadow">
          <p className="text-sm">З бойовим досвідом</p>
          <p className="text-2xl font-bold">{withExperience}</p>
        </div>

        <div className="bg-yellow-100 text-yellow-800 p-4 rounded shadow">
          <p className="text-sm">Топ спеціальностей</p>
          {Object.entries(specialtyStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => (
              <p key={name} className="text-sm">
                {name}: <span className="font-bold">{count}</span>
              </p>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="mr-2">Спеціальність:</label>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">Усі</option>
            {[...new Set(candidates.map((c) => c.specialty))].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">Досвід:</label>
          <select
            value={filterExperience}
            onChange={(e) => setFilterExperience(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">Усі</option>
            <option value="yes">Має досвід</option>
            <option value="no">Без досвіду</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Пошук за імʼям, телефоном або спеціальністю"
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={showOnlyUnprocessed}
            onChange={() => setShowOnlyUnprocessed((prev) => !prev)}
          />
          Показати лише необроблені
        </label>
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : candidates.length === 0 ? (
        <p>Анкет поки немає</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-2">Імʼя</th>
              <th className="border px-2 py-2">Телефон</th>
              <th className="border px-2 py-2">Спеціальність</th>
              <th className="border px-2 py-2">Досвід</th>
              <th className="border px-2 py-2">Дата</th>
              <th className="border px-2 py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {candidates
              .filter((c) =>
                filterSpecialty === 'all'
                  ? true
                  : c.specialty === filterSpecialty
              )
              .filter((c) =>
                filterExperience === 'all'
                  ? true
                  : filterExperience === 'yes'
                    ? c.experience.toLowerCase().includes('так')
                    : !c.experience.toLowerCase().includes('так')
              )
              .filter((c) => {
                const term = searchTerm.toLowerCase();
                return (
                  c.name.toLowerCase().includes(term) ||
                  c.phone.toLowerCase().includes(term) ||
                  c.specialty.toLowerCase().includes(term)
                );
              })
              .filter((c) => (showOnlyUnprocessed ? !c.processed : true))
              .map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td
                    className="border px-2 py-1 text-blue-600 underline cursor-pointer"
                    onClick={() => navigate(`/admin/${c.id}`)}
                  >
                    {c.name}
                  </td>

                  <td className="border px-2 py-1">{c.phone}</td>
                  <td className="border px-2 py-1">{c.specialty}</td>
                  <td className="border px-2 py-1">{c.experience}</td>
                  <td className="border px-2 py-1 text-xs text-gray-500">
                    {c.createdAt?.toDate().toLocaleString('uk-UA') ?? '—'}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => toggleProcessed(c.id, !!c.processed)}
                      className={`px-2 py-1 rounded text-xs ${
                        c.processed
                          ? 'bg-gray-400 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {c.processed ? '✅ Опрацьовано' : 'Опрацювати'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
