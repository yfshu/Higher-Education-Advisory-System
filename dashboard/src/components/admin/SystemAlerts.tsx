"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSystemAlerts, resolveAlert, type SystemAlert } from "@/lib/api/admin";
import { useUser } from "@/contexts/UserContext";
import { formatDistanceToNow } from "date-fns";

// Fallback for time formatting if date-fns fails
function formatTimeAgo(date: string | null): string {
  if (!date) return 'Unknown time';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function SystemAlerts() {
  const { userData } = useUser();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.accessToken) {
      setLoading(false);
      return;
    }

    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSystemAlerts(userData.accessToken, 10);
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError(err instanceof Error ? err.message : "Failed to load alerts");
        setAlerts([]); // Ensure alerts is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userData?.accessToken]);

  const handleResolve = async (alertId: number) => {
    if (!userData?.accessToken) return;

    try {
      await resolveAlert(userData.accessToken, alertId);
      // Update local state
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        )
      );
    } catch (err) {
      console.error("Error resolving alert:", err);
      alert(err instanceof Error ? err.message : "Failed to resolve alert");
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h3 className="font-semibold text-foreground">System Alerts & Notifications</h3>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h3 className="font-semibold text-foreground">System Alerts & Notifications</h3>
        </div>
        <div className="p-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </Card>
    );
  }

  const openAlerts = Array.isArray(alerts) ? alerts.filter((alert) => alert?.status === 'open') : [];

  if (openAlerts.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
        <div className="p-6 border-b border-white/20">
          <h3 className="font-semibold text-foreground">System Alerts & Notifications</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p>No open alerts. All systems operational.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
      <div className="p-6 border-b border-white/20">
        <h3 className="font-semibold text-foreground">System Alerts & Notifications</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {openAlerts.map((alert) => {
            if (!alert) return null;
            const timeAgo = formatTimeAgo(alert?.created_at);

            return (
              <div
                key={alert?.id ?? Math.random()}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  alert.type === 'error'
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/30 dark:border-red-800/30'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/30 dark:border-yellow-800/30'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/30 dark:border-blue-800/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'error'
                      ? 'bg-red-100 dark:bg-red-900/50'
                      : alert.type === 'warning'
                      ? 'bg-yellow-100 dark:bg-yellow-900/50'
                      : 'bg-blue-100 dark:bg-blue-900/50'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      alert.type === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.type === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{alert?.message ?? 'No message'}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                {alert?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                    className="flex-shrink-0"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

