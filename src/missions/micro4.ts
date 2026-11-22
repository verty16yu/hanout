// Mission Micro 4 « Le juste prix » : marchandage au comptoir,
// disposition à payer, surplus du consommateur et du producteur.
import { trouverMission } from '../contenu/missions';
import { CLIENTS_COMPTOIR, PATIENCE_INITIALE, Reaction, Vente, Visage, bilan, reagir } from '../economie/comptoir';
import { formaterPrix } from '../economie/monnaie';
import { ville } from '../etat';
import { barreMission } from '../ui/barre';
import { brancherDebrief, htmlDebrief } from '../ui/debrief';
import { clientAuComptoir, etageres, icone } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';

export function missionMicro4(racine: HTMLElement): void {
  const mission = trouverMission('micro-4')!;
  const monnaie = ville().monnaie;
  const prix = (u: number) => formaterPrix(u, monnaie);
  const ventes: Vente[] = [];
  let index = 0;

  function servir(): void {
    const client = CLIENTS_COMPTOIR[index];
    let patience = PATIENCE_INITIALE;
    let offre = Math.round(client.cout * 2.6 * 10) / 10;
    let visage: Visage = 'neutre';
    let message = client.phraseAccueil;
    let termine: Reaction['issue'] | null = null;

    function rendre(garderPosition = false): void {
      const max = Math.round(client.cout * 3.5 * 10) / 10;
      afficher(
        racine,
        `<main class="ecran mission">
${barreMission(mission, `Client ${index + 1} / ${CLIENTS_COMPTOIR.length}`)}
<div class="comptoir">
  ${etageres()}
  ${clientAuComptoir({ nom: client.nom, couleurHaut: client.couleurHaut, teint: client.teint, visage })}
  <div class="bulle-client" role="status" aria-live="polite"><p class="qui">${echapper(client.nom)} · ${echapper(client.description)}</p><p>${echapper(message)}</p></div>
  <div class="planche" aria-hidden="true"></div>
</div>
<div class="contenu">
  <div class="produit-comptoir">
    <p><b>${echapper(client.produit)}</b><br><span class="petit">Tu l’as acheté ${prix(client.cout)} au grossiste</span></p>
    <p class="patience" aria-label="Patience de ${echapper(client.nom)} : ${patience} sur ${PATIENCE_INITIALE}">${Array.from({ length: PATIENCE_INITIALE }, (_, i) => icone('coeur', i < patience ? '#B83E32' : '#E2D7BF', 20)).join('')}</p>
  </div>
  ${
    termine
      ? `<div class="issue ${termine === 'vente' ? 'ok' : 'ko'}">${termine === 'vente' ? `Vendu ${prix(offre)}. Ta marge : ${prix(offre - client.cout)}.` : `${echapper(client.nom)} est parti sans rien acheter.`}</div>
         <button type="button" class="bouton principal grand" data-action="suivant">${index + 1 < CLIENTS_COMPTOIR.length ? 'Client suivant' : 'Voir le bilan de la journée'}</button>`
      : `<div class="carte offre">
    <div class="offre-ligne"><label for="offre">Ton prix</label><output for="offre" class="gros-prix">${prix(offre)}</output></div>
    <input id="offre" type="range" min="${client.cout}" max="${max}" step="0.1" value="${offre}">
    <div class="offre-ligne petit"><span>${prix(client.cout)}</span><span>Ta marge : <b>${prix(offre - client.cout)}</b></span><span>${prix(max)}</span></div>
  </div>
  <button type="button" class="bouton principal grand" data-action="proposer">Proposer ce prix</button>
  <p class="note">Trop cher, ${echapper(client.nom)} perd patience. Trop bas, tu perds de l’argent.</p>`
  }
</div>
</main>`,
        { garderPosition },
      );
      const curseur = racine.querySelector<HTMLInputElement>('#offre');
      curseur?.addEventListener('input', () => {
        offre = Number(curseur.value);
        racine.querySelector('output.gros-prix')!.textContent = prix(offre);
        const marge = racine.querySelector('.offre-ligne.petit b');
        if (marge) marge.textContent = prix(offre - client.cout);
      });
      racine.querySelector('[data-action="proposer"]')?.addEventListener('click', () => {
        const r = reagir(client, offre, patience);
        patience = r.patienceRestante;
        visage = r.visage;
        message = r.message;
        if (r.issue === 'vente' || r.issue === 'depart') {
          termine = r.issue;
          ventes.push({ clientId: client.id, prix: r.issue === 'vente' ? offre : null });
        }
        rendre(true);
      });
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
    const debrief = {
      missionId: mission.id,
      titre: 'Ce que chacun gagne à l’échange',
      explication: `Chaque client avait un prix maximum en tête : sa <b>disposition à payer</b>. Quand il paie moins, la différence est son <b>surplus du consommateur</b>. De ton côté, ce que tu gagnes au-dessus de ton coût est ton <b>surplus du producteur</b>. Additionnés, ils forment le gain de l’échange : ${prix(b.total)} aujourd’hui. Monter ton prix ne crée pas de richesse : il la fait passer du client vers toi… tant que le client accepte encore d’acheter.`,
      notions: ['Disposition à payer', 'Surplus du consommateur', 'Surplus du producteur'],
      reflexion: 'Quand un client part sans acheter, que devient le gain de l’échange ? Pour toi, pour lui, et pour le quartier ?',
      questions: [
        {
          question: 'Le surplus du consommateur, c’est…',
          choix: ['La différence entre ce qu’il était prêt à payer et le prix payé', 'Le bénéfice du commerçant sur la vente', 'Le prix payé moins le coût du produit', 'L’argent que le client met de côté chaque mois'],
          bonne: 0,
          explication: `Karim était prêt à payer ${prix(8.5)} : s’il paie ${prix(7)}, il garde ${prix(1.5)} de surplus.`,
        },
        {
          question: 'Tu montes ton prix et le client achète quand même. Que se passe-t-il ?',
          choix: ['Son surplus baisse et le tien augmente d’autant', 'Les deux surplus augmentent', 'Les deux surplus baissent', 'Rien ne change pour personne'],
          bonne: 0,
          explication: 'Le gain total de l’échange reste le même : il est seulement partagé autrement.',
        },
      ],
    };
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, 'Bilan')}
<div class="contenu">
  <section class="carte" aria-labelledby="titre-bilan">
    <h2 id="titre-bilan">Le bilan du comptoir</h2>
    <div class="defile"><table class="tableau">
      <thead><tr><th scope="col">Client</th><th scope="col">Prêt à payer</th><th scope="col">Prix</th><th scope="col">Son surplus</th><th scope="col">Ton surplus</th></tr></thead>
      <tbody>${b.lignes
        .map((l) => `<tr><th scope="row">${echapper(l.client.nom)}</th><td>${prix(l.client.dispositionAPayer)}</td><td>${l.prix === null ? 'parti' : prix(l.prix)}</td><td>${prix(l.consommateur)}</td><td>${prix(l.producteur)}</td></tr>`)
        .join('')}</tbody>
      <tfoot><tr><th scope="row">Total</th><td></td><td></td><td>${prix(b.consommateur)}</td><td>${prix(b.producteur)}</td></tr></tfoot>
    </table></div>
  </section>
  ${htmlDebrief(debrief)}
</div>
</main>`,
    );
    brancherDebrief(racine, debrief);
  }

  servir();
}
