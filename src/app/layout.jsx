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
  title: "Simpcraftt – Coming Soon",
  description:
    "Simpcraftt is launching soon. A new era of premium futuristic electronics and lifestyle products. Get notified at launch.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
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
            0%   { transform: translateY(0px); }
            50%  { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes custom-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.8); }
          }
          .animate-float  { animation: float 4s ease-in-out infinite; }
          .custom-pulse   { animation: custom-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        `}</style>
      <div
        className="bg-surface text-text-base dark:bg-surface-dark dark:text-text-base-dark antialiased transition-colors duration-200 ease-out min-h-screen"
        style={{ fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif" }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    </>
  );
}

