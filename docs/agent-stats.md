# Agent 3 — Stats des joueurs

L'agent lit les données de jeu dans PostHog. Il repère ce qui bloque, ennuie ou n'est pas compris, puis propose des améliorations classées par priorité. **Il ne modifie jamais le jeu** : il propose, et le porteur du projet valide (règle du projet : « Claude conçoit et code tout ; je valide les choix »).

- **Quand :** chaque lundi matin (tâche planifiée), ou à la demande (« analyse les stats des joueurs »).
- **Où il lit :** le projet PostHog 363681 (région UE), par le connecteur PostHog.
- **Où il écrit :** une issue GitHub dans `verty16yu/hanout`, titre « Analyse des joueurs — semaine du JJ/MM/AAAA », étiquette `analyse-joueurs`.

## Règles

1. **Période :** les 7 derniers jours, comparés aux 7 jours d'avant quand c'est utile.
2. **Comptes de test :** chaque requête exclut la cohorte « Internal / Test users » avec `AND person_id NOT IN COHORT 344184`. Pour en exclure ton téléphone, ajoute-le à cette cohorte dans PostHog.
3. **Peu de données :** sous **5 joueurs** pour un chiffre, l'agent l'écrit « à surveiller » et n'en tire aucune recommandation ferme. Il donne toujours l'effectif (n).
4. **Pas de nom ni de donnée personnelle** dans l'issue : seulement des chiffres agrégés.
5. **Chaque recommandation s'appuie sur un chiffre** (la preuve, avec n) et nomme le fichier à changer.
6. Si un événement attendu manque dans les données (il ne s'affiche pas ou a été renommé), l'agent le signale au lieu de conclure.
7. Il relit l'issue d'analyse précédente : si une recommandation y a été appliquée (commit ou issue fermée depuis), il regarde si le chiffre a bougé.

## Étapes et requêtes

Les requêtes s'exécutent avec l'outil `execute-sql` du connecteur PostHog. Chacune finit par l'exclusion des comptes de test.

### 1. Volume et public

```sql
SELECT properties.version AS version, properties.langue AS langue, properties.ecran_large AS ordinateur,
       properties.pays AS pays, count(DISTINCT person_id) AS joueurs
FROM events
WHERE event = 'ecran_vu' AND timestamp > now() - INTERVAL 7 DAY AND person_id NOT IN COHORT 344184
GROUP BY version, langue, ordinateur, pays ORDER BY joueurs DESC LIMIT 50
```

### 2. Missions : commencées, terminées, durée

```sql
SELECT properties.mission AS mission,
       count(DISTINCT if(event = 'mission_commencee', person_id, NULL)) AS ont_commence,
       count(DISTINCT if(event = 'mission_terminee', person_id, NULL)) AS ont_termine,
       round(100.0 * ont_termine / greatest(ont_commence, 1)) AS taux_pct,
       round(quantileIf(0.5)(toFloat(properties.duree_s), event = 'mission_terminee')) AS duree_mediane_s
FROM events
WHERE event IN ('mission_commencee', 'mission_terminee') AND timestamp > now() - INTERVAL 7 DAY
  AND person_id NOT IN COHORT 344184
GROUP BY mission ORDER BY mission
```

### 3. Quiz : notions difficiles (premier essai)

```sql
SELECT properties.mission AS mission, properties.question AS question,
       countIf(toInt(properties.tentative) = 1) AS premiers_essais,
       round(100.0 * countIf(toInt(properties.tentative) = 1 AND properties.juste = true)
             / greatest(countIf(toInt(properties.tentative) = 1), 1)) AS pct_juste_1er_essai,
       topK(1)(if(properties.juste = false, properties.reponse, NULL)) AS erreur_frequente
FROM events
WHERE event = 'quiz_reponse' AND timestamp > now() - INTERVAL 7 DAY AND person_id NOT IN COHORT 344184
GROUP BY mission, question ORDER BY pct_juste_1er_essai ASC
```

L'erreur la plus fréquente dit quelle idée fausse corriger dans le débrief de la mission.

### 4. Décisions dans les missions

- **Micro 4 (marchandage), première offre par client :**

```sql
SELECT properties.client AS client, count() AS premieres_offres,
       round(quantile(0.5)(toFloat(properties.ecart_pct))) AS ecart_median_pct,
       round(100.0 * countIf(properties.issue = 'vente') / count()) AS pct_vente_1er_essai
FROM events
WHERE event = 'micro4_offre' AND toInt(properties.essai) = 1 AND timestamp > now() - INTERVAL 7 DAY
  AND person_id NOT IN COHORT 344184
GROUP BY client
```

- **Intro 1 :** part de `intro1_semaine` avec `panier_optimal = true`, et la médiane de `part_du_meilleur`.
- **Stats 3 :** part de `stats3_classe` justes, et nombre moyen d'essais dans `stats3_horaire`.

### 5. Mon hanout

```sql
SELECT count(DISTINCT person_id) AS joueurs_7j,
       count(DISTINCT if(event = 'ecran_vu' AND properties.ecran = 'hanout', person_id, NULL)) AS ont_ouvert_hanout,
       countIf(event = 'hanout_achat') AS achats,
       round(quantileIf(0.5)(toFloat(properties.clients), event = 'hanout_quitte')) AS clients_median_par_visite,
       round(quantileIf(0.5)(toFloat(properties.duree_s), event = 'hanout_quitte')) AS duree_mediane_s,
       count(DISTINCT if(event = 'hanout_livret', person_id, NULL)) AS joueurs_livret
FROM events
WHERE timestamp > now() - INTERVAL 7 DAY AND person_id NOT IN COHORT 344184
```

Ensuite, les achats par amélioration : `hanout_achat`, regroupé par `amelioration`.

### 6. Fidélité

```sql
WITH premiers AS (SELECT person_id, min(toDate(timestamp)) AS j0 FROM events
                  WHERE event = 'ecran_vu' AND person_id NOT IN COHORT 344184 GROUP BY person_id),
     jours AS (SELECT DISTINCT person_id, toDate(timestamp) AS j FROM events WHERE event = 'ecran_vu')
SELECT count(DISTINCT p.person_id) AS joueurs,
       countDistinctIf(p.person_id, p.j0 <= today() - 1) AS eligibles_j1,
       count(DISTINCT if(dateDiff('day', p.j0, jours.j) = 1, p.person_id, NULL)) AS revenus_j1,
       countDistinctIf(p.person_id, p.j0 <= today() - 7) AS eligibles_7j,
       count(DISTINCT if(dateDiff('day', p.j0, jours.j) BETWEEN 1 AND 7, p.person_id, NULL)) AS revenus_7j
FROM premiers AS p LEFT JOIN jours ON jours.person_id = p.person_id
```

Le taux de retour se calcule sur les joueurs **éligibles**, c'est-à-dire arrivés depuis assez longtemps.

### 7. Signes de frustration

```sql
SELECT event, properties.$current_url AS page, count() AS n
FROM events
WHERE event IN ('$rageclick', '$exception') AND timestamp > now() - INTERVAL 7 DAY AND person_id NOT IN COHORT 344184
GROUP BY event, page ORDER BY n DESC LIMIT 20
```

L'ancre de l'URL (`#/mission/…`, `#/hanout`) dit sur quel écran ça se passe. S'il y a des rageclicks, l'agent regarde 2 ou 3 enregistrements de ces sessions, quand ils existent.

## Seuils d'alerte

| Signal | Seuil | Ce que l'agent propose |
| --- | --- | --- |
| Mission terminée | moins de 70 % des joueurs qui l'ont commencée | Trouver l'étape qui bloque (durée, rageclicks) ; clarifier la consigne d'Ammi |
| Durée médiane d'une mission | plus de 10 min | Raccourcir ou découper la mission |
| Quiz, bonne réponse au 1er essai | moins de 60 % | Revoir le débrief de la notion, à partir de l'erreur fréquente |
| Quiz, bonne réponse au 1er essai | plus de 95 % | Question trop facile : la rendre plus discriminante |
| Micro 4, écart médian de la 1re offre | au-delà de ±25 % | Rendre les indices de disposition à payer plus lisibles |
| Mon hanout ouvert | moins de 30 % des joueurs | Rendre la carte du carnet plus visible, l'annoncer après une mission |
| Mon hanout, visites sans achat | médiane de 0 achat | Revoir l'équilibrage (prix, marge de base) |
| Livret utilisé | moins de 10 % de ceux qui ouvrent Mon hanout | Mieux présenter le livret |
| Retour à J+1 | moins de 20 % des joueurs éligibles | Donner une raison de revenir (défi du jour, gains d'absence mis en avant) |
| Rageclicks | 3 ou plus sur un même écran | Bouton peu clair ou trop lent : à corriger en priorité |

Ces seuils sont un point de départ : l'agent peut proposer de les changer quand il y a plus de données.

## Modèle de l'issue

```markdown
## En bref
3 phrases au plus : ce qui marche, ce qui bloque, la priorité de la semaine.

## Les chiffres (7 derniers jours)
Joueurs : n (semaine d'avant : n) · versions · langues · téléphone/ordinateur
Tableau des missions : commencées, terminées, taux, durée médiane
Tableau des quiz : premier essai juste (%), erreur fréquente
Mon hanout : ouvert par x %, achats, livret
Fidélité : retour J+1 et 7 jours (sur n éligibles)

## Ce qu'il faudrait améliorer
- [ ] **Priorité 1 — titre court.** Preuve : chiffre (n = …). Proposition : … Fichier : `src/…`
- [ ] Priorité 2 — …
(5 propositions au plus, cases à cocher pour que le porteur du projet valide)

## À surveiller
Les signaux sous le seuil des 5 joueurs, et les événements manquants.

## Suivi de la semaine dernière
Ce qui a été appliqué, et si le chiffre a bougé.
```

L'issue renvoie aux tableaux de bord PostHog : Entonnoir des missions (1141914), Notions difficiles (1141916), Marchandage (1141917), Fidélité (1141919), Profil du public (1141920).
