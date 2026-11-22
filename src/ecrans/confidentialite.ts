import { arreterMesure, demarrerMesure, mesureDisponible, suivre } from '../analyse';
import { changerConsentement, lireEtat } from '../etat';
import { t, tListe } from '../i18n';
import { icone } from '../ui/dessins';
import { afficher } from '../ui/dom';

export function ecranConfidentialite(racine: HTMLElement): void {
  const c = lireEtat().consentement;
  const dispo = mesureDisponible();
  const etat = !dispo ? t('conf.etat.indispo') : t(`conf.etat.${c ?? 'null'}`);
  afficher(
    racine,
    `<main class="ecran confidentialite">
  <header class="barre">
    <a class="retour" href="#/" aria-label="${t('conf.retour')}">${icone('retour')}</a>
    <div class="titres"><h1 tabindex="-1" data-focus>${t('conf.titre')}</h1></div>
  </header>
  <div class="texte-long">
    <p>${t('conf.intro')}</p>
    <h2>${t('conf.collecte.titre')}</h2>
    <ul>${tListe('conf.collecte').map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>${t('conf.jamais.titre')}</h2>
    <p>${t('conf.jamais')}</p>
    <h2>${t('conf.ou.titre')}</h2>
    <p>${t('conf.ou')}</p>
    <h2>${t('conf.choix.titre')}</h2>
    <p class="carte" role="status">${etat}</p>
    ${
      dispo
        ? c === 'oui'
          ? `<button type="button" class="bouton" data-action="retirer">${t('conf.desactiver')}</button>`
          : `<button type="button" class="bouton principal" data-action="accepter">${t('conf.activer')}</button>`
        : ''
    }
  </div>
</main>`,
  );
  racine.querySelector('[data-action="accepter"]')?.addEventListener('click', () => {
    changerConsentement('oui');
    document.getElementById('bandeau-consentement')?.remove();
    void demarrerMesure().then(() => suivre('consentement_accepte'));
    ecranConfidentialite(racine);
  });
  racine.querySelector('[data-action="retirer"]')?.addEventListener('click', () => {
    suivre('consentement_retire');
    changerConsentement('non');
    arreterMesure();
    ecranConfidentialite(racine);
  });
}
