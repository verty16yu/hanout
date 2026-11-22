import { formaterPrix } from '../economie/monnaie';
import { ville } from '../etat';
import { langue } from '../i18n';

/** Prix dans la monnaie de la ville et au format de la langue du joueur. */
export function prix(unites: number): string {
  return formaterPrix(unites, ville().monnaie, langue());
}
