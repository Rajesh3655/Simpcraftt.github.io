import { signIn, useSession } from "@auth/create/react";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";

export default function AdminLayout({ children }) {
  const { session, status } = useSession();

  // Show a premium loading state while authentication is being verified
  if (status === "loading") {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Show a restricted access screen instead of silently redirecting
  if (status === "unauthenticated" || !session || !session?.user?.isAdmin) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center bg-surface dark:bg-surface-dark p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" strokeWidth={1.5} />
        <h1 className="text-3xl font-black mb-2 text-text-base dark:text-text-base-dark">Restricted Access</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          You must be logged in as an administrator to view this area.
        </p>
        <div className="flex gap-4">
          <Link to="/" className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-sm font-medium hover:bg-gray-300 dark:hover:bg-white/20 transition-colors text-black dark:text-white">
            Return Home
          </Link>
          <button
            onClick={() => signIn()}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and authorized, render the requested admin page
  return <>{children}</>;
}