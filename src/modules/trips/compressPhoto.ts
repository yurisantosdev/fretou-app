import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const LIMITE_DATA_URL = 1_400_000;
const LADO_INICIAL = 1280;

export async function comprimirFoto(uri: string, width = 0, height = 0): Promise<string> {
  let lado = LADO_INICIAL;
  let compress = 0.55;

  for (let tentativa = 0; tentativa < 6; tentativa += 1) {
    const maior = Math.max(width, height);
    const reduzir = maior > lado;
    const escala = reduzir ? lado / maior : 1;
    const resize =
      width > 0 && height > 0 && reduzir
        ? { width: Math.max(1, Math.round(width * escala)), height: Math.max(1, Math.round(height * escala)) }
        : maior > lado
          ? width >= height
            ? { width: lado }
            : { height: lado }
          : width > lado
            ? { width: lado }
            : height > lado
              ? { height: lado }
              : null;

    const resultado = await manipulateAsync(uri, resize ? [{ resize }] : [], {
      compress,
      format: SaveFormat.JPEG,
      base64: true,
    });

    if (!resultado.base64) {
      throw new Error('Não foi possível preparar a imagem.');
    }

    const dataUrl = `data:image/jpeg;base64,${resultado.base64}`;
    if (dataUrl.length <= LIMITE_DATA_URL) return dataUrl;

    compress = Math.max(0.3, compress - 0.08);
    lado = Math.round(lado * 0.75);
  }

  throw new Error('A foto ficou grande demais. Envie uma imagem menor.');
}
