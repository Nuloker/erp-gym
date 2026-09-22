'use client';

/**
 * BackgroundBlobs.tsx
 * Blobs animados de fundo — efeito fluido/água.
 * Renderizado no layout raiz para aparecer em todas as páginas.
 */
export function BackgroundBlobs() {
  return (
    <div className="bg-blobs" aria-hidden="true">
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
    </div>
  );
}
