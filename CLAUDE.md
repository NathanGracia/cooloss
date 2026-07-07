# CLAUDE.md — cooloss

Hub d'identité partagé entre les apps "-oss" du VPS (Blindtoss, Memoss, futures apps). Voir `~/docs/compte-unifie-cooloss.md` sur le VPS pour l'architecture complète du système partagé cross-app — ce fichier ne couvre que cooloss lui-même.

## Stack

Next.js 16 (App Router) + Prisma + SQLite. Pas de custom server (`next start` suffit, pas de Socket.IO/WebSocket ici contrairement à Blindtoss).

## Modèle de données

Un seul modèle, `User` (`prisma/schema.prisma`) :

```
id, username (unique, toujours lowercase), displayName (optionnel, nom stylisé),
passwordHash (scrypt "salt:hash"), avatarFile (URL absolue ou null),
isAdmin, isHabitue, createdAt
```

`isHabitue` : rôle intermédiaire, spécifique à Memoss (accès en lecture à l'historique des légendes / timeline, pas de droit de modération). Géré ici (page `/admin`) même si Blindtoss n'en a aucun usage — ce champ est simplement ignoré par Blindtoss (pas dans son `SharedClaims` local, pas de colonne correspondante dans son miroir).

`username` = identifiant de connexion, jamais affiché directement si `displayName` est renseigné (`displayName || username` partout côté affichage).

## Le token partagé

`lib/sharedToken.ts` — `signSharedToken()` / `verifySharedToken()`. Format et rationale détaillés dans `~/docs/compte-unifie-cooloss.md`. Point d'attention : **toute route qui modifie `User` (login, register, avatar, profile) doit réémettre un token frais** avec les nouvelles claims et le reposer via `sharedCookieOptions()` — sinon l'ancienne valeur (ex. ancien avatar) reste visible sur Blindtoss/Memoss jusqu'à expiration (48h).

`lib/session.ts` : `getCurrentClaims()` (lecture), `requireAdminClaims()` (gate admin), `sharedCookieOptions()` (options de cookie communes — **toujours réutiliser cette fonction**, ne jamais respécifier `domain`/`path`/etc. à la main ailleurs, sinon le cookie ne se supprime pas correctement au logout).

## Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/login`, `/api/register` | POST | Auth, posent le cookie |
| `/api/logout` | POST | Clear cookie (JSON, utilisé par le bouton logout de cooloss) |
| `/api/logout` | GET | Clear cookie + redirect `?next=` (navigable, utilisé par Blindtoss/Memoss pour un lien logout sans CORS) — `next` validé via `lib/nextUrl.ts` contre `*.nathangracia.com` (anti open-redirect) |
| `/api/session/refresh` | POST | Réémet un token frais (claims à jour, expiration glissante) |
| `/api/avatar` | POST | Upload avatar, réémet un token frais |
| `/api/profile` | PATCH | Change `displayName`, réémet un token frais |
| `/api/admin/users/[id]` | PATCH | Toggle `isAdmin` et/ou `isHabitue` (indépendants, body `{isAdmin?, isHabitue?}`) — refuse qu'un admin retire son propre `isAdmin` (anti-lockout), pas de restriction équivalente sur `isHabitue` |
| `/api/admin/users/[id]/reset-password` | POST | Génère un mot de passe aléatoire, retourné **une seule fois** dans la réponse (pas d'email configuré, à relayer à la main) |

Toutes les routes `/api/admin/*` et la page `/admin` sont gatées par `requireAdminClaims()`.

## Avatars

Uploadés dans `public/avatars/`, mais **servis directement par nginx** (`location /avatars/` dans la config nginx du VPS, pas dans ce repo), pas par Next.js — `next start` n'indexe `public/` qu'au démarrage, un fichier ajouté après coup sur le volume monté restait 404 jusqu'au restart. `avatarFile` en base est toujours une **URL absolue** (`https://cooloss.nathangracia.com/avatars/...`), jamais un chemin relatif — ce champ est rendu tel quel dans un `<img src>` sur d'autres origines (Blindtoss, Memoss).

## Migration des comptes existants

`scripts/import_users_from_blindtoss.py` — script one-shot, lit la DB SQLite de Blindtoss et copie les `User` (mêmes ids, mots de passe, avatars copiés physiquement + URLs réécrites) dans la DB de cooloss. **Toujours dry-run sur des copies des deux DB avant de lancer en vrai** (voir le docstring du script pour les arguments). Déjà exécuté une fois pour les 5 comptes historiques de Blindtoss — pas censé être relancé, sauf migration d'une nouvelle app avec ses propres comptes préexistants.

## Déploiement

Docker Compose (`docker-compose.yml`), pattern identique aux autres apps du VPS : `docker compose up -d --build`, `prisma db push` au démarrage via `docker-entrypoint.sh` (pas de vraies migrations Prisma, juste push du schema — cohérent avec Blindtoss/Memoss). Secret `SHARED_SESSION_SECRET` dans `.env` (jamais committé), doit être **identique** à celui de Blindtoss et Memoss.

nginx + certbot standard, sous-domaine `cooloss.nathangracia.com`, port local `3010`.

## Conventions

- Pas de commentaires sauf si le "pourquoi" n'est pas évident depuis le code.
- Réutiliser `sharedCookieOptions()`/`getCurrentClaims()` plutôt que réécrire la logique cookie/token ailleurs.
- Toute nouvelle app "-oss" qui veut rejoindre le compte unifié : répliquer la vérification du token (voir les 3 implémentations existantes listées dans `~/docs/compte-unifie-cooloss.md`), ne pas appeler cooloss en synchrone à chaque requête (le système est conçu pour rester stateless côté vérification).
