import type { APIRoute } from 'astro';

/**
 * Recebe o "Cadastro de interesse" da página Como aderir e repassa ao Pardot
 * (mesmo form handler e mesmos nomes de campo do site atual).
 * Local (npm run dev): não envia — só valida e responde, para não gerar leads de teste.
 * Produção: envia para PARDOT_ADESAO_URL (variável no Vercel) ou o handler padrão abaixo.
 */
export const prerender = false;

const PARDOT_DEFAULT = 'https://go.pactoglobal.org.br/l/979353/2023-11-29/51qzj';
const REQUIRED = ['nome', 'sobrenome', 'email', 'empresa', 'pais', 'telefone', 'cargo', 'tipoorganizacao', 'numerofuncionarios', 'nivelhierarquico', 'optin', 'fazparte'] as const;
const OPTIONAL = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Formulário inválido.' }, 400);
  }

  // armadilha anti-spam: campo invisível para pessoas, preenchido por robôs
  if (String(form.get('website_url') || '').trim() !== '') {
    return wantsJson ? json({ ok: true }) : redirect('/como-aderir?enviado=1#formulario', 303);
  }

  const data: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const k of REQUIRED) {
    const v = String(form.get(k) ?? '').trim().slice(0, 200);
    if (!v) errors[k] = 'Campo obrigatório.';
    data[k] = v;
  }
  for (const k of OPTIONAL) data[k] = String(form.get(k) ?? '').trim().slice(0, 200);
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Informe um e-mail válido.';
  if (data.numerofuncionarios && !/^\d{1,7}$/.test(data.numerofuncionarios)) errors.numerofuncionarios = 'Informe apenas números.';
  if (data.telefone && data.telefone.replace(/\D/g, '').length < 8) errors.telefone = 'Informe um telefone válido, com DDD.';

  if (Object.keys(errors).length) {
    return wantsJson ? json({ ok: false, errors }, 422) : redirect('/como-aderir?erro=1#formulario', 303);
  }

  if (import.meta.env.DEV) {
    return wantsJson ? json({ ok: true, teste: true }) : redirect('/como-aderir?enviado=1#formulario', 303);
  }

  const target = import.meta.env.PARDOT_ADESAO_URL || PARDOT_DEFAULT;
  const origin = request.headers.get('referer') || 'https://pacto-global.vercel.app/como-aderir';
  const body = new URLSearchParams({ ...data, current_page_url: origin, origin_page: origin });
  try {
    const res = await fetch(target, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      redirect: 'manual',
    });
    const ok = res.status < 400;
    if (!ok) throw new Error(`Pardot ${res.status}`);
    return wantsJson ? json({ ok: true }) : redirect('/como-aderir?enviado=1#formulario', 303);
  } catch (e) {
    console.error('[adesao] falha ao enviar ao Pardot', e);
    return wantsJson
      ? json({ ok: false, error: 'Não foi possível enviar agora. Tente novamente ou escreva para engajamento@pactoglobal.org.br.' }, 502)
      : redirect('/como-aderir?erro=1#formulario', 303);
  }
};
