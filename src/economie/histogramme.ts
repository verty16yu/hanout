// Mission Stats 3 « À quelle heure ouvrir ? » — Statistiques, chapitres 2 et 3 :
// données continues regroupées en classes, histogramme, classe modale.

export interface Classe {
  /** Borne inférieure incluse (heure). */
  debut: number;
  /** Borne supérieure exclue (heure). */
  fin: number;
  /** Effectif : nombre de clients sur la semaine. */
  effectif: number;
}

/** Cahier de caisse : passages sur 7 jours, en classes d'une heure, de 7 h à 21 h. */
export const FREQUENTATION: Classe[] = [
  [7, 18], [8, 46], [9, 30], [10, 14], [11, 12], [12, 28], [13, 22],
  [14, 8], [15, 7], [16, 10], [17, 26], [18, 52], [19, 44], [20, 20],
].map(([h, n]) => ({ debut: h, fin: h + 1, effectif: n }));

export const HEURES_OUVERTURE = 8;

export interface Horaire {
  id: string;
  libelle: string;
  /** Heures de début des classes couvertes. */
  heures: number[];
}

export const HORAIRES: Horaire[] = [
  { id: 'matin', libelle: '7 h – 15 h', heures: [7, 8, 9, 10, 11, 12, 13, 14] },
  { id: 'journee', libelle: '11 h – 19 h', heures: [11, 12, 13, 14, 15, 16, 17, 18] },
  { id: 'deux-pics', libelle: '7 h – 10 h, puis 16 h – 21 h', heures: [7, 8, 9, 16, 17, 18, 19, 20] },
];

export function effectifTotal(classes: Classe[] = FREQUENTATION): number {
  return classes.reduce((s, c) => s + c.effectif, 0);
}

/** Classe modale : la classe dont l'effectif est le plus élevé (classes de même amplitude). */
export function classeModale(classes: Classe[] = FREQUENTATION): Classe {
  return classes.reduce((a, b) => (b.effectif > a.effectif ? b : a));
}

export function clientsServis(horaire: Horaire, classes: Classe[] = FREQUENTATION): number {
  return classes.filter((c) => horaire.heures.includes(c.debut)).reduce((s, c) => s + c.effectif, 0);
}

export function meilleurHoraire(horaires: Horaire[] = HORAIRES, classes: Classe[] = FREQUENTATION): Horaire {
  return horaires.reduce((a, b) => (clientsServis(b, classes) > clientsServis(a, classes) ? b : a));
}

/** Fréquence relative d'une classe, en pourcentage arrondi à l'unité. */
export function frequence(classe: Classe, classes: Classe[] = FREQUENTATION): number {
  return Math.round((classe.effectif / effectifTotal(classes)) * 100);
}
