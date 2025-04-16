import type { LoaderFunction } from '@remix-run/cloudflare';
import { providerBaseUrlEnvKeys } from '~/utils/constants';

export const loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  // Sempre retornar true para Anthropic, pois estamos usando chaves fixas
  if (provider === 'Anthropic') {
    return Response.json({ isSet: true });
  }

  // Para outros provedores, retornar false (não serão usados)
  return Response.json({ isSet: false });
};
