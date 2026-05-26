import { Bell, CheckCircle2 } from "lucide-react";
import { AdminShell } from "../../layouts/AdminLayout";
import { EmptyState } from "../../components/AppStates";
import { useAdminStore } from "../../store/appStore";

export default function NotificationsPage() {
  const notifications = useAdminStore((state) => state.notifications);
  const markNotificationRead = useAdminStore((state) => state.markNotificationRead);
  return (
    <AdminShell title="Notifications" description="Important alerts for warranty, support, product, and performance activity.">
      {notifications.length === 0 ? <EmptyState title="No notifications" description="Admin alerts will appear here." /> : (
        <div className="grid gap-3">
          {notifications.map((item) => (
            <button key={item.id} onClick={() => markNotificationRead(item.id)} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-900/5 bg-white/60 p-5 text-left dark:border-white/5 dark:bg-white/[0.03]">
              <div className="flex gap-3"><Bell className="mt-1 h-5 w-5 text-slate-900 dark:text-white" /><div><p className="font-semibold text-slate-900 dark:text-white">{item.title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p></div></div>
              {item.read ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white" />}
            </button>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
