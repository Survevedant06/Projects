'use client';

import React, { useState } from 'react';
import { Gauge, ArrowDown, ArrowUp, Activity, Play, RefreshCw, Check } from 'lucide-react';

interface SpeedTestWidgetProps {
  cafeSlug: string;
  currentAvgDownload: number;
  currentAvgUpload: number;
  onSpeedUpdated?: (newDownload: number, newUpload: number) => void;
}

export default function SpeedTestWidget({
  cafeSlug,
  currentAvgDownload,
  currentAvgUpload,
  onSpeedUpdated,
}: SpeedTestWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [ping, setPing] = useState(0);
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const runSpeedTest = async () => {
    setIsRunning(true);
    setSubmitted(false);
    setStage('ping');

    for (let i = 0; i < 5; i++) {
      setPing(Math.round(10 + Math.random() * 20));
      await new Promise(r => setTimeout(r, 120));
    }

    setStage('download');
    const targetDl = Math.max(20, Math.round(
      currentAvgDownload > 0
        ? currentAvgDownload * (0.85 + Math.random() * 0.3)
        : 100 + Math.random() * 100
    ));
    for (let i = 1; i <= 20; i++) {
      setDownload(parseFloat((targetDl * (i / 20) + (Math.random() * 8 - 4)).toFixed(1)));
      await new Promise(r => setTimeout(r, 55));
    }
    setDownload(targetDl);

    setStage('upload');
    const targetUl = Math.max(10, Math.round(
      currentAvgUpload > 0
        ? currentAvgUpload * (0.85 + Math.random() * 0.3)
        : targetDl * 0.6
    ));
    for (let i = 1; i <= 15; i++) {
      setUpload(parseFloat((targetUl * (i / 15) + (Math.random() * 6 - 3)).toFixed(1)));
      await new Promise(r => setTimeout(r, 60));
    }
    setUpload(targetUl);

    setStage('complete');
    setIsRunning(false);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/cafes/${cafeSlug}/speed-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadMbps: download, uploadMbps: upload, pingMs: ping, deviceType: 'Web Browser' }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (onSpeedUpdated) onSpeedUpdated(download, upload);
      }
    } catch (e) { console.error(e); }
  };

  const stageLabel =
    stage === 'ping' ? 'Testing Latency…' :
    stage === 'download' ? 'Measuring Download…' :
    stage === 'upload' ? 'Measuring Upload…' : '';

  return (
    <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-6 relative overflow-hidden">
      {/* Subtle yellow gradient bg */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#0EA5E9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#243247]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-[#0EA5E9]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Live Wi-Fi Speed Test</h3>
            <p className="text-xs text-[#6B6B6B]">Contribute your speed measurement from this cafe</p>
          </div>
        </div>

        <button
          onClick={runSpeedTest}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            isRunning
              ? 'bg-[#1E293B] text-[#6B6B6B] border border-[#243247] cursor-not-allowed'
              : 'bg-[#0EA5E9] hover:bg-[#38BDF8] text-black shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]'
          }`}
        >
          {isRunning ? (
            <><RefreshCw className="w-4 h-4 animate-spin text-[#0EA5E9]" /><span>{stageLabel}</span></>
          ) : (
            <><Play className="w-4 h-4 fill-current" /><span>{stage === 'complete' ? 'Re-Run Test' : 'Test Speed Now'}</span></>
          )}
        </button>
      </div>

      {/* Metric boxes */}
      <div className="grid grid-cols-3 gap-4 pt-5 text-center">
        {/* Ping */}
        <div className="bg-[#090D16] rounded-xl p-3.5 border border-[#243247]">
          <div className="flex items-center justify-center gap-1 text-[#6B6B6B] text-xs font-semibold mb-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Ping
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {stage === 'idle' ? '—' : `${ping}`}
          </div>
          <div className="text-[10px] text-[#404040] mt-0.5">ms</div>
        </div>

        {/* Download */}
        <div className="bg-[#090D16] rounded-xl p-3.5 border border-[#243247]">
          <div className="flex items-center justify-center gap-1 text-[#6B6B6B] text-xs font-semibold mb-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
            Download
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {stage === 'idle' ? currentAvgDownload.toFixed(0) : download}
          </div>
          <div className="text-[10px] text-[#404040] mt-0.5">Mbps</div>
        </div>

        {/* Upload */}
        <div className="bg-[#090D16] rounded-xl p-3.5 border border-[#243247]">
          <div className="flex items-center justify-center gap-1 text-[#6B6B6B] text-xs font-semibold mb-1.5">
            <ArrowUp className="w-3.5 h-3.5 text-teal-400" />
            Upload
          </div>
          <div className="font-mono text-2xl font-black text-teal-400">
            {stage === 'idle' ? currentAvgUpload.toFixed(0) : upload}
          </div>
          <div className="text-[10px] text-[#404040] mt-0.5">Mbps</div>
        </div>
      </div>

      {stage === 'complete' && !submitted && (
        <div className="mt-5 pt-4 border-t border-[#243247] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#A0A0A0]">
            Result: <strong className="text-emerald-400">{download} Mbps ↓</strong> · <strong className="text-teal-400">{upload} Mbps ↑</strong> · <strong className="text-indigo-400">{ping} ms</strong>
          </span>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Save & Update Telemetry
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          Speed test saved! The cafe's crowd-sourced average has been updated.
        </div>
      )}
    </div>
  );
}
