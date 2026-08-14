import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import { API } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (formData.password !== formData.passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await API.signup(formData.username, formData.password, 'pending', formData.name, formData.phone);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || '회원가입에 실패했습니다.');
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#121724] rounded-xl border border-green-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">가입 신청 완료</h2>
        <p className="text-[#7D8D9F] mb-6">
          보안 접근 권한이 신청되었습니다.<br/>
          최고 관리자의 승인 대기 중이며, 승인 완료 시 시스템에 로그인할 수 있습니다.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#232C3F] text-[#E2E8F0] px-6 py-2.5 rounded font-semibold hover:bg-[#31343f] active:scale-[0.98] transition-all"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#121724] rounded-xl border border-[#232C3F] shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
      <div className="p-6 pb-2 text-center flex flex-col items-center border-b border-[#232C3F]/50">
        <div className="w-12 h-12 rounded-full bg-[#31343f] border border-[#232C3F] flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">신규 접근 신청</h2>
        <p className="text-sm text-[#7D8D9F]">관제 시스템 접속을 위한 계정을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-[#ccc3d8] block uppercase">사용자 계정 (ID/이메일)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7D8D9F] group-focus-within:text-blue-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-[#232C3F] bg-[#1c1f29] rounded-lg text-[#E2E8F0] placeholder-[#7D8D9F] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono shadow-inner"
                placeholder="계정 아이디 (사번 등)"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#E2E8F0] mb-1">
              이름 (실명) <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7D8D9F] group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-[#232C3F] bg-[#1c1f29] rounded-lg text-[#E2E8F0] placeholder-[#7D8D9F] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#E2E8F0] mb-1">
              핸드폰 번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7D8D9F] group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
              </div>
              <input
                type="tel"
                required
                className="block w-full pl-10 pr-3 py-3 border border-[#232C3F] bg-[#1c1f29] rounded-lg text-[#E2E8F0] placeholder-[#7D8D9F] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono shadow-inner"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-[#ccc3d8] block uppercase">비밀번호</label>
          <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
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

        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-[#ccc3d8] block uppercase">비밀번호 확인</label>
          <div className="relative flex items-center bg-[#0b0e17] border border-[#232C3F] rounded transition-all duration-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Lock className="w-5 h-5 absolute left-3 text-[#7D8D9F]" />
            <input 
              required
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-transparent border-none py-2.5 pl-10 pr-3 font-mono text-sm text-[#E2E8F0] focus:outline-none placeholder:text-[#7D8D9F]/50"
              placeholder="비밀번호 재입력"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col space-y-3">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2.5 rounded font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all duration-150 flex justify-center items-center"
          >
            가입 승인 신청 <UserPlus className="w-4 h-4 ml-2" />
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            className="w-full bg-transparent border border-[#232C3F] text-[#E2E8F0] py-2.5 rounded font-semibold hover:bg-[#31343f] active:scale-[0.98] transition-all duration-150"
          >
            돌아가기 (Login)
          </button>
        </div>
      </form>
    </div>
  );
}
