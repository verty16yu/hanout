# Plan de mesure de Hanout

La mesure est **anonyme** et **désactivée par défaut** : rien n'est chargé ni envoyé tant que le joueur n'a pas accepté dans le bandeau (ou sur la page Confidentialité). Outil : [PostHog](https://posthog.com), serveurs dans l'Union européenne, offre gratuite (1 million d'événements par mois).

## Activer la mesure

1. Créer un compte gratuit sur PostHog (région **EU**) et un projet « Hanout ».
2. Copier la **clé publique du projet** (elle commence par `phc_`).
3. La clé est écrite dans `src/config.ts` (elle est publique par nature : elle permet d'envoyer des événements, pas de lire les données). On peut la remplacer sans toucher au code avec la variable de dépôt `POSTHOG_KEY`.
4. À la publication, le bandeau de consentement apparaît dans le jeu.
5. Dans PostHog, réglages du projet : activer l'anonymisation des adresses IP.

## Propriétés envoyées avec chaque événement

| Propriété | Exemple | Sert à |
| --- | --- | --- |
| `langue` | `fr`, `en` | Comparer les joueurs francophones et anglophones |
| `version` | `edu`, `public` | Comparer étudiants et grand public |
| `ville`, `pays` | `alger`, `DZ` | Voir d'où viennent les joueurs |
| `ecran_large` | `true` | Téléphone ou ordinateur |

## Événements

| Événement | Propriétés | Question à laquelle il répond |
| --- | --- | --- |
| `ecran_vu` | `ecran` (`accueil`, `carnet`, `hanout`) | Quels écrans sont ouverts, où les joueurs s'arrêtent |
| `mission_commencee` | `mission` | Quelles missions attirent |
| `mission_terminee` | `mission`, `duree_s`, `etoiles` | Taux de réussite, temps passé par mission |
| `mission_rejouee` | `mission`, `etoiles` | Les joueurs ont-ils envie de rejouer ? |
| `quiz_reponse` | `mission`, `question`, `juste`, `tentative`, `reponse` | **Quelles notions de cours posent problème**, quelles mauvaises réponses reviennent |
| `badge_gagne` | `mission`, `sans_erreur` | Part des étudiants qui maîtrisent la notion du premier coup |
| `intro1_semaine` | `produits`, `gain`, `part_du_meilleur`, `panier_optimal`, `renonce_a` | Les joueurs comprennent-ils l'arbitrage et le coût d'opportunité ? |
| `micro4_offre` | `client`, `essai`, `prix`, `disposition_a_payer`, `ecart_pct`, `issue` | Comment les joueurs marchandent, à quelle distance de la disposition à payer |
| `micro4_bilan` | `surplus_producteur`, `surplus_consommateur`, `part_du_max`, `departs` | Le partage du surplus en fin de journée |
| `stats3_classe` | `heure`, `juste` | Savent-ils repérer la classe modale ? |
| `stats3_horaire` | `horaire`, `essai`, `servis`, `juste` | Savent-ils lire un histogramme pour décider ? |
| `hanout_achat` | `amelioration`, `niveau`, `caisse_totale`, `missions_reussies` | Mon hanout : quelles améliorations sont achetées, et à quel moment de la progression |
| `hanout_quitte` | `duree_s`, `clients`, `achats`, `revenu_par_s`, `gain_absence` | Temps passé dans Mon hanout, et s'il donne envie de revenir |
| `reglage_change` | `reglage`, `valeur` | Changements de langue, de version, de ville |
| `consentement_accepte`, `consentement_retire` | — | Suivi des accords |

PostHog ajoute aussi les clics (autocapture) et, si activés dans le projet, des enregistrements anonymes de parties avec les champs de saisie masqués.

## Tableaux de bord

Créés dans PostHog le 23 novembre 2026 (projet 363681, région UE) : *Entonnoir des missions*, *Notions difficiles*, *Marchandage*, *Fidélité*, *Profil du public*. Leur intention :

1. **Entonnoir** : accueil → carnet → mission commencée → mission terminée, par version et par langue.
2. **Notions difficiles** : taux de bonnes réponses au premier essai pour chaque question de quiz.
3. **Marchandage** : distribution de `ecart_pct` au premier essai, et part des clients perdus.
4. **Fidélité** : joueurs qui reviennent après 1, 7 et 30 jours.
5. **Public** : répartition par pays, langue, version et type d'écran.
