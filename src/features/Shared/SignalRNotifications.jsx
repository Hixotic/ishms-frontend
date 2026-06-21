import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  Clock,
  User,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSignalRContext } from "../APIS/useSignalR";
import { useNavigate } from "react-router-dom";
import { useData } from "../Shared/IContext";
import PatientDetailsModal from "../Reception/components/PatientDetailsModal";

/* ─── Live ticking timeAgo ───────────────────────────────────────────────── */
function useLiveTimeAgo(date) {
  const calc = (d) => {
    const seconds = Math.floor((Date.now() - new Date(d)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days < 7 ? `${days}d ago` : new Date(d).toLocaleDateString();
  };
  const [label, setLabel] = useState(() => calc(date));
  useEffect(() => {
    setLabel(calc(date));
    const id = setInterval(() => setLabel(calc(date)), 1000);
    return () => clearInterval(id);
  }, [date]);
  return label;
}

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

/* ─── Sound system ───────────────────────────────────────────────────────── */
function useSoundSystem() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef(null);
  const audioBuffersRef = useRef({});

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const loadAudio = useCallback(
    async (url, name) => {
      try {
        const ctx = getCtx();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffersRef.current[name] = audioBuffer;
      } catch (error) {
        console.error(`Error loading audio file ${name} from ${url}:`, error);
      }
    },
    [getCtx],
  );

  useEffect(() => {
    loadAudio("/sounds/notification.mp3", "critical");
    loadAudio("/sounds/notification.mp3", "warning");
    loadAudio("/sounds/notification.mp3", "info");
  }, [loadAudio]);

  const playSound = useCallback(
    (name, volume = 1) => {
      if (muted) return;
      const audioBuffer = audioBuffersRef.current[name];
      if (!audioBuffer) return;
      try {
        const ctx = getCtx();
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.value = volume;
        source.start(0);
      } catch (error) {
        console.error(`Error playing sound ${name}:`, error);
      }
    },
    [muted, getCtx],
  );

  const playForSeverity = useCallback(
    (severity) => {
      const s = severity?.toLowerCase();
      if (s === "critical") playSound("critical", 0.6);
      else if (s === "warning") playSound("warning", 0.6);
      else playSound("info", 0.6);
    },
    [playSound],
  );

  return { muted, setMuted, playForSeverity };
}

/* ─── Severity config ────────────────────────────────────────────────────── */
const getSev = (severity) => {
  const s = severity?.toLowerCase();
  if (s === "critical")
    return {
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      Icon: ShieldAlert,
      dot: "bg-red-500",
      pill: "bg-red-50 text-red-600 border border-red-100",
      label: "Urgent",
      pulse: true,
    };
  if (s === "warning")
    return {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      Icon: AlertTriangle,
      dot: "bg-amber-400",
      pill: "bg-amber-50 text-amber-600 border border-amber-100",
      label: "Warning",
      pulse: false,
    };
  return {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    Icon: Stethoscope,
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-600 border border-blue-100",
    label: null,
    pulse: false,
  };
};

/* ─── useNavbarBottom ────────────────────────────────────────────────────── */
function useNavbarBottom(headerRef) {
  const [navBottom, setNavBottom] = useState(64);
  useEffect(() => {
    const el = headerRef?.current;
    if (!el) return;
    const update = () => setNavBottom(el.getBoundingClientRect().bottom);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro.disconnect();
    };
  }, [headerRef]);
  return navBottom;
}

