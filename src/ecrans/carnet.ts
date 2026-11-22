import { MISSIONS, MODULES, Mission, ModuleId } from '../contenu/missions';
import { aLeBadge, lireEtat, ville } from '../etat';
import { icone } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';

function ligneMission(m: Mission, couleur: string): string {
  const fait = aLeBadge(m.id);
  const rond = fait
    ? `<span class="rond fait" style="background:${couleur}">${icone('coche', '#fff', 20)}</span>`
    : m.jouable
      ? `<span class="rond actif" style="border-color:${couleur};color:${couleur}">${m.numero}</span>`
      : `<span class="rond verrou">${icone('cadenas', '#9A93A0', 18)}</span>`;
  const sous = fait ? 'Terminée · badge gagné' : m.jouable ? `À jouer · ${echapper(m.notion)}` : `Bientôt · ${echapper(m.notion)}`;
  const contenu = `${rond}<span class="texte"><span class="nom">${m.numero}. ${echapper(m.titre)} <span class="chap">${m.chapitre}</span></span><span class="sous">${sous}</span></span>`;
  return m.jouable
    ? `<li><a class="ligne-mission" href="#/mission/${m.id}">${contenu}</a></li>`
    : `<li><div class="ligne-mission verrouillee" aria-disabled="true">${contenu}</div></li>`;
}

export function ecranCarnet(racine: HTMLElement): void {
  const badges = lireEtat().badges.length;
  const pistes = (Object.keys(MODULES) as ModuleId[])
    .map((id) => {
      const mod = MODULES[id];
      const liste = MISSIONS.filter((m) => m.module === id);
      const faits = liste.filter((m) => aLeBadge(m.id)).length;
      return `<section class="piste" aria-labelledby="piste-${id}">
  <div class="piste-tete" style="background:${mod.fond}"><h2 id="piste-${id}" style="color:${mod.couleur}">${echapper(mod.nom)}</h2><span style="color:${mod.couleur}">${faits} / ${liste.length}</span></div>
  <ul>${liste.map((m) => ligneMission(m, mod.couleur)).join('')}</ul>
</section>`;
    })
    .join('');
  afficher(
    racine,
    `<main class="ecran carnet">
  <header class="barre">
    <a class="retour" href="#/" aria-label="Retour à l’accueil">${icone('retour')}</a>
    <div class="titres"><span class="petit">Hanout Académie · ${echapper(ville().nom)}</span><h1 tabindex="-1" data-focus>Carnet de missions</h1></div>
    <span class="compteur">${icone('etoile', '#F2B632', 16)} ${badges} / ${MISSIONS.length}</span>
  </header>
  <div class="defi">${icone('trophee', '#fff', 22)}<p><span class="petit">Bientôt : défi de la semaine</span><b>Groupe contre groupe, sur les missions du cours</b></p></div>
  ${pistes}
</main>`,
  );
}
