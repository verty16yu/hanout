// Mesure d'audience anonyme avec PostHog, seulement si le joueur a accepté.
// - Rien n'est chargé ni envoyé avant l'accord : la bibliothèque est importée à la demande.
// - Aucune donnée personnelle : ni nom, ni email, ni position. Un identifiant au hasard par appareil.
// - Le plan de mesure (événements et questions auxquelles ils répondent) est dans docs/analyse.md.

import type { PostHog } from 'posthog-js';
import { POSTHOG } from './config';
import { lireEtat, ville } from './etat';

type Proprietes = Record<string, string | number | boolean | string[] | null>;

let client: PostHog | null = null;
let chargement: Promise<void> | null = null;
const enAttente: { evenement: string; proprietes: Proprietes }[] = [];

export function mesureDisponible(): boolean {
  return POSTHOG.cle.length > 0;
}

function contexte(): Proprietes {
  const e = lireEtat();
  return {
    langue: e.langue,
    version: e.mode,
    ville: e.villeId,
    pays: ville().pays,
    ecran_large: typeof window !== 'undefined' && window.innerWidth >= 900,
  };
}

/** Démarre PostHog si une clé est configurée et que le joueur a accepté. Sans effet sinon. */
export function demarrerMesure(): Promise<void> {
  if (!mesureDisponible() || lireEtat().consentement !== 'oui') return Promise.resolve();
  if (chargement) return chargement;
  chargement = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG.cle, {
        api_host: POSTHOG.hote,
        person_profiles: 'identified_only', // événements anonymes, aucun profil personnel
        capture_pageview: false, // les écrans sont envoyés par le jeu (routeur par ancre)
        autocapture: true,
        persistence: 'localStorage',
        disable_session_recording: false,
        session_recording: { maskAllInputs: true },
      });
      posthog.register(contexte());
      client = posthog;
      enAttente.splice(0).forEach((x) => posthog.capture(x.evenement, x.proprietes));
    })
    .catch(() => {
      // bloqueur de publicité ou réseau absent : le jeu continue sans mesure
      chargement = null;
    });
  return chargement;
}

/** Arrête la mesure et efface l'identifiant de l'appareil (le joueur a retiré son accord). */
export function arreterMesure(): void {
  if (client) {
    client.opt_out_capturing();
    client.reset();
  }
  client = null;
  chargement = null;
  enAttente.length = 0;
}

/** Enregistre un événement de jeu. Ignoré tant que le joueur n'a pas accepté. */
export function suivre(evenement: string, proprietes: Proprietes = {}): void {
  if (!mesureDisponible() || lireEtat().consentement !== 'oui') return;
  const props = { ...contexte(), ...proprietes };
  if (client) client.capture(evenement, props);
  else {
    enAttente.push({ evenement, proprietes: props });
    void demarrerMesure();
  }
}

/** Chronomètre simple pour la durée d'une mission. */
export function chrono(): () => number {
  const debut = Date.now();
  return () => Math.round((Date.now() - debut) / 1000);
}
