'use client';
import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const mm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mm.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay ?? '0';
          setTimeout(() => el.classList.add('in-view'), Number(delay));
          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
