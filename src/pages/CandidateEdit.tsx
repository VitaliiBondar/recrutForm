import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useForm } from 'react-hook-form';

type FormData = {
  name: string;
  phone: string;
  specialty: string;
  experience: string;
};

export default function CandidateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'candidates', id!);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as FormData;
        reset(data); // заповнюємо форму
      } else {
        alert('Анкету не знайдено');
        navigate('/admin');
      }
      setLoading(false);
    };
    fetchData();
  }, [id, navigate, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateDoc(doc(db, 'candidates', id!), data);
      navigate(`/admin/${id}`);
    } catch (error) {
      console.error('Помилка при оновленні:', error);
    }
  };

  if (loading) return <p className="p-4">Завантаження...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-2xl shadow bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Редагувати анкету</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Імʼя</label>
          <input
            {...register('name')}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Телефон</label>
          <input
            {...register('phone')}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Спеціальність</label>
          <input
            {...register('specialty')}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Досвід</label>
          <textarea
            {...register('experience')}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Зберегти
        </button>
      </form>
    </div>
  );
}
