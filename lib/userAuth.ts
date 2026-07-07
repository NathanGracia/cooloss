import crypto from 'crypto';

// Hachage mot de passe (Node crypto / scrypt) — repris tel quel de Blindtoss
// (lib/userAuth.ts), même format de stockage "salt:hash" pour rester
// compatible avec les mots de passe migrés depuis Blindtoss.

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('hex'));
    });
  });
  return `${salt}:${hash}`;
}

export async function comparePassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}
