// Mission Micro 4 « Le juste prix » : marchandage au comptoir,
// disposition à payer, surplus du consommateur et du producteur.
import { trouverMission } from '../contenu/missions';
import { CLIENTS_COMPTOIR, PATIENCE_INITIALE, Reaction, Vente, Visage, bilan, reagir, surplusProducteurMax } from '../economie/comptoir';
import { lireEtat } from '../etat';
import { chrono, suivre } from '../analyse';
import { t, tListe } from '../i18n';
import { barreMission } from '../ui/barre';
import { FinDeMission, brancherFin, htmlFin, partieEnCours, question } from '../ui/debrief';
import { clientAuComptoir, etageres, icone } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';
import { prix } from '../ui/format';

/** Étoiles (grand public) : part du surplus maximal que le hanout pouvait obtenir. */
export function etoilesMicro4(surplusProducteur: number, max: number): number {
  const r = max > 0 ? surplusProducteur / max : 0;
  return r >= 0.85 ? 3 : r >= 0.6 ? 2 : 1;
}

export function missionMicro4(racine: HTMLElement): void {
  const mission = trouverMission('micro-4')!;
  let ventes: Vente[] = [];
  let index = 0;
  let duree = chrono();

  function servir(): void {
    const client = CLIENTS_COMPTOIR[index];
    const nom = t(`perso.${client.id}`);
    let patience = PATIENCE_INITIALE;
    let offre = Math.round(client.cout * 2.6 * 10) / 10;
    let visage: Visage = 'neutre';
    let message = t(`client.${client.id}.accueil`);
    let termine: Reaction['issue'] | null = null;
    let essai = 0;

    function proposer(): void {
      const r = reagir(client, offre, patience);
      essai += 1;
      suivre('micro4_offre', {
        client: client.id,
        essai,
        prix: offre,
        disposition_a_payer: client.dispositionAPayer,
        ecart_pct: Math.round(((offre - client.dispositionAPayer) / client.dispositionAPayer) * 100),
        issue: r.issue,
        partie: partieEnCours(mission.id),
      });
      patience = r.patienceRestante;
      visage = r.visage;
      message = t(r.message);
      if (r.issue === 'vente' || r.issue === 'depart') {
        termine = r.issue;
        ventes.push({ clientId: client.id, prix: r.issue === 'vente' ? offre : null });
      }
      rendre(true);
      const suite = racine.querySelector<HTMLElement>(termine ? '[data-action="suivant"]' : '#offre');
      suite?.focus({ preventScroll: true });
    }

    function rendre(garderPosition = false): void {
      const max = Math.round(client.cout * 3.5 * 10) / 10;
      afficher(
        racine,
        `<main class="ecran mission">
${barreMission(mission, t('barre.client', { a: index + 1, b: CLIENTS_COMPTOIR.length }))}
<div class="mise-en-page">
  <div class="col-gauche">
    <div class="comptoir">
      ${etageres()}
      ${clientAuComptoir({ etiquette: t('micro4.client', { nom, humeur: t(`visage.${visage}`) }), couleurHaut: client.couleurHaut, teint: client.teint, visage })}
      <div class="bulle-client" role="status" aria-live="polite"><p class="qui">${echapper(nom)} · ${echapper(t(`client.${client.id}.desc`))}</p><p>${echapper(message)}</p></div>
      <div class="planche" aria-hidden="true"></div>
    </div>
  </div>
  <div class="col-droite">
    <div class="produit-comptoir">
      <p><b>${echapper(t(`client.${client.id}.produit`))}</b><br><span class="petit">${t('micro4.achete', { x: prix(client.cout) })}</span></p>
      <p class="patience" aria-label="${echapper(t('micro4.patience', { nom, n: patience, max: PATIENCE_INITIALE }))}">${Array.from({ length: PATIENCE_INITIALE }, (_, i) => icone('coeur', i < patience ? '#B83E32' : '#E2D7BF', 20)).join('')}</p>
    </div>
    ${
      termine
        ? `<div class="issue ${termine === 'vente' ? 'ok' : 'ko'}" role="status">${termine === 'vente' ? t('micro4.vendu', { prix: prix(offre), marge: prix(offre - client.cout) }) : t('micro4.parti', { nom: echapper(nom) })}</div>
           <button type="button" class="bouton principal grand" data-action="suivant">${index + 1 < CLIENTS_COMPTOIR.length ? t('micro4.suivant') : t('micro4.voirBilan')}</button>`
        : `<div class="carte offre">
      <div class="offre-ligne"><label for="offre">${t('micro4.prix')}</label><output for="offre" class="gros-prix">${prix(offre)}</output></div>
      <input id="offre" type="range" min="${client.cout}" max="${max}" step="0.1" value="${offre}">
      <div class="offre-ligne petit"><span>${prix(client.cout)}</span><span class="marge">${t('micro4.marge', { x: prix(offre - client.cout) })}</span><span>${prix(max)}</span></div>
    </div>
    <button type="button" class="bouton principal grand" data-action="proposer">${t('micro4.proposer')}</button>
    <p class="note">${t('micro4.note', { nom: echapper(nom) })}</p>
    <p class="note seulement-souris">${t('micro4.clavier')}</p>`
    }
  </div>
</div>
</main>`,
        { garderPosition },
      );
      const curseur = racine.querySelector<HTMLInputElement>('#offre');
      curseur?.addEventListener('input', () => {
        offre = Number(curseur.value);
        racine.querySelector('output.gros-prix')!.textContent = prix(offre);
        const marge = racine.querySelector('.offre-ligne .marge');
        if (marge) marge.innerHTML = t('micro4.marge', { x: prix(offre - client.cout) });
      });
      curseur?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          proposer();
        }
      });
      racine.querySelector('[data-action="proposer"]')?.addEventListener('click', proposer);
      racine.querySelector('[data-action="suivant"]')?.addEventListener('click', () => {
        index += 1;
        if (index < CLIENTS_COMPTOIR.length) servir();
        else rendreBilan();
      });
    }
    rendre();
  }

  function rendreBilan(): void {
    const b = bilan(ventes);
    const maxProd = surplusProducteurMax();
    suivre('micro4_bilan', {
      surplus_producteur: Math.round(b.producteur * 100) / 100,
      surplus_consommateur: Math.round(b.consommateur * 100) / 100,
      part_du_max: Math.round((b.producteur / maxProd) * 100),
      departs: ventes.filter((v) => v.prix === null).length,
      partie: partieEnCours(mission.id),
    });
    const fin: FinDeMission = {
      missionId: mission.id,
      titre: t('micro4.debrief.titre'),
      explication: t('micro4.debrief.texte', { total: prix(b.total) }),
      conseil: t('micro4.conseil', { marge: prix(b.producteur), max: prix(maxProd) }),
      notions: tListe('micro4.notions'),
      reflexion: t('micro4.reflexion'),
      questions: [question('micro4.q1', t('micro4.q1.e', { a: prix(8.5), b: prix(7), c: prix(1.5) })), question('micro4.q2')],
      etoiles: etoilesMicro4(b.producteur, maxProd),
      duree: duree(),
    };
    const edu = lireEtat().mode === 'edu';
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, t('barre.bilan'))}
<div class="mise-en-page">
  <div class="col-gauche">
    <section class="carte" aria-labelledby="titre-bilan">
      <h2 id="titre-bilan">${t('micro4.bilan')}</h2>
      <div class="defile"><table class="tableau">
        <thead><tr><th scope="col">${t('micro4.col.client')}</th>${edu ? `<th scope="col">${t('micro4.col.dap')}</th>` : ''}<th scope="col">${t('micro4.col.prix')}</th>${edu ? `<th scope="col">${t('micro4.col.sc')}</th><th scope="col">${t('micro4.col.sp')}</th>` : `<th scope="col">${t('micro4.col.marge')}</th>`}</tr></thead>
        <tbody>${b.lignes
          .map(
            (l) => `<tr><th scope="row">${echapper(t(`perso.${l.client.id}`))}</th>${edu ? `<td>${prix(l.client.dispositionAPayer)}</td>` : ''}<td>${l.prix === null ? t('micro4.partiCourt') : prix(l.prix)}</td>${edu ? `<td>${prix(l.consommateur)}</td>` : ''}<td>${prix(l.producteur)}</td></tr>`,
          )
          .join('')}</tbody>
        <tfoot><tr><th scope="row">${t('micro4.total')}</th>${edu ? '<td></td>' : ''}<td></td>${edu ? `<td>${prix(b.consommateur)}</td>` : ''}<td>${prix(b.producteur)}</td></tr></tfoot>
      </table></div>
    </section>
  </div>
  <div class="col-droite">${htmlFin(fin)}</div>
</div>
</main>`,
    );
    brancherFin(racine, fin, () => {
      ventes = [];
      index = 0;
      duree = chrono();
      servir();
    });
  }

  servir();
}