/* ─── ConnectionPill ─────────────────────────────────────────────────────── */
function ConnectionPill({ status }) {
  const map = {
    connected: {
      label: "Live",
      Icon: Wifi,
      cls: "text-emerald-600 bg-emerald-50 border-emerald-100",
      dot: "bg-emerald-500",
      spin: false,
    },
    connecting: {
      label: "Connecting",
      Icon: Loader2,
      cls: "text-blue-600 bg-blue-50 border-blue-100",
      dot: "bg-blue-400 animate-pulse",
      spin: true,
    },
    reconnecting: {
      label: "Reconnecting",
      Icon: RefreshCw,
      cls: "text-amber-600 bg-amber-50 border-amber-100",
      dot: "bg-amber-400 animate-pulse",
      spin: true,
    },
    disconnected: {
      label: "Offline",
      Icon: WifiOff,
      cls: "text-slate-400 bg-slate-50 border-slate-100",
      dot: "bg-slate-300",
      spin: false,
    },
  };
  const c = map[status] ?? map.disconnected;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${c.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <c.Icon
        size={9}
        className={c.spin ? "animate-spin" : ""}
        strokeWidth={2.5}
      />
      {c.label}
    </span>
  );
}

/* ─── MuteButton ─────────────────────────────────────────────────────────── */
function MuteButton({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={muted ? "Unmute notifications" : "Mute notifications"}
      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
        muted
          ? "bg-slate-100 text-slate-400 hover:text-slate-600"
          : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
      }`}
    >
      {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
    </button>
  );
}

/* ─── LiveTime ───────────────────────────────────────────────────────────── */
function LiveTime({ date }) {
  const label = useLiveTimeAgo(date);
  return (
    <span className="flex items-center gap-1">
      <Clock size={9} />
      {label}
    </span>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ event, onDismiss, isNew, onClick }) {
  const NotificationFloatTimer = 6000;
  const [phase, setPhase] = useState("enter");
  const sev = getSev(event.severity);
  const isCritical = event.severity?.toLowerCase() === "critical";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("idle"), 20);
    const t2 = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => onDismiss(event.id), 280);
    }, NotificationFloatTimer);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [event.id, onDismiss]);

  const style = {
    transform:
      phase === "enter"
        ? "translateY(100%)"
        : phase === "exit"
          ? "translateX(110%)"
          : "translate(0,0)",
    opacity: phase === "enter" ? 0 : 1,
    transition:
      phase === "exit"
        ? "transform .28s cubic-bezier(.55,0,1,.45),opacity .2s ease"
        : "transform .38s cubic-bezier(.22,1,.36,1),opacity .28s ease",
  };

  return (
    <div
      style={style}
      onClick={() => onClick?.(event.patientId)}
      className="w-[300px] bg-white border border-slate-200 rounded-xl overflow-hidden pointer-events-auto shadow-lg cursor-pointer"
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.iconBg}`}
        >
          <sev.Icon size={14} className={sev.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {isNew && (
              <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-px rounded-full">
                New
              </span>
            )}
            {isCritical && (
              <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-px rounded-full animate-pulse">
                Urgent
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold text-slate-800 leading-snug">
            {event.message}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
            <LiveTime date={event.timestamp || event.createdAt} />
            {event.targetUserName && (
              <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <User size={9} />
                {event.targetUserName}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPhase("exit");
            setTimeout(() => onDismiss(event.id), 280);
          }}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
      <div className="h-[2px] bg-slate-100">
        <div
          className={`h-full ${isCritical ? "bg-red-400" : "bg-blue-400"}`}
          style={{ animation: "tp 6s linear forwards" }}
        />
      </div>
    </div>
  );
}

/* ─── ToastStack ─────────────────────────────────────────────────────────── */
function ToastStack({ toasts, onDismiss, newMessageIds, onViewPatient }) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 items-end pointer-events-none">
      {toasts.map((e) => (
        <Toast
          key={e.id}
          event={e}
          onDismiss={onDismiss}
          isNew={newMessageIds.has(e.id)}
          onClick={onViewPatient}
        />
      ))}
    </div>,
    document.body,
  );
}

