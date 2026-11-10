/* Interações do site (leve, sem dependências). GSAP é carregado depois, sob demanda. */

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const root = document.documentElement;
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

/* ---------------- Header: estado ao rolar ---------------- */
const header = $('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------- Dropdowns ---------------- */
const dropdowns = $$('[data-dropdown]');
const closeAll = (except?: Element) =>
  dropdowns.forEach((d) => {
    if (d === except) return;
    d.classList.remove('is-open');
    $('button', d)?.setAttribute('aria-expanded', 'false');
  });
dropdowns.forEach((dd) => {
  const btn = $('button', dd)!;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !dd.classList.contains('is-open');
    closeAll(dd);
    dd.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
  dd.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape') {
      closeAll();
      btn.focus();
    }
  });
});
document.addEventListener('click', () => closeAll());

/* ---------------- Diálogos (menu, busca, acessibilidade) ---------------- */
const dialogs = new Map($$<HTMLDialogElement>('dialog[data-dialog]').map((d) => [d.dataset.dialog!, d]));
const openDialog = (name: string) => {
  dialogs.forEach((d, k) => k !== name && d.open && d.close());
  const d = dialogs.get(name);
  if (!d) return;
  d.showModal();
  document.body.style.overflow = 'hidden';
  if (name === 'search') initSearch();
};
dialogs.forEach((d) => {
  d.addEventListener('close', () => {
    if (![...dialogs.values()].some((x) => x.open)) document.body.style.overflow = '';
  });
  d.addEventListener('click', (e) => {
    if (e.target === d) d.close(); // clique no fundo
    const close = (e.target as Element).closest('[data-close]');
    if (close) d.close();
  });
});
document.addEventListener('click', (e) => {
  const opener = (e.target as Element).closest<HTMLElement>('[data-open]');
  if (opener) {
    e.preventDefault();
    openDialog(opener.dataset.open!);
  }
});
document.addEventListener('keydown', (e) => {
  const typing = /input|textarea|select/i.test((e.target as Element).tagName);
  if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
    e.preventDefault();
    openDialog('search');
  }
});

/* ---------------- Tema claro / escuro ---------------- */
const setTheme = (th: 'light' | 'dark') => {
  root.dataset.theme = th;
  store.set('pg-theme', th);
  syncTheme();
};
const syncTheme = () => {
  const dark = root.dataset.theme === 'dark';
  $$('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-label', dark ? b.dataset.labelLight! : b.dataset.labelDark!);
    b.setAttribute('title', b.getAttribute('aria-label')!);
  });
  $$('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === root.dataset.theme)));
};
$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')));
$$('[data-set-theme]').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.setTheme as 'light' | 'dark')));
syncTheme();

/* ---------------- Acessibilidade ---------------- */
type A11y = { text?: string; cb?: string; contrast?: boolean; links?: boolean; spacing?: boolean; motion?: boolean; cursor?: boolean; libras?: boolean };
let a11y: A11y = {};
try {
  a11y = JSON.parse(store.get('pg-a11y') || '{}');
} catch {}
const applyA11y = () => {
  if (a11y.text && a11y.text !== '0') root.dataset.text = a11y.text;
  else delete root.dataset.text;
  if (a11y.cb) root.dataset.cb = a11y.cb;
  else delete root.dataset.cb;
  (['contrast', 'links', 'spacing', 'motion', 'cursor'] as const).forEach((k) => root.classList.toggle(`a11y-${k}`, !!a11y[k]));
  $$('[data-a11y-text]').forEach((b) => b.setAttribute('aria-pressed', String((a11y.text ?? '0') === b.dataset.a11yText)));
  $$('[data-a11y-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(!!a11y[b.dataset.a11yToggle as keyof A11y])));
  $$('[data-a11y-cb]').forEach((b) => b.setAttribute('aria-pressed', String((a11y.cb ?? '') === b.dataset.a11yCb)));
  $$('[data-a11y-libras]').forEach((b) => b.setAttribute('aria-pressed', String(!!a11y.libras)));
  store.set('pg-a11y', JSON.stringify(a11y));
  if (a11y.libras) loadVLibras();
  document.dispatchEvent(new CustomEvent('a11y:change', { detail: a11y }));
};
$$('[data-a11y-text]').forEach((b) => b.addEventListener('click', () => ((a11y.text = b.dataset.a11yText), applyA11y())));
$$('[data-a11y-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const k = b.dataset.a11yToggle as 'contrast';
    a11y[k] = !a11y[k];
    applyA11y();
  })
);
$$('[data-a11y-cb]').forEach((b) => b.addEventListener('click', () => ((a11y.cb = b.dataset.a11yCb || undefined), applyA11y())));
$$('[data-a11y-libras]').forEach((b) =>
  b.addEventListener('click', () => {
    a11y.libras = !a11y.libras;
    applyA11y();
    if (!a11y.libras) location.reload(); // o widget oficial não oferece "desligar"
  })
);
$('[data-a11y-reset]')?.addEventListener('click', () => {
  const hadLibras = a11y.libras;
  a11y = {};
  applyA11y();
  if (hadLibras) location.reload();
});
applyA11y();

