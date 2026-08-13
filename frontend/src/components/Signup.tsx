import React, { useState } from 'react';
import { Shield, User, Building2, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';

interface SignupProps {
  onSignupSuccess: () => void;
  onBackToLogin: () => void;
}

export default function Signup({ onSignupSuccess, onBackToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    organization: '',
    department: '',
    position: '',
    role: 'operator'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    // 가상의 회원가입 처리 (FastAPI 백엔드 연동 전)
    console.log("Signup Request:", formData);
    onSignupSuccess();
  };

  return (
    <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-4 antialiased text-[#E2E8F0]">
      <div className="w-full max-w-2xl bg-[#121724] rounded-xl shadow-lg border border-[#232C3F] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C2335] border-b border-[#232C3F] p-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#7C3AED]" />
            <h1 className="text-3xl font-bold text-[#7C3AED]">ewVLM-Core</h1>
          </div>
          <h2 className="text-2xl font-semibold text-white">지능형 영상 관제 플랫폼 회원가입</h2>
          <p className="text-sm text-[#7D8D9F] mt-2 text-center">보안 접근을 위한 관리자 계정 생성 절차입니다.</p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: 기본 정보 */}
            <div>
              <h3 className="text-base font-semibold text-[#7C3AED] mb-4 border-b border-[#232C3F] pb-2 flex items-center gap-2">
                <User className="w-5 h-5" /> 기본 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">성명</label>
                  <input required type="text" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">이메일 주소</label>
                  <input required type="email" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">비밀번호</label>
                  <input required type="password" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">비밀번호 확인</label>
                  <input required type="password" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, passwordConfirm: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: 소속 정보 */}
            <div>
              <h3 className="text-base font-semibold text-[#7C3AED] mb-4 border-b border-[#232C3F] pb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> 소속 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">소속 기관명</label>
                  <input required type="text" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">부서명</label>
                  <input required type="text" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-[#8E9AA8] block uppercase">직책</label>
                  <input required type="text" 
                    className="w-full bg-[#070A13] border border-[#232C3F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: 권한 신청 */}
            <div>
              <h3 className="text-base font-semibold text-[#7C3AED] mb-4 border-b border-[#232C3F] pb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> 권한 신청
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 rounded border border-[#232C3F] bg-[#1C2335] cursor-pointer hover:border-[#7C3AED] transition-colors">
                  <input type="radio" name="role" value="operator" defaultChecked className="text-[#7C3AED] focus:ring-[#7C3AED]" 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                  <span className="text-sm text-white">관제 요원</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded border border-[#232C3F] bg-[#1C2335] cursor-pointer hover:border-[#7C3AED] transition-colors">
                  <input type="radio" name="role" value="supervisor" className="text-[#7C3AED] focus:ring-[#7C3AED]" 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                  <span className="text-sm text-white">관리 감독자</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded border border-[#232C3F] bg-[#1C2335] cursor-pointer hover:border-[#7C3AED] transition-colors">
                  <input type="radio" name="role" value="admin" className="text-[#7C3AED] focus:ring-[#7C3AED]" 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                  <span className="text-sm text-white">시스템 관리자</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-[#232C3F] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button type="button" onClick={onBackToLogin} className="text-sm text-[#7C3AED] hover:text-[#5a00c6] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> 로그인 화면으로 돌아가기
              </button>
              <button type="submit" className="w-full sm:w-auto bg-[#7C3AED] hover:bg-[#5a00c6] text-white px-8 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors">
                회원가입 완료 <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
