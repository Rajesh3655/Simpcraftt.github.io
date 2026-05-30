import { AlertCircle, Inbox, LockKeyhole, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { useAdminStore } from "../store/appStore";

export function PageLoader({ label = "Loading admin workspace" }) {
  return (
    <div className="premium-surface grid min-h-[260px] place-items-center overflow-hidden p-8 dark:bg-white/[0.03]">
      <div className="grid justify-items-center">
        <BrandSpinner />
        <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function BrandSpinner({ compact = false }) {
  const size = compact ? "h-10 w-10" : "h-16 w-16";
  const mark = compact ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className={`relative grid ${size} place-items-center`} role="status" aria-live="polite" aria-label="Loading">
      <span className="absolute inset-0 rounded-full border border-slate-900/10 bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/8" />
      <span className="absolute inset-1 rounded-full border-2 border-slate-200 border-t-slate-950 animate-spin dark:border-white/10 dark:border-t-white" />
      <span className={`relative rounded-full bg-slate-950 ${mark} shadow-[0_0_0_7px_rgba(15,23,42,0.06)] dark:bg-white dark:shadow-[0_0_0_7px_rgba(255,255,255,0.08)]`} />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`premium-shimmer rounded-[1.15rem] bg-slate-200/80 dark:bg-white/10 ${className}`} />;
}

export function EmptyState({ title = "No records yet", description, action }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-slate-900/15 bg-white/64 p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.04)] dark:border-white/15 dark:bg-white/[0.03]">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Could not load data", description, onRetry }) {
  return (
    <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/5 p-6 text-red-900 shadow-[0_12px_34px_rgba(190,18,60,0.055)] dark:text-red-100">
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
        <div className="grid justify-items-center">
          <BrandSpinner />
          <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Checking admin session</p>
        </div>
      </div>
    );
  }
  if (!auth.user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8F7F5] px-6">
        <div className="max-w-md rounded-2xl border border-slate-900/10 bg-white/80 p-8 text-center shadow-sm">
          <LockKeyhole className="mx-auto h-8 w-8 text-slate-900" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Admin login required</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">Protected workspace access is validated with a secure session.</p>
          <Link to="/auth/login" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }
  return children;
}
