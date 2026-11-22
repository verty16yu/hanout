// Les 19 missions de la version éducative, alignées sur les plans de cours
// de L1 SEGC (Statistics 1, Microeconomics 1, Introduction to Economics).
// Seules les missions « jouable: true » existent dans le prototype (phase 0).

export type ModuleId = 'intro' | 'micro' | 'stats';

export interface Mission {
  id: string;
  module: ModuleId;
  numero: number;
  titre: string;
  chapitre: string;
  notion: string;
  jouable: boolean;
}

export const MODULES: Record<ModuleId, { nom: string; couleur: string; fond: string }> = {
  intro: { nom: 'Introduction à l’économie', couleur: '#8F5222', fond: '#FBF1E4' },
  micro: { nom: 'Microéconomie', couleur: '#1E6FA8', fond: '#E3EFF8' },
  stats: { nom: 'Statistiques', couleur: '#2F8A63', fond: '#DDF0E6' },
};

export const MISSIONS: Mission[] = [
  { id: 'intro-1', module: 'intro', numero: 1, titre: 'Le premier jour', chapitre: 'ch. 2', notion: 'Rareté, choix, coût d’opportunité', jouable: true },
  { id: 'intro-2', module: 'intro', numero: 2, titre: 'Qui fait tourner le quartier ?', chapitre: 'ch. 3', notion: 'Agents et circuit économique', jouable: false },
  { id: 'intro-3', module: 'intro', numero: 3, titre: 'Consommer ou épargner ?', chapitre: 'ch. 4', notion: 'Consommation, épargne, investissement', jouable: false },
  { id: 'intro-4', module: 'intro', numero: 4, titre: 'La banque du coin', chapitre: 'ch. 5', notion: 'Monnaie et crédit', jouable: false },
  { id: 'intro-5', module: 'intro', numero: 5, titre: 'Tout augmente !', chapitre: 'ch. 6–7', notion: 'Inflation et politiques économiques', jouable: false },
  { id: 'intro-6', module: 'intro', numero: 6, titre: 'Le hanout en ligne', chapitre: 'ch. 9', notion: 'Économie numérique', jouable: false },
  { id: 'micro-1', module: 'micro', numero: 1, titre: 'Lait ou dattes ?', chapitre: 'ch. 1', notion: 'Coût d’opportunité, frontière des possibilités', jouable: false },
  { id: 'micro-2', module: 'micro', numero: 2, titre: 'La courbe de la rue', chapitre: 'ch. 2', notion: 'Courbe de demande', jouable: false },
  { id: 'micro-3', module: 'micro', numero: 3, titre: 'Le marché du pain', chapitre: 'ch. 2', notion: 'Offre et équilibre', jouable: false },
  { id: 'micro-4', module: 'micro', numero: 4, titre: 'Le juste prix', chapitre: 'ch. 4', notion: 'Disposition à payer, surplus', jouable: true },
  { id: 'micro-5', module: 'micro', numero: 5, titre: 'Lait contre chocolat', chapitre: 'ch. 3', notion: 'Élasticités', jouable: false },
  { id: 'micro-6', module: 'micro', numero: 6, titre: 'Le prix plafonné', chapitre: 'ch. 4', notion: 'Prix plafond, pénurie', jouable: false },
  { id: 'micro-7', module: 'micro', numero: 7, titre: 'Le panier de Mme Benali', chapitre: 'ch. 5–6', notion: 'Utilité, courbes d’indifférence', jouable: false },
  { id: 'stats-1', module: 'stats', numero: 1, titre: 'Le cahier de caisse', chapitre: 'ch. 1', notion: 'Population, variables', jouable: false },
  { id: 'stats-2', module: 'stats', numero: 2, titre: 'Ce qui se vend', chapitre: 'ch. 2', notion: 'Fréquences, diagrammes', jouable: false },
  { id: 'stats-3', module: 'stats', numero: 3, titre: 'À quelle heure ouvrir ?', chapitre: 'ch. 2–3', notion: 'Histogramme, classe modale', jouable: true },
  { id: 'stats-4', module: 'stats', numero: 4, titre: 'Le panier moyen', chapitre: 'ch. 3', notion: 'Moyenne, médiane, quartiles', jouable: false },
  { id: 'stats-5', module: 'stats', numero: 5, titre: 'Deux fournisseurs', chapitre: 'ch. 4', notion: 'Dispersion, écart-type', jouable: false },
  { id: 'stats-6', module: 'stats', numero: 6, titre: 'La forme des ventes', chapitre: 'ch. 5', notion: 'Asymétrie, aplatissement', jouable: false },
];

export function trouverMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}
