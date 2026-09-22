'use client';

/**
 * RippleEffect.tsx
 * Adiciona efeito de ondas (ripple) em qualquer elemento clicável.
 * Envolva o elemento com este componente para ativar o efeito.
 */
import { useCallback, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function RippleEffect({ children, className = '' }: Props) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const rect    = element.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top  - size / 2;

    const ripple       = document.createElement('span');
    ripple.className   = 'ripple-effect';
    ripple.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${x}px;
      top:    ${y}px;
    `;

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  return (
    <div
      className={'ripple-btn ' + className}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
