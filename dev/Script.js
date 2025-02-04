import { Jeu, Joueur } from './Jeu.js';

const background = new Image();
const lik_left = new Image();
const lik_right = new Image();
const tiles = new Image();

background.src = '../tiles/bck@2x.png';
lik_left.src = '../tiles/lik-left@2x.png';
lik_right.src = '../tiles/lik-right@2x.png';
tiles.src = '../tiles/game-tiles.png';
const PNGs = [background, lik_left, lik_right, tiles];


const MAX_GENERATION = 50; //(nombre de générations avant de présenter les résultats finaux).
const TAUX_MUTATION = 0.05; //(probabilité qu’une constante mute)

algorithme_genetique();

function algorithme_genetique() {

    let joueurs = null;

    for (let i = 0; i < MAX_GENERATION; i++) {
        const jeu = new Jeu(PNGs, [360, 540], joueurs);
        jeu.lancer();
        let meilleurs_joueurs = jeu.arreter();
        joueurs = generer_enfants(meilleurs_joueurs);

    }
}


function generer_enfants(parents) {
    const max_joueurs = Jeu.POPULATION_MAX;
    const nb_parents = parents.length;

    let joueurs = parents;

    let parent1, parent2;
    let rand1, rand2;
    let enfant;


    while (joueurs.length <= max_joueurs) {

        rand1 = Math.round(Math.random() * nb_parents);
        rand2 = Math.round(Math.random() * nb_parents);
        while (rand2 === rand1) { //eviter de faire un enfant avec lui meme
            rand2 = Math.round(Math.random() * nb_parents);
        }

        parent1 = parents[rand1];
        parent2 = parents[rand2];

        enfant = copuler(parent1, parent2);

        joueurs.push(enfant);
    }

    return joueurs;
}


function copuler(parent1, parent2) {
    const reseau1 = parent1.get_reseau();
    const reseau2 = parent2.get_reseau();
    let enfant;


    return enfant;
}



//présentation < 5 min
//questions 5 min