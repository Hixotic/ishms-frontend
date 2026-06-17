import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "../lib/api";
import * as mockData from "../lib/mockData";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function Alerts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const {
    data: alerts = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      try {
        const apiResponse = await alertApi.getAlertsByRole("Nurse");
        let data = Array.isArray(apiResponse)
          ? apiResponse
          : apiResponse?.data || apiResponse?.alerts || [];

        if (!data || data.length === 0) {
          data = mockData.getAllAlerts();
        }

        return data.map((alert) => ({
          ...alert,
          id: alert.id || alert.Id || alert.alertId,
          patientId: alert.patientId || alert.PatientId || alert.patient_id,
          patientName:
            alert.patientName ||
            alert.PatientName ||
            alert.patient_name ||
            "Unknown",
          title: alert.title || alert.Title || alert.alertTitle || "Alert",
          description:
            alert.description ||
            alert.Description ||
            alert.message ||
            alert.Message ||
            "",
          type: (
            alert.type ||
            alert.Type ||
            alert.alertType ||
            "notification"
          ).toLowerCase(),
          priority: (
            alert.priority ||
            alert.Priority ||
            alert.severity ||
            "medium"
          ).toLowerCase(),
          timestamp:
            alert.timestamp ||
            alert.Timestamp ||
            alert.createdAt ||
            alert.CreatedAt ||
            new Date().toISOString(),
          read:
            alert.read ?? alert.Read ?? alert.isRead ?? alert.IsRead ?? false,
        }));
      } catch (err) {
        console.error("Error fetching alerts:", err);
        return mockData.getAllAlerts();
      }
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (alertId) => alertApi.markAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const getFilteredAlerts = () => {
    let filtered = alerts;
    if (filter === "unread") filtered = filtered.filter((a) => !a.read);
    else if (filter === "high")
      filtered = filtered.filter((a) => a.priority === "high");
    else if (filter === "medium")
      filtered = filtered.filter((a) => a.priority === "medium");
    else if (filter === "low")
      filtered = filtered.filter((a) => a.priority === "low");
    return filtered;
  };

  const handleAlertClick = async (alert) => {
    if (!alert.read) {
      markReadMutation.mutate(alert.id);
      mockData.markAlertAsRead(alert.id);
    }
    if (alert.patientId) {
      navigate(`/nurse/patient/${alert.patientId}`);
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter((a) => !a.read).length;

  const getAlertIcon = (type) => {
    switch (type) {
      case "vitals":
        return <AlertCircle className="text-red-500" size={20} />;
      case "medication":
        return <Clock className="text-blue-500" size={20} />;
      case "task":
        return <CheckCircle className="text-yellow-500" size={20} />;
      case "notification":
        return <Info className="text-green-500" size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <p className="text-red-800 dark:text-red-200">
              Failed to load alerts. Showing cached data.
            </p>
          </div>
        )}

        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "unread" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("high")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "high" ? "bg-red-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >
              High
            </button>
            <button
              onClick={() => setFilter("medium")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "medium" ? "bg-yellow-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "low" ? "bg-green-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >
              Low
            </button>
            <button
              onClick={() => refetch()}
              className={`p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors ml-auto ${isFetching ? "animate-spin" : ""}`}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground mt-4">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card rounded-lg p-6 shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer ${
                  alert.priority === "high"
                    ? "border-red-500"
                    : alert.priority === "medium"
                      ? "border-yellow-500"
                      : "border-green-500"
                } ${!alert.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority.toUpperCase()}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">Patient:</span>{" "}
                          {alert.patientName} (ID: {alert.patientId})
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="text-muted-foreground" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No alerts to display
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
