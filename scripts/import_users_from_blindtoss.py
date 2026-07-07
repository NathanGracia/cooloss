#!/usr/bin/env python3
"""
Migration one-shot : copie les comptes existants de Blindtoss vers cooloss.

Garde les mêmes id (les FK de Blindtoss vers User.id restent valides via le
miroir local — voir lib/sharedAuth.ts côté Blindtoss), copie physiquement les
fichiers d'avatar, et réécrit avatarFile en URL absolue puisqu'un chemin
relatif /avatars/... ne veut plus rien dire une fois affiché ailleurs que sur
blindtoss.nathangracia.com.

Toujours faire un dry-run sur des COPIES des DB avant de lancer en vrai :

  python3 import_users_from_blindtoss.py \
    --source-db /tmp/dev.db.copy --dest-db /tmp/cooloss_dev.db.copy \
    --source-avatars /opt/blindtest-films/public/avatars \
    --dest-avatars /tmp/avatars_copy \
    --avatar-base-url https://cooloss.nathangracia.com
"""
import argparse
import shutil
import sqlite3
from pathlib import Path


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source-db", required=True, help="dev.db de Blindtoss (source)")
    p.add_argument("--dest-db", required=True, help="dev.db de cooloss (destination)")
    p.add_argument("--source-avatars", required=True, help="dossier public/avatars de Blindtoss")
    p.add_argument("--dest-avatars", required=True, help="dossier public/avatars de cooloss")
    p.add_argument("--avatar-base-url", required=True, help="ex: https://cooloss.nathangracia.com")
    args = p.parse_args()

    source_avatars = Path(args.source_avatars)
    dest_avatars = Path(args.dest_avatars)
    dest_avatars.mkdir(parents=True, exist_ok=True)
    base_url = args.avatar_base_url.rstrip("/")

    src = sqlite3.connect(args.source_db)
    src.row_factory = sqlite3.Row
    dst = sqlite3.connect(args.dest_db)

    rows = src.execute(
        "SELECT id, username, passwordHash, avatarFile, isAdmin, createdAt FROM User ORDER BY id"
    ).fetchall()

    print(f"{len(rows)} compte(s) trouvé(s) dans la source.")

    inserted, skipped, avatars_copied = 0, 0, 0
    max_id = 0

    for row in rows:
        max_id = max(max_id, row["id"])

        existing = dst.execute("SELECT id FROM User WHERE id = ?", (row["id"],)).fetchone()
        if existing:
            print(f"  - id={row['id']} ({row['username']}) déjà présent dans la destination, ignoré.")
            skipped += 1
            continue

        new_avatar_file = None
        if row["avatarFile"] and row["avatarFile"].startswith("/avatars/"):
            filename = row["avatarFile"].removeprefix("/avatars/")
            src_path = source_avatars / filename
            if src_path.exists():
                shutil.copy2(src_path, dest_avatars / filename)
                new_avatar_file = f"{base_url}/avatars/{filename}"
                avatars_copied += 1
            else:
                print(f"  ! avatar introuvable pour id={row['id']}: {src_path}")

        dst.execute(
            "INSERT INTO User (id, username, passwordHash, avatarFile, isAdmin, createdAt) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (row["id"], row["username"], row["passwordHash"], new_avatar_file, row["isAdmin"], row["createdAt"]),
        )
        inserted += 1
        print(f"  + id={row['id']} ({row['username']}) migré.")

    if max_id > 0:
        dst.execute(
            "UPDATE sqlite_sequence SET seq = ? WHERE name = 'User'",
            (max_id,),
        )
        # Si sqlite_sequence n'a pas encore de ligne pour User (DB toute fraîche)
        if dst.execute("SELECT changes()").fetchone()[0] == 0:
            dst.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('User', ?)", (max_id,))

    dst.commit()
    src.close()
    dst.close()

    print(f"\nRésumé : {inserted} inséré(s), {skipped} déjà présent(s), {avatars_copied} avatar(s) copié(s).")


if __name__ == "__main__":
    main()
