import React, { useState } from 'react';
import { API } from '../api/client';

export const IpAudioBroadcastConsole: React.FC = () => {
  const [isPttActive, setIsPttActive] = useState(false);
  const [ttsMessage, setTtsMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    if (!ttsMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      await API.broadcastAudio('Z-A-01 정문 외 1곳', ttsMessage);
      alert('✅ 방송 송출이 완료되었습니다.');
      setTtsMessage('');
    } catch (err) {
      console.error(err);
      alert('방송 송출에 실패했습니다.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return ( <>
<main className="flex-1 min-w-0 p-container-padding flex-1 flex gap-gutter bg-surface-container-lowest overflow-hidden">
{/* Left Column: Zone Tree */}
<section className="w-1/4 glass-panel rounded-lg flex flex-col h-full border border-border-subtle">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center rounded-t-lg">
<h3 className="text-title-sm font-title-sm text-on-surface">구역 라우팅</h3>
<span className="material-symbols-outlined text-text-muted cursor-pointer hover:text-primary transition-colors">filter_list</span>
</div>
<div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
{/* Zone Items */}
<div className="space-y-2">
<div className="flex items-center gap-2 p-2 hover:bg-surface-container-high rounded cursor-pointer group">
<span className="material-symbols-outlined text-primary text-sm group-hover:rotate-90 transition-transform">chevron_right</span>
<span className="material-symbols-outlined text-text-muted text-sm">business</span>
<span className="text-body-sm font-body-sm text-text-primary">섹터 알파 (북쪽)</span>
<span className="ml-auto w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_#4edea3]"></span>
</div>
<div className="pl-6 space-y-1 border-l border-border-subtle ml-3">
<div className="flex items-center justify-between p-1.5 hover:bg-surface-container-high rounded cursor-pointer active-glow">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-xs">speaker</span>
<span className="text-mono-data font-mono-data text-on-surface">Z-A-01 정문</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xs cursor-pointer">volume_up</span>
<span className="text-mono-data font-mono-data text-primary">85%</span>
</div>
</div>
<div className="flex items-center justify-between p-1.5 hover:bg-surface-container-high rounded cursor-pointer">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-muted text-xs">speaker</span>
<span className="text-mono-data font-mono-data text-text-muted">Z-A-02 주차장 L1</span>
</div>
<span className="material-symbols-outlined text-text-muted text-xs cursor-pointer hover:text-primary">volume_off</span>
</div>
</div>
<div className="flex items-center gap-2 p-2 hover:bg-surface-container-high rounded cursor-pointer mt-2">
<span className="material-symbols-outlined text-primary text-sm rotate-90">chevron_right</span>
<span className="material-symbols-outlined text-text-muted text-sm">warehouse</span>
<span className="text-body-sm font-body-sm text-text-primary">섹터 베타 (창고)</span>
<span className="ml-auto w-2 h-2 rounded-full bg-tertiary shadow-[0_0_4px_#4edea3]"></span>
</div>
<div className="pl-6 space-y-1 border-l border-border-subtle ml-3">
<div className="flex items-center justify-between p-1.5 bg-surface-container rounded cursor-pointer alert-glow">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-danger text-xs animate-pulse">crisis_alert</span>
<span className="text-mono-data font-mono-data text-danger font-bold">Z-B-04 하역장 B</span>
</div>
<span className="text-mono-data font-mono-data text-danger bg-error-container px-1 rounded">인터콤 활성</span>
</div>
</div>
</div>
</div>
<div className="p-3 border-t border-border-subtle bg-surface-container-low rounded-b-lg">
<button className="w-full py-1.5 border border-border-subtle text-text-muted text-body-sm font-body-sm rounded hover:bg-surface-container-high transition-colors">모든 구역 선택</button>
</div>
</section>
{/* Center/Right Column: Control Panel */}
<section className="flex-1 flex flex-col gap-gutter">
{/* Top Half: Live Audio & Intercom */}
<div className="flex-1 flex gap-gutter">
{/* Microphone Control */}
<div className="w-1/2 glass-panel rounded-lg border border-border-subtle flex flex-col">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center rounded-t-lg">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary">mic</span> 실시간 방송 </h3>
<span className="text-mono-data font-mono-data text-primary px-2 py-0.5 bg-primary-fixed-dim bg-opacity-20 rounded border border-primary">준비</span>
</div>
<div className="flex-1 flex flex-col items-center justify-center p-6 relative">
{/* Decorative visualization */}
<div className="absolute inset-0 opacity-20 pointer-events-none">
<div className="w-full h-full bg-cover bg-center" data-alt="A dark, abstract digital visualization of soundwaves in an industrial setting. Glowing violet lines undulate against a deep black-blue background, representing audio frequencies. The style is modern, technical, and data-driven." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLH-4kJeCx1BSIlwKKZaysB9eowJHlTof-AjdZMo0roJ16FmK6YBJh3BuA2KyL4_nJTCZMv5zJ5zrZlFMbAhR0AFfqddC8USXZZ3KT2ciEsFPECKln7wXHM3oCM-Q1_0CGTEiv9qHNOwGnELXTJpTOIGL6FGbqX6DOxxmjIhVx9itWU_cu7ekhQfVwGqZf138XzQsHr4w8zVJYItvXMS6G_wJ__WhmEkUv8av5YgTyDSyaYP4pz7Cwnw')" }}></div>
</div>
<button 
  className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10 ${isPttActive ? 'bg-danger/20 border-danger' : 'bg-surface-container-highest border-surface-variant hover:border-primary'}`} 
  id="pttBtn"
  onMouseDown={() => setIsPttActive(true)}
  onMouseUp={() => setIsPttActive(false)}
  onMouseLeave={() => setIsPttActive(false)}
>
<span className={`material-symbols-outlined text-4xl ${isPttActive ? 'text-danger' : 'text-text-muted'}`} id="pttIcon">mic_none</span>
<span className={`text-label-caps font-label-caps ${isPttActive ? 'text-danger' : 'text-text-muted'}`} id="pttLabel">{isPttActive ? '송출 중...' : '누르고 말하기'}</span>
</button>
<div className="mt-8 w-full px-8 z-10">
<div className="flex justify-between text-mono-data font-mono-data text-text-muted mb-2">
<span>입력 게인</span>
<span>0 dB</span>
</div>
<input className="w-full accent-primary h-1 bg-surface-variant rounded-full appearance-none" max="20" min="-20" type="range" value="0"/>
</div>
</div>
</div>
{/* Emergency Intercom */}
<div className="w-1/2 glass-panel rounded-lg border border-danger flex flex-col relative overflow-hidden">
<div className="absolute inset-0 bg-danger opacity-5 pointer-events-none"></div>
<div className="p-3 border-b border-danger/30 bg-surface/80 flex justify-between items-center rounded-t-lg">
<h3 className="text-title-sm font-title-sm text-danger flex items-center gap-2 font-bold">
<span className="material-symbols-outlined animate-pulse">emergency</span> 활성 인터콤 </h3>
<span className="text-mono-data font-mono-data text-danger animate-pulse">00:01:24</span>
</div>
<div className="p-4 flex-1 flex flex-col justify-between z-10">
<div className="bg-surface-container p-4 rounded border border-border-subtle">
<div className="text-osd-label font-osd-label text-text-muted mb-1">발신자 ID</div>
<div className="text-headline-md font-headline-md text-on-surface">Z-B-04 하역장 B</div>
<div className="text-body-sm font-body-sm text-warning mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-sm">warning</span> 카메라 C-12에서 무단 접근 감지됨 </div>
</div>
<div className="space-y-4 mt-4">
<div className="flex items-center justify-between bg-surface-container p-2 rounded">
<span className="text-mono-data font-mono-data text-text-muted">음향 에코 제거 (AEC)</span>
<div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
<div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
</div>
</div>
<div className="flex items-center justify-between bg-surface-container p-2 rounded">
<span className="text-mono-data font-mono-data text-text-muted">자동 게인 제어 (AGC)</span>
<div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
<div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
</div>
</div>
</div>
<div className="flex gap-2 mt-auto pt-4">
<button className="flex-1 py-2 bg-danger text-white text-body-sm font-bold rounded hover:bg-error-container transition-colors shadow-lg">통화 종료</button>
<button className="px-4 py-2 border border-border-subtle text-text-primary rounded hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
</div>
</div>
</div>
{/* Bottom Half: TTS & Scenarios */}
<div className="glass-panel rounded-lg border border-border-subtle flex flex-col h-64">
<div className="p-3 border-b border-border-subtle bg-surface flex justify-between items-center rounded-t-lg">
<h3 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary">record_voice_over</span> TTS 및 시나리오 </h3>
<div className="flex gap-2">
<select className="bg-surface-container border border-border-subtle text-mono-data text-text-primary rounded px-2 py-1 focus:ring-primary focus:border-primary">
<option>음성: 남성 (명령)</option>
<option>음성: 여성 (경고)</option>
</select>
<select className="bg-surface-container border border-border-subtle text-mono-data text-text-primary rounded px-2 py-1 focus:ring-primary focus:border-primary">
<option>언어: EN</option>
<option>언어: KO</option>
</select>
</div>
</div>
<div className="flex flex-1 p-0">
{/* Quick Scenarios */}
<div className="w-1/3 border-r border-border-subtle p-3 overflow-y-auto custom-scrollbar bg-surface-container-low">
<div className="text-osd-label font-osd-label text-text-muted mb-2">빠른 시나리오</div>
<div className="space-y-2">
<button onClick={() => setTtsMessage('현재 건물에 비상 상황이 발생했습니다. 즉시 안전한 곳으로 대피하시기 바랍니다.')} className="w-full text-left p-2 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded text-body-sm font-body-sm text-text-primary transition-colors flex items-center justify-between"> 대피 안내 <span className="material-symbols-outlined text-danger text-sm">play_arrow</span>
</button>
<button onClick={() => setTtsMessage('제한 구역입니다. 즉시 이탈하지 않으면 보안 요원이 출동합니다.')} className="w-full text-left p-2 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded text-body-sm font-body-sm text-text-primary transition-colors flex items-center justify-between"> 침입자 경고 <span className="material-symbols-outlined text-warning text-sm">play_arrow</span>
</button>
<button onClick={() => setTtsMessage('야간 경계 근무 교대 시간입니다. 각 초소는 근무 준비를 하십시오.')} className="w-full text-left p-2 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded text-body-sm font-body-sm text-text-primary transition-colors flex items-center justify-between"> 교대 알림 <span className="material-symbols-outlined text-primary text-sm">play_arrow</span>
</button>
</div>
</div>
{/* TTS Input */}
<div className="flex-1 p-3 flex flex-col">
<textarea 
  className="flex-1 w-full bg-surface-container border border-border-subtle rounded p-3 text-body-base font-body-base text-text-primary focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-text-muted" 
  placeholder="선택한 구역에 방송할 메시지를 입력하세요..."
  value={ttsMessage}
  onChange={e => setTtsMessage(e.target.value)}
></textarea>
<div className="flex justify-between items-center mt-3">
<span className="text-mono-data font-mono-data text-text-muted">대상: 섹터 알파 (북쪽) • 2개 구역</span>
<button 
  className="py-2 px-6 bg-primary-container text-white text-body-sm font-bold rounded flex items-center gap-2 hover:bg-inverse-primary transition-colors shadow-[0_4px_12px_rgba(124,58,237,0.3)] disabled:opacity-50"
  onClick={handleBroadcast}
  disabled={isBroadcasting || !ttsMessage.trim()}
>
{isBroadcasting ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">send</span>}
{isBroadcasting ? '송출 중...' : '방송 송출'} 
</button>
</div>
</div>
</div>
</div>
</section>
</main> </> );
};
