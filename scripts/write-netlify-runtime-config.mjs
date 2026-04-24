import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const apiUrl = process.env.APP_API_URL?.trim();
const googleClientId = process.env.APP_GOOGLE_CLIENT_ID?.trim();

const missingVars = [
  !apiUrl && 'APP_API_URL',
  !googleClientId && 'APP_GOOGLE_CLIENT_ID',
].filter(Boolean);

if (missingVars.length > 0) {
  console.error(
    `Faltan variables de entorno para Netlify: ${missingVars.join(', ')}.`,
  );
  process.exit(1);
}

const outputPath = join(
  process.cwd(),
  'dist',
  'ApiFamilia',
  'browser',
  'app-config.js',
);

const fileContents = `window.__appConfig = {
  apiUrl: ${JSON.stringify(apiUrl)},
  googleClientId: ${JSON.stringify(googleClientId)},
};
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, fileContents, 'utf8');

console.log(`Configuracion de Netlify escrita en ${outputPath}`);
