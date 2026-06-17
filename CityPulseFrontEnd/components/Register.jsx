import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import Swal from 'sweetalert2';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // switching beween pages without refresh

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Passwords do not match!',
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      });
      return;
    }

    Swal.fire({
      title: 'Creating account...',
      text: 'Please wait a moment',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-xl' }
    });

    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        name: fullName,
        email: email,
        password: password
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Your registration was successful. You can log in now!',
        confirmButtonColor: '#04332D',
        customClass: { popup: 'rounded-xl' }
      }).then(() => {
        navigate('/'); // navigate to login page after successful registration
      });

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
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
          <h1 className="text-2xl font-bold text-[#0F2925] tracking-tight">Create An Account</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Register for Infrastructure System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User size={18} strokeWidth={2} />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                required
              />
            </div>
          </div>

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
            <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Password</label>
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

          <div>
            <label className="block text-sm font-semibold text-[#1E3A37] mb-1.5">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={18} strokeWidth={2} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFA] border border-[#D1DCDA] rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#04332D] focus:ring-1 focus:ring-[#04332D] transition-all text-sm"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#04332D] hover:bg-[#032420] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm">
            <span>Register Account</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-bold text-[#04332D] hover:underline">
              Log In here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;