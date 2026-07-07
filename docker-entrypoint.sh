#!/bin/sh
set -e

echo "=== cooloss - Demarrage ==="

DB_FILE="/app/prisma/dev.db"

if [ ! -f "$DB_FILE" ]; then
    echo "[1/2] Base de donnees non trouvee, creation..."
    npx prisma db push --skip-generate
else
    echo "[1/2] Base de donnees existante detectee, verification du schema..."
    npx prisma db push --skip-generate
fi

echo "[2/2] Demarrage du serveur..."
exec npm start
