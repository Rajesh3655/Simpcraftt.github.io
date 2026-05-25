import { AlertCircle, Inbox, LockKeyhole, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { useAppStore } from "../store/appStore";

export function PageLoader({ label = "Preparing experience" }) {
  return (
    <div className="premium-surface grid min-h-[300px] place-items-center overflow-hidden p-8 dark:bg-white/[0.03]">
      <div className="w-full max-w-sm">
        <div className="premium-shimmer mx-auto h-2 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="premium-shimmer mx-auto mt-5 aspect-[16/9] w-full rounded-[1.35rem] bg-slate-200/80 dark:bg-white/10" />
        <div className="mx-auto mt-5 grid max-w-[13rem] gap-2">
          <div className="premium-shimmer h-2 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="premium-shimmer mx-auto h-2 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`premium-shimmer rounded-2xl bg-slate-200/80 dark:bg-white/10 ${className}`} />;
}

export function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-slate-900/15 bg-white/66 p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.045)] dark:border-white/15 dark:bg-white/[0.03]">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Could not load content", description, onRetry }) {
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

export function ProtectedRoute({ children }) {
  const auth = useAppStore((state) => state.auth);
  if (!auth.user) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-6">
        <div className="max-w-md rounded-[1.35rem] border border-slate-900/10 bg-white/86 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
          <LockKeyhole className="mx-auto h-8 w-8 text-slate-900" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Login required</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">Sign in to manage products, warranty records, support tickets, and account preferences.</p>
          <Link to="/login" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }
  return children;
}
