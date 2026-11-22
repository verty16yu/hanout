// Réglages publics du jeu.
// La clé PostHog d'un projet est publique par nature (elle part dans le navigateur de chaque joueur) :
// elle permet seulement d'envoyer des événements, pas de lire les données.
// Tant qu'elle est vide, aucune mesure n'a lieu et le bandeau de consentement ne s'affiche pas.
export const POSTHOG = {
  cle: import.meta.env.VITE_POSTHOG_KEY ?? '',
  hote: import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
};
