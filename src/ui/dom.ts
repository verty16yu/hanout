// Petits utilitaires d'affichage, sans framework : le jeu doit rester léger
// pour tourner sur des téléphones d'entrée de gamme.

export function echapper(texte: string | number): string {
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Remplace le contenu de l'application ; remonte en haut sauf si on met à jour l'écran en cours. */
export function afficher(racine: HTMLElement, html: string, options: { garderPosition?: boolean } = {}): void {
  const y = window.scrollY;
  racine.innerHTML = html;
  if (options.garderPosition) {
    window.scrollTo(0, y);
    return;
  }
  window.scrollTo(0, 0);
  const titre = racine.querySelector<HTMLElement>('[data-focus]');
  titre?.focus({ preventScroll: true });
}

/** Branche un gestionnaire de clic sur tous les éléments portant data-action="nom". */
export function surAction(racine: HTMLElement, nom: string, fn: (el: HTMLElement) => void): void {
  racine.querySelectorAll<HTMLElement>(`[data-action="${nom}"]`).forEach((el) => {
    el.addEventListener('click', () => fn(el));
  });
}

export function prefereMoinsDeMouvement(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
