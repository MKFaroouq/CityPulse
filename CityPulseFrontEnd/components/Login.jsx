import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Checking credentials...',
      text: 'Please wait a moment',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-xl' }
    });

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: email,
        password: password
      });

      // ==========================================
      //  حفظ الـ Token والـ Role في الـ LocalStorage هنا دون لمس بقية الكود
      // ==========================================
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user?.role || 'user');
      }

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Login Successful! Welcome to CityPulse.',
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });

      navigate('/report-issue');
      console.log('Backend Response:', response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong';
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMsg,
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white rounded-xl shadow-md border border-[#E5E9E8] p-10 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="text-[#04332D] mb-3">
            <Building2 size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#0F2925] tracking-tight">CityPulse</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Try To Make The World Better Place !</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={18} strokeWidth={2} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john.doe@city.gov"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-[#1E3A37]">Password</label>
              <a href="#" className="text-xs font-semibold text-gray-500 hover:text-[#04332D] hover:underline transition-colors">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={18} strokeWidth={2} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input id="remember" type="checkbox" className="h-4 w-4 text-[#04332D] focus:ring-[#04332D] border-[#D1DCDA] rounded cursor-pointer" />
            <label htmlFor="remember" className="ml-2 block text-sm font-medium text-gray-600 select-none cursor-pointer">
              Remember device for 30 days
            </label>
          </div>

          <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm">
            <span>Log In</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            New to CityPulse?{' '}
            <Link to="/register" className="font-bold text-[#04332D] hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>

      {/* <div className="mt-8 flex flex-col items-center text-center space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-bold tracking-wider uppercase">
          <ShieldCheck size={14} className="text-[#04332D]" />
          <span>Infrastructure Management System</span>
        </div>
        <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
          Authorized personnel only. All activity is logged and monitored.
        </p>
      </div> */}
    </div>
  );
}

export default Login;