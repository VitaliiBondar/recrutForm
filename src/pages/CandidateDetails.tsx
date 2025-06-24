import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const docRef = doc(db, 'candidates', id!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCandidate(docSnap.data());
        } else {
          console.error('Анкета не знайдена');
        }
      } catch (err) {
        console.error('Помилка при завантаженні:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Ти впевнений, що хочеш видалити цю анкету?'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'candidates', id!));
      navigate('/admin');
    } catch (error) {
      console.error('Помилка при видаленні:', error);
    }
  };

  if (loading) return <p className="p-4">Завантаження...</p>;

  if (!candidate)
    return (
      <div className="p-4">
        <p>Анкету не знайдено.</p>
        <button onClick={() => navigate(-1)} className="mt-2 underline">
          ← Назад
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">
        📄 Деталі анкети{' '}
        <button
          onClick={() => navigate(`/admin/${id}/edit`)}
          className="mt-4 mr-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          ✏️ Редагувати
        </button>
        <button
          onClick={handleDelete}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🗑 Видалити
        </button>
      </h2>

      <p>
        <strong>Імʼя:</strong> {candidate.name}
      </p>
      <p>
        <strong>Телефон:</strong> {candidate.phone}
      </p>
      <p>
        <strong>Спеціальність:</strong> {candidate.specialty}
      </p>
      <p>
        <strong>Досвід:</strong>
      </p>
      <p className="whitespace-pre-line bg-gray-100 p-2 rounded">
        {candidate.experience}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Створено: {candidate.createdAt?.toDate().toLocaleString('uk-UA')}
      </p>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Назад
      </button>
    </div>
  );
}
