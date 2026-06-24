import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  UserPlus, 
  ClipboardList, 
  Users, 
  LogOut, 
  Clock,
  ArrowLeft,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ 
    totalIssues: 0, 
    openIssues: 0, 
    totalEngineers: 0,
    totalCitizens: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const issuesResponse = await fetch('http://localhost:3000/api/issues', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const issuesData = await issuesResponse.json();

        const usersResponse = await fetch('http://localhost:3000/api/auth/users', { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersResponse.json();

        if (issuesResponse.ok && usersResponse.ok) {
          const open = issuesData.filter(i => i.status === 'Open').length;
          const engineers = usersData.filter(u => u.role === 'employee' || u.role === 'engineer').length;
          const citizens = usersData.filter(u => u.role === 'citizen' || u.role === 'user').length;

          setStats({
            totalIssues: issuesData.length,
            openIssues: open,
            totalEngineers: engineers,
            totalCitizens: citizens
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data from APIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      <div className="max-w-6xl mx-auto">
        
        {/* 🔝 الهيدر العلوي */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E9E8] mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#04332D] text-white p-2.5 rounded-xl shadow-md">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F2925]">لوحة تحكم الإدارة العليا</h1>
              <p className="text-xs text-gray-400 font-medium">البيانات الحالية متزامنة ومحدثة لحظياً من قاعدة البيانات.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/report-issue')}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>واجهة البلاغات</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold border border-red-100 transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* 📊 الكروت الرقمية */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-0.5">إجمالي البلاغات</p>
              <h3 className="text-xl font-black text-[#0F2925]">{stats.totalIssues}</h3>
            </div>
            <div className="p-2.5 bg-gray-50 text-gray-500 rounded-lg"><ClipboardList size={18} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-0.5">بلاغات مفتوحة</p>
              <h3 className="text-xl font-black text-amber-600">{stats.openIssues}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-0.5">المهندسين الفنيين</p>
              <h3 className="text-xl font-black text-blue-600">{stats.totalEngineers}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-0.5">المواطنين المسجلين</p>
              <h3 className="text-xl font-black text-emerald-600">{stats.totalCitizens}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={18} /></div>
          </div>
        </div>

        {/* 🎛️ لوحة الخدمات الإدارية */}
        <h2 className="text-sm font-bold text-gray-500 mb-4 block">الخدمات الإدارية المتاحة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/registerEngineer')} 
            className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="bg-emerald-50 text-[#04332D] p-3 rounded-xl w-fit group-hover:bg-[#04332D] group-hover:text-white transition-colors">
              <UserPlus size={24} />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base text-[#0F2925] mb-1">تسجيل مهندس جديد</h3>
              <p className="text-xs text-gray-400 leading-relaxed">إضافة مهندس أو موظف قطاع فني جديد إلى النظام وتحديد صلاحياته.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/admin-issues-list')} 
            className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ClipboardList size={24} />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base text-[#0F2925] mb-1">عرض وإدارة الشكاوى</h3>
              <p className="text-xs text-gray-400 leading-relaxed">استعراض كافة البلاغات المقدمة، تعديل حالاتها، وتعيين المهندسين للمتابعة.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/users')}
            className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="bg-purple-50 text-purple-600 p-3 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base text-[#0F2925] mb-1">إدارة المستخدمين</h3>
              <p className="text-xs text-gray-400 leading-relaxed">متابعة حسابات المواطنين والموظفين النشطين على المنظومة والتحكم بها.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Shield, 
//   UserPlus, 
//   ClipboardList, 
//   Users, 
//   LogOut, 
//   Clock,
//   ArrowLeft,
//   UserCheck,
//   AlertTriangle,
//   CheckCircle,
//   MapPin,
//   Map
// } from 'lucide-react';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
  
//   // الـ States لحفظ الإحصائيات والبلاغات
//   const [stats, setStats] = useState({ 
//     totalIssues: 0, 
//     openIssues: 0, 
//     totalEngineers: 0,
//     totalCitizens: 0 
//   });
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🚀 ربط الـ APIs وجلب كافة البيانات الحقيقية بما فيها جدول البلاغات
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         // 1️⃣ جلب بيانات الشكاوى والبلاغات
//         const issuesResponse = await fetch('http://localhost:3000/api/issues', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const issuesData = await issuesResponse.json();

//         // 2️⃣ جلب بيانات المستخدمين
//         const usersResponse = await fetch('http://localhost:3000/api/auth/users', { 
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const usersData = await usersResponse.json();

//         if (issuesResponse.ok && usersResponse.ok) {
//           setIssues(issuesData);

//           // حساب الشكاوى المفتوحة
//           const open = issuesData.filter(i => i.status === 'Open').length;
          
//           // فلترة المستخدمين بناءً على الـ role
//           const engineers = usersData.filter(u => u.role === 'employee' || u.role === 'engineer').length;
//           const citizens = usersData.filter(u => u.role === 'citizen' || u.role === 'user').length;

//           // تحديث الـ State بالأرقام الحية من الداتابيز
//           setStats({
//             totalIssues: issuesData.length,
//             openIssues: open,
//             totalEngineers: engineers,
//             totalCitizens: citizens
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching dashboard data from APIs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   // دالة مساعدة لتلوين درجة الخطورة (Severity)
//   const getSeverityBadge = (severity) => {
//     const styles = {
//       Critical: 'bg-red-100 text-red-800 border-red-200',
//       Medium: 'bg-amber-100 text-amber-800 border-amber-200',
//       Low: 'bg-green-100 text-green-800 border-green-200'
//     };
//     return styles[severity] || 'bg-gray-100 text-gray-800';
//   };

//   // دالة مساعدة لتلوين حالة الشكوى (Status)
//   const getStatusBadge = (status) => {
//     const styles = {
//       'Open': 'bg-blue-100 text-blue-800',
//       'In-progress': 'bg-purple-100 text-purple-800',
//       'Resolved': 'bg-emerald-100 text-emerald-800'
//     };
//     return styles[status] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#04332D]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased" dir="rtl">
//       <div className="max-w-6xl mx-auto">
        
//         {/* 🔝 الهيدر العلوي */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E9E8] mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-xl shadow-md">
//               <Shield size={28} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">لوحة تحكم الإدارة العليا</h1>
//               <p className="text-xs text-gray-400 font-medium">البيانات الحالية متزامنة ومحدثة لحظياً من قاعدة البيانات.</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => navigate('/report-issue')}
//               className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
//             >
//               <ArrowLeft size={15} />
//               <span>واجهة البلاغات</span>
//             </button>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold border border-red-100 transition-all cursor-pointer"
//             >
//               <LogOut size={15} />
//               <span>تسجيل الخروج</span>
//             </button>
//           </div>
//         </div>

//         {/* 📊 الكروت الرقمية الحية */}
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">إجمالي البلاغات</p>
//               <h3 className="text-xl font-black text-[#0F2925]">{stats.totalIssues}</h3>
//             </div>
//             <div className="p-2.5 bg-gray-50 text-gray-500 rounded-lg"><ClipboardList size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">بلاغات مفتوحة</p>
//               <h3 className="text-xl font-black text-amber-600">{stats.openIssues}</h3>
//             </div>
//             <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">المهندسين الفنيين</p>
//               <h3 className="text-xl font-black text-blue-600">{stats.totalEngineers}</h3>
//             </div>
//             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">المواطنين المسجلين</p>
//               <h3 className="text-xl font-black text-emerald-600">{stats.totalCitizens}</h3>
//             </div>
//             <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={18} /></div>
//           </div>
//         </div>

//         {/* 🎛️ لوحة الخدمات الإدارية */}
//         <h2 className="text-sm font-bold text-gray-500 mb-4 block">الخدمات الإدارية المتاحة</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div 
//             onClick={() => navigate('/registerEngineer')} 
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-emerald-50 text-[#04332D] p-3 rounded-xl w-fit group-hover:bg-[#04332D] group-hover:text-white transition-colors">
//               <UserPlus size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">تسجيل مهندس جديد</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">إضافة مهندس أو موظف قطاع فني جديد إلى النظام وتحديد صلاحياته.</p>
//             </div>
//           </div>

//           <div 
//             onClick={() => navigate('/admin-issues-list')} 
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
//               <ClipboardList size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">عرض وإدارة الشكاوى</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">استعراض كافة البلاغات المقدمة، تعديل حالاتها، وتعيين المهندسين للمتابعة.</p>
//             </div>
//           </div>

//           <div 
//             onClick={() => navigate('/users')}
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-purple-50 text-purple-600 p-3 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
//               <Users size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">إدارة المستخدمين</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">متابعة حسابات المواطنين والموظفين النشطين على المنظومة والتحكم بها.</p>
//             </div>
//           </div>
//         </div>

//         {/* 📋 جدول الشكاوى الرئيسي المتكامل (مضاف إليه اللوكيشن الجغرافي) */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
//           <div className="p-5 border-b border-gray-100 bg-gray-50/50">
//             <h2 className="font-bold text-sm text-gray-800">قائمة البلاغات الواردة الحالية</h2>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-right border-collapse">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-700 text-xs font-semibold border-b border-gray-200">
//                   <th className="p-4">عنوان البلاغ</th>
//                   <th className="p-4">الموقع المكتوب</th>
//                   <th className="p-4">الموقع الجغرافي (الخريطة)</th>
//                   <th className="p-4">المُبلّغ</th>
//                   <th className="p-4">درجة الخطورة</th>
//                   <th className="p-4">الحالة</th>
//                   <th className="p-4">المسؤول</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 text-xs text-gray-600">
//                 {issues.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="p-8 text-center text-gray-400">لا توجد بلاغات مسجلة في النظام حالياً.</td>
//                   </tr>
//                 ) : (
//                   issues.map((issue) => (
//                     <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                       <td className="p-4">
//                         <div className="font-semibold text-gray-900">{issue.title}</div>
//                         <div className="text-[11px] text-gray-400 mt-1 max-w-xs truncate">{issue.description}</div>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex items-center gap-1 text-gray-700">
//                           <MapPin size={14} className="text-gray-400" />
//                           {issue.location}
//                         </div>
//                       </td>
                      
//                       {/* 🎯 إضافة تفاصيل الإحداثيات الجغرافية ورابط جوجل مابس هنا للادمن */}
//                       <td className="p-4">
//                         {issue.coordinates ? (
//                           (() => {
//                             try {
//                               const coords = typeof issue.coordinates === 'string' 
//                                 ? JSON.parse(issue.coordinates) 
//                                 : issue.coordinates;

//                               if (coords && coords.lat && coords.lng) {
//                                 return (
//                                   <div className="flex items-center gap-2">
//                                     <a
//                                       href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
//                                       target="_blank"
//                                       rel="noreferrer"
//                                       title="افتح في خرائط جوجل"
//                                       className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono px-2 py-1 rounded border border-emerald-200 transition-all"
//                                     >
//                                       <Map size={13} />
//                                       <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
//                                     </a>
//                                   </div>
//                                 );
//                               }
//                             } catch (e) {
//                               console.error("Error parsing issue coordinates:", e);
//                             }
//                             return <span className="text-gray-400 italic">إحداثيات غير صالحة</span>;
//                           })()
//                         ) : (
//                           <span className="text-gray-400 italic">لم يحدد على الخريطة</span>
//                         )}
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center gap-1">
//                           <div className="bg-gray-100 p-1 rounded-full text-gray-500 shrink-0">
//                             <UserCheck size={14} />
//                           </div>
//                           <div>
//                             <div className="font-medium text-gray-900">{issue.reportedBy?.name || 'مواطن'}</div>
//                             <div className="text-[10px] text-gray-400">{issue.reportedBy?.email || ''}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(issue.severity)}`}>
//                           {issue.severity === 'Critical' ? 'حرجة' : issue.severity === 'Medium' ? 'متوسطة' : 'منخفضة'}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(issue.status)}`}>
//                           {issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}
//                         </span>
//                       </td>
//                       <td className="p-4 text-gray-500">
//                         {issue.assignedTo?.name ? (
//                           <span className="text-indigo-600 font-semibold">{issue.assignedTo.name}</span>
//                         ) : (
//                           <span className="text-gray-400 italic">لم يتم التعيين</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Shield, 
//   UserPlus, 
//   ClipboardList, 
//   Users, 
//   LogOut, 
//   Clock,
//   ArrowLeft,
//   UserCheck
// } from 'lucide-react';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
  
//   // الـ States لحفظ البيانات الحقيقية من الداتابيز
//   const [stats, setStats] = useState({ 
//     totalIssues: 0, 
//     openIssues: 0, 
//     totalEngineers: 0,
//     totalCitizens: 0 
//   });
//   const [loading, setLoading] = useState(true);

//   // 🚀 ربط الـ APIs وجلب الداتا الحقيقية
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         // 1️⃣ ضرب API الشكاوى
//         const issuesResponse = await fetch('http://localhost:3000/api/issues', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const issuesData = await issuesResponse.json();

//         // 2️⃣ ضرب API المستخدمين (اللي بانيينها ومحمية بـ adminOnly)
//         const usersResponse = await fetch('http://localhost:3000/api/auth/users', { // تأكد من المسار عندك بالملي
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const usersData = await usersResponse.json();

//         if (issuesResponse.ok && usersResponse.ok) {
//           // حساب الشكاوى المفتوحة
//           const open = issuesData.filter(i => i.status === 'Open').length;
          
//           // فلترة المستخدمين بناءً على الـ role اللي في الـ Schema بتاعتك
//           const engineers = usersData.filter(u => u.role === 'employee' || u.role === 'engineer').length;
//           const citizens = usersData.filter(u => u.role === 'citizen' || u.role === 'user').length;

//           // تحديث الـ State بالأرقام الحية من الداتابيز
//           setStats({
//             totalIssues: issuesData.length,
//             openIssues: open,
//             totalEngineers: engineers,
//             totalCitizens: citizens
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching dashboard data from APIs:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#04332D]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased" dir="rtl">
//       <div className="max-w-6xl mx-auto">
        
//         {/* 🔝 الهيدر العلوي */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E9E8] mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-xl shadow-md">
//               <Shield size={28} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">لوحة تحكم الإدارة العليا</h1>
//               <p className="text-xs text-gray-400 font-medium">البيانات الحالية متزامنة ومحدثة لحظياً من قاعدة البيانات.</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => navigate('/report-issue')}
//               className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
//             >
//               <ArrowLeft size={15} />
//               <span>واجهة البلاغات</span>
//             </button>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold border border-red-100 transition-all cursor-pointer"
//             >
//               <LogOut size={15} />
//               <span>تسجيل الخروج</span>
//             </button>
//           </div>
//         </div>

//         {/* 📊 الكروت الرقمية الحية من الـ APIs */}
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">إجمالي البلاغات</p>
//               <h3 className="text-xl font-black text-[#0F2925]">{stats.totalIssues}</h3>
//             </div>
//             <div className="p-2.5 bg-gray-50 text-gray-500 rounded-lg"><ClipboardList size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">بلاغات مفتوحة</p>
//               <h3 className="text-xl font-black text-amber-600">{stats.openIssues}</h3>
//             </div>
//             <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">المهندسين الفنيين</p>
//               <h3 className="text-xl font-black text-blue-600">{stats.totalEngineers}</h3>
//             </div>
//             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] flex items-center justify-between">
//             <div>
//               <p className="text-[11px] font-bold text-gray-400 mb-0.5">المواطنين المسجلين</p>
//               <h3 className="text-xl font-black text-emerald-600">{stats.totalCitizens}</h3>
//             </div>
//             <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={18} /></div>
//           </div>
//         </div>

//         {/* 🎛️ لوحة الخدمات الإدارية */}
//         <h2 className="text-sm font-bold text-gray-500 mb-4 block">الخدمات الإدارية المتاحة</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
//           {/* مربع 1: تسجيل مهندس جديد */}
//           <div 
//             onClick={() => navigate('/registerEngineer')} 
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-emerald-50 text-[#04332D] p-3 rounded-xl w-fit group-hover:bg-[#04332D] group-hover:text-white transition-colors">
//               <UserPlus size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">تسجيل مهندس جديد</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">إضافة مهندس أو موظف قطاع فني جديد إلى النظام وتحديد صلاحياته.</p>
//             </div>
//           </div>

//           {/* مربع 2: عرض وإدارة الشكاوى */}
//           <div 
//             onClick={() => navigate('/admin-issues-list')} 
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
//               <ClipboardList size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">عرض وإدارة الشكاوى</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">استعراض كافة البلاغات المقدمة، تعديل حالاتها، وتعيين المهندسين للمتابعة.</p>
//             </div>
//           </div>

//           {/* مربع 3: مراقبة المستخدمين */}
//           <div 
//             onClick={() => navigate('/users')}
//             className="bg-white p-6 rounded-2xl border border-[#E5E9E8] shadow-sm hover:shadow-md hover:border-[#04332D]/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
//           >
//             <div className="bg-purple-50 text-purple-600 p-3 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
//               <Users size={24} />
//             </div>
//             <div className="mt-4">
//               <h3 className="font-bold text-base text-[#0F2925] mb-1">إدارة المستخدمين</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">متابعة حسابات المواطنين والموظفين النشطين على المنظومة والتحكم بها.</p>
//             </div>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// //
// import React, { useState, useEffect } from 'react';
// import { Shield, AlertTriangle, CheckCircle, Clock, Users, MapPin, Calendar } from 'lucide-react';

// const AdminDashboard = () => {
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });

//   // 1️⃣ جلب المشاكل من الباك إند أول ما الصفحة تفتح
//   useEffect(() => {
//     const fetchIssues = async () => {
//       try {
//         // تأكد من تغيير المسار وتمرير التوكن المظبوط من الـ LocalStorage عندك
//         const token = localStorage.getItem('token'); 
//         const response = await fetch('http://localhost:3000/api/issues', {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
//         const data = await response.json();
        
//         if (response.ok) {
//           setIssues(data);
//           calculateStats(data);
//         }
//       } catch (error) {
//         console.error('Error loading dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchIssues();
//   }, []);

//   // 2️⃣ حساب الإحصائيات السريعة للكروت اللي فوق
//   const calculateStats = (data) => {
//     const total = data.length;
//     const open = data.filter(i => i.status === 'Open').length;
//     const inProgress = data.filter(i => i.status === 'In-progress').length;
//     const resolved = data.filter(i => i.status === 'Resolved').length;
//     setStats({ total, open, inProgress, resolved });
//   };

//   // دالة مساعدة لتلوين درجة الخطورة (Severity)
//   const getSeverityBadge = (severity) => {
//     const styles = {
//       Critical: 'bg-red-100 text-red-800 border-red-200',
//       Medium: 'bg-amber-100 text-amber-800 border-amber-200',
//       Low: 'bg-green-100 text-green-800 border-green-200'
//     };
//     return styles[severity] || 'bg-gray-100 text-gray-800';
//   };

//   // دالة مساعدة لتلوين حالة الشكوى (Status)
//   const getStatusBadge = (status) => {
//     const styles = {
//       'Open': 'bg-blue-100 text-blue-800',
//       'In-progress': 'bg-purple-100 text-purple-800',
//       'Resolved': 'bg-emerald-100 text-emerald-800'
//     };
//     return styles[status] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 font-sans" dir="rtl">
//       {/* الهيدر العلوي */}
//       <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-5">
//         <div className="flex items-center gap-3">
//           <div className="bg-indigo-600 text-white p-2 rounded-lg">
//             <Shield size={28} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم النظام</h1>
//             <p className="text-sm text-gray-500">إدارة ومتابعة بلاغات المواطنين والشكاوى المستلمة</p>
//           </div>
//         </div>
//       </div>

//       {/* 📊 كروت الإحصائيات السريعة */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-500">إجمالي البلاغات</p>
//             <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
//           </div>
//           <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><AlertTriangle size={24} /></div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-500">بلاغات مفتوحة</p>
//             <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.open}</h3>
//           </div>
//           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={24} /></div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-500">قيد الإصلاح</p>
//             <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.inProgress}</h3>
//           </div>
//           <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Clock size={24} /></div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-500">تم حلها</p>
//             <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.resolved}</h3>
//           </div>
//           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={24} /></div>
//         </div>
//       </div>

//       {/* 📋 جدول الشكاوى الرئيسي */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="p-5 border-b border-gray-100 bg-gray-50/50">
//           <h2 className="font-bold text-lg text-gray-800">قائمة البلاغات الواردة</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-right border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700 text-sm font-semibold border-b border-gray-200">
//                 <th className="p-4">عنوان البلاغ</th>
//                 <th className="p-4">الموقع</th>
//                 <th className="p-4">المُبلّغ</th>
//                 <th className="p-4">درجة الخطورة</th>
//                 <th className="p-4">الحالة</th>
//                 <th className="p-4">المسؤول</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
//               {issues.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="p-8 text-center text-gray-400">لا توجد بلاغات مسجلة في النظام حالياً.</td>
//                 </tr>
//               ) : (
//                 issues.map((issue) => (
//                   <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                     <td className="p-4">
//                       <div className="font-semibold text-gray-900">{issue.title}</div>
//                       <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{issue.description}</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-1 text-gray-700">
//                         <MapPin size={16} className="text-gray-400" />
//                         {issue.location}
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-1">
//                         <Users size={16} className="text-gray-400" />
//                         <div>
//                           <div>{issue.reportedBy?.name || 'مواطن'}</div>
//                           <div className="text-xs text-gray-400">{issue.reportedBy?.email || ''}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(issue.severity)}`}>
//                         {issue.severity === 'Critical' ? 'حرجة' : issue.severity === 'Medium' ? 'متوسطة' : 'منخفضة'}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(issue.status)}`}>
//                         {issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}
//                       </span>
//                     </td>
//                     <td className="p-4 text-gray-500">
//                       {issue.assignedTo?.name ? (
//                         <span className="text-indigo-600 font-medium">{issue.assignedTo.name}</span>
//                       ) : (
//                         <span className="text-gray-400 italic">لم يتم التعيين</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;