// Valide le paramètre ?next= avant de l'utiliser comme cible de redirection
// après login/register — sans ça, n'importe qui pourrait forger un lien
// cooloss.nathangracia.com/login?next=https://phishing.example.com et se
// servir de la confiance dans le domaine d'auth pour un open redirect.
export function safeNextUrl(next: string | null | undefined): string {
  if (!next) return '/';
  try {
    const url = new URL(next);
    const host = url.hostname;
    if (host === 'nathangracia.com' || host.endsWith('.nathangracia.com')) {
      return url.toString();
    }
  } catch {
    // pas une URL absolue valide
  }
  return '/';
}
