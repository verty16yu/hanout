// Mission Micro 4 « Le juste prix » — Microéconomie, chapitre 4 :
// disposition à payer, surplus du consommateur et surplus du producteur.
// Chaque client a une disposition à payer cachée. Le joueur propose un prix.

export type Visage = 'neutre' | 'content' | 'fache';

export interface Client {
  /** Identifiant ; le nom, la description, le produit et les phrases sont dans i18n. */
  id: string;
  /** Prix payé au grossiste (coût du produit pour le hanout), en unités de base. */
  cout: number;
  /** Prix maximum que le client accepte de payer, en unités de base. Caché au joueur. */
  dispositionAPayer: number;
  couleurHaut: string;
  teint: string;
}

export const CLIENTS_COMPTOIR: Client[] = [
  { id: 'karim', cout: 4, dispositionAPayer: 8.5, couleurHaut: '#B83E32', teint: '#C68A5E' },
  { id: 'benali', cout: 5, dispositionAPayer: 7, couleurHaut: '#3FA67A', teint: '#E0B48A' },
  { id: 'yacine', cout: 2, dispositionAPayer: 6, couleurHaut: '#1E6FA8', teint: '#8D5A3B' },
];

export const PATIENCE_INITIALE = 3;
/** Au-dessus de la disposition à payer, mais à moins de 15 % : le client hésite. */
export const SEUIL_HESITATION = 1.15;

export type Issue = 'vente' | 'hesite' | 'refus' | 'depart';

export interface Reaction {
  issue: Issue;
  visage: Visage;
  patienceRestante: number;
  /** Clé du message dans i18n (reaction.*). */
  message: string;
}

/** Réaction du client à un prix proposé, selon la patience qui lui reste. */
export function reagir(client: Client, prix: number, patience: number): Reaction {
  if (prix <= client.dispositionAPayer) {
    const tresBon = prix <= client.dispositionAPayer * 0.75;
    return {
      issue: 'vente',
      visage: 'content',
      patienceRestante: patience,
      message: tresBon ? 'reaction.donne' : 'reaction.accord',
    };
  }
  const restante = patience - 1;
  if (restante <= 0) {
    return { issue: 'depart', visage: 'fache', patienceRestante: 0, message: 'reaction.depart' };
  }
  if (prix <= client.dispositionAPayer * SEUIL_HESITATION) {
    return { issue: 'hesite', visage: 'neutre', patienceRestante: restante, message: 'reaction.hesite' };
  }
  return { issue: 'refus', visage: 'fache', patienceRestante: restante, message: 'reaction.refus' };
}

/** Surplus du consommateur : ce qu'il était prêt à payer moins ce qu'il a payé. */
export function surplusConsommateur(client: Client, prix: number): number {
  return Math.max(0, client.dispositionAPayer - prix);
}

/** Surplus du producteur (ici, le hanout) : le prix de vente moins le prix minimum accepté, le coût. */
export function surplusProducteur(client: Client, prix: number): number {
  return prix - client.cout;
}

export interface Vente {
  clientId: string;
  prix: number | null;
}

/** Le plus grand surplus que le hanout peut tirer d'un client : vendre exactement à sa disposition à payer. */
export function surplusProducteurMax(clients: Client[] = CLIENTS_COMPTOIR): number {
  return clients.reduce((s, c) => s + (c.dispositionAPayer - c.cout), 0);
}

/** Bilan de toutes les ventes : surplus de chacun et surplus total (le gain de l'échange). */
export function bilan(ventes: Vente[]) {
  const lignes = ventes.map((v) => {
    const c = CLIENTS_COMPTOIR.find((x) => x.id === v.clientId)!;
    if (v.prix === null) return { client: c, prix: null, consommateur: 0, producteur: 0 };
    return { client: c, prix: v.prix, consommateur: surplusConsommateur(c, v.prix), producteur: surplusProducteur(c, v.prix) };
  });
  const consommateur = lignes.reduce((s, l) => s + l.consommateur, 0);
  const producteur = lignes.reduce((s, l) => s + l.producteur, 0);
  return { lignes, consommateur, producteur, total: consommateur + producteur };
}
