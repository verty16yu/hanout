// Les 19 missions de la version éducative, alignées sur les plans de cours
// de L1 SEGC (Statistics 1, Microeconomics 1, Introduction to Economics).
// Titres et notions sont dans i18n (mission.<id>.titre / .notion).
// Seules les missions « jouable: true » existent dans le prototype.

import { lireEtat } from '../etat';
import { t } from '../i18n';

export type ModuleId = 'intro' | 'micro' | 'stats';

export interface Mission {
  id: string;
  module: ModuleId;
  numero: number;
  /** Chapitre du cours, par exemple « ch. 2 ». */
  chapitre: string;
  jouable: boolean;
}

export const MODULES: Record<ModuleId, { couleur: string; fond: string }> = {
  intro: { couleur: '#8F5222', fond: '#FBF1E4' },
  micro: { couleur: '#1E6FA8', fond: '#E3EFF8' },
  stats: { couleur: '#2F8A63', fond: '#DDF0E6' },
};

const m = (id: string, module: ModuleId, numero: number, chapitre: string, jouable = false): Mission => ({ id, module, numero, chapitre, jouable });

export const MISSIONS: Mission[] = [
  m('intro-1', 'intro', 1, 'ch. 2', true),
  m('intro-2', 'intro', 2, 'ch. 3'),
  m('intro-3', 'intro', 3, 'ch. 4'),
  m('intro-4', 'intro', 4, 'ch. 5'),
  m('intro-5', 'intro', 5, 'ch. 6–7'),
  m('intro-6', 'intro', 6, 'ch. 9'),
  m('micro-1', 'micro', 1, 'ch. 1'),
  m('micro-2', 'micro', 2, 'ch. 2'),
  m('micro-3', 'micro', 3, 'ch. 2'),
  m('micro-4', 'micro', 4, 'ch. 4', true),
  m('micro-5', 'micro', 5, 'ch. 3'),
  m('micro-6', 'micro', 6, 'ch. 4'),
  m('micro-7', 'micro', 7, 'ch. 5–6'),
  m('stats-1', 'stats', 1, 'ch. 1'),
  m('stats-2', 'stats', 2, 'ch. 2'),
  m('stats-3', 'stats', 3, 'ch. 2–3', true),
  m('stats-4', 'stats', 4, 'ch. 3'),
  m('stats-5', 'stats', 5, 'ch. 4'),
  m('stats-6', 'stats', 6, 'ch. 5'),
];

export function trouverMission(id: string): Mission | undefined {
  return MISSIONS.find((x) => x.id === id);
}

export function titreMission(mission: Mission): string {
  return t(`mission.${mission.id}.titre`);
}

/** Nom du module : intitulé du cours en version éducative, thème de jeu en grand public. */
export function nomModule(id: ModuleId): string {
  return lireEtat().mode === 'edu' ? t(`module.${id}`) : t(`modulePublic.${id}`);
}
