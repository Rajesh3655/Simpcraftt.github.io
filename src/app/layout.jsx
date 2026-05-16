import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactLenis } from "lenis/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata = {
  title: "Simpcraftt — Quiet Precision.",
  description:
    "Premium electronics built for quiet precision. Marketplace-first, warranty-ready, future commerce.",
};

export default function RootLayout({ children }) {
  return (
    <>
      {/* Fonts — Satoshi + Cormorant Garamond only */}
      <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      <link
        href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap"
        rel="stylesheet"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap"
        rel="stylesheet"
      />

      <div className="relative flex flex-col min-h-[100svh] w-full">
        <ReactLenis root options={{ lerp: 0.08, duration: 1.4, wheelMultiplier: 1.2, smoothWheel: true }}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ReactLenis>
      </div>
    </>
  );
}
