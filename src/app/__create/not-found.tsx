import type { Route } from './+types/not-found';
import { useNavigate } from 'react-router';

export function loader({ params }: Route.LoaderArgs) {
  return {
    path: `/${params['*'] ?? ''}`,
  };
}

export default function NotFoundPage({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const navigate = useNavigate();
  const missingPath = loaderData.path.replace(/^\//, '');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400 mb-4">404</p>
        <h1 className="text-4xl font-black mb-4">Page not found</h1>
        <p className="text-gray-400 mb-8">
          {missingPath ? `/${missingPath}` : 'This page'} is not available on INFIBOLT.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm"
        >
          Back home
        </button>
      </div>
    </div>
  );
}
