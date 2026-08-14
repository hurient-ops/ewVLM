import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { API } from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/monitor-a';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const data = await API.login(formData.username, formData.password);
      login(data.access_token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="bg-[#121724] rounded-xl border border-[#232C3F] shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
      <div className="p-6 pb-2 text-center flex flex-col items-center border-b border-[#232C3F]/50">
        <div className="w-12 h-12 rounded-full bg-[#31343f] border border-[#232C3F] flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">시스템 로그인</h2>
        <p className="text-sm text-[#7D8D9F]">보안 접근을 위한 계정 정보를 입력하십시오.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-[#ccc3d8] block uppercase">사용자 계정</label>
          <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <User className="w-5 h-5 absolute left-3 text-[#7D8D9F]" />
            <input 
              required
              type="text" 
              className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 font-mono text-sm text-[#E2E8F0] focus:outline-none placeholder:text-[#7D8D9F]/50"
              placeholder="이메일 또는 아이디"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-[#ccc3d8] block uppercase">비밀번호</label>
          <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <Lock className="w-5 h-5 absolute left-3 text-[#7D8D9F]" />
            <input 
              required
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-transparent border-none py-2.5 pl-10 pr-10 font-mono text-sm text-[#E2E8F0] focus:outline-none placeholder:text-[#7D8D9F]/50"
              placeholder="비밀번호"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 bg-[#0b0e17] border border-[#232C3F] rounded text-primary focus:ring-primary"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
            />
            <span className="text-sm text-[#7D8D9F] group-hover:text-[#E2E8F0] transition-colors">로그인 상태 유지</span>
          </label>
          <button type="button" className="text-sm text-primary hover:text-blue-400 transition-colors">
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <div className="pt-4 flex flex-col space-y-3">
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2.5 rounded font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all duration-150 flex justify-center items-center"
          >
            시스템 로그인 <LogIn className="w-4 h-4 ml-2" />
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/signup')}
            className="w-full bg-transparent border border-[#232C3F] text-[#E2E8F0] py-2.5 rounded font-semibold hover:bg-[#31343f] active:scale-[0.98] transition-all duration-150"
          >
            신규 계정 등록 (Signup)
          </button>
        </div>
      </form>

      <div className="bg-[#0b0e17] py-3 px-6 border-t border-[#232C3F] flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_var(--color-primary)]"></span>
        <span className="font-mono text-xs text-[#7D8D9F] uppercase tracking-wider">Secure Connection Established</span>
      </div>
    </div>
  );
}
