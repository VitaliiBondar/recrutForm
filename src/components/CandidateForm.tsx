import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { specialties } from '../const';

type FormData = {
  name: string;
  phone: string;
  specialty: string;
  experience: string;
};

const schema = yup.object().shape({
  name: yup.string().required('Ім’я обовʼязкове'),
  phone: yup.string().required('Телефон обовʼязковий'),
  specialty: yup.string().required('Оберіть спеціальність'),
  experience: yup.string().required('Вкажіть досвід'),
});

export default function CandidateForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // 1. Зберігаємо в Firestore
      await addDoc(collection(db, 'candidates'), {
        ...data,
        createdAt: Timestamp.now(),
      });

      // 2. Надсилаємо повідомлення в Telegram
      const message = `
🆕 Нова анкета:
👤 Імʼя: ${data.name}
📞 Телефон: ${data.phone}
🔧 Спеціальність: ${data.specialty}
🪖 Досвід: ${data.experience}
`;

      await fetch(
        `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );

      setSubmitted(true);
      reset();
    } catch (error) {
      console.error('Помилка при збереженні або відправці:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="mw-full max-w-xl p-6 bg-white/90 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Залиште заявку для рекрутера
        </h2>

        {submitted && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 border rounded">
            ✅ Дані успішно надіслані!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium">Імʼя</label>
            <input
              {...register('name')}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Петро"
            />
            {errors.name && (
              <p className="text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Телефон</label>
            <input
              {...register('phone')}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="+380..."
            />
            {errors.phone && (
              <p className="text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Спеціальність</label>
            <select
              {...register('specialty')}
              className="w-full border rounded px-3 py-2 mt-1 bg-white"
            >
              <option value="">-- Оберіть спеціальність --</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.specialty && (
              <p className="text-red-600">{errors.specialty.message}</p>
            )}
          </div>

          {/* <div>
            <label className="block font-medium">Досвід</label>
            <textarea
              {...register('experience')}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Де служив, скільки, посада"
            />
            {errors.experience && (
              <p className="text-red-600">{errors.experience.message}</p>
            )}
          </div> */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Надсилається...' : 'Надіслати'}
          </button>
        </form>
      </div>
    </div>
  );
}
