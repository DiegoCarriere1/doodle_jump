import { Jeu } from './Jeu.js';



function algorithme_genetique() {
    const jeu = new Jeu([360, 540]);
    jeu.lancer();
    let meilleurs_poids = jeu.arreter();
}
