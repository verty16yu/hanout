// Écran « Mon hanout » : la boutique qui tourne entre les missions.
// Un geste sur la devanture sert un client ; les améliorations font tourner la boutique toute seule.
// En version éducative, chaque amélioration montre la notion du cours qu'elle illustre.
import { suivre } from '../analyse';
import { chargerBoutique, missionsReussies, multiplicateur, sauverBoutique } from '../boutique';
import {
  AMELIORATIONS,
  Amelioration,
  PLAFOND_LIVRET,
  SEUIL_LIVRET,
  deposer,
  interets,
  retirer,
  EtatBoutique,
  acheter,
  avancer,
  cout,
  delaiRecuperation,
  gainMarginal,
  gainParClient,
  gainsAbsence,
  niveau,
  revenuParSeconde,
  servir,
} from '../economie/clicker';
import { lireEtat, ville } from '../etat';
import { langue, t } from '../i18n';
import { ammi, devanture, icone, vignetteAmelioration } from '../ui/dessins';
import { afficher, echapper, prefereMoinsDeMouvement } from '../ui/dom';
import { prix } from '../ui/format';

/** Une amélioration se dévoile quand la boutique a gagné 40 % de son premier prix. */
const SEUIL_DEVOILEMENT = 0.4;

export function duree(secondes: number): string {
  if (!Number.isFinite(secondes)) return '∞';
  if (secondes < 60) return `${Math.max(1, Math.ceil(secondes))} s`;
  if (secondes < 3600) return `${Math.ceil(secondes / 60)} min`;
  const h = Math.floor(secondes / 3600);
  const m = Math.round((secondes % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

function visible(a: Amelioration, e: EtatBoutique): boolean {
  return niveau(e, a.id) > 0 || e.total >= a.coutBase * SEUIL_DEVOILEMENT;
}

function livretVisible(e: EtatBoutique): boolean {
  return e.livret > 0 || e.total >= SEUIL_LIVRET;
}

/** Nombre d'éléments dévoilés (améliorations et livret), pour savoir quand redessiner. */
function devoiles(e: EtatBoutique): number {
  return AMELIORATIONS.filter((a) => visible(a, e)).length + (livretVisible(e) ? 1 : 0);
}

function nombre(n: number): string {
  return Math.floor(n).toLocaleString(langue() === 'en' ? 'en-GB' : 'fr-FR').replace(/[  ]/g, ' ');
}

export function ecranHanout(racine: HTMLElement): void {
  const edu = lireEtat().mode === 'edu';
  const mult = multiplicateur();
  const nbMissions = missionsReussies();
  const ouverture = Date.now();
  const absence = gainsAbsence(chargerBoutique(ouverture), ouverture, mult);
  let etat = absence.etat;
  sauverBoutique(etat);
  let clientsSession = 0;
  let achatsSession = 0;
  let nbVisibles = devoiles(etat);
  let message = absence.gain > 0.005 ? t('hanout.absence', { montant: prix(absence.gain) }) : '';
  if (absence.interets > 0.005) message = (message || t('hanout.absence', { montant: prix(0) })) + t('hanout.absence.interets', { montant: prix(absence.interets) });

  const ligneAmelioration = (a: Amelioration): string => {
    const n = niveau(etat, a.id);
    const p = cout(a, n);
    const effet = t(`amelio.${a.id}.effet`, { v: prix(gainMarginal(a, n) * mult) });
    const recup = delaiRecuperation(a, n, mult);
    let details = `<span class="petit">${echapper(t(`amelio.${a.id}.blague`))}</span>`;
    if (edu) {
      const recupTexte = a.type === 'auto' ? t('hanout.recup.temps', { d: duree(recup) }) : t('hanout.recup.clients', { n: Math.ceil(recup) });
      const prochain = a.decroissance < 1 && n > 0 ? `<span class="petit">${echapper(t('hanout.prochain', { v: prix(gainMarginal(a, n) * mult), p: prix(gainMarginal(a, 0) * mult) }))}</span>` : '';
      details = `<span class="notion-puce">${echapper(t(`amelio.${a.id}.notion`))}</span>
        <span class="petit">${echapper(t(`amelio.${a.id}.explication`))}</span>${prochain}
        <span class="petit recup">${echapper(recupTexte)}</span>`;
    }
    return `<li class="amelio">
  ${vignetteAmelioration(a.id)}
  <div class="amelio-texte">
    <span class="amelio-nom"><b>${echapper(t(`amelio.${a.id}.nom`))}</b>${n > 0 ? ` <span class="niveau">${echapper(t('hanout.possede', { n }))}</span>` : ''}</span>
    <span class="effet">${echapper(effet)}</span>
    ${details}
  </div>
  <button type="button" class="bouton acheter" data-acheter="${a.id}" data-prix="${p}"${etat.caisse + 1e-9 < p ? ' disabled' : ''}>
    <span class="libelle">${echapper(t('hanout.acheter', { prix: prix(p) }))}</span>
  </button>
</li>`;
  };

  const ligneMystere = (a: Amelioration): string => `<li class="amelio mystere">
  <svg class="vignette" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#E6DCC6"/><text x="24" y="32" text-anchor="middle" font-size="24" font-weight="700" fill="#9A93A0">?</text></svg>
  <div class="amelio-texte"><b>${t('hanout.mystere')}</b><span class="petit">${echapper(t('hanout.mystere.sous', { prix: prix(a.coutBase * SEUIL_DEVOILEMENT) }))}</span></div>
</li>`;

  const carteLivret = (): string => {
    if (!livretVisible(etat)) return '';
    const plein = etat.livret >= PLAFOND_LIVRET - 1e-6;
    const details = edu
      ? `<span class="notion-puce">${echapper(t('livret.notion'))}</span><span class="petit">${echapper(t('livret.explication'))}</span><span class="petit recup" data-livret-projection>${echapper(t('livret.projection', { montant: prix(etat.livret + interets(etat.livret, 600)) }))}</span>`
      : `<span class="petit">${echapper(t('livret.blague'))}</span>`;
    return `<div class="livret">
  <div class="livret-tete">
    <svg class="vignette" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#E3EFF8"/><rect x="11" y="9" width="26" height="31" rx="3" fill="#1E6FA8"/><rect x="15" y="14" width="18" height="5" rx="1.5" fill="#F2B632"/><path d="M16 26h16M16 31h11" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
    <div class="amelio-texte">
      <b>${t('livret.titre')}</b>
      <span class="petit">${echapper(t('livret.taux', { plafond: prix(PLAFOND_LIVRET) }))}</span>
      ${details}
    </div>
  </div>
  <p class="livret-solde"><span>${t('livret.solde')}</span><b data-livret>${echapper(prix(etat.livret))}</b></p>
  ${plein ? `<p class="petit livret-plein">${t('livret.plein')}</p>` : ''}
  <div class="livret-boutons">
    <button type="button" class="bouton" data-livret-action="moitie">${t('livret.deposerMoitie')}</button>
    <button type="button" class="bouton" data-livret-action="tout">${t('livret.toutDeposer')}</button>
    <button type="button" class="bouton" data-livret-action="retirer">${t('livret.toutRetirer')}</button>
  </div>
</div>`;
  };

  const listeAmeliorations = (): string => {
    const vues = AMELIORATIONS.filter((a) => visible(a, etat));
    const suivante = AMELIORATIONS.find((a) => !visible(a, etat));
    return vues.map(ligneAmelioration).join('') + (suivante ? ligneMystere(suivante) : '');
  };

  const bonus = nbMissions === 0
    ? `<p class="bonus">${icone('trophee', '#8F5222', 18)} <span>${t('hanout.bonus.aucun')}</span></p>`
    : `<p class="bonus actif">${icone('trophee', '#fff', 18)} <span><b>${t('hanout.bonus', { x: mult.toLocaleString(langue() === 'en' ? 'en-GB' : 'fr-FR') })}</b> · ${t(edu ? 'hanout.bonus.edu' : 'hanout.bonus.public')}</span></p>`;

  function rendre(focusId?: string, garder = focusId !== undefined): void {
    const aide = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ? t('hanout.servirAide.clavier') : t('hanout.servirAide');
    afficher(
      racine,
      `<main class="ecran hanout">
  <header class="barre">
    <a class="retour" href="#/carnet" aria-label="${echapper(t('barre.retourCarnet'))}">${icone('retour')}</a>
    <div class="titres"><span class="petit">${echapper(t('hanout.surtitre', { ville: ville().nom }))}</span><h1 tabindex="-1" data-focus>${t('hanout.titre')}</h1></div>
    <span class="compteur caisse-barre" aria-hidden="true">${icone('panier', '#8F5222', 16)} <span data-caisse>${echapper(prix(etat.caisse))}</span></span>
  </header>
  <div class="hanout-corps">
    <section class="hanout-boutique">
      ${etat.total === 0 ? `<div class="bulle-ammi">${ammi(40)}<p>${t('hanout.ammi')}</p></div>` : ''}
      ${message ? `<p class="message-absence" role="status">${echapper(message)} <span class="petit">${t('hanout.absence.note')}</span></p>` : ''}
      <div class="zone-clic">
        <button type="button" class="devanture-bouton" data-servir aria-label="${echapper(t('hanout.servir'))}" aria-describedby="aide-servir">${devanture(etat.niveaux)}</button>
        <span id="aide-servir" class="petit aide-servir">${echapper(aide)}</span>
      </div>
      <dl class="chiffres">
        <div class="chiffre principal"><dt>${t('hanout.caisse')}</dt><dd data-caisse aria-live="off">${echapper(prix(etat.caisse))}</dd></div>
        <div class="chiffre"><dt>${t('hanout.revenu')}</dt><dd>${echapper(t('hanout.parSeconde', { v: prix(revenuParSeconde(etat, mult)) }))}</dd></div>
        <div class="chiffre"><dt>${t('hanout.parClient')}</dt><dd>${echapper(prix(gainParClient(etat, mult)))}</dd></div>
      </dl>
      <p class="petit clients-servis" data-clients>${echapper(t('hanout.clients', { n: nombre(etat.clients) }))}</p>
      ${bonus}
      <a class="bouton" href="#/carnet">${t(edu ? 'hanout.missions.edu' : 'hanout.missions.public')}</a>
    </section>
    <section class="hanout-ameliorations" aria-labelledby="titre-amelios">
      ${carteLivret()}
      <h2 id="titre-amelios">${t('hanout.ameliorations')}</h2>
      <ul class="liste-amelios">${listeAmeliorations()}</ul>
      <p class="sr" role="status" data-annonce></p>
    </section>
  </div>
</main>`,
      { garderPosition: garder },
    );
    brancher();
    brancherLivret();
    rafraichir();
    if (focusId) racine.querySelector<HTMLElement>(`[data-acheter="${focusId}"]`)?.focus({ preventScroll: true });
  }

  /** Met à jour la caisse et les boutons sans tout redessiner (garde le focus et les animations). */
  function rafraichir(): void {
    const texte = prix(etat.caisse);
    racine.querySelectorAll<HTMLElement>('[data-caisse]').forEach((el) => {
      if (el.textContent !== texte) el.textContent = texte;
    });
    const clients = racine.querySelector<HTMLElement>('[data-clients]');
    if (clients) clients.textContent = t('hanout.clients', { n: nombre(etat.clients) });
    racine.querySelectorAll<HTMLButtonElement>('[data-acheter]').forEach((b) => {
      b.disabled = etat.caisse + 1e-9 < Number(b.dataset.prix);
    });
    const livret = racine.querySelector<HTMLElement>('[data-livret]');
    if (livret) livret.textContent = prix(etat.livret);
    const projection = racine.querySelector<HTMLElement>('[data-livret-projection]');
    if (projection) projection.textContent = t('livret.projection', { montant: prix(etat.livret + interets(etat.livret, 600)) });
    racine.querySelectorAll<HTMLButtonElement>('[data-livret-action]').forEach((b) => {
      const depot = b.dataset.livretAction !== 'retirer';
      b.disabled = depot ? etat.caisse < 0.005 || etat.livret >= PLAFOND_LIVRET - 1e-6 : etat.livret < 0.005;
    });
  }

  function gainFlottant(montant: number): void {
    if (prefereMoinsDeMouvement()) return;
    const zone = racine.querySelector<HTMLElement>('.zone-clic');
    if (!zone) return;
    const el = document.createElement('span');
    el.className = 'gain-flottant';
    el.textContent = `+${prix(montant)}`;
    el.style.left = `${25 + Math.random() * 50}%`;
    el.style.top = `${35 + Math.random() * 25}%`;
    el.setAttribute('aria-hidden', 'true');
    zone.appendChild(el);
    window.setTimeout(() => el.remove(), 900);
  }

  function brancher(): void {
    const bouton = racine.querySelector<HTMLButtonElement>('[data-servir]');
    bouton?.addEventListener('click', () => {
      const gain = gainParClient(etat, mult);
      etat = servir(etat, mult);
      clientsSession += 1;
      gainFlottant(gain);
      bouton.classList.remove('servi');
      void bouton.offsetWidth; // relance l'animation
      bouton.classList.add('servi');
      rafraichir();
      verifierDevoilement();
    });
    racine.querySelectorAll<HTMLButtonElement>('[data-acheter]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.dataset.acheter ?? '';
        const apres = acheter(etat, id);
        if (!apres) return;
        etat = apres;
        achatsSession += 1;
        sauverBoutique(etat);
        suivre('hanout_achat', { amelioration: id, niveau: niveau(etat, id), caisse_totale: Math.round(etat.total * 100) / 100, missions_reussies: nbMissions });
        message = '';
        nbVisibles = devoiles(etat);
        rendre(id);
        const annonce = racine.querySelector<HTMLElement>('[data-annonce]');
        if (annonce) annonce.textContent = t('hanout.achete', { nom: t(`amelio.${id}.nom`) });
      }),
    );
  }

  function brancherLivret(): void {
    racine.querySelectorAll<HTMLButtonElement>('[data-livret-action]').forEach((b) =>
      b.addEventListener('click', () => {
        const action = b.dataset.livretAction ?? '';
        const avant = etat.livret;
        const apres =
          action === 'retirer' ? retirer(etat, etat.livret) : deposer(etat, action === 'moitie' ? etat.caisse / 2 : etat.caisse);
        if (!apres) return;
        etat = apres;
        sauverBoutique(etat);
        suivre('hanout_livret', { action: action === 'retirer' ? 'retrait' : 'depot', montant: Math.round(Math.abs(etat.livret - avant) * 100) / 100, livret: Math.round(etat.livret * 100) / 100 });
        rendre(undefined, true);
        racine.querySelector<HTMLElement>(`[data-livret-action="${action}"]`)?.focus({ preventScroll: true });
        const annonce = racine.querySelector<HTMLElement>('[data-annonce]');
        if (annonce) annonce.textContent = t('livret.annonce', { montant: prix(etat.livret) });
      }),
    );
  }

  function verifierDevoilement(): void {
    const n = devoiles(etat);
    if (n !== nbVisibles) {
      nbVisibles = n;
      const actif = document.activeElement as HTMLElement | null;
      const surBoutique = actif?.hasAttribute('data-servir');
      rendre(undefined, true);
      if (surBoutique) racine.querySelector<HTMLElement>('[data-servir]')?.focus({ preventScroll: true });
    }
  }

  // Le temps qui passe : la boutique encaisse toute seule.
  let dernier = performance.now();
  let depuisSauvegarde = 0;
  const minuterie = window.setInterval(() => {
    const maintenant = performance.now();
    const dt = Math.min(5, (maintenant - dernier) / 1000);
    dernier = maintenant;
    etat = { ...avancer(etat, dt, mult), vu: Date.now() };
    rafraichir();
    verifierDevoilement();
    depuisSauvegarde += dt;
    if (depuisSauvegarde >= 5) {
      sauverBoutique(etat);
      depuisSauvegarde = 0;
    }
  }, 250);

  const enregistrer = () => sauverBoutique({ ...etat, vu: Date.now() });
  const quandCache = () => {
    if (document.visibilityState === 'hidden') enregistrer();
  };
  document.addEventListener('visibilitychange', quandCache);
  window.addEventListener('pagehide', enregistrer);
  window.addEventListener(
    'hashchange',
    () => {
      window.clearInterval(minuterie);
      document.removeEventListener('visibilitychange', quandCache);
      window.removeEventListener('pagehide', enregistrer);
      enregistrer();
      suivre('hanout_quitte', {
        duree_s: Math.round((Date.now() - ouverture) / 1000),
        clients: clientsSession,
        achats: achatsSession,
        revenu_par_s: Math.round(revenuParSeconde(etat, mult) * 100) / 100,
        gain_absence: Math.round(absence.gain * 100) / 100,
      });
    },
    { once: true },
  );

  rendre();
}
