import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, User, Mail, Lock, MapPin } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

function RegisterEngineer() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'جاري تسجيل المهندس...',
      text: 'يرجى الانتظار لحظة',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-xl' }
    });

    try {
      const token = localStorage.getItem('token');
      
      // 🚀 تم الربط بناءً على الـ User Schema الخاصة بك بالظبط
      await axios.post('http://localhost:3000/api/auth/register', {
        name: name,
        email: email,
        password: password,
        role: 'engineer', // متوافق مع الـ enum في السكيما بتاعتك
        sector: sector    // متوافق مع حقل الـ sector في السكيما بتاعتك
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'تم التسجيل بنجاح!',
        text: `تم إضافة المهندس ${name} وتعيينه لقطاع ${sector}.`,
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });

      // تفريغ الحقول بعد النجاح
      setName('');
      setEmail('');
      setPassword('');
      setSector('');

    } catch (error) {
      console.error('Error registering engineer:', error);
      const errorMsg = error.response?.data?.message || 'فشلت عملية التسجيل. يرجى المحاولة مرة أخرى.';
      Swal.fire({
        icon: 'error',
        title: 'فشل التسجيل',
        text: errorMsg,
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8">
        
        {/* 🔝 الهيدر العلوي */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-[#04332D]">
              <UserPlus size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F2925]">تسجيل مهندس جديد</h1>
              <p className="text-xs text-gray-400 font-medium">إضافة عضو جديد للفريق الفني وتحديد نطاقه الجغرافي.</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard')}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors cursor-pointer"
            title="العودة للوحة التحكم"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* 📋 الفورم */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. اسم المهندس */}
          <div>
            <label className="block text-xs font-bold text-[#1E3A37] mb-1.5">الاسم بالكامل</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: م. أحمد محمد"
                className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* 2. البريد الإلكتروني */}
          <div>
            <label className="block text-xs font-bold text-[#1E3A37] mb-1.5">البريد الإلكتروني الحسابي</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@citypulse.com"
                className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 text-left placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* 3. كلمة المرور الافتراضية */}
          <div>
            <label className="block text-xs font-bold text-[#1E3A37] mb-1.5">كلمة مرور افتراضية</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 text-left placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* 4. القطاع / المحافظة */}
          <div>
            <label className="block text-xs font-bold text-[#1E3A37] mb-1.5">القطاع الفني المسؤول عنه (Sector)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <MapPin size={16} className="text-emerald-600" />
              </span>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="مثال: cairo أو giza أو alexandria"
                className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-xs"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">💡 يرجى إدخال اسم القطاع بنفس الصيغة المتبعة لفلترة البلاغات وتوجيهها تلقائياً.</p>
          </div>

          {/* زر الإرسال */}
          <button
            type="submit"
            className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-xs shadow-sm mt-4"
          >
            <span>اعتماد وتسجيل المهندس</span>
          </button>

        </form>

      </div>
    </div>
  );
}

export default RegisterEngineer;