/**
 * Animações com GSAP + ScrollTrigger.
 * Carregado só depois do "load" e apenas se o usuário não pediu menos movimento.
 * Nada fica invisível sem JavaScript: os estados iniciais são aplicados aqui.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function init() {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;

  // Sai de qualquer animação se o usuário ativar "Pausar animações"
  document.addEventListener('a11y:change', () => {
    if (root.classList.contains('a11y-motion')) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.globalTimeline.clear();
      gsap.set('[data-reveal], [data-stagger] > *', { clearProps: 'all' });
    }
  });

  const inView = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.9;

  // Títulos e blocos: sobem suavemente ao entrar na tela
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (inView(el)) return;
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Grades de cards: entram em cascata
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    if (inView(group)) return;
    gsap.from(group.children, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // Números: contagem progressiva
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.dataset.count || el.textContent || '0';
    const target = Number(raw.replace(/\D/g, ''));
    if (!target) return;
    const fmt = new Intl.NumberFormat(document.documentElement.lang);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt.format(Math.round(obj.v))),
      onComplete: () => (el.textContent = raw),
    });
  });

  // Banner: palavra gigante com parallax e entrada do conteúdo
  const giant = document.querySelector('[data-giant]');
  if (giant) {
    gsap.fromTo(giant, { yPercent: 10 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
  }
}
