import { AlertCircle, Inbox, LockKeyhole, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { useAdminStore } from "../store/appStore";

export function PageLoader({ label = "Loading admin workspace" }) {
  return (
    <div className="premium-surface grid min-h-[260px] place-items-center p-8 dark:bg-white/[0.03]">
      <div className="w-full max-w-sm">
        <div className="premium-shimmer mx-auto h-2 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="premium-shimmer mx-auto mt-5 h-20 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`premium-shimmer rounded-2xl bg-slate-200/80 dark:bg-white/10 ${className}`} />;
}

export function EmptyState({ title = "No records yet", description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-900/15 bg-white/60 p-8 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Could not load data", description, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-900 dark:text-red-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm leading-6 opacity-80">{description}</p>}
          </div>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-red-900 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminProtectedRoute({ children }) {
  const auth = useAdminStore((state) => state.auth);
  if (auth.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8F7F5] px-6">
        <PageLoader label="Checking admin session" />
      </div>
    );
  }
  if (!auth.user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8F7F5] px-6">
        <div className="max-w-md rounded-2xl border border-slate-900/10 bg-white/80 p-8 text-center shadow-sm">
          <LockKeyhole className="mx-auto h-8 w-8 text-slate-900" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Admin login required</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">Admin routes are protected by secure backend session validation.</p>
          <Link to="/auth/login" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }
  return children;
}
