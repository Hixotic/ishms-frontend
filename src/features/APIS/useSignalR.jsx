/**
 * useSignalR.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure SignalR connection hook — zero UI, zero Tailwind.
 *
 * MOCK_MODE = true  → fires fake events every 4s (no backend needed)
 * MOCK_MODE = false → connects to real SignalR hub
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import * as signalR from "@microsoft/signalr";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const MOCK_MODE = false; // ← flip to false when backend hub is ready
const DISABLE_MODE = false;

const HUB_URL =
  import.meta.env?.VITE_HUB_URL ||
  "https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/hubs/notifications";

const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];

const HUB_EVENTS = [
  "ReceiveStatusUpdate",
  "ReceiveNewsUpdate",
  "ReceiveAlert",
  "ReceiveTask",
  "ReceiveMedicalReport",
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_EVENTS = [
  {
    eventName: "ReceiveAlert",
    data: {
      patientId: 1,
      patientName: "Rania Mansour",
      severity: "Critical",
      message: "URGENT: Patient requires immediate attention.",
      targetRole: "Doctor",
    },
  },
  {
    eventName: "ReceiveNewsUpdate",
    data: {
      patientId: 2,
      patientName: "Nada Ibrahim",
      newsScore: 8,
      status: "Critical",
    },
  },
  {
    eventName: "ReceiveTask",
    data: {
      patientId: 3,
      patientName: "Mariam Adel",
      title: "Monitor Patient Vitals",
      description: "Patient is now under observation.",
      assignedToRole: "Nurse",
    },
  },
  {
    eventName: "ReceiveStatusUpdate",
    data: {
      patientId: 4,
      patientName: "Reem Amin",
      newStatus: "WaitingDoctor",
    },
  },
  {
    eventName: "ReceiveMedicalReport",
    data: {
      patientId: 5,
      patientName: "Farida Mansour",
      doctorName: "Dr. Ahmed Karim",
      reportType: "TreatmentPlan",
    },
  },
  {
    eventName: "ReceiveAlert",
    data: {
      patientId: 6,
      patientName: "Rania Salem",
      severity: "Warning",
      message: "Blood pressure rising — needs review soon.",
      targetRole: "Nurse",
    },
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const resolveSeverity = (eventName, data) => {
  if (eventName === "ReceiveAlert") {
    const s = data?.severity?.toLowerCase();
    if (s === "critical") return "critical";
    if (s === "warning") return "warning";
    return "info";
  }
  if (eventName === "ReceiveNewsUpdate") {
    const score = data?.newsScore ?? 0;
    if (score >= 7) return "critical";
    if (score >= 5) return "warning";
    return "info";
  }
  return "info";
};

const resolveCategory = (eventName) => {
  const map = {
    ReceiveStatusUpdate: "Status Update",
    ReceiveNewsUpdate: "NEWS Score",
    ReceiveAlert: "Alert",
    ReceiveTask: "Task",
    ReceiveMedicalReport: "Medical Report",
  };
  return map[eventName] ?? eventName;
};

const resolveMessage = (eventName, data) => {
  const name = data?.patientName ?? "Unknown patient";
  switch (eventName) {
    case "ReceiveStatusUpdate":
      return `${name} → ${data?.newStatus ?? "status changed"}`;
    case "ReceiveNewsUpdate":
      return `${name} — NEWS ${data?.newsScore} (${data?.status})`;
    case "ReceiveAlert":
      return data?.message ?? `Alert for ${name}`;
    case "ReceiveTask":
      return `${data?.title ?? "New task"} — ${name}`;
    case "ReceiveMedicalReport":
      return `${data?.reportType ?? "Report"} by ${data?.doctorName ?? "doctor"} for ${name}`;
    default:
      return "New notification";
  }
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useSignalR(token, { maxEvents = 50 } = {}) {
  const connectionRef = useRef(null);
  const [status, setStatus] = useState("disconnected");
  const [events, setEvents] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const pushEvent = useCallback(
    (eventName, data) => {
      const normalised = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        eventName,
        category: resolveCategory(eventName),
        severity: resolveSeverity(eventName, data),
        message: resolveMessage(eventName, data),
        patientId: data?.patientId ?? null,
        patientName: data?.patientName ?? null,
        raw: data,
        timestamp: data?.timestamp ? new Date(data.timestamp) : new Date(),
        read: false,
      };
      setEvents((prev) => [normalised, ...prev].slice(0, maxEvents));
      setUnreadCount((c) => c + 1);
    },
    [maxEvents],
  );

  useEffect(() => {
    // ── DISABLE MODE ─────────────────────────────────────────────────────────
    if (DISABLE_MODE) {
      setStatus("disconnected");
      return;
    }

    if (!token) {
      setStatus("disconnected");
      return;
    }

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (MOCK_MODE) {
      setStatus("connected");

      let index = 0;

      // Send first notification once
      const firstTimeout = setTimeout(() => {
        const mock = MOCK_EVENTS[index];
        pushEvent(mock.eventName, {
          ...mock.data,
          timestamp: new Date().toISOString(),
        });

        index++;
      }, 0);

      // Then continue every minute
      const interval = setInterval(() => {
        const mock = MOCK_EVENTS[index % MOCK_EVENTS.length];

        pushEvent(mock.eventName, {
          ...mock.data,
          timestamp: new Date().toISOString(),
        });

        index++;
      }, 60000);

      return () => {
        clearTimeout(firstTimeout);
        clearInterval(interval);
      };
    }

    // ── REAL SIGNALR ─────────────────────────────────────────────────────────
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    HUB_EVENTS.forEach((eventName) => {
      connection.on(eventName, (data) => {
        if (isMounted) pushEvent(eventName, data);
      });
    });

    connection.onreconnecting(() => {
      if (isMounted) setStatus("reconnecting");
    });

    connection.onreconnected(() => {
      if (isMounted) setStatus("connected");
    });

    connection.onclose(() => {
      if (isMounted) setStatus("disconnected");
    });

    setStatus("connecting");
    connection
      .start()
      .then(() => {
        if (isMounted) setStatus("connected");
      })
      .catch((err) => {
        console.error("[useSignalR] Connection failed:", err);
        if (isMounted) setStatus("disconnected");
      });

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [token, pushEvent]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const clearEvent = useCallback((id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, read: true } : e)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
    setUnreadCount(0);
  }, []);

  const dismissEvent = useCallback((id) => {
    setEvents((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setEvents([]);
    setUnreadCount(0);
  }, []);

  return {
    status,
    events,
    unreadCount,
    clearEvent,
    markAllRead,
    dismissEvent,
    clearAll,
  };
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const SignalRContext = createContext(null);

export function SignalRProvider({ token, children }) {
  const value = useSignalR(token);
  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
}

export function useSignalRContext() {
  const ctx = useContext(SignalRContext);
  if (!ctx)
    throw new Error("useSignalRContext must be used inside <SignalRProvider>");
  return ctx;
}
