import { useState, useEffect } from 'react';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBImage } from '@app/types/tmdb';

interface ContentBackdropProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  className?: string;
  children?: React.ReactNode;
}

export const ContentBackdrop: React.FC<ContentBackdropProps> = ({
  contentId,
  contentType,
  className = '',
  children,
}) => {
  const [backdrop, setBackdrop] = useState<TMDBImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        setLoading(true);
        setError(false);

        const imagesResponse =
          contentType === 'movie'
            ? await tmdbApi.getMovieImages(contentId)
            : await tmdbApi.getTVShowImages(contentId);

        const bestBackdrop = tmdbApi.findBestBackdrop(imagesResponse.backdrops);

        setBackdrop(bestBackdrop);
      } catch (err) {
        console.error(`Error fetching ${contentType} backdrop:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (contentId && contentType) {
      fetchBackdrop();
    }
  }, [contentId, contentType]);

  if (loading) {
    return <div className={`bg-slate-800 animate-pulse ${className}`}>{children}</div>;
  }

  if (error || !backdrop) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ${className}`}
        style={{
          backgroundImage: `url(/placeholder.svg?height=800&width=1200)`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${tmdbApi.getBackdropUrl(backdrop.file_path, 'w1280')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
};
