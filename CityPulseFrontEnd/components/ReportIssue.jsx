import React, { useState } from 'react';
import { AlertTriangle, MapPin, AlignLeft, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

function ReportIssue() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(''); // Default severity ('' means not selected default is => 'Low' see backend model)

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Submitting report...',
      text: 'Please wait while we log the issue',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-xl' }
    });

    try {
      // 1️⃣ قراءة التوكن المخزن في الخزنة عشان نثبت شخصية اليوزر
      const token = localStorage.getItem('token');

      // 2️⃣ إرسال الداتا للباك إند مع التوكن في الـ Headers
      await axios.post('http://localhost:3000/api/issues', {
        title,
        location,
        description,
        severity
      }, {
        headers: {
          Authorization: `Bearer ${token}` // <-- المفتاح اللي هيعرف الباك إند مين اليوزر ده
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Issue Reported!',
        text: 'Thank you. The issue has been logged successfully and assigned to the technical team.',
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });

      // تفريغ الحقول بعد النجاح
      setTitle('');
      setLocation('');
      setDescription('');
      setSeverity('');

    } catch (error) {
      console.error('Error reporting issue:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit report. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: errorMsg,
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* اليسار: فورم البلاغ (يأخذ مساحة 2 من 3) */}
        <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8 md:col-span-2">
          <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
            <div className="text-[#04332D]">
              <AlertTriangle size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F2925] tracking-tight">Report a New Issue</h1>
              <p className="text-xs text-gray-500 font-medium">Help us keep the city infrastructure safe and running.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. عنوان المشكلة */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Issue Title</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <FileText size={18} />
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water pipe leakage, Power outage"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* 2. المكان */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Location / Sector</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sector 4, North District, Main St."
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* 3. درجة الخطورة (Severity) */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-2">Severity Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'Critical'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      severity === level
                        ? level === 'Low'
                          ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                          : level === 'Medium'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
                          : 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                        : 'bg-[#F8FAFA] border-[#D1DCDA] text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. تفاصيل المشكلة (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">
                Description <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-gray-400">
                  <AlignLeft size={18} />
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue (if any)..."
                  rows="4"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm resize-none"
                ></textarea>
              </div>
            </div>

            {/* زر الإرسال */}
            <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-sm mt-2">
              <CheckCircle size={16} />
              <span>Submit Report</span>
            </button>
          </form>
        </div>

        {/* اليمين: الجزء الجانبي للإرشادات */}
        <div className="bg-[#04332D] text-white rounded-xl p-8 flex flex-col justify-between shadow-md">
          <div>
            <div className="text-emerald-400 mb-4">
              <ShieldAlert size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold mb-2 tracking-tight">Reporting Guide</h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Please make sure to provide accurate locations and set the appropriate severity level so our teams can act fast.
            </p>

            <ul className="space-y-4 text-xs font-medium text-gray-200">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Low:</strong> Cosmetic damages or non-urgent matters.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Medium:</strong> System malfunction affecting a small area.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Critical:</strong> Immediate hazard or major public failure.</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-emerald-900/50 pt-4 mt-6">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block mb-1">CityPulse Security</span>
            <p className="text-[11px] text-gray-300 leading-snug">
              Every reported issue logs your employee ID and system timestamp automatically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReportIssue;