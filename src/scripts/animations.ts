/**
 * Animações do site — GSAP + ScrollTrigger + SplitText, com rolagem suave (Lenis).
 * Carregado só depois do "load" e apenas se a pessoa não pediu menos movimento.
 * Elementos já visíveis ao carregar não são escondidos (sem "piscar" e sem atrasar o LCP).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const EASE = 'expo.out';

export function init() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const splits: SplitText[] = [];

  /* ---------- Rolagem suave ---------- */
  const lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  // links internos (#secao) com rolagem suave e compensando o header
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
    const target = document.querySelector(a.hash);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -88 });
    history.pushState(null, '', a.hash);
  });
  // pausa a rolagem suave enquanto um diálogo (menu, busca, acessibilidade) está aberto
  new MutationObserver(() => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start())).observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
  });

  /* ---------- Desliga tudo se a pessoa ativar "Pausar animações" ---------- */
  document.addEventListener('a11y:change', () => {
    if (!root.classList.contains('a11y-motion')) return;
    lenis.destroy();
    gsap.ticker.remove(raf);
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.globalTimeline.clear();
    splits.forEach((s) => s.revert());
    gsap.set('[data-reveal], [data-stagger] > *, .anim-img', { clearProps: 'all' });
  });

  const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

  /* ---------- Títulos: linhas surgindo por trás de uma máscara ---------- */
  const titleSel = '.sec__title, .ja-title, .about__statement, .num__head h2, .join h2, .others__head h2, .pubs h1, [data-split]';
  gsap.utils.toArray<HTMLElement>(titleSel).forEach((el) => {
    if (!below(el)) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      },
    });
    splits.push(split);
  });

  /* ---------- Parágrafos e blocos ---------- */
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (!below(el)) return;
    // não anima de novo o título (já tem a animação por linha)
    const targets = Array.from(el.children).filter((c) => !c.matches(titleSel));
    gsap.from(targets.length ? targets : el, {
      y: 28,
      autoAlpha: 0,
      duration: 1,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ---------- Grades de cards: cascata ---------- */
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    if (!below(group)) return;
    gsap.from(group.children, {
      y: 48,
      autoAlpha: 0,
      duration: 1.1,
      ease: EASE,
      stagger: { each: 0.07, from: 'start' },
      clearProps: 'transform,opacity,visibility', // termina exatamente alinhado
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });

  /* ---------- Fotos: zoom suave com a rolagem ---------- */
  gsap.utils.toArray<HTMLElement>('.num__photo img, .news__feat img, .pub__pages figure:first-child img').forEach((img) => {
    img.classList.add('anim-img');
    gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Números: contagem progressiva ---------- */
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.dataset.count || el.textContent || '0';
    const target = Number(raw.replace(/\D/g, ''));
    if (!target) return;
    const fmt = new Intl.NumberFormat(root.lang);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt.format(Math.round(obj.v))),
      onComplete: () => (el.textContent = raw),
    });
  });

  /* ---------- Banner: palavra gigante e imagem em parallax ---------- */
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    gsap.fromTo('[data-giant]', { yPercent: 8 }, { yPercent: -22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // recalcula posições quando fontes/imagens terminam de carregar
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
