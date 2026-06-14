import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X, Volume2 } from "lucide-react";

export function CriticalAlarm({ criticalAlerts }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isBlinking, setIsBlinking] = useState(true);
  const navigate = useNavigate();

  // Blink animation
  useEffect(() => {
    if (criticalAlerts.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 600);

    return () => clearInterval(interval);
  }, [criticalAlerts]);

  // Sound effect on new critical alert
  useEffect(() => {
    if (criticalAlerts.length > 0) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [criticalAlerts.length]);

  if (!isVisible || criticalAlerts.length === 0) return null;

  const mostCritical = criticalAlerts[0];

  return (
    <div
      className={`fixed top-20 right-6 z-[1000] max-w-sm transition-all duration-300 cursor-pointer ${
        isBlinking ? "scale-100 shadow-2xl" : "scale-95 shadow-lg"
      }`}
      onClick={() => navigate("/alerts")}
    >
      <div className="bg-danger text-white rounded-2xl border-2 border-red-600 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.4)]">
        {/* Pulse animation background */}
        <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />

        {/* Content */}
        <div className="relative p-5 flex items-start gap-4">
          {/* Icon with pulse */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse" style={{ animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div className="relative w-10 h-10 rounded-full bg-red-700 flex items-center justify-center">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
          </div>

          {/* Alert details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-extrabold text-white text-sm uppercase tracking-wide">Critical Patient Alert</p>
              <Volume2 size={16} className="flex-shrink-0 animate-pulse" />
            </div>
            <p className="text-red-100 text-[13px] font-semibold truncate">
              {mostCritical.patient} · {mostCritical.room}
            </p>
            <p className="text-red-50 text-[12px] mt-1.5 leading-relaxed">
              {mostCritical.detail}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-red-100 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alert count badge */}
        {criticalAlerts.length > 1 && (
          <div className="px-5 py-2 bg-red-700/50 border-t border-red-600/50 flex items-center justify-between">
            <p className="text-red-100 text-[12px] font-medium">
              {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? "s" : ""}
            </p>
            <button 
              onClick={() => navigate("/alerts")}
              className="text-red-200 hover:text-white text-[12px] font-semibold transition-colors"
            >
              View All →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