let vlibrasLoaded = false;
function loadVLibras() {
  if (vlibrasLoaded) return;
  vlibrasLoaded = true;
  const wrap = document.createElement('div');
  wrap.setAttribute('vw', '');
  wrap.className = 'enabled';
  wrap.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(wrap);
  const s = document.createElement('script');
  s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  s.onload = () => new (window as any).VLibras.Widget('https://vlibras.gov.br/app');
  document.body.appendChild(s);
}

/* ---------------- Busca ---------------- */
type Doc = { type: string; title: string; text?: string; url: string; date?: string };
let index: Doc[] | null = null;
let searchReady = false;
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
function highlight(text: string, terms: string[]) {
  let out = esc(text);
  const n = norm(out);
  const marks: [number, number][] = [];
  terms.forEach((t) => {
    let i = n.indexOf(t);
    while (i > -1) {
      marks.push([i, i + t.length]);
      i = n.indexOf(t, i + t.length);
    }
  });
  marks.sort((a, b) => b[0] - a[0]).forEach(([a, b]) => (out = out.slice(0, a) + '<mark>' + out.slice(a, b) + '</mark>' + out.slice(b)));
  return out;
}
async function initSearch() {
  const dlg = dialogs.get('search')!;
  const input = $<HTMLInputElement>('input', dlg)!;
  const list = $('#search-results', dlg)!;
  const status = $('#search-status', dlg)!;
  const L = JSON.parse(dlg.dataset.labels || '{}');
  requestAnimationFrame(() => input.focus());
  if (!index) {
    try {
      index = await (await fetch('/search-index.json')).json();
    } catch {
      index = [];
    }
  }
  if (searchReady) return;
  searchReady = true;
  const run = () => {
    const q = norm(input.value.trim());
    const terms = q.split(/\s+/).filter((t) => t.length > 1);
    if (q.length < 2) {
      status.textContent = L.empty;
      list.innerHTML = '';
      return;
    }
    const scored = index!
      .map((d) => {
        const title = norm(d.title);
        const text = norm(d.text || '');
        let score = 0;
        for (const t of terms) {
          if (title.includes(t)) score += title.startsWith(t) ? 5 : 3;
          else if (text.includes(t)) score += 1;
          else return null;
        }
        return { d, score };
      })
      .filter(Boolean) as { d: Doc; score: number }[];
    scored.sort((a, b) => b.score - a.score || (b.d.date || '').localeCompare(a.d.date || ''));
    status.textContent = scored.length ? `${scored.length} ${L.results}` : `${L.none} “${input.value.trim()}”`;
    list.innerHTML = scored
      .slice(0, 20)
      .map(
        ({ d }) =>
          `<li><a href="${esc(d.url)}"><span class="r-type">${esc(L[d.type] || d.type)}</span><span class="r-title">${highlight(d.title, terms)}</span>${
            d.text ? `<span class="r-text">${highlight(d.text, terms)}</span>` : ''
          }</a></li>`
      )
      .join('');
  };
  input.addEventListener('input', run);
  list.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) dlg.close();
  });
  run();
}

/* ---------------- Slider do banner ---------------- */
const hero = $('[data-hero]');
if (hero) {
  const slides = $$('[data-slide]', hero);
  const bgs = $$('[data-bg]', hero);
  const dots = $$<HTMLButtonElement>('[data-goto]', hero);
  const pauseBtn = $<HTMLButtonElement>('[data-hero-pause]', hero);
  let current = 0;
  let timer: number | undefined;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('a11y-motion');
  let paused = reduced();
  const go = (i: number) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === current;
      s.classList.toggle('is-active', on);
      if (on) {
        s.removeAttribute('aria-hidden');
        s.removeAttribute('inert');
      } else {
        s.setAttribute('aria-hidden', 'true');
        s.setAttribute('inert', '');
      }
    });
    bgs.forEach((b, k) => b.classList.toggle('is-active', k === current));
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === current);
      if (k === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    window.clearInterval(timer);
    if (!paused && slides.length > 1) timer = window.setInterval(() => go(current + 1), 7000);
  };
  const setPaused = (p: boolean) => {
    paused = p;
    pauseBtn?.setAttribute('aria-pressed', String(p));
    schedule();
  };
  dots.forEach((d) => d.addEventListener('click', () => (go(Number(d.dataset.goto)), schedule())));
  pauseBtn?.addEventListener('click', () => setPaused(!paused));
  hero.addEventListener('focusin', () => window.clearInterval(timer));
  hero.addEventListener('focusout', schedule);
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') (go(current + 1), schedule());
    if (e.key === 'ArrowLeft') (go(current - 1), schedule());
  });
  // swipe no celular
  let x0 = 0;
  hero.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  hero.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) (go(current + (dx < 0 ? 1 : -1)), schedule());
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? window.clearInterval(timer) : schedule()));
  document.addEventListener('a11y:change', () => reduced() && setPaused(true));
  setPaused(paused);
}

/* ---------------- Animações (GSAP sob demanda) ---------------- */
const wantsMotion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('a11y-motion');
const startAnimations = () => {
  if (wantsMotion()) import('./animations').then((m) => m.init());
};
if (document.readyState === 'complete') startAnimations();
else window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(startAnimations) : setTimeout(startAnimations, 200)));
