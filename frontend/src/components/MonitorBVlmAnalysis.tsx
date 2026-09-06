import React, { useState, useRef, useEffect } from 'react';
import { useEventLogStore } from '../store/useEventLogStore';
import { API } from '../api/client';

export const MonitorBVlmAnalysis: React.FC = () => { 
  const { logs } = useEventLogStore();
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', role: 'user', text: '넘어진 사람의 움직임을 요약해 줘.', timestamp: '15:02:45' },
    { id: '2', role: 'ai', text: '대상자가 [15:02:10]에 북쪽 복도에서 화면에 진입함. 보폭: 일정함. [15:02:38]에 대상자가 계단 하강 지점에 접근함. 두 번째 계단에서 발을 헛디딤 [15:02:40]. 대상자가 4계단을 급격히 내려와 중간 참에 멈춤. 낙상 후 움직임 감지되지 않음.', timestamp: '15:02:48', image: true }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newUserMsg = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5) };
    setMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await API.sendVlmChat(newUserMsg.text, undefined);
      const newAiMsg = { id: (Date.now()+1).toString(), role: 'ai', text: res.reply, timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5) };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error('Failed to send VLM chat:', error);
      const newAiMsg = { id: (Date.now()+1).toString(), role: 'ai', text: 'VLM 분석 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }).substring(0, 5) };
      setMessages(prev => [...prev, newAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };
  
  return ( <>
<main className="flex-1 p-container-padding flex gap-gutter h-[calc(100vh-3.5rem)] overflow-hidden">
{/* Left Column (Cognitive Analytics) */}
<section className="flex-1 flex flex-col gap-gutter min-w-0">
{/* VLM Real-time Event Feed */}
<div className="flex-[3] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
<div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle flex justify-between items-center">
<h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
<span className="material-symbols-outlined mr-2 text-primary" data-icon="timeline">timeline</span> VLM 실시간 이벤트 피드 </h2>
<span className="text-label-caps font-label-caps text-text-muted whitespace-nowrap ml-2">실시간 피드</span>
</div>
<div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
  {logs.map((log) => {
    if (log.level === 'critical') {
      return (
        <div key={log.id} className="bg-surface-container border border-danger rounded p-3 relative overflow-hidden group animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-danger animate-pulse"></div>
          <div className="flex justify-between items-start mb-1">
            <span className="text-mono-data font-mono-data text-danger font-bold flex items-center">
              <span className="material-symbols-outlined text-sm mr-1 animate-pulse" data-icon="warning">warning</span> {log.timestamp} [{log.cameraId}] </span>
            <span className="text-label-caps font-label-caps bg-danger/20 text-danger px-2 py-0.5 rounded">심각</span>
          </div>
          <p className="text-body-base font-body-base text-on-surface">{log.message}</p>
          <div className="mt-2 flex gap-2">
            <button className="bg-surface-container-highest hover:bg-surface-variant border border-border-subtle text-body-sm font-body-sm px-2 py-1 rounded transition-colors flex items-center">
              <span className="material-symbols-outlined text-sm mr-1" data-icon="play_circle">play_circle</span> 재생 </button>
            <button className="bg-surface-container-highest hover:bg-surface-variant border border-border-subtle text-body-sm font-body-sm px-2 py-1 rounded transition-colors flex items-center">
              <span className="material-symbols-outlined text-sm mr-1" data-icon="center_focus_strong">center_focus_strong</span> PTZ 집중 </button>
          </div>
        </div>
      );
    } else {
      const borderColorClass = log.level === 'warning' ? 'border-l-warning' : 'border-l-secondary-container';
      const textColorClass = log.level === 'warning' ? 'text-warning' : 'text-secondary-container';
      const label = log.level === 'warning' ? '경고' : '정보';
      
      return (
        <div key={log.id} className={`bg-surface-container border border-border-subtle rounded p-2 border-l-2 ${borderColorClass} animate-in fade-in slide-in-from-right-4 duration-300`}>
          <div className="flex justify-between items-start">
            <span className="text-mono-data font-mono-data text-text-muted">{log.timestamp} [{log.cameraId}]</span>
            <span className={`text-label-caps font-label-caps ${textColorClass}`}>{label}</span>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{log.message}</p>
        </div>
      );
    }
  })}
</div>
</div>
{/* SOP Compliance Guide */}
<div className="flex-[2] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
<div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle">
<h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
<span className="material-symbols-outlined mr-2 text-primary" data-icon="assignment_turned_in">assignment_turned_in</span> SOP 준수 가이드 </h2>
<p className="text-body-sm font-body-sm text-text-muted mt-1">활성 프로토콜: 노인 낙상 대응</p>
</div>
<div className="flex-1 p-4 flex flex-col justify-between">
<ul className="space-y-3">
<li className="flex items-center text-body-base font-body-base">
<span className="material-symbols-outlined text-tertiary mr-3" data-icon="check_box">check_box</span>
<span className="text-on-surface opacity-50 line-through">1. 119 출동</span>
</li>
<li className="flex items-center text-body-base font-body-base bg-surface-container-highest p-2 rounded border-l-2 border-primary">
<span className="material-symbols-outlined text-primary mr-3 animate-pulse" data-icon="radio_button_checked">radio_button_checked</span>
<span className="text-on-surface font-semibold">2. IP 오디오 방송</span>
<span className="ml-auto text-label-caps font-label-caps text-primary bg-primary/10 px-2 py-0.5 rounded">활성</span>
</li>
<li className="flex items-center text-body-base font-body-base mt-1">
<span className="material-symbols-outlined text-tertiary mr-3" data-icon="check_box">check_box</span>
<span className="text-on-surface opacity-50 line-through">3. 순찰 앱 푸시</span>
</li>
</ul>
<button className="mt-4 w-full bg-surface-container border border-border-subtle hover:bg-surface-variant text-on-surface font-title-sm text-[14px] py-3 rounded flex items-center justify-center transition-colors group">
<span className="material-symbols-outlined mr-2 text-text-muted group-hover:text-primary transition-colors" data-icon="mic">mic</span> 마이크 방송 유지 </button>
</div>
</div>
</section>
{/* Right Column (Intelligence & Reporting) */}
<section className="flex-1 flex flex-col gap-gutter min-w-0">
{/* VSS Semantic Chat */}
<div className="flex-[3] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden">
<div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle">
<h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
<span className="material-symbols-outlined mr-2 text-primary-container" data-icon="forum">forum</span> VSS 시맨틱 챗 </h2>
</div>
<div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
  {messages.map((msg) => (
    msg.role === 'user' ? (
      <div key={msg.id} className="self-end max-w-[80%] bg-surface-container-highest p-3 rounded-l-lg rounded-tr-lg border border-border-subtle animate-in fade-in slide-in-from-bottom-2">
        <p className="text-body-sm font-body-sm text-on-surface">{msg.text}</p>
        <span className="text-[10px] text-text-muted mt-1 block text-right">{msg.timestamp}</span>
      </div>
    ) : (
      <div key={msg.id} className="self-start max-w-[90%] bg-surface-dim p-3 rounded-r-lg rounded-tl-lg border-l-2 border-primary-container animate-in fade-in slide-in-from-left-2">
        <div className="flex items-center mb-2">
          <span className="material-symbols-outlined text-primary-container text-sm mr-2" data-icon="smart_toy">smart_toy</span>
          <span className="text-label-caps font-label-caps text-text-muted">VLM 어시스턴트</span>
          <span className="text-[10px] text-text-muted ml-auto">{msg.timestamp}</span>
        </div>
        <p className="text-mono-data font-mono-data text-on-surface-variant leading-relaxed mb-3"> {msg.text} </p>
        {msg.image && (
          <div className="relative w-48 h-28 border border-border-subtle rounded overflow-hidden group cursor-pointer">
            <img alt="Incident Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNA0DmYa8_ph7gMjh2NMzBH84qdKTxZCM6AdtkmNAeUhA4lTwM6D9XTwxJLxARAde1lGKPHIYXwXPG8nlVyRtkqmcGYu9gXCLMp_Kt_2KcTnvejEucDmEIsLopmej-7PSMyFWDZZ_X8YO9sw2q4_VgA8q86l7szN1nYMPMeSazOtCVqfmknNQdCqpoc5LwqCpCW3zu8ZYJeK5vAlLCUjcOZiGoA7nylMXq9Jb-gXCdlXGP6f5NXPFuMQ"/>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl" data-icon="play_circle">play_circle</span>
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-[10px] text-white font-mono-data rounded">15:02:35 - 15:02:50</div>
          </div>
        )}
      </div>
    )
  ))}
  
  {isTyping && (
    <div className="self-start bg-surface-dim p-3 rounded-r-lg rounded-tl-lg border-l-2 border-primary-container animate-in fade-in">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </div>
  )}
  <div ref={chatEndRef} />
</div>
{/* Chat Input */}
<form onSubmit={handleChatSubmit} className="p-3 border-t border-border-subtle bg-surface-container-low flex items-center">
  <input 
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    className="flex-1 bg-surface border border-border-subtle rounded-l px-3 py-2 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" 
    placeholder="VLM 지능 쿼리..." 
    type="text"
  />
  <button type="submit" disabled={isTyping || !chatInput.trim()} className="bg-primary-container hover:bg-inverse-primary disabled:opacity-50 text-white px-3 py-2 rounded-r transition-colors flex items-center">
    <span className="material-symbols-outlined" data-icon="send">send</span>
  </button>
</form>
</div>
{/* Incident Report (Auto-draft) */}
<div className="flex-[2] bg-surface rounded-DEFAULT border border-border-subtle flex flex-col overflow-hidden relative">
<div className="px-3 py-2 bg-surface-container-low border-b border-border-subtle flex justify-between items-center">
<h2 className="text-[14px] font-title-sm text-on-surface uppercase tracking-wider flex items-center whitespace-nowrap">
<span className="material-symbols-outlined mr-2 text-primary" data-icon="description">description</span> 사건 보고서 (자동 초안) </h2>
<span className="text-label-caps font-label-caps bg-surface-container-highest px-2 py-1 rounded text-text-muted border border-border-subtle whitespace-nowrap ml-2">ID: RPT-8832</span>
</div>
<div className="flex-1 p-4 flex flex-col">
<div className="grid grid-cols-2 gap-4 mb-4">
<div>
<span className="block text-label-caps font-label-caps text-text-muted mb-1">사건 발생 시간</span>
<span className="text-mono-data font-mono-data text-on-surface bg-surface-container px-2 py-1 rounded block border border-border-subtle">2023-10-27 15:02:40</span>
</div>
<div>
<span className="block text-label-caps font-label-caps text-text-muted mb-1">위치</span>
<span className="text-mono-data font-mono-data text-on-surface bg-surface-container px-2 py-1 rounded block border border-border-subtle">서쪽 계단, L2</span>
</div>
</div>
<div className="mb-4 flex-1">
<span className="block text-label-caps font-label-caps text-text-muted mb-1">사건 요약 (VLM 생성)</span>
<textarea className="w-full h-24 bg-surface-container border border-border-subtle rounded p-2 text-mono-data font-mono-data text-on-surface-variant focus:outline-none resize-none" readOnly>노인 남성이 서쪽 계단을 내려가다 넘어짐. 30초 이상 움직임 없음. 자동 경보 발생. SOP 시작됨.</textarea>
</div>
<div className="mb-4">
<span className="block text-label-caps font-label-caps text-text-muted mb-1">조치 사항</span>
<div className="flex gap-2">
<span className="text-[10px] font-mono-data bg-surface-container-highest text-on-surface px-2 py-1 rounded border border-border-subtle">119 출동</span>
<span className="text-[10px] font-mono-data bg-surface-container-highest text-on-surface px-2 py-1 rounded border border-border-subtle">오디오 방송</span>
</div>
</div>
<button className="w-full bg-primary-container text-white font-title-sm text-[14px] py-2 rounded flex items-center justify-center transition-all hover:bg-inverse-primary shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] mt-auto whitespace-nowrap"> 승인 요청 <span className="material-symbols-outlined ml-2 text-sm" data-icon="upload">upload</span>
</button>
</div>
</div>
</section>
</main> </> );
};
