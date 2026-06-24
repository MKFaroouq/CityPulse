import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, User, Briefcase, ArrowRight, Search, Mail, Calendar } from 'lucide-react';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 🚀 جلب المستخدمين من الـ API الحقيقي في الباك إند
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data);
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error fetching users from API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // فلترة المستخدمين بالبحث (الاسم أو الإيميل)
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة لتلوين وتحديد شكل الـ Role (أدمن، مهندس، مواطن)
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'أدمن نظام', color: 'bg-red-50 text-red-700 border-red-200', icon: <Shield size={13} /> };
      case 'employee':
      case 'engineer':
        return { text: 'مهندس فني', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Briefcase size={13} /> };
      default:
        return { text: 'مواطن', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <User size={13} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#04332D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* 🔝 الهيدر العلوي للرجوع للداشبورد */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F2925]">إدارة ومراقبة المستخدمين</h1>
              <p className="text-xs text-gray-400 font-medium">عرض كافة الحسابات المسجلة على المنظومة والتحكم بصلاحياتهم.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>العودة للوحة التحكم</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 🔍 شريط البحث السريع */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] mb-6 flex items-center relative">
          <span className="absolute right-7 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
          />
        </div>

        {/* 📋 جدول عرض المستخدمين الفخم */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-medium">
              لا يوجد مستخدمين مطابقين للبحث الحالي.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
                    <th className="p-4">الاسم بالكامل</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">الصلاحية (Role)</th>
                    <th className="p-4">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredUsers.map((user) => {
                    const badge = getRoleBadge(user.role);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                        {/* الاسم */}
                        <td className="p-4 font-bold text-[#0F2925]">{user.name || 'غير محدد'}</td>
                        
                        {/* الإيميل */}
                        <td className="p-4 text-gray-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        
                        {/* الصلاحية */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                            {badge.icon}
                            <span>{badge.text}</span>
                          </span>
                        </td>
                        
                        {/* تاريخ التسجيل */}
                        <td className="p-4 text-gray-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : 'قديم'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminUsers;