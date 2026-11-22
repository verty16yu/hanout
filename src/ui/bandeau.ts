// Bandeau de consentement : affiché tant que le joueur n'a pas choisi, et seulement si la mesure est configurée.
import { arreterMesure, demarrerMesure, mesureDisponible, suivre } from '../analyse';
import { changerConsentement, lireEtat } from '../etat';
import { t } from '../i18n';

export function afficherBandeau(): void {
  document.getElementById('bandeau-consentement')?.remove();
  if (!mesureDisponible() || lireEtat().consentement !== null) return;
  const b = document.createElement('div');
  b.id = 'bandeau-consentement';
  b.className = 'bandeau';
  b.setAttribute('role', 'region');
  b.setAttribute('aria-label', t('conf.titre'));
  b.innerHTML = `<p>${t('bandeau.texte')} <a href="#/confidentialite">${t('bandeau.plus')}</a></p>
<div class="bandeau-boutons">
  <button type="button" class="bouton" data-choix="non">${t('bandeau.refuser')}</button>
  <button type="button" class="bouton principal" data-choix="oui">${t('bandeau.accepter')}</button>
</div>`;
  b.querySelectorAll<HTMLButtonElement>('[data-choix]').forEach((x) =>
    x.addEventListener('click', () => {
      const choix = x.dataset.choix === 'oui' ? 'oui' : 'non';
      changerConsentement(choix);
      b.remove();
      if (choix === 'oui') {
        void demarrerMesure().then(() => suivre('consentement_accepte'));
      } else arreterMesure();
    }),
  );
  document.body.appendChild(b);
}
