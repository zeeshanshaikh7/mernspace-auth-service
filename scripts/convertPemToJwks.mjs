/* eslint-disable no-undef */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKey = fs.readFileSync(
    path.resolve(__dirname, '../certs/private.pem'),
);

const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

console.log(jwk);
