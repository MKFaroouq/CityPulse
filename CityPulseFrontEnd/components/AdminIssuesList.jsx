import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, Search, MapPin, AlertCircle, Clock, CheckCircle, RefreshCw, Eye, Image as ImageIcon, X, Map, UserCheck, Trash2 } from 'lucide-react'; // 👈 ضفنا Trash2
import Swal from 'sweetalert2';
import axios from 'axios';

function AdminIssuesList() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚀 States للتحكم في نافذة العرض المنبثقة (Modal)
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🛠️ States الخاصة بالمهندسين
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineerEmail, setSelectedEngineerEmail] = useState(''); 

  // 🚀 1. جلب الشكاوى من الـ API الحقيقي
  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 2. جلب قائمة المهندسين من الباك إند
  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // تصفية المهندسين فقط بناءً على الـ Role
      const onlyEngineers = response.data.filter(user => user.role === 'engineer');

      setEngineers(onlyEngineers);
    } catch (error) {
      console.error("Error fetching and filtering engineers:", error);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchEngineers();
  }, []);

  // 🚀 3. دالة فتح نافذة المعاينة
  const handleOpenPreview = (issue) => {
    setSelectedIssue(issue);
    setSelectedEngineerEmail(issue.assignedTo?.email || '');
    setIsModalOpen(true);
  };

  // 🚀 4. دالة إسناد البلاغ للمهندس
  const handleAssignEngineer = async () => {
    if (!selectedEngineerEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'warning',
        text: 'Please select an engineer first.',
        confirmButtonColor: '#04332D'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/issues/action/assign-engineer', {
        issueId: selectedIssue._id,
        engineerEmail: selectedEngineerEmail 
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Assigned Successfully!',
          text: 'The issue has been assigned to the selected engineer.',
          timer: 2000,
          showConfirmButton: false
        });

        setSelectedIssue(prev => ({
          ...prev,
          assignedTo: response.data.issue.assignedTo,
          assignmentStatus: 'Assigned'
        }));

        fetchIssues();
      }
    } catch (error) {
      console.error("Error in handleAssignEngineer:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Assign',
        text: error.response?.data?.message || 'An error occurred while assigning the issue.'
      });
    }
  };

  // 🚀 5. دالة تحديث حالة الشكوى (API Update Status)
  const handleUpdateStatus = async (issueId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: 'تحديث حالة البلاغ',
      input: 'select',
      inputOptions: {
        'Open': 'مفتوح (Open)',
        'In-progress': 'جاري العمل عليها (In-progress)',
        'Resolved': 'تم الحل بنجاح (Resolved)'
      },
      inputValue: currentStatus,
      inputPlaceholder: 'اختر الحالة الجديدة',
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      confirmButtonText: 'تحديث',
      confirmButtonColor: '#04332D',
      customClass: { popup: 'rounded-xl' }
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/issues/${issueId}`, { 
          status: newStatus 
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'تم التحديث!',
          text: 'تم تغيير حالة البلاغ بنجاح.',
          timer: 1500,
          showConfirmButton: false
        });

        if (selectedIssue && selectedIssue._id === issueId) {
          setSelectedIssue(prev => ({ ...prev, status: newStatus }));
        }

        fetchIssues();
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire({
          icon: 'error',
          title: 'فشل التحديث',
          text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.'
        });
      }
    }
  };

  // 🚀 6. دالة حذف الشكوى من الداتابيز
  // 🚀 6. دالة حذف الشكوى من الداتابيز
  const handleDeleteIssue = async (issueId) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا البلاغ بعد حذفه!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذفه!',
      cancelButtonText: 'إلغاء',
      customClass: { popup: 'rounded-xl' }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        // جرب الرابط العادي، وإذا الباك إند مستني الـ ID في الـ body فـ data هتبعت الحالتين
        await axios.delete(`http://localhost:3000/api/issues/${issueId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          data: { issueId: issueId } // تأمين إضافي لو الباك إند بيقرا من الـ body
        });

        Swal.fire({
          icon: 'success',
          title: 'تم الحذف!',
          text: 'تم حذف البلاغ بنجاح.',
          timer: 1500,
          showConfirmButton: false
        });

        fetchIssues(); // تحديث الجدول بعد الحذف
      } catch (error) {
        console.error("Error deleting issue:", error);
        
        // لو لسه فيه مشكلة، هيظهر لك السبب الحقيقي اللي جاي من الباك إند في الـ Alert
        Swal.fire({
          icon: 'error',
          title: 'فشل الحذف',
          text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم. تأكد من رابط الـ API في الباك إند.'
        });
      }
    }
  };
  const renderMapLink = (latitude, longitude) => {
    if (!latitude || !longitude) {
      return <span className="text-gray-400 italic text-xs">غير محدد</span>;
    }
    
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    return (
      <a
        href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-mono px-2 py-1 rounded border border-emerald-200 transition-all cursor-pointer"
      >
        <Map size={12} />
        <span>{latNum.toFixed(4)}, {lngNum.toFixed(4)}</span>
      </a>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'In-progress':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Resolved':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F2925]">عرض وإدارة البلاغات</h1>
              <p className="text-xs text-gray-400 font-medium">متابعة كافة المشاكل المقدمة من المواطنين وتوزيعها وتحديث حالاتها.</p>
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
            placeholder="ابحث عن بلاغ بالعنوان أو الموقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
          />
        </div>

        {/* 📋 جدول البلاغات */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-medium">
              لا توجد بلاغات مسجلة حالياً أو مطابقة للبحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
                    <th className="p-4">عنوان البلاغ</th>
                    <th className="p-4">الموقع المكتوب</th>
                    <th className="p-4">الموقع الجغرافي</th>
                    <th className="p-4">الخطورة</th>
                    <th className="p-4">المهندس المسؤول</th> {/* 👈 إضافة العمود هنا */}
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-[#0F2925]">{issue.title}</div>
                          {issue.image && <ImageIcon size={14} className="text-emerald-600" title="يحتوي على صورة مرفقة" />}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{issue.description || 'لا يوجد وصف'}</div>
                      </td>
                      
                      <td className="p-4 text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{issue.location}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {renderMapLink(issue.latitude, issue.longitude)}
                      </td>
                      
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {issue.severity || 'Low'}
                        </span>
                      </td>

                      {/* 👈 خانة المهندس المسؤول المضاف في الجدول الرئيسي */}
                      <td className="p-4">
                        {issue.assignedTo ? (
                          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/60 border border-emerald-100 rounded px-2 py-1 inline-block">
                            {issue.assignedTo.name || 'مهندس مسجل'}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">غير معين بعد</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(issue.status)}`}>
                          <span>{issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
                        </span>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={() => handleOpenPreview(issue)}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>المعاينة</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(issue._id, issue.status)}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            <RefreshCw size={13} />
                            <span>تعديل الحالة</span>
                          </button>

                          {/* 👈 زرار حذف البلاغ الجديد */}
                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-red-200"
                          >
                            <Trash2 size={13} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🖼️ الـ Modal الفخم لعرض كامل تفاصيل الشكوى */}
        {isModalOpen && selectedIssue && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto border border-[#E5E9E8]">
              
              {/* هيدر الـ Modal */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFA] rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <ClipboardList className="text-[#04332D]" size={20} />
                  <h2 className="text-base font-bold text-[#0F2925]">تفاصيل بلاغ: {selectedIssue.title}</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* محتوى الـ Modal */}
              <div className="p-6 space-y-6">
                
                {/* شبكة معلومات سريعة */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1">الموقع القطاع</span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{selectedIssue.location}</span>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1">الموقع الجغرافي</span>
                    <div className="mt-1">
                      {renderMapLink(selectedIssue.latitude, selectedIssue.longitude)}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1">مستوى الخطورة</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                      selectedIssue.severity === 'Critical' ? 'bg-red-100 text-red-700' : selectedIssue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedIssue.severity || 'Low'}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1">حالة العمل الحالية</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusBadge(selectedIssue.status)}`}>
                      <span>{selectedIssue.status === 'Open' ? 'مفتوح' : selectedIssue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
                    </span>
                  </div>
                </div>

                {/* 🛠️ إسناد المهندس داخل الـ Preview Modal */}
                <div className="bg-[#F3FAF9] p-4 rounded-xl border border-[#D1DCDA] space-y-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0F2925]">
                    <UserCheck size={16} className="text-[#04332D]" />
                    <span>توجيه وإسناد البلاغ لمهندس صيانة:</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedEngineerEmail}
                      onChange={(e) => setSelectedEngineerEmail(e.target.value)}
                      className="w-full p-2.5 border border-[#D1DCDA] rounded-lg bg-white text-gray-800 text-xs focus:ring-1 focus:ring-[#04332D] focus:outline-none"
                    >
                      <option value="">-- اختر المهندس المسئول --</option>
                      {engineers.map((eng) => (
                        <option key={eng._id} value={eng.email}>
                          {eng.name} ({eng.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignEngineer}
                      className="bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer"
                    >
                      تأكيد التعيين
                    </button>
                  </div>
                  {selectedIssue.assignedTo && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✓ هذا البلاغ مسند حالياً إلى: <span className="font-bold">{selectedIssue.assignedTo.name || 'مهندس مسجل'}</span>
                    </p>
                  )}
                </div>

                {/* الوصف الكامل */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 mb-2">شرح وتفاصيل المشكلة:</h3>
                  <p className="bg-[#F8FAFA] p-4 rounded-xl text-sm text-gray-700 border border-gray-100 leading-relaxed whitespace-pre-line">
                    {selectedIssue.description || 'لا يوجد شرح إضافي مرفق مع هذا البلاغ.'}
                  </p>
                </div>

                {/* عرض دليل الصورة */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 mb-2">الدليل المصور المرفق:</h3>
                  {selectedIssue.image ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center">
                      <img 
                        src={`http://localhost:3000${selectedIssue.image}`} 
                        alt="Evidence" 
                        className="w-full h-full object-contain max-h-72"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/600x400?text=خطأ+في+تحميل+الصورة";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 flex flex-col items-center gap-1">
                      <ImageIcon size={24} className="text-gray-300" />
                      <span>لم يقم المواطن بإرفاق أي صورة مع هذا البلاغ.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* فوتر الـ Modal */}
              <div className="p-4 border-t border-gray-100 bg-[#F8FAFA] flex items-center justify-between rounded-b-2xl">
                <button
                  onClick={() => handleUpdateStatus(selectedIssue._id, selectedIssue.status)}
                  className="flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw size={13} />
                  <span>تغيير الحالة الآن</span>
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  إغلاق المعاينة
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminIssuesList;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ClipboardList, ArrowRight, Search, MapPin, AlertCircle, Clock, CheckCircle, RefreshCw, Eye, Image as ImageIcon, X, Map, UserCheck } from 'lucide-react';
// import Swal from 'sweetalert2';
// import axios from 'axios';

// function AdminIssuesList() {
//   const navigate = useNavigate();
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // 🚀 States للتحكم في نافذة العرض المنبثقة (Modal)
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // 🛠️ States الخاصة بالمهندسين
//   const [engineers, setEngineers] = useState([]);
//   const [selectedEngineerEmail, setSelectedEngineerEmail] = useState(''); // 👈 تعديل: تخزين الإيميل بدلاً من الـ ID

//   // 🚀 1. جلب الشكاوى من الـ API الحقيقي
//   const fetchIssues = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/issues', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       setIssues(response.data);
//     } catch (error) {
//       console.error("Error fetching issues:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🚀 2. جلب قائمة المهندسين من الباك إند
//   const fetchEngineers = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/auth/users', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       // تصفية المهندسين فقط بناءً على الـ Role
//       const onlyEngineers = response.data.filter(user => user.role === 'engineer');

//       setEngineers(onlyEngineers);
//     } catch (error) {
//       console.error("Error fetching and filtering engineers:", error);
//     }
//   };

//   useEffect(() => {
//     fetchIssues();
//     fetchEngineers();
//   }, []);

//   // 🚀 3. دالة فتح نافذة المعاينة
//   const handleOpenPreview = (issue) => {
//     setSelectedIssue(issue);
//     // تصفير الاختيار القديم أو وضع إيميل المهندس الحالي للبلاغ إن وجد
//     setSelectedEngineerEmail(issue.assignedTo?.email || '');
//     setIsModalOpen(true);
//   };

//   // 🚀 4. دالة إسناد البلاغ للمهندس (تم تعديلها بالكامل لتطابق الباك إند الجديد)
//   const handleAssignEngineer = async () => {
//     if (!selectedEngineerEmail) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'warning',
//         text: 'Please select an engineer first.',
//         confirmButtonColor: '#04332D'
//       });
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put('http://localhost:3000/api/issues/action/assign-engineer', {
//         issueId: selectedIssue._id,
//         engineerEmail: selectedEngineerEmail // 👈 نبعت الإيميل هنا للباك إند
//       }, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Assigned Successfully!',
//           text: 'The issue has been assigned to the selected engineer.',
//           timer: 2000,
//           showConfirmButton: false
//         });

//         // تحديث البلاغ الحالي داخل الـ Modal ليعكس البيانات الجديدة بذكاء بدون مشاكل الـ status
//         setSelectedIssue(prev => ({
//           ...prev,
//           assignedTo: response.data.issue.assignedTo,
//           assignmentStatus: 'Assigned'
//         }));

//         // إعادة جلب كل البلاغات لتحديث الجدول الرئيسي في الخلفية
//         fetchIssues();
//       }
//     } catch (error) {
//       console.error("Error in handleAssignEngineer:", error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Failed to Assign',
//         text: error.response?.data?.message || 'An error occurred while assigning the issue.'
//       });
//     }
//   };

//   // 🚀 5. دالة تحديث حالة الشكوى (API Update Status)
//   const handleUpdateStatus = async (issueId, currentStatus) => {
//     const { value: newStatus } = await Swal.fire({
//       title: 'تحديث حالة البلاغ',
//       input: 'select',
//       inputOptions: {
//         'Open': 'مفتوح (Open)',
//         'In-progress': 'جاري العمل عليها (In-progress)',
//         'Resolved': 'تم الحل بنجاح (Resolved)'
//       },
//       inputValue: currentStatus,
//       inputPlaceholder: 'اختر الحالة الجديدة',
//       showCancelButton: true,
//       cancelButtonText: 'إلغاء',
//       confirmButtonText: 'تحديث',
//       confirmButtonColor: '#04332D',
//       customClass: { popup: 'rounded-xl' }
//     });

//     if (newStatus && newStatus !== currentStatus) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.put(`http://localhost:3000/api/issues/${issueId}`, { 
//           status: newStatus 
//         }, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         Swal.fire({
//           icon: 'success',
//           title: 'تم التحديث!',
//           text: 'تم تغيير حالة البلاغ بنجاح.',
//           timer: 1500,
//           showConfirmButton: false
//         });

//         if (selectedIssue && selectedIssue._id === issueId) {
//           setSelectedIssue(prev => ({ ...prev, status: newStatus }));
//         }

//         fetchIssues();
//       } catch (error) {
//         console.error("Error updating status:", error);
//         Swal.fire({
//           icon: 'error',
//           title: 'فشل التحديث',
//           text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.'
//         });
//       }
//     }
//   };

//   const renderMapLink = (latitude, longitude) => {
//     if (!latitude || !longitude) {
//       return <span className="text-gray-400 italic text-xs">غير محدد</span>;
//     }
    
//     const latNum = parseFloat(latitude);
//     const lngNum = parseFloat(longitude);

//     return (
//       <a
//         href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
//         target="_blank"
//         rel="noreferrer"
//         className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-mono px-2 py-1 rounded border border-emerald-200 transition-all cursor-pointer"
//       >
//         <Map size={12} />
//         <span>{latNum.toFixed(4)}, {lngNum.toFixed(4)}</span>
//       </a>
//     );
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Open':
//         return 'text-blue-600 bg-blue-50 border-blue-200';
//       case 'In-progress':
//         return 'text-purple-600 bg-purple-50 border-purple-200';
//       case 'Resolved':
//         return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       default:
//         return 'text-gray-600 bg-gray-50';
//     }
//   };

//   const filteredIssues = issues.filter(issue => 
//     issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//         <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
//               <ClipboardList size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">عرض وإدارة البلاغات</h1>
//               <p className="text-xs text-gray-400 font-medium">متابعة كافة المشاكل المقدمة من المواطنين وتوزيعها وتحديث حالاتها.</p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
//           >
//             <span>العودة للوحة التحكم</span>
//             <ArrowRight size={15} />
//           </button>
//         </div>

//         {/* 🔍 شريط البحث السريع */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] mb-6 flex items-center relative">
//           <span className="absolute right-7 text-gray-400">
//             <Search size={18} />
//           </span>
//           <input
//             type="text"
//             placeholder="ابحث عن بلاغ بالعنوان أو الموقع..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//           />
//         </div>

//         {/* 📋 جدول البلاغات */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
//           {filteredIssues.length === 0 ? (
//             <div className="p-12 text-center text-gray-400 text-sm font-medium">
//               لا توجد بلاغات مسجلة حالياً أو مطابقة للبحث.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-right border-collapse">
//                 <thead>
//                   <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
//                     <th className="p-4">عنوان البلاغ</th>
//                     <th className="p-4">الموقع المكتوب</th>
//                     <th className="p-4">الموقع الجغرافي</th>
//                     <th className="p-4">الخطورة</th>
//                     <th className="p-4">الحالة</th>
//                     <th className="p-4 text-center">الإجراءات</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {filteredIssues.map((issue) => (
//                     <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <div className="font-bold text-[#0F2925]">{issue.title}</div>
//                           {issue.image && <ImageIcon size={14} className="text-emerald-600" title="يحتوي على صورة مرفقة" />}
//                         </div>
//                         <div className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{issue.description || 'لا يوجد وصف'}</div>
//                       </td>
                      
//                       <td className="p-4 text-gray-500 font-medium">
//                         <div className="flex items-center gap-1.5 text-xs">
//                           <MapPin size={14} className="text-gray-400" />
//                           <span>{issue.location}</span>
//                         </div>
//                       </td>

//                       <td className="p-4">
//                         {renderMapLink(issue.latitude, issue.longitude)}
//                       </td>
                      
//                       <td className="p-4">
//                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                           issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                         }`}>
//                           {issue.severity || 'Low'}
//                         </span>
//                       </td>

//                       <td className="p-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(issue.status)}`}>
//                           <span>{issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                         </span>
//                       </td>
                      
//                       <td className="p-4 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleOpenPreview(issue)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
//                           >
//                             <Eye size={13} />
//                             <span>المعاينة</span>
//                           </button>

//                           <button
//                             onClick={() => handleUpdateStatus(issue._id, issue.status)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
//                           >
//                             <RefreshCw size={13} />
//                             <span>تعديل الحالة</span>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* 🖼️ الـ Modal الفخم لعرض كامل تفاصيل الشكوى */}
//         {isModalOpen && selectedIssue && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
//             <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto border border-[#E5E9E8]">
              
//               {/* هيدر الـ Modal */}
//               <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFA] rounded-t-2xl">
//                 <div className="flex items-center gap-2">
//                   <ClipboardList className="text-[#04332D]" size={20} />
//                   <h2 className="text-base font-bold text-[#0F2925]">تفاصيل بلاغ: {selectedIssue.title}</h2>
//                 </div>
//                 <button 
//                   onClick={() => setIsModalOpen(false)} 
//                   className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-all cursor-pointer"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               {/* محتوى الـ Modal */}
//               <div className="p-6 space-y-6">
                
//                 {/* شبكة معلومات سريعة */}
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">الموقع القطاع</span>
//                     <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
//                       <MapPin size={14} className="text-gray-400" />
//                       <span className="truncate">{selectedIssue.location}</span>
//                     </div>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">الموقع الجغرافي</span>
//                     <div className="mt-1">
//                       {renderMapLink(selectedIssue.latitude, selectedIssue.longitude)}
//                     </div>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">مستوى الخطورة</span>
//                     <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
//                       selectedIssue.severity === 'Critical' ? 'bg-red-100 text-red-700' : selectedIssue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                     }`}>
//                       {selectedIssue.severity || 'Low'}
//                     </span>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">حالة العمل الحالية</span>
//                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusBadge(selectedIssue.status)}`}>
//                       <span>{selectedIssue.status === 'Open' ? 'مفتوح' : selectedIssue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                     </span>
//                   </div>
//                 </div>

//                 {/* 🛠️ إسناد المهندس داخل الـ Preview Modal (تم التعديل لليوزر إيميل) */}
//                 <div className="bg-[#F3FAF9] p-4 rounded-xl border border-[#D1DCDA] space-y-3">
//                   <label className="flex items-center gap-1.5 text-xs font-bold text-[#0F2925]">
//                     <UserCheck size={16} className="text-[#04332D]" />
//                     <span>توجيه وإسناد البلاغ لمهندس صيانة:</span>
//                   </label>
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <select
//                       value={selectedEngineerEmail}
//                       onChange={(e) => setSelectedEngineerEmail(e.target.value)} // 👈 تعديل: تخزين الإيميل
//                       className="w-full p-2.5 border border-[#D1DCDA] rounded-lg bg-white text-gray-800 text-xs focus:ring-1 focus:ring-[#04332D] focus:outline-none"
//                     >
//                       <option value="">-- اختر المهندس المسئول --</option>
//                       {engineers.map((eng) => (
//                         <option key={eng._id} value={eng.email}> {/* 👈 تعديل: الـ value أصبح الإيميل */}
//                           {eng.name} ({eng.email})
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       onClick={handleAssignEngineer}
//                       className="bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer"
//                     >
//                       تأكيد التعيين
//                     </button>
//                   </div>
//                   {selectedIssue.assignedTo && (
//                     <p className="text-[11px] text-emerald-700 font-medium">
//                       ✓ هذا البلاغ مسند حالياً إلى: <span className="font-bold">{selectedIssue.assignedTo.name || 'مهندس مسجل'}</span>
//                     </p>
//                   )}
//                 </div>

//                 {/* الوصف الكامل */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">شرح وتفاصيل المشكلة:</h3>
//                   <p className="bg-[#F8FAFA] p-4 rounded-xl text-sm text-gray-700 border border-gray-100 leading-relaxed whitespace-pre-line">
//                     {selectedIssue.description || 'لا يوجد شرح إضافي مرفق مع هذا البلاغ.'}
//                   </p>
//                 </div>

//                 {/* عرض دليل الصورة */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">الدليل المصور المرفق:</h3>
//                   {selectedIssue.image ? (
//                     <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center">
//                       <img 
//                         src={`http://localhost:3000${selectedIssue.image}`} 
//                         alt="Evidence" 
//                         className="w-full h-full object-contain max-h-72"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = "https://placehold.co/600x400?text=خطأ+في+تحميل+الصورة";
//                         }}
//                       />
//                     </div>
//                   ) : (
//                     <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 flex flex-col items-center gap-1">
//                       <ImageIcon size={24} className="text-gray-300" />
//                       <span>لم يقم المواطن بإرفاق أي صورة مع هذا البلاغ.</span>
//                     </div>
//                   )}
//                 </div>

//               </div>

//               {/* فوتر الـ Modal */}
//               <div className="p-4 border-t border-gray-100 bg-[#F8FAFA] flex items-center justify-between rounded-b-2xl">
//                 <button
//                   onClick={() => handleUpdateStatus(selectedIssue._id, selectedIssue.status)}
//                   className="flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
//                 >
//                   <RefreshCw size={13} />
//                   <span>تغيير الحالة الآن</span>
//                 </button>
//                 <button 
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2"
//                 >
//                   إغلاق المعاينة
//                 </button>
//               </div>

//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default AdminIssuesList;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ClipboardList, ArrowRight, Search, MapPin, AlertCircle, Clock, CheckCircle, RefreshCw, Eye, Image as ImageIcon, X, Map } from 'lucide-react';
// import Swal from 'sweetalert2';
// import axios from 'axios';

// function AdminIssuesList() {
//   const navigate = useNavigate();
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // 🚀 States للتحكم في نافذة العرض المنبثقة (Modal)
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // 🚀 1. جلب الشكاوى من الـ API الحقيقي
//   const fetchIssues = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/issues', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       setIssues(response.data);
//     } catch (error) {
//       console.error("Error fetching issues:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchIssues();
//   }, []);

//   // 🚀 2. دالة فتح نافذة المعاينة
//   const handleOpenPreview = (issue) => {
//     setSelectedIssue(issue);
//     setIsModalOpen(true);
//   };

//   // 🚀 3. دالة تحديث حالة الشكوى (API Update Status)
//   const handleUpdateStatus = async (issueId, currentStatus) => {
//     const { value: newStatus } = await Swal.fire({
//       title: 'تحديث حالة البلاغ',
//       input: 'select',
//       inputOptions: {
//         'Open': 'مفتوح (Open)',
//         'In-progress': 'جاري العمل عليها (In-progress)',
//         'Resolved': 'تم الحل بنجاح (Resolved)'
//       },
//       inputValue: currentStatus,
//       inputPlaceholder: 'اختر الحالة الجديدة',
//       showCancelButton: true,
//       cancelButtonText: 'إلغاء',
//       confirmButtonText: 'تحديث',
//       confirmButtonColor: '#04332D',
//       customClass: { popup: 'rounded-xl' }
//     });

//     if (newStatus && newStatus !== currentStatus) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.put(`http://localhost:3000/api/issues/${issueId}`, { 
//           status: newStatus 
//         }, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         Swal.fire({
//           icon: 'success',
//           title: 'تم التحديث!',
//           text: 'تم تغيير حالة البلاغ بنجاح.',
//           timer: 1500,
//           showConfirmButton: false
//         });

//         // لو النافذة المنبثقة مفتوحة لنفس البلاغ، نحدث الحالة جواها برضه
//         if (selectedIssue && selectedIssue._id === issueId) {
//           setSelectedIssue(prev => ({ ...prev, status: newStatus }));
//         }

//         fetchIssues();
//       } catch (error) {
//         console.error("Error updating status:", error);
//         Swal.fire({
//           icon: 'error',
//           title: 'فشل التحديث',
//           text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.'
//         });
//       }
//     }
//   };

//   // 🎯 التعديل الجوهري: قراءة خطوط الطول والعرض الجديدة مباشرة وعرض رابط الخريطة الفعلي
//   const renderMapLink = (latitude, longitude) => {
//     if (!latitude || !longitude) {
//       return <span className="text-gray-400 italic text-xs">غير محدد</span>;
//     }
    
//     const latNum = parseFloat(latitude);
//     const lngNum = parseFloat(longitude);

//     return (
//       <a
//         href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
//         target="_blank"
//         rel="noreferrer"
//         className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-mono px-2 py-1 rounded border border-emerald-200 transition-all cursor-pointer"
//       >
//         <Map size={12} />
//         <span>{latNum.toFixed(4)}, {lngNum.toFixed(4)}</span>
//       </a>
//     );
//   };

//   // تلوين حالات الشكوى (Status)
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Open':
//         return 'text-blue-600 bg-blue-50 border-blue-200';
//       case 'In-progress':
//         return 'text-purple-600 bg-purple-50 border-purple-200';
//       case 'Resolved':
//         return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       default:
//         return 'text-gray-600 bg-gray-50';
//     }
//   };

//   // فلترة الشكاوى بناءً على بحث العنوان أو المكان
//   const filteredIssues = issues.filter(issue => 
//     issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//         <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
//               <ClipboardList size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">عرض وإدارة البلاغات</h1>
//               <p className="text-xs text-gray-400 font-medium">متابعة كافة المشاكل المقدمة من المواطنين وتوزيعها وتحديث حالاتها.</p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
//           >
//             <span>العودة للوحة التحكم</span>
//             <ArrowRight size={15} />
//           </button>
//         </div>

//         {/* 🔍 شريط البحث السريع */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] mb-6 flex items-center relative">
//           <span className="absolute right-7 text-gray-400">
//             <Search size={18} />
//           </span>
//           <input
//             type="text"
//             placeholder="ابحث عن بلاغ بالعنوان أو الموقع..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//           />
//         </div>

//         {/* 📋 جدول البلاغات الاحترافي */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
//           {filteredIssues.length === 0 ? (
//             <div className="p-12 text-center text-gray-400 text-sm font-medium">
//               لا توجد بلاغات مسجلة حالياً أو مطابقة للبحث.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-right border-collapse">
//                 <thead>
//                   <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
//                     <th className="p-4">عنوان البلاغ</th>
//                     <th className="p-4">الموقع المكتوب</th>
//                     <th className="p-4">الموقع الجغرافي</th>
//                     <th className="p-4">الخطورة</th>
//                     <th className="p-4">الحالة</th>
//                     <th className="p-4 text-center">الإجراءات</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {filteredIssues.map((issue) => (
//                     <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                       {/* العنوان والوصف المصغر */}
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <div className="font-bold text-[#0F2925]">{issue.title}</div>
//                           {issue.image && <ImageIcon size={14} className="text-emerald-600" title="يحتوي على صورة مرفقة" />}
//                         </div>
//                         <div className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{issue.description || 'لا يوجد وصف'}</div>
//                       </td>
                      
//                       {/* الموقع النصي */}
//                       <td className="p-4 text-gray-500 font-medium">
//                         <div className="flex items-center gap-1.5 text-xs">
//                           <MapPin size={14} className="text-gray-400" />
//                           <span>{issue.location}</span>
//                         </div>
//                       </td>

//                       {/* الموقع الجغرافي الخريطة (تم تحديث الممررات لتتوافق مع السكيما الجديدة) */}
//                       <td className="p-4">
//                         {renderMapLink(issue.latitude, issue.longitude)}
//                       </td>
                      
//                       {/* الخطورة */}
//                       <td className="p-4">
//                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                           issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                         }`}>
//                           {issue.severity || 'Low'}
//                         </span>
//                       </td>

//                       {/* الحالة */}
//                       <td className="p-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(issue.status)}`}>
//                           <span>{issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                         </span>
//                       </td>
                      
//                       {/* زر الإجراءات */}
//                       <td className="p-4 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleOpenPreview(issue)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
//                           >
//                             <Eye size={13} />
//                             <span>المعاينة</span>
//                           </button>

//                           <button
//                             onClick={() => handleUpdateStatus(issue._id, issue.status)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
//                           >
//                             <RefreshCw size={13} />
//                             <span>تعديل الحالة</span>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* 🖼️ الـ Modal الفخم لعرض كامل تفاصيل الشكوى */}
//         {isModalOpen && selectedIssue && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
//             <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto border border-[#E5E9E8]">
              
//               {/* هيدر الـ Modal */}
//               <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFA] rounded-t-2xl">
//                 <div className="flex items-center gap-2">
//                   <ClipboardList className="text-[#04332D]" size={20} />
//                   <h2 className="text-base font-bold text-[#0F2925]">تفاصيل بلاغ: {selectedIssue.title}</h2>
//                 </div>
//                 <button 
//                   onClick={() => setIsModalOpen(false)} 
//                   className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-all cursor-pointer"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               {/* محتوى الـ Modal */}
//               <div className="p-6 space-y-6">
                
//                 {/* شبكة معلومات سريعة */}
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">الموقع القطاع</span>
//                     <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
//                       <MapPin size={14} className="text-gray-400" />
//                       <span className="truncate">{selectedIssue.location}</span>
//                     </div>
//                   </div>

//                   {/* تم تحديث الممررات لتتوافق مع السكيما الجديدة داخل المودال */}
//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">الموقع الجغرافي</span>
//                     <div className="mt-1">
//                       {renderMapLink(selectedIssue.latitude, selectedIssue.longitude)}
//                     </div>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">مستوى الخطورة</span>
//                     <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
//                       selectedIssue.severity === 'Critical' ? 'bg-red-100 text-red-700' : selectedIssue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                     }`}>
//                       {selectedIssue.severity || 'Low'}
//                     </span>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">حالة العمل الحالية</span>
//                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusBadge(selectedIssue.status)}`}>
//                       <span>{selectedIssue.status === 'Open' ? 'مفتوح' : selectedIssue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                     </span>
//                   </div>
//                 </div>

//                 {/* الوصف الكامل */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">شرح وتفاصيل المشكلة:</h3>
//                   <p className="bg-[#F8FAFA] p-4 rounded-xl text-sm text-gray-700 border border-gray-100 leading-relaxed whitespace-pre-line">
//                     {selectedIssue.description || 'لا يوجد شرح إضافي مرفق مع هذا البلاغ.'}
//                   </p>
//                 </div>

//                 {/* عرض دليل الصورة */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">الدليل المصور المرفق:</h3>
//                   {selectedIssue.image ? (
//                     <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center">
//                       <img 
//                         src={`http://localhost:3000${selectedIssue.image}`} 
//                         alt="Evidence" 
//                         className="w-full h-full object-contain max-h-72"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = "https://placehold.co/600x400?text=خطأ+في+تحميل+الصورة";
//                         }}
//                       />
//                     </div>
//                   ) : (
//                     <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 flex flex-col items-center gap-1">
//                       <ImageIcon size={24} className="text-gray-300" />
//                       <span>لم يقم المواطن بإرفاق أي صورة مع هذا البلاغ.</span>
//                     </div>
//                   )}
//                 </div>

//               </div>

//               {/* فوتر الـ Modal */}
//               <div className="p-4 border-t border-gray-100 bg-[#F8FAFA] flex items-center justify-between rounded-b-2xl">
//                 <button
//                   onClick={() => handleUpdateStatus(selectedIssue._id, selectedIssue.status)}
//                   className="flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
//                 >
//                   <RefreshCw size={13} />
//                   <span>تغيير الحالة الآن</span>
//                 </button>
//                 <button 
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2"
//                 >
//                   إغلاق المعاينة
//                 </button>
//               </div>

//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default AdminIssuesList;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ClipboardList, ArrowRight, Search, MapPin, AlertCircle, Clock, CheckCircle, RefreshCw, Eye, Image as ImageIcon, X } from 'lucide-react';
// import Swal from 'sweetalert2';
// import axios from 'axios';

// function AdminIssuesList() {
//   const navigate = useNavigate();
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // 🚀 States جديدة للتحكم في نافذة العرض المنبثقة (Modal)
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // 🚀 1. جلب الشكاوى من الـ API الحقيقي
//   const fetchIssues = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/issues', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       setIssues(response.data);
//     } catch (error) {
//       console.error("Error fetching issues:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchIssues();
//   }, []);

//   // 🚀 2. دالة فتح نافذة المعاينة
//   const handleOpenPreview = (issue) => {
//     setSelectedIssue(issue);
//     setIsModalOpen(true);
//   };

//   // 🚀 3. دالة تحديث حالة الشكوى (API Update Status)
//   const handleUpdateStatus = async (issueId, currentStatus) => {
//     const { value: newStatus } = await Swal.fire({
//       title: 'تحديث حالة البلاغ',
//       input: 'select',
//       inputOptions: {
//         'Open': 'مفتوح (Open)',
//         'In-progress': 'جاري العمل عليها (In-progress)',
//         'Resolved': 'تم الحل بنجاح (Resolved)'
//       },
//       inputValue: currentStatus,
//       inputPlaceholder: 'اختر الحالة الجديدة',
//       showCancelButton: true,
//       cancelButtonText: 'إلغاء',
//       confirmButtonText: 'تحديث',
//       confirmButtonColor: '#04332D',
//       customClass: { popup: 'rounded-xl' }
//     });

//     if (newStatus && newStatus !== currentStatus) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.put(`http://localhost:3000/api/issues/${issueId}`, { 
//           status: newStatus 
//         }, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         Swal.fire({
//           icon: 'success',
//           title: 'تم التحديث!',
//           text: 'تم تغيير حالة البلاغ بنجاح.',
//           timer: 1500,
//           showConfirmButton: false
//         });

//         // لو النافذة المنبثقة مفتوحة لنفس البلاغ، نحدث الحالة جواها برضه
//         if (selectedIssue && selectedIssue._id === issueId) {
//           setSelectedIssue(prev => ({ ...prev, status: newStatus }));
//         }

//         fetchIssues();
//       } catch (error) {
//         console.error("Error updating status:", error);
//         Swal.fire({
//           icon: 'error',
//           title: 'فشل التحديث',
//           text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.'
//         });
//       }
//     }
//   };

//   // تلوين حالات الشكوى (Status)
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Open':
//         return 'text-blue-600 bg-blue-50 border-blue-200';
//       case 'In-progress':
//         return 'text-purple-600 bg-purple-50 border-purple-200';
//       case 'Resolved':
//         return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       default:
//         return 'text-gray-600 bg-gray-50';
//     }
//   };

//   // فلترة الشكاوى بناءً على بحث العنوان أو المكان
//   const filteredIssues = issues.filter(issue => 
//     issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//         <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
//               <ClipboardList size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">عرض وإدارة البلاغات</h1>
//               <p className="text-xs text-gray-400 font-medium">متابعة كافة المشاكل المقدمة من المواطنين وتوزيعها وتحديث حالاتها.</p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
//           >
//             <span>العودة للوحة التحكم</span>
//             <ArrowRight size={15} />
//           </button>
//         </div>

//         {/* 🔍 شريط البحث السريع */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] mb-6 flex items-center relative">
//           <span className="absolute right-7 text-gray-400">
//             <Search size={18} />
//           </span>
//           <input
//             type="text"
//             placeholder="ابحث عن بلاغ بالعنوان أو الموقع..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//           />
//         </div>

//         {/* 📋 جدول البلاغات الاحترافي */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
//           {filteredIssues.length === 0 ? (
//             <div className="p-12 text-center text-gray-400 text-sm font-medium">
//               لا توجد بلاغات مسجلة حالياً أو مطابقة للبحث.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-right border-collapse">
//                 <thead>
//                   <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
//                     <th className="p-4">عنوان البلاغ</th>
//                     <th className="p-4">الموقع</th>
//                     <th className="p-4">الخطورة</th>
//                     <th className="p-4">الحالة</th>
//                     <th className="p-4 text-center">الإجراءات</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {filteredIssues.map((issue) => (
//                     <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                       {/* العنوان والوصف المصغر */}
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <div className="font-bold text-[#0F2925]">{issue.title}</div>
//                           {issue.image && <ImageIcon size={14} className="text-emerald-600" title="يحتوي على صورة مرفقة" />}
//                         </div>
//                         <div className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{issue.description || 'لا يوجد وصف'}</div>
//                       </td>
                      
//                       {/* الموقع */}
//                       <td className="p-4 text-gray-500 font-medium">
//                         <div className="flex items-center gap-1.5 text-xs">
//                           <MapPin size={14} className="text-gray-400" />
//                           <span>{issue.location}</span>
//                         </div>
//                       </td>
                      
//                       {/* الخطورة */}
//                       <td className="p-4">
//                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                           issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                         }`}>
//                           {issue.severity || 'Low'}
//                         </span>
//                       </td>

//                       {/* الحالة */}
//                       <td className="p-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(issue.status)}`}>
//                           <span>{issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                         </span>
//                       </td>
                      
//                       {/* زر الإجراءات */}
//                       <td className="p-4 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           {/* 👁️ زر المعاينة الجديد */}
//                           <button
//                             onClick={() => handleOpenPreview(issue)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
//                           >
//                             <Eye size={13} />
//                             <span>المعاينة</span>
//                           </button>

//                           {/* 🔄 زر تعديل الحالة */}
//                           <button
//                             onClick={() => handleUpdateStatus(issue._id, issue.status)}
//                             className="inline-flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
//                           >
//                             <RefreshCw size={13} />
//                             <span>تعديل الحالة</span>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* 🖼️ الـ Modal الفخم لعرض كامل تفاصيل الشكوى مع الصورة لايف */}
//         {isModalOpen && selectedIssue && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
//             <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto border border-[#E5E9E8]">
              
//               {/* هيدر الـ Modal */}
//               <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFA] rounded-t-2xl">
//                 <div className="flex items-center gap-2">
//                   <ClipboardList className="text-[#04332D]" size={20} />
//                   <h2 className="text-base font-bold text-[#0F2925]">تفاصيل بلاغ: {selectedIssue.title}</h2>
//                 </div>
//                 <button 
//                   onClick={() => setIsModalOpen(false)} 
//                   className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-all cursor-pointer"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               {/* محتوى الـ Modal */}
//               <div className="p-6 space-y-6">
                
//                 {/* شبكة معلومات سريعة */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">الموقع القطاع</span>
//                     <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
//                       <MapPin size={14} className="text-gray-400" />
//                       <span>{selectedIssue.location}</span>
//                     </div>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">مستوى الخطورة</span>
//                     <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
//                       selectedIssue.severity === 'Critical' ? 'bg-red-100 text-red-700' : selectedIssue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                     }`}>
//                       {selectedIssue.severity || 'Low'}
//                     </span>
//                   </div>

//                   <div className="bg-[#F8FAFA] p-3 rounded-xl border border-gray-100">
//                     <span className="text-xs text-gray-400 block mb-1">حالة العمل الحالية</span>
//                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusBadge(selectedIssue.status)}`}>
//                       <span>{selectedIssue.status === 'Open' ? 'مفتوح' : selectedIssue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                     </span>
//                   </div>
//                 </div>

//                 {/* الوصف الكامل */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">شرح وتفاصيل المشكلة:</h3>
//                   <p className="bg-[#F8FAFA] p-4 rounded-xl text-sm text-gray-700 border border-gray-100 leading-relaxed whitespace-pre-line">
//                     {selectedIssue.description || 'لا يوجد شرح إضافي مرفق مع هذا البلاغ.'}
//                   </p>
//                 </div>

//                 {/* 🖼️ عرض دليل الصورة مرفوع لايف من السيرفر */}
//                 <div>
//                   <h3 className="text-xs font-bold text-gray-400 mb-2">الدليل المصور المرفق:</h3>
//                   {selectedIssue.image ? (
//                     <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center">
//                       <img 
//                         src={`http://localhost:3000${selectedIssue.image}`} 
//                         alt="Evidence" 
//                         className="w-full h-full object-contain max-h-72"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = "https://placehold.co/600x400?text=خطأ+في+تحميل+الصورة";
//                         }}
//                       />
//                     </div>
//                   ) : (
//                     <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 flex flex-col items-center gap-1">
//                       <ImageIcon size={24} className="text-gray-300" />
//                       <span>لم يقم المواطن بإرفاق أي صورة مع هذا البلاغ.</span>
//                     </div>
//                   )}
//                 </div>

//               </div>

//               {/* فوتر الـ Modal مع زر سريع لتغيير الحالة */}
//               <div className="p-4 border-t border-gray-100 bg-[#F8FAFA] flex items-center justify-between rounded-b-2xl">
//                 <button
//                   onClick={() => handleUpdateStatus(selectedIssue._id, selectedIssue.status)}
//                   className="flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
//                 >
//                   <RefreshCw size={13} />
//                   <span>تغيير الحالة الآن</span>
//                 </button>
//                 <button 
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2"
//                 >
//                   إغلاق المعاينة
//                 </button>
//               </div>

//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default AdminIssuesList;

// v1
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ClipboardList, ArrowRight, Search, MapPin, AlertCircle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
// import Swal from 'sweetalert2';
// import axios from 'axios';

// function AdminIssuesList() {
//   const navigate = useNavigate();
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // 🚀 1. جلب الشكاوى من الـ API الحقيقي
//   const fetchIssues = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/issues', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       setIssues(response.data);
//     } catch (error) {
//       console.error("Error fetching issues:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchIssues();
//   }, []);

//   // 🚀 2. دالة تحديث حالة الشكوى (API Update Status)
//   const handleUpdateStatus = async (issueId, currentStatus) => {
//     // عرض قائمة خيارات لتغيير الحالة بشكل شيك بـ SweetAlert
//     const { value: newStatus } = await Swal.fire({
//       title: 'تحديث حالة البلاغ',
//       input: 'select',
//       inputOptions: {
//         'Open': 'مفتوح (Open)',
//         'In-progress': 'جاري العمل عليها (In-progress)',
//         'Resolved': 'تم الحل بنجاح (Resolved)'
//       },
//       inputValue: currentStatus,
//       inputPlaceholder: 'اختر الحالة الجديدة',
//       showCancelButton: true,
//       cancelButtonText: 'إلغاء',
//       confirmButtonText: 'تحديث',
//       confirmButtonColor: '#04332D',
//       customClass: { popup: 'rounded-xl' }
//     });

//     if (newStatus && newStatus !== currentStatus) {
//       try {
//         const token = localStorage.getItem('token');
//         // تأكد من مسار الـ PUT لتحديث الحالة عندك في الباك إند (هنا بنبعت الـ status في الـ body)
//         await axios.put(`http://localhost:3000/api/issues/${issueId}`, { 
//           status: newStatus 
//         }, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         Swal.fire({
//           icon: 'success',
//           title: 'تم التحديث!',
//           text: 'تم تغيير حالة البلاغ بنجاح.',
//           timer: 1500,
//           showConfirmButton: false
//         });

//         // إعادة جلب الداتا لتحديث الجدول فوراً
//         fetchIssues();
//       } catch (error) {
//         console.error("Error updating status:", error);
//         Swal.fire({
//           icon: 'error',
//           title: 'فشل التحديث',
//           text: error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.'
//         });
//       }
//     }
//   };

//   // تلوين حالات الشكوى (Status)
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'Open':
//         return 'text-blue-600 bg-blue-50 border-blue-200';
//       case 'In-progress':
//         return 'text-purple-600 bg-purple-50 border-purple-200';
//       case 'Resolved':
//         return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       default:
//         return 'text-gray-600 bg-gray-50';
//     }
//   };

//   // فلترة الشكاوى بناءً على بحث العنوان أو المكان
//   const filteredIssues = issues.filter(issue => 
//     issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//         <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E9E8] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#04332D] text-white p-2.5 rounded-lg">
//               <ClipboardList size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-[#0F2925]">عرض وإدارة البلاغات</h1>
//               <p className="text-xs text-gray-400 font-medium">متابعة كافة المشاكل المقدمة من المواطنين وتوزيعها وتحديث حالاتها.</p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
//           >
//             <span>العودة للوحة التحكم</span>
//             <ArrowRight size={15} />
//           </button>
//         </div>

//         {/* 🔍 شريط البحث السريع */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E9E8] mb-6 flex items-center relative">
//           <span className="absolute right-7 text-gray-400">
//             <Search size={18} />
//           </span>
//           <input
//             type="text"
//             placeholder="ابحث عن بلاغ بالعنوان أو الموقع..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//           />
//         </div>

//         {/* 📋 جدول البلاغات الاحترافي */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#E5E9E8] overflow-hidden">
//           {filteredIssues.length === 0 ? (
//             <div className="p-12 text-center text-gray-400 text-sm font-medium">
//               لا توجد بلاغات مسجلة حالياً أو مطابقة للبحث.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-right border-collapse">
//                 <thead>
//                   <tr className="bg-[#F8FAFA] border-b border-[#E5E9E8] text-gray-500 text-xs font-bold">
//                     <th className="p-4">عنوان البلاغ</th>
//                     <th className="p-4">الموقع</th>
//                     <th className="p-4">الخطورة</th>
//                     <th className="p-4">الحالة</th>
//                     <th className="p-4 text-center">الإجراءات</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {filteredIssues.map((issue) => (
//                     <tr key={issue._id} className="hover:bg-gray-50/70 transition-colors">
//                       {/* العنوان والوصف المصغر */}
//                       <td className="p-4">
//                         <div className="font-bold text-[#0F2925]">{issue.title}</div>
//                         <div className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{issue.description || 'لا يوجد وصف'}</div>
//                       </td>
                      
//                       {/* الموقع */}
//                       <td className="p-4 text-gray-500 font-medium">
//                         <div className="flex items-center gap-1.5 text-xs">
//                           <MapPin size={14} className="text-gray-400" />
//                           <span>{issue.location}</span>
//                         </div>
//                       </td>
                      
//                       {/* الخطورة */}
//                       <td className="p-4">
//                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                           issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
//                         }`}>
//                           {issue.severity || 'Low'}
//                         </span>
//                       </td>

//                       {/* الحالة */}
//                       <td className="p-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(issue.status)}`}>
//                           <span>{issue.status === 'Open' ? 'مفتوح' : issue.status === 'In-progress' ? 'قيد العمل' : 'تم الحل'}</span>
//                         </span>
//                       </td>
                      
//                       {/* زر الإجراءات (تعديل الحالة) */}
//                       <td className="p-4 text-center">
//                         <button
//                           onClick={() => handleUpdateStatus(issue._id, issue.status)}
//                           className="inline-flex items-center gap-1 text-xs font-bold bg-[#04332D] hover:bg-[#032420] text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
//                         >
//                           <RefreshCw size={13} />
//                           <span>تعديل الحالة</span>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default AdminIssuesList;