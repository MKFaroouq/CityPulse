import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, AlignLeft, ShieldAlert, CheckCircle, FileText, LogOut, LayoutDashboard, Image as ImageIcon, Upload, Navigation } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// 🌍 1. Import Leaflet components
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// 🚨 2. Import Leaflet CSS and setup default marker
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 🏙️ Predefined Cascading Data for Governorates and Areas
const EGYPT_REGIONS = {
  "Cairo": ["Heliopolis", "Nasr City", "5th Settlement", "Downtown", "Shubra"],
  "Giza": ["Dokki", "Mohandessin", "Haram", "6th of October", "Sheikh Zayed"],
  "Alexandria": ["Smouha", "Moharam Bek", "Montaza", "Stanley", "El Agamy"]
};

function ReportIssue() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let isAdmin = false;

  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      isAdmin = payload.role === 'admin';
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been logged out successfully.',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
    navigate('/Login');
  };

  // Basic Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(''); 
  const [image, setImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(''); 
  
  // Dependent Dropdowns States
  const [selectedGovernorate, setSelectedGovernorate] = useState(''); 
  const [selectedArea, setSelectedArea] = useState(''); 

  // Map Coordinates States
  const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]); 
  const [markerPosition, setMarkerPosition] = useState(null);

  // 🚀 دالة جلب الـ GPS والتحكم بالخريطة تلقائياً
  const autoFetchGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log("GPS automatic detection declined or unavailable.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // ⏱️ تشغيل الـ GPS تلقائياً فور تحميل الصفحة للمستخدم
  useEffect(() => {
    autoFetchGPS();
  }, []);

  // 🎯 مكوّن لمراقبة الضغط اليدوي وتحديث مركز الخريطة التلقائي
  const MapRecenterAndClickHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      if (markerPosition) {
        map.flyTo(markerPosition, 14);
      }
    }, [markerPosition, map]);

    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handleGovernorateChange = (e) => {
    setSelectedGovernorate(e.target.value);
    setSelectedArea(''); 
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGovernorate || !selectedArea) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select both Governorate and Area.' });
      return;
    }

    Swal.fire({
      title: 'Submitting report...',
      text: 'Please wait while we log the issue and upload assets',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-xl' }
    });

    try {
      const formData = new FormData();
      formData.append('title', title);
      
      const fullLocationString = `${selectedGovernorate} - ${selectedArea}`;
      formData.append('location', fullLocationString); 
      
      formData.append('description', description);
      formData.append('severity', severity);
      
      // 🛠️ التعديل هنا: نرسل خطوط الطول والعرض منفصلة تماماً ومباشرة
      // السيرفر سيستقبلهم في req.body.latitude و req.body.longitude بدون مشاكل الـ Object
      if (markerPosition && markerPosition[0] && markerPosition[1]) {
        formData.append('latitude', markerPosition[0]);
        formData.append('longitude', markerPosition[1]);
      }

      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:3000/api/issues', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Issue Reported!',
        text: 'Thank you. The issue has been logged successfully with assets.',
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });

      setTitle('');
      setSelectedGovernorate('');
      setSelectedArea('');
      setDescription('');
      setSeverity('');
      setImage(null);
      setPreviewUrl('');
      setMarkerPosition(null);

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
        
        {/* Left Side: Form */}
        <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8 md:col-span-2" dir="ltr">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="text-[#04332D]">
                <AlertTriangle size={32} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F2925] tracking-tight">Report a New Issue</h1>
                <p className="text-xs text-gray-500 font-medium">Help us keep the city infrastructure safe and running.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/admin-dashboard')}
                  className="flex items-center justify-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold border border-red-200 transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Title */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Issue Title</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <FileText size={18} />
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water pipe leakage, Power outage..."
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* 🏙️ 2. Governorate & Area (Cascading Dropdowns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Governorate */}
              <div>
                <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Governorate</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <MapPin size={18} />
                  </span>
                  <select
                    value={selectedGovernorate}
                    onChange={handleGovernorateChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select Governorate --</option>
                    {Object.keys(EGYPT_REGIONS).map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Area */}
              <div>
                <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Area / District</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <MapPin size={18} />
                  </span>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedGovernorate} 
                    required
                  >
                    <option value="" disabled>-- Select Area --</option>
                    {selectedGovernorate && EGYPT_REGIONS[selectedGovernorate].map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 🌍 3. Interactive Map (With Live Coordinates Output) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#1E3A37]">
                  Pin Location on Map <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={autoFetchGPS}
                  className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2 py-1 rounded border border-emerald-200 transition-all"
                >
                  <Navigation size={10} />
                  <span>Locate Me (GPS)</span>
                </button>
              </div>
              <div 
                className="w-full rounded-lg overflow-hidden border border-[#D1DCDA] shadow-inner z-0"
                style={{ height: '250px' }}
              >
                <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <MapRecenterAndClickHandler />
                </MapContainer>
              </div>
              
              {/* طباعة الإحداثيات الحالية للمواطن */}
              {markerPosition && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2 flex items-center justify-between">
                  <p className="text-xs text-emerald-800 font-bold">
                    🎯 Location Selected Successfully!
                  </p>
                  <p className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                    Lat: <span className="text-emerald-600 font-bold">{markerPosition[0].toFixed(5)}</span> | Lng: <span className="text-emerald-600 font-bold">{markerPosition[1].toFixed(5)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* 4. Severity Level */}
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

            {/* 📸 5. Image Upload & Preview */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Evidence Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFA] border border-dashed border-[#D1DCDA] rounded-lg p-4 transition-all hover:bg-gray-50/50 justify-between">
                <label className="flex items-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer">
                  <Upload size={14} />
                  <span>Choose Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                
                {previewUrl ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ImageIcon size={14} />
                    <span>No image uploaded yet</span>
                  </span>
                )}
              </div>
            </div>

            {/* 6. Description */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Description</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-gray-400 pointer-events-none">
                  <AlignLeft size={18} />
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue (if any)..."
                  rows="2"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-sm mt-2">
              <CheckCircle size={16} />
              <span className="pl-2">Submit Report Now</span>
            </button>
          </form>
        </div>

        {/* Right Side: Guide Info Panel */}
        <div className="bg-[#04332D] text-white rounded-xl p-8 flex flex-col justify-between shadow-md" dir="ltr">
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
// import React, { useState } from 'react';
// import { AlertTriangle, MapPin, AlignLeft, ShieldAlert, CheckCircle, FileText, LogOut, LayoutDashboard, Image as ImageIcon, Upload } from 'lucide-react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';

// // 🌍 1. Import Leaflet components
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// // 🚨 2. Import Leaflet CSS and setup default marker
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // 🏙️ Predefined Cascading Data for Governorates and Areas
// const EGYPT_REGIONS = {
//   "Cairo": ["Heliopolis", "Nasr City", "5th Settlement", "Downtown", "Shubra"],
//   "Giza": ["Dokki", "Mohandessin", "Haram", "6th of October", "Sheikh Zayed"],
//   "Alexandria": ["Smouha", "Moharam Bek", "Montaza", "Stanley", "El Agamy"]
// };

// function ReportIssue() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   let isAdmin = false;

//   if (token) {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const payload = JSON.parse(window.atob(base64));
//       isAdmin = payload.role === 'admin';
//     } catch (e) {
//       console.error("Error decoding token:", e);
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     Swal.fire({
//       icon: 'success',
//       title: 'Logged Out',
//       text: 'You have been logged out successfully.',
//       timer: 1500,
//       showConfirmButton: false,
//       customClass: { popup: 'rounded-xl' }
//     });
//     navigate('/');
//   };

//   // Basic Form States
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [severity, setSeverity] = useState(''); 
//   const [image, setImage] = useState(null); 
//   const [previewUrl, setPreviewUrl] = useState(''); 
  
//   // Dependent Dropdowns States
//   const [selectedGovernorate, setSelectedGovernorate] = useState(''); 
//   const [selectedArea, setSelectedArea] = useState(''); 

//   // Map Coordinates States
//   const [mapCenter] = useState([30.0444, 31.2357]); 
//   const [markerPosition, setMarkerPosition] = useState(null);

//   // 🎯 component to handle map click events and save location coordinates
//   const MapClickHandler = () => {
//     useMapEvents({
//       click(e) {
//         setMarkerPosition([e.latlng.lat, e.latlng.lng]);
//       },
//     });
//     return markerPosition ? <Marker position={markerPosition} /> : null;
//   };

//   const handleGovernorateChange = (e) => {
//     setSelectedGovernorate(e.target.value);
//     setSelectedArea(''); 
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedGovernorate || !selectedArea) {
//       Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select both Governorate and Area.' });
//       return;
//     }

//     Swal.fire({
//       title: 'Submitting report...',
//       text: 'Please wait while we log the issue and upload assets',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); },
//       customClass: { popup: 'rounded-xl' }
//     });

//     try {
//       const formData = new FormData();
//       formData.append('title', title);
      
//       const fullLocationString = `${selectedGovernorate} - ${selectedArea}`;
//       formData.append('location', fullLocationString); 
      
//       formData.append('description', description);
//       formData.append('severity', severity);
      
//       if (markerPosition) {
//         formData.append('coordinates', JSON.stringify({
//           lat: markerPosition[0],
//           lng: markerPosition[1]
//         }));
//       }

//       if (image) {
//         formData.append('image', image);
//       }

//       await axios.post('http://localhost:3000/api/issues', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Issue Reported!',
//         text: 'Thank you. The issue has been logged successfully with assets.',
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });

//       setTitle('');
//       setSelectedGovernorate('');
//       setSelectedArea('');
//       setDescription('');
//       setSeverity('');
//       setImage(null);
//       setPreviewUrl('');
//       setMarkerPosition(null);

//     } catch (error) {
//       console.error('Error reporting issue:', error);
//       const errorMsg = error.response?.data?.message || 'Failed to submit report. Please try again.';
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: errorMsg,
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased flex items-center justify-center">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
//         {/* Left Side: Form */}
//         <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8 md:col-span-2" dir="ltr">
          
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-gray-100 pb-4 gap-4">
//             <div className="flex items-center space-x-3">
//               <div className="text-[#04332D]">
//                 <AlertTriangle size={32} strokeWidth={2} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-[#0F2925] tracking-tight">Report a New Issue</h1>
//                 <p className="text-xs text-gray-500 font-medium">Help us keep the city infrastructure safe and running.</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 self-start sm:self-auto">
//               {isAdmin && (
//                 <button
//                   type="button"
//                   onClick={() => navigate('/admin-dashboard')}
//                   className="flex items-center justify-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
//                 >
//                   <LayoutDashboard size={15} />
//                   <span>Dashboard</span>
//                 </button>
//               )}

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold border border-red-200 transition-all cursor-pointer"
//               >
//                 <LogOut size={15} />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* 1. Title */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Issue Title</label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                   <FileText size={18} />
//                 </span>
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="e.g. Water pipe leakage, Power outage..."
//                   className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//                   required
//                 />
//               </div>
//             </div>

//             {/* 🏙️ 2. Governorate & Area (Cascading Dropdowns) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* Select Governorate */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Governorate</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedGovernorate}
//                     onChange={handleGovernorateChange}
//                     className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer"
//                     required
//                   >
//                     <option value="" disabled>-- Select Governorate --</option>
//                     {Object.keys(EGYPT_REGIONS).map((gov) => (
//                       <option key={gov} value={gov}>{gov}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Select Area */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Area / District</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedArea}
//                     onChange={(e) => setSelectedArea(e.target.value)}
//                     className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={!selectedGovernorate} 
//                     required
//                   >
//                     <option value="" disabled>-- Select Area --</option>
//                     {selectedGovernorate && EGYPT_REGIONS[selectedGovernorate].map((area) => (
//                       <option key={area} value={area}>{area}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* 🌍 3. Interactive Map (With Live Coordinates Output) */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">
//                 Pin Location on Map <span className="text-xs text-gray-400 font-normal">(Optional)</span>
//               </label>
//               <div 
//                 className="w-full rounded-lg overflow-hidden border border-[#D1DCDA] shadow-inner z-0"
//                 style={{ height: '250px' }}
//               >
//                 <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; OpenStreetMap contributors'
//                   />
//                   <MapClickHandler />
//                 </MapContainer>
//               </div>
              
//               {/* 🎯 هنا السطر السحري اللي بيطبع خطوط الطول والعرض بالأرقام فوراً أول ما تدوس على الخريطة */}
//               {markerPosition && (
//                 <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2 flex items-center justify-between">
//                   <p className="text-xs text-emerald-800 font-bold">
//                     🎯 Location Selected Successfully!
//                   </p>
//                   <p className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
//                     Lat: <span className="text-emerald-600 font-bold">{markerPosition[0].toFixed(5)}</span> | Lng: <span className="text-emerald-600 font-bold">{markerPosition[1].toFixed(5)}</span>
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* 4. Severity Level */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-2">Severity Level</label>
//               <div className="grid grid-cols-3 gap-3">
//                 {['Low', 'Medium', 'Critical'].map((level) => (
//                   <button
//                     key={level}
//                     type="button"
//                     onClick={() => setSeverity(level)}
//                     className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
//                       severity === level
//                         ? level === 'Low'
//                           ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
//                           : level === 'Medium'
//                           ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
//                           : 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
//                         : 'bg-[#F8FAFA] border-[#D1DCDA] text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {level}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* 📸 5. Image Upload & Preview */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Evidence Image</label>
//               <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFA] border border-dashed border-[#D1DCDA] rounded-lg p-4 transition-all hover:bg-gray-50/50 justify-between">
//                 <label className="flex items-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer">
//                   <Upload size={14} />
//                   <span>Choose Image</span>
//                   <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                 </label>
                
//                 {previewUrl ? (
//                   <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
//                     <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
//                   </div>
//                 ) : (
//                   <span className="text-xs text-gray-400 flex items-center gap-1">
//                     <ImageIcon size={14} />
//                     <span>No image uploaded yet</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* 6. Description */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Description</label>
//               <div className="relative">
//                 <span className="absolute top-3 left-3.5 text-gray-400 pointer-events-none">
//                   <AlignLeft size={18} />
//                 </span>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Provide detailed information about the issue (if any)..."
//                   rows="2"
//                   className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm resize-none"
//                 ></textarea>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-sm mt-2">
//               <CheckCircle size={16} />
//               <span className="pl-2">Submit Report Now</span>
//             </button>
//           </form>
//         </div>

//         {/* Right Side: Guide Info Panel */}
//         <div className="bg-[#04332D] text-white rounded-xl p-8 flex flex-col justify-between shadow-md" dir="ltr">
//           <div>
//             <div className="text-emerald-400 mb-4">
//               <ShieldAlert size={40} strokeWidth={1.5} />
//             </div>
//             <h2 className="text-lg font-bold mb-2 tracking-tight">Reporting Guide</h2>
//             <p className="text-xs text-gray-300 leading-relaxed mb-6">
//               Please make sure to provide accurate locations and set the appropriate severity level so our teams can act fast.
//             </p>

//             <ul className="space-y-4 text-xs font-medium text-gray-200">
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Low:</strong> Cosmetic damages or non-urgent matters.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Medium:</strong> System malfunction affecting a small area.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Critical:</strong> Immediate hazard or major public failure.</span>
//               </li>
//             </ul>
//           </div>

//           <div className="border-t border-emerald-900/50 pt-4 mt-6">
//             <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block mb-1">CityPulse Security</span>
//             <p className="text-[11px] text-gray-300 leading-snug">
//               Every reported issue logs your employee ID and system timestamp automatically.
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default ReportIssue;

// import React, { useState } from 'react';
// import { AlertTriangle, MapPin, AlignLeft, ShieldAlert, CheckCircle, FileText, LogOut, LayoutDashboard, Image as ImageIcon, Upload } from 'lucide-react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';

// // 🌍 1. استيراد مكونات الخريطة (Leaflet)
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// // 🚨 2. استيراد الـ CSS الخاص بالخريطة وضبط المتغيرات
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'; // 🎯 تم تعديلها هنا لتجنب خطأ الـ Vite السابق

// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // 🏙️ هيكل البيانات الديناميكي للمحافظات والمناطق
// const EGYPT_REGIONS = {
//   "القاهرة": ["مصر الجديدة", "مدينة نصر", "التجمع الخامس", "وسط البلد", "شبرا"],
//   "الجيزة": ["الدقي", "المهندسين", "الهرم", "أكتوبر", "الشيخ زايد"],
//   "الإسكندرية": ["سموحة", "محرم بك", "المنتزه", "ستانلي", "العجمي"]
// };

// function ReportIssue() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   let isAdmin = false;

//   if (token) {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const payload = JSON.parse(window.atob(base64));
//       isAdmin = payload.role === 'admin';
//     } catch (e) {
//       console.error("Error decoding token:", e);
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     Swal.fire({
//       icon: 'success',
//       title: 'Logged Out',
//       text: 'You have been logged out successfully.',
//       timer: 1500,
//       showConfirmButton: false,
//       customClass: { popup: 'rounded-xl' }
//     });
//     navigate('/');
//   };

//   // States الفورم الأساسية
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [severity, setSeverity] = useState(''); 
//   const [image, setImage] = useState(null); 
//   const [previewUrl, setPreviewUrl] = useState(''); 
  
//   // 🗺️ States القوائم المتتالية الجديدة
//   const [selectedGovernorate, setSelectedGovernorate] = useState(''); // المحافظة المختارة
//   const [selectedArea, setSelectedArea] = useState(''); // المنطقة المختارة

//   // 📍 إحداثيات الخريطة
//   const [mapCenter] = useState([30.0444, 31.2357]); 
//   const [markerPosition, setMarkerPosition] = useState(null);

//   const MapClickHandler = () => {
//     useMapEvents({
//       click(e) {
//         setMarkerPosition([e.latlng.lat, e.latlng.lng]);
//       },
//     });
//     return markerPosition ? <Marker position={markerPosition} /> : null;
//   };

//   // معالجة تغيير المحافظة وتصفير المنطقة أوتوماتيكياً
//   const handleGovernorateChange = (e) => {
//     setSelectedGovernorate(e.target.value);
//     setSelectedArea(''); // تصفير المنطقة القديمة فوراً عند تغيير المحافظة
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedGovernorate || !selectedArea) {
//       Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'الرجاء اختيار المحافظة والمنطقة بالكامل.' });
//       return;
//     }

//     Swal.fire({
//       title: 'Submitting report...',
//       text: 'Please wait while we log the issue and upload assets',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); },
//       customClass: { popup: 'rounded-xl' }
//     });

//     try {
//       const formData = new FormData();
//       formData.append('title', title);
      
//       // دمج المحافظة والمنطقة لإرسالهم في حقل الـ location للباك إند
//       const fullLocationString = `${selectedGovernorate} - ${selectedArea}`;
//       formData.append('location', fullLocationString); 
      
//       formData.append('description', description);
//       formData.append('severity', severity);
      
//       if (markerPosition) {
//         formData.append('coordinates', JSON.stringify({
//           lat: markerPosition[0],
//           lng: markerPosition[1]
//         }));
//       }

//       if (image) {
//         formData.append('image', image);
//       }

//       await axios.post('http://localhost:3000/api/issues', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Issue Reported!',
//         text: 'Thank you. The issue has been logged successfully with assets.',
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });

//       setTitle('');
//       setSelectedGovernorate('');
//       setSelectedArea('');
//       setDescription('');
//       setSeverity('');
//       setImage(null);
//       setPreviewUrl('');
//       setMarkerPosition(null);

//     } catch (error) {
//       console.error('Error reporting issue:', error);
//       const errorMsg = error.response?.data?.message || 'Failed to submit report. Please try again.';
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: errorMsg,
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased flex items-center justify-center">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
//         {/* اليسار: فورم البلاغ */}
//         <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8 md:col-span-2" dir="rtl">
          
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-gray-100 pb-4 gap-4" dir="ltr">
//             <div className="flex items-center space-x-3">
//               <div className="text-[#04332D]">
//                 <AlertTriangle size={32} strokeWidth={2} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-[#0F2925] tracking-tight">Report a New Issue</h1>
//                 <p className="text-xs text-gray-500 font-medium">Help us keep the city infrastructure safe and running.</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 self-start sm:self-auto">
//               {isAdmin && (
//                 <button
//                   type="button"
//                   onClick={() => navigate('/admin-dashboard')}
//                   className="flex items-center justify-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
//                 >
//                   <LayoutDashboard size={15} />
//                   <span>Dashboard</span>
//                 </button>
//               )}

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold border border-red-200 transition-all cursor-pointer"
//               >
//                 <LogOut size={15} />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* 1. عنوان المشكلة */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">عنوان البلاغ</label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
//                   <FileText size={18} />
//                 </span>
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="مثال: تسريب مياه، عمود إنارة مكسور..."
//                   className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm text-right"
//                   required
//                 />
//               </div>
//             </div>

//             {/* 🏙️ 2. اختيار المحافظة والمنطقة (Dropdowns المتتالية) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* اختيار المحافظة */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">المحافظة</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedGovernorate}
//                     onChange={handleGovernorateChange}
//                     className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer text-right"
//                     required
//                   >
//                     <option value="" disabled>-- اختر المحافظة --</option>
//                     {Object.keys(EGYPT_REGIONS).map((gov) => (
//                       <option key={gov} value={gov}>{gov}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* اختيار المنطقة بناءً على المحافظة فوق */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">المنطقة / الحي</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedArea}
//                     onChange={(e) => setSelectedArea(e.target.value)}
//                     className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer text-right disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={!selectedGovernorate} // تجميد الاختيار لحد ما يختار المحافظة أولاً
//                     required
//                   >
//                     <option value="" disabled>-- اختر المنطقة --</option>
//                     {selectedGovernorate && EGYPT_REGIONS[selectedGovernorate].map((area) => (
//                       <option key={area} value={area}>{area}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* 🌍 3. الخريطة التفاعلية */}
//             <div dir="ltr">
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">
//                 تحديد النقطة على الخريطة <span className="text-xs text-gray-400 font-normal">(اختياري)</span>
//               </label>
//               <div 
//                 className="w-full rounded-lg overflow-hidden border border-[#D1DCDA] shadow-inner z-0"
//                 style={{ height: '250px' }}
//               >
//                 <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; OpenStreetMap contributors'
//                   />
//                   <MapClickHandler />
//                 </MapContainer>
//               </div>
//               {markerPosition && (
//                 <p className="text-[11px] text-emerald-600 font-bold mt-1 text-right" dir="rtl">
//                   🎯 تم تحديد الإحداثيات الجغرافية بنجاح!
//                 </p>
//               )}
//             </div>

//             {/* 4. درجة الخطورة */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-2 text-right">درجة الخطورة</label>
//               <div className="grid grid-cols-3 gap-3">
//                 {['Low', 'Medium', 'Critical'].map((level) => (
//                   <button
//                     key={level}
//                     type="button"
//                     onClick={() => setSeverity(level)}
//                     className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
//                       severity === level
//                         ? level === 'Low'
//                           ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
//                           : level === 'Medium'
//                           ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
//                           : 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
//                         : 'bg-[#F8FAFA] border-[#D1DCDA] text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {level === 'Low' ? 'منخفضة' : level === 'Medium' ? 'متوسطة' : 'حرجة'}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* 📸 5. حقل رفع ومعاينة الصور */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">إرفاق صورة الدليل</label>
//               <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFA] border border-dashed border-[#D1DCDA] rounded-lg p-4 transition-all hover:bg-gray-50/50 justify-between">
//                 <label className="flex items-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer">
//                   <Upload size={14} />
//                   <span>اختر صورة</span>
//                   <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                 </label>
                
//                 {previewUrl ? (
//                   <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
//                     <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
//                   </div>
//                 ) : (
//                   <span className="text-xs text-gray-400 flex items-center gap-1">
//                     <ImageIcon size={14} />
//                     <span>لم يتم رفع صورة بعد</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* 6. تفاصيل المشكلة */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5 text-right">تفاصيل وشرح البلاغ</label>
//               <div className="relative">
//                 <span className="absolute top-3 right-3.5 text-gray-400 pointer-events-none">
//                   <AlignLeft size={18} />
//                 </span>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="اكتب هنا أي تفاصيل إضافية عن المشكلة إن وجدت..."
//                   rows="2"
//                   className="w-full pr-11 pl-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm resize-none text-right"
//                 ></textarea>
//               </div>
//             </div>

//             {/* زر الإرسال */}
//             <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-sm mt-2">
//               <CheckCircle size={16} className="ml-2" />
//               <span>إرسال البلاغ الآن</span>
//             </button>
//           </form>
//         </div>

//         {/* اليمين: الجزء الجانبي للإرشادات */}
//         <div className="bg-[#04332D] text-white rounded-xl p-8 flex flex-col justify-between shadow-md">
//           <div>
//             <div className="text-emerald-400 mb-4">
//               <ShieldAlert size={40} strokeWidth={1.5} />
//             </div>
//             <h2 className="text-lg font-bold mb-2 tracking-tight">Reporting Guide</h2>
//             <p className="text-xs text-gray-300 leading-relaxed mb-6">
//               Please make sure to provide accurate locations and set the appropriate severity level so our teams can act fast.
//             </p>

//             <ul className="space-y-4 text-xs font-medium text-gray-200">
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Low:</strong> Cosmetic damages or non-urgent matters.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Medium:</strong> System malfunction affecting a small area.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Critical:</strong> Immediate hazard or major public failure.</span>
//               </li>
//             </ul>
//           </div>

//           <div className="border-t border-emerald-900/50 pt-4 mt-6">
//             <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block mb-1">CityPulse Security</span>
//             <p className="text-[11px] text-gray-300 leading-snug">
//               Every reported issue logs your employee ID and system timestamp automatically.
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default ReportIssue;

// import React, { useState } from 'react';
// import { AlertTriangle, MapPin, AlignLeft, ShieldAlert, CheckCircle, FileText, LogOut, LayoutDashboard, Image as ImageIcon, Upload } from 'lucide-react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';

// // 🌍 1. Import Leaflet components
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// // 🚨 2. Import Leaflet CSS and setup default marker
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // 🏙️ Predefined Cascading Data for Governorates and Areas
// const EGYPT_REGIONS = {
//   "Cairo": ["Heliopolis", "Nasr City", "5th Settlement", "Downtown", "Shubra"],
//   "Giza": ["Dokki", "Mohandessin", "Haram", "6th of October", "Sheikh Zayed"],
//   "Alexandria": ["Smouha", "Moharam Bek", "Montaza", "Stanley", "El Agamy"]
// };

// function ReportIssue() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   let isAdmin = false;

//   if (token) {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const payload = JSON.parse(window.atob(base64));
//       isAdmin = payload.role === 'admin';
//     } catch (e) {
//       console.error("Error decoding token:", e);
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     Swal.fire({
//       icon: 'success',
//       title: 'Logged Out',
//       text: 'You have been logged out successfully.',
//       timer: 1500,
//       showConfirmButton: false,
//       customClass: { popup: 'rounded-xl' }
//     });
//     navigate('/');
//   };

//   // Basic Form States
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [severity, setSeverity] = useState(''); 
//   const [image, setImage] = useState(null); 
//   const [previewUrl, setPreviewUrl] = useState(''); 
  
//   // Dependent Dropdowns States
//   const [selectedGovernorate, setSelectedGovernorate] = useState(''); 
//   const [selectedArea, setSelectedArea] = useState(''); 

//   // Map Coordinates States
//   const [mapCenter] = useState([30.0444, 31.2357]); 
//   const [markerPosition, setMarkerPosition] = useState(null);

//   const MapClickHandler = () => {
//     useMapEvents({
//       click(e) {
//         setMarkerPosition([e.latlng.lat, e.latlng.lng]);
//       },
//     });
//     return markerPosition ? <Marker position={markerPosition} /> : null;
//   };

//   const handleGovernorateChange = (e) => {
//     setSelectedGovernorate(e.target.value);
//     setSelectedArea(''); 
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedGovernorate || !selectedArea) {
//       Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select both Governorate and Area.' });
//       return;
//     }

//     Swal.fire({
//       title: 'Submitting report...',
//       text: 'Please wait while we log the issue and upload assets',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); },
//       customClass: { popup: 'rounded-xl' }
//     });

//     try {
//       const formData = new FormData();
//       formData.append('title', title);
      
//       const fullLocationString = `${selectedGovernorate} - ${selectedArea}`;
//       formData.append('location', fullLocationString); 
      
//       formData.append('description', description);
//       formData.append('severity', severity);
      
//       if (markerPosition) {
//         formData.append('coordinates', JSON.stringify({
//           lat: markerPosition[0],
//           lng: markerPosition[1]
//         }));
//       }

//       if (image) {
//         formData.append('image', image);
//       }

//       await axios.post('http://localhost:3000/api/issues', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Issue Reported!',
//         text: 'Thank you. The issue has been logged successfully with assets.',
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });

//       setTitle('');
//       setSelectedGovernorate('');
//       setSelectedArea('');
//       setDescription('');
//       setSeverity('');
//       setImage(null);
//       setPreviewUrl('');
//       setMarkerPosition(null);

//     } catch (error) {
//       console.error('Error reporting issue:', error);
//       const errorMsg = error.response?.data?.message || 'Failed to submit report. Please try again.';
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: errorMsg,
//         confirmButtonColor: '#04332D',
//         customClass: { popup: 'rounded-xl' }
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F4F7F6] p-6 font-sans antialiased flex items-center justify-center">
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
//         {/* Left Side: Form */}
//         <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-8 md:col-span-2" dir="ltr">
          
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-gray-100 pb-4 gap-4">
//             <div className="flex items-center space-x-3">
//               <div className="text-[#04332D]">
//                 <AlertTriangle size={32} strokeWidth={2} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-[#0F2925] tracking-tight">Report a New Issue</h1>
//                 <p className="text-xs text-gray-500 font-medium">Help us keep the city infrastructure safe and running.</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 self-start sm:self-auto">
//               {isAdmin && (
//                 <button
//                   type="button"
//                   onClick={() => navigate('/admin-dashboard')}
//                   className="flex items-center justify-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
//                 >
//                   <LayoutDashboard size={15} />
//                   <span>Dashboard</span>
//                 </button>
//               )}

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold border border-red-200 transition-all cursor-pointer"
//               >
//                 <LogOut size={15} />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* 1. Title */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Issue Title</label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                   <FileText size={18} />
//                 </span>
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="e.g. Water pipe leakage, Power outage..."
//                   className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
//                   required
//                 />
//               </div>
//             </div>

//             {/* 🏙️ 2. Governorate & Area (Cascading Dropdowns) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* Select Governorate */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Governorate</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedGovernorate}
//                     onChange={handleGovernorateChange}
//                     className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer"
//                     required
//                   >
//                     <option value="" disabled>-- Select Governorate --</option>
//                     {Object.keys(EGYPT_REGIONS).map((gov) => (
//                       <option key={gov} value={gov}>{gov}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Select Area */}
//               <div>
//                 <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Area / District</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
//                     <MapPin size={18} />
//                   </span>
//                   <select
//                     value={selectedArea}
//                     onChange={(e) => setSelectedArea(e.target.value)}
//                     className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                     disabled={!selectedGovernorate} 
//                     required
//                   >
//                     <option value="" disabled>-- Select Area --</option>
//                     {selectedGovernorate && EGYPT_REGIONS[selectedGovernorate].map((area) => (
//                       <option key={area} value={area}>{area}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* 🌍 3. Interactive Map */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">
//                 Pin Location on Map <span className="text-xs text-gray-400 font-normal">(Optional)</span>
//               </label>
//               <div 
//                 className="w-full rounded-lg overflow-hidden border border-[#D1DCDA] shadow-inner z-0"
//                 style={{ height: '250px' }}
//               >
//                 <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; OpenStreetMap contributors'
//                   />
//                   <MapClickHandler />
//                 </MapContainer>
//               </div>
//               {markerPosition && (
//                 <p className="text-[11px] text-emerald-600 font-bold mt-1">
//                   🎯 Geographic coordinates captured successfully!
//                 </p>
//               )}
//             </div>

//             {/* 4. Severity Level */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-2">Severity Level</label>
//               <div className="grid grid-cols-3 gap-3">
//                 {['Low', 'Medium', 'Critical'].map((level) => (
//                   <button
//                     key={level}
//                     type="button"
//                     onClick={() => setSeverity(level)}
//                     className={`py-2.5 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
//                       severity === level
//                         ? level === 'Low'
//                           ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
//                           : level === 'Medium'
//                           ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
//                           : 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
//                         : 'bg-[#F8FAFA] border-[#D1DCDA] text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {level}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* 📸 5. Image Upload & Preview */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Evidence Image</label>
//               <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFA] border border-dashed border-[#D1DCDA] rounded-lg p-4 transition-all hover:bg-gray-50/50 justify-between">
//                 <label className="flex items-center gap-2 bg-[#04332D] hover:bg-[#032420] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer">
//                   <Upload size={14} />
//                   <span>Choose Image</span>
//                   <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                 </label>
                
//                 {previewUrl ? (
//                   <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
//                     <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
//                   </div>
//                 ) : (
//                   <span className="text-xs text-gray-400 flex items-center gap-1">
//                     <ImageIcon size={14} />
//                     <span>No image uploaded yet</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* 6. Description */}
//             <div>
//               <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Description</label>
//               <div className="relative">
//                 <span className="absolute top-3 left-3.5 text-gray-400 pointer-events-none">
//                   <AlignLeft size={18} />
//                 </span>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Provide detailed information about the issue (if any)..."
//                   rows="2"
//                   className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm resize-none"
//                 ></textarea>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm shadow-sm mt-2">
//               <CheckCircle size={16} />
//               <span className="pl-2">Submit Report Now</span>
//             </button>
//           </form>
//         </div>

//         {/* Right Side: Guide Info Panel */}
//         <div className="bg-[#04332D] text-white rounded-xl p-8 flex flex-col justify-between shadow-md" dir="ltr">
//           <div>
//             <div className="text-emerald-400 mb-4">
//               <ShieldAlert size={40} strokeWidth={1.5} />
//             </div>
//             <h2 className="text-lg font-bold mb-2 tracking-tight">Reporting Guide</h2>
//             <p className="text-xs text-gray-300 leading-relaxed mb-6">
//               Please make sure to provide accurate locations and set the appropriate severity level so our teams can act fast.
//             </p>

//             <ul className="space-y-4 text-xs font-medium text-gray-200">
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Low:</strong> Cosmetic damages or non-urgent matters.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Medium:</strong> System malfunction affecting a small area.</span>
//               </li>
//               <li className="flex items-start space-x-2">
//                 <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span>
//                 <span><strong>Critical:</strong> Immediate hazard or major public failure.</span>
//               </li>
//             </ul>
//           </div>

//           <div className="border-t border-emerald-900/50 pt-4 mt-6">
//             <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block mb-1">CityPulse Security</span>
//             <p className="text-[11px] text-gray-300 leading-snug">
//               Every reported issue logs your employee ID and system timestamp automatically.
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default ReportIssue;