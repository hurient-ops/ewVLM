import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateSignup: () => void;
}

export default function Login({ onLoginSuccess, onNavigateSignup }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Attempt:", formData);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#070A13] flex flex-col font-sans relative overflow-hidden text-[#E2E8F0]">
      {/* Technical Grid Background Layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-50"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(35, 44, 63, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 44, 63, 0.2) 1px, transparent 1px)'
        }}
      ></div>

      {/* TopNavBar */}
      <header className="bg-[#0b0e17] border-b border-[#232C3F] flex justify-between items-center px-4 py-2 w-full z-10 relative">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-[#7c3aed] mr-2" />
          <span className="text-xl font-bold text-[#7c3aed] tracking-tight">ewVLM-Core</span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center relative z-10 p-4">
        {/* Login Card */}
        <div className="bg-[#121724] rounded-xl border border-[#232C3F] w-full max-w-md shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="p-6 pb-2 text-center flex flex-col items-center border-b border-[#232C3F]/50">
            <div className="w-12 h-12 rounded-full bg-[#31343f] border border-[#232C3F] flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#7c3aed]" />
            </div>
            <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">시스템 로그인</h1>
            <p className="text-sm text-[#7D8D9F]">보안 접근을 위한 계정 정보를 입력하십시오.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col">
            {/* Email/ID Input Group */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-[#ccc3d8] block uppercase">사용자 계정</label>
              <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]">
                <User className="w-5 h-5 absolute left-3 text-[#7D8D9F]" />
                <input 
                  required
                  type="text" 
                  className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 font-mono text-sm text-[#E2E8F0] focus:outline-none placeholder:text-[#7D8D9F]/50"
                  placeholder="이메일 또는 아이디를 입력하세요"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-[#ccc3d8] block uppercase">비밀번호</label>
              <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]">
                <Lock className="w-5 h-5 absolute left-3 text-[#7D8D9F]" />
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-transparent border-none py-2.5 pl-10 pr-10 font-mono text-sm text-[#E2E8F0] focus:outline-none placeholder:text-[#7D8D9F]/50"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#7D8D9F] hover:text-[#E2E8F0] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 bg-[#0b0e17] border border-[#232C3F] rounded text-[#7c3aed] focus:ring-[#7c3aed]"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                />
                <span className="text-sm text-[#7D8D9F] group-hover:text-[#E2E8F0] transition-colors">로그인 상태 유지</span>
              </label>
              <button type="button" className="text-sm text-[#7c3aed] hover:text-[#d2bbff] transition-colors">
                비밀번호를 잊으셨나요?
              </button>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col space-y-3">
              <button 
                type="submit" 
                className="w-full bg-[#7c3aed] text-white py-2.5 rounded font-semibold hover:bg-[#732ee4] active:scale-[0.98] transition-all duration-150 flex justify-center items-center"
              >
                로그인 <LogIn className="w-4 h-4 ml-2" />
              </button>
              <button 
                type="button" 
                onClick={onNavigateSignup}
                className="w-full bg-transparent border border-[#232C3F] text-[#E2E8F0] py-2.5 rounded font-semibold hover:bg-[#31343f] active:scale-[0.98] transition-all duration-150"
              >
                회원가입
              </button>
            </div>
          </form>

          {/* Security Banner */}
          <div className="bg-[#0b0e17] py-3 px-6 border-t border-[#232C3F] flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed] shadow-[0_0_4px_#7c3aed]"></span>
            <span className="font-mono text-xs text-[#7D8D9F] uppercase tracking-wider">Secure Connection Established</span>
          </div>
        </div>
      </main>
    </div>
  );
}