/* ─── NotifItem ──────────────────────────────────────────────────────────── */
function NotifItem({ event, onDismiss, onRead, isNew, showDivider, onClick }) {
  const sev = getSev(event.severity);
  const isRead = event.isRead || event.read;
  const isNormal =
    !event.severity || event.severity?.toLowerCase() === "normal";
  const initials = event.patientName
    ? event.patientName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      <div
        onClick={() => {
          if (!isRead) onRead(event.id);
          if (event.patientId) onClick?.(event.patientId);
        }}
        className="group relative flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${sev.iconBg} ${sev.iconColor}`}
        >
          {isNormal ? initials : <sev.Icon size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-[12px] font-semibold text-slate-800 truncate leading-tight">
                {event.patientName || "System"}
              </span>
              {sev.label && !isRead && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-px rounded-full ${sev.pill} ${sev.pulse ? "animate-pulse" : ""}`}
                >
                  {sev.label}
                </span>
              )}
              {isNew && (
                <span className="text-[9px] font-bold px-1.5 py-px rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                <LiveTime date={event.timestamp || event.createdAt} />
              </span>
              {!isRead && (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sev.dot} ${sev.pulse ? "animate-pulse" : ""}`}
                />
              )}
            </div>
          </div>
          <p
            className={`text-[11px] leading-snug ${isRead ? "text-slate-400" : "text-slate-600 font-medium"}`}
          >
            {event.message}
          </p>
          {event.targetUserName && (
            <span className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <User size={9} />
              {event.targetUserName}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(event.id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
          aria-label="Dismiss"
        >
          <X size={10} />
        </button>
      </div>
      {showDivider && <div className="mx-3 h-px bg-slate-100" />}
    </>
  );
}

/* ─── NotificationTooltip ────────────────────────────────────────────────── */
const LIMIT = 10;

function NotificationTooltip({
  open,
  onClose,
  events,
  status,
  dismissEvent,
  clearEvent,
  bellRef,
  newMessageIds,
  onViewAll,
  navBottom,
  muted,
  onToggleMute,
  onViewPatient,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (bellRef?.current?.contains(e.target)) return;
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose, bellRef]);

  if (!open) return null;

  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.timestamp || b.createdAt) -
      new Date(a.timestamp || a.createdAt),
  );
  const visible = sorted.slice(0, LIMIT);
  const hasMore = sorted.length > LIMIT;
  const criticalCount = events.filter(
    (e) => e.severity?.toLowerCase() === "critical" && !(e.isRead || e.read),
  ).length;

  const grouped = visible.reduce((acc, ev) => {
    const d = formatDate(ev.timestamp || ev.createdAt);
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {});

  const bellRect = bellRef?.current?.getBoundingClientRect();
  const rightOffset = bellRect ? window.innerWidth - bellRect.right : 16;

  return createPortal(
    <>
      <style>{`
        @keyframes tp { from{width:100%} to{width:0%} }
        @keyframes nfin { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: navBottom + 6,
          right: rightOffset,
          zIndex: 9999,
          animation: "nfin .18s ease both",
          width: 320,
        }}
        className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-slate-900">
              Notifications
            </span>
            <ConnectionPill status={status} />
            {criticalCount > 0 && (
              <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 px-1.5 py-px rounded-full animate-pulse">
                {criticalCount} urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <MuteButton muted={muted} onToggle={onToggleMute} />
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                <Bell size={16} className="text-slate-300" />
              </div>
              <p className="text-[12px] font-semibold text-slate-600">
                All caught up
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No alerts right now.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {items.map((ev, idx) => (
                  <NotifItem
                    key={ev.id}
                    event={ev}
                    onDismiss={dismissEvent}
                    onRead={clearEvent}
                    isNew={newMessageIds.has(ev.id)}
                    onClick={onViewPatient}
                    showDivider={idx < items.length - 1}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {events.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[10px] text-slate-400">
              {hasMore
                ? `${LIMIT} of ${sorted.length} shown`
                : `${sorted.length} notification${sorted.length !== 1 ? "s" : ""}`}
            </span>
            <button
              onClick={() => {
                onClose();
                onViewAll?.();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              See all <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

/* ─── BellButton ─────────────────────────────────────────────────────────── */
const BellButton = React.forwardRef(
  ({ unreadCount, alerts = [], status, onClick, isOpen }, ref) => {
    const hasUnread = unreadCount > 0;
    const badgeCount = hasUnread ? unreadCount : alerts.length;
    const badgeColor = hasUnread ? "bg-red-500" : "bg-yellow-500";

    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={`Notifications${badgeCount > 0 ? `, ${badgeCount} unread` : ""}`}
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-150 ${
          isOpen
            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
            : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
        }`}
      >
        <Bell
          size={17}
          strokeWidth={2}
          className={isOpen ? "fill-white/20" : ""}
        />
        {(hasUnread || alerts.length > 0) && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 ${badgeColor} border-[2px] border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white transition-transform ${isOpen ? "scale-0" : "scale-100"}`}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>
    );
  },
);
BellButton.displayName = "BellButton";

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function SignalRNotifications({ headerRef, onViewAll }) {
  const { status, events, unreadCount, clearEvent, dismissEvent } =
    useSignalRContext();
  const { alerts, isReceptionist, patients } = useData();
  const { muted, setMuted, playForSeverity } = useSoundSystem();
  const navigate = useNavigate();

  const navBottom = useNavbarBottom(headerRef);
  const bellRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [newMessageIds, setNewMessageIds] = useState(new Set());
  const prevLen = useRef(events.length);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const unique = useMemo(() => {
    return Array.from(
      new Map([...events, ...(alerts || [])].map((i) => [i.id, i])).values(),
    );
  }, [events, alerts]);

  const handleViewPatient = useCallback(
    (patientId) => {
      const patient = patients?.find((p) => p.id === patientId) ?? {
        id: patientId,
      };

      setOpen(false);

      if (isReceptionist) {
        setSelectedPatient(patient);
        setShowPatientModal(true);
      } else {
        navigate(`/patients/${patientId}`);
      }
    },
    [patients, isReceptionist, navigate],
  );

  useEffect(() => {
    if (events.length > prevLen.current) {
      const newEvs = events.slice(0, events.length - prevLen.current);

      const severityRank = { critical: 3, warning: 2, info: 1 };
      const topSev = newEvs.reduce((best, ev) => {
        return (severityRank[ev.severity?.toLowerCase()] ?? 1) >
          (severityRank[best?.toLowerCase()] ?? 1)
          ? ev.severity
          : best;
      }, "info");
      playForSeverity(topSev);

      setNewMessageIds((p) => {
        const s = new Set(p);
        newEvs.forEach((e) => s.add(e.id));
        return s;
      });
      if (!open) setToastQueue((p) => [...p, ...newEvs].slice(-4));
      setTimeout(() => {
        setNewMessageIds((p) => {
          const s = new Set(p);
          newEvs.forEach((e) => s.delete(e.id));
          return s;
        });
      }, 10000);
    }
    prevLen.current = events.length;
  }, [events, open, playForSeverity]);

  const dismissToast = useCallback(
    (id) => {
      setToastQueue((p) => p.filter((t) => t.id !== id));
      clearEvent(id);
    },
    [clearEvent],
  );

  return (
    <>
      <BellButton
        ref={bellRef}
        unreadCount={unreadCount}
        alerts={alerts}
        status={status}
        isOpen={open}
        onClick={() => setOpen((p) => !p)}
      />
      <NotificationTooltip
        open={open}
        onClose={() => setOpen(false)}
        events={unique}
        status={status}
        dismissEvent={dismissEvent}
        clearEvent={clearEvent}
        bellRef={bellRef}
        onViewPatient={handleViewPatient}
        newMessageIds={newMessageIds}
        onViewAll={onViewAll}
        navBottom={navBottom}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
      <ToastStack
        toasts={toastQueue}
        onDismiss={dismissToast}
        newMessageIds={newMessageIds}
        onViewPatient={handleViewPatient}
      />
      {createPortal(
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
        />,
        document.body,
      )}
    </>
  );
}

export { BellButton, NotificationTooltip, ToastStack, ConnectionPill };
