import { MISSIONS, MODULES, Mission, ModuleId, nomModule, titreMission } from '../contenu/missions';
import { etoiles, lireEtat, missionReussie, ville } from '../etat';
import { t } from '../i18n';
import { chargerBoutique, multiplicateur } from '../boutique';
import { revenuParSeconde } from '../economie/clicker';
import { icone, vignetteAmelioration } from '../ui/dessins';
import { prix } from '../ui/format';
import { afficher, echapper } from '../ui/dom';

function ligneMission(m: Mission, couleur: string): string {
  const edu = lireEtat().mode === 'edu';
  const fait = missionReussie(m.id);
  const rond = fait
    ? `<span class="rond fait" style="background:${couleur}">${icone('coche', '#fff', 20)}</span>`
    : m.jouable
      ? `<span class="rond actif" style="border-color:${couleur};color:${couleur}">${m.numero}</span>`
      : `<span class="rond verrou">${icone('cadenas', '#9A93A0', 18)}</span>`;
  const notion = t(`mission.${m.id}.notion`);
  let sous: string;
  if (fait) sous = edu ? t('carnet.fait.edu') : t('carnet.fait.public', { n: etoiles(m.id) });
  else sous = (m.jouable ? t('carnet.ajouer') : t('carnet.bientot')) + (edu ? ` · ${notion}` : '');
  const chapitre = edu ? ` <span class="chap">${m.chapitre}</span>` : '';
  const etoilesHtml = !edu && fait ? `<span class="mini-etoiles" aria-hidden="true">${[1, 2, 3].map((i) => icone('etoile', i <= etoiles(m.id) ? '#F2B632' : '#E2D7BF', 14)).join('')}</span>` : '';
  const contenu = `${rond}<span class="texte"><span class="nom">${m.numero}. ${echapper(titreMission(m))}${chapitre}</span><span class="sous">${echapper(sous)}</span></span>${etoilesHtml}`;
  return m.jouable
    ? `<li><a class="ligne-mission" href="#/mission/${m.id}">${contenu}</a></li>`
    : `<li><div class="ligne-mission verrouillee" aria-disabled="true">${contenu}</div></li>`;
}

export function ecranCarnet(racine: HTMLElement): void {
  const e = lireEtat();
  const edu = e.mode === 'edu';
  const compteur = edu
    ? t('carnet.compteur.edu', { n: e.badges.length, total: MISSIONS.length })
    : t('carnet.compteur.public', { n: Object.values(e.etoiles).reduce((s, x) => s + x, 0), total: MISSIONS.length * 3 });
  const pistes = (Object.keys(MODULES) as ModuleId[])
    .map((id) => {
      const mod = MODULES[id];
      const liste = MISSIONS.filter((m) => m.module === id);
      const faits = liste.filter((m) => missionReussie(m.id)).length;
      return `<section class="piste" aria-labelledby="piste-${id}">
  <div class="piste-tete" style="background:${mod.fond}"><h2 id="piste-${id}" style="color:${mod.couleur}">${echapper(nomModule(id))}</h2><span style="color:${mod.couleur}">${faits} / ${liste.length}</span></div>
  <ul>${liste.map((m) => ligneMission(m, mod.couleur)).join('')}</ul>
</section>`;
    })
    .join('');
  const boutique = chargerBoutique();
  const sousHanout = boutique.total > 0
    ? t('carnet.hanout.sous', { caisse: prix(boutique.caisse), revenu: prix(revenuParSeconde(boutique, multiplicateur())) })
    : t('carnet.hanout.vide');
  const carteHanout = `<a class="carte-hanout" href="#/hanout">${vignetteAmelioration('etagere')}<span class="texte"><b>${t('carnet.hanout.titre')}</b><span class="petit">${echapper(sousHanout)}</span></span><span class="bouton-mini">${t('carnet.hanout.bouton')}</span></a>`;
  afficher(
    racine,
    `<main class="ecran carnet">
  <header class="barre">
    <a class="retour" href="#/" aria-label="${t('barre.retourAccueil')}">${icone('maison')}</a>
    <div class="titres"><span class="petit">${echapper(t(edu ? 'carnet.surtitre.edu' : 'carnet.surtitre.public', { ville: ville().nom }))}</span><h1 tabindex="-1" data-focus>${t(edu ? 'carnet.titre.edu' : 'carnet.titre.public')}</h1></div>
    <span class="compteur" title="${echapper(compteur)}">${icone('etoile', '#F2B632', 16)} <span>${echapper(compteur)}</span></span>
  </header>
  <div class="carnet-corps">
    ${carteHanout}
    <div class="defi">${icone('trophee', '#fff', 22)}<p><span class="petit">${t('carnet.defi.petit')}</span><b>${t(edu ? 'carnet.defi.edu' : 'carnet.defi.public')}</b></p>
      <a class="lien-version" href="#/">${t('carnet.version', { v: t(edu ? 'mode.edu.titre' : 'mode.public.titre') })}</a></div>
    <div class="pistes">${pistes}</div>
    <p class="note pied"><a href="#/confidentialite">${t('conf.lien')}</a></p>
  </div>
</main>`,
  );
}
