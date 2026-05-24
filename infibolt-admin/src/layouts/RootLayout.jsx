import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata = {
  title: "INFIBOLT",
  description:
    "INFIBOLT Admin is the secure operations workspace for products, warranty, support, and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }
          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          ::selection { background-color: rgba(59,130,246,0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          .dark ::-webkit-scrollbar-track { background: #050505; }
          .dark ::-webkit-scrollbar-thumb { background: #1a1a1a; }
          .dark ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
          @keyframes float {
            0%, 100% { transform: translate3d(0,0,0); }
            50% { transform: translate3d(0,-4px,0); }
          }
          @keyframes custom-pulse {
            0%, 100% { opacity: 0.82; }
            50% { opacity: 0.54; }
          }
          .animate-float { animation: float 8s cubic-bezier(0.22,1,0.36,1) infinite; }
          .custom-pulse { animation: custom-pulse 3.6s cubic-bezier(0.22,1,0.36,1) infinite; }
        `}</style>
      <div
        className="bg-surface text-text-base dark:bg-surface-dark dark:text-text-base-dark antialiased transition-colors duration-200 ease-out min-h-screen"
        style={{ fontFamily: "'General Sans', 'Satoshi', sans-serif" }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    </>
  );
}


