// Réglages publics du jeu.
// La clé PostHog d'un projet est publique par nature (elle part dans le navigateur de chaque joueur) :
// elle permet seulement d'envoyer des événements, pas de lire les données.
// Elle peut être remplacée par la variable VITE_POSTHOG_KEY (vide = aucune mesure, pas de bandeau).
const CLE_PROJET_HANOUT = 'phc_qotrnkBEyNb7PuaUxueSYQVqHhScqa4NnTPSDv5s7KUn';

export const POSTHOG = {
  cle: import.meta.env.VITE_POSTHOG_KEY || (import.meta.env.MODE === 'test' ? '' : CLE_PROJET_HANOUT),
  hote: import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
};
