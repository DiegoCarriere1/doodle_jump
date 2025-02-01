import { Controller } from './Controller.js';

const body = document.body;


class Joueur {
    static MAX_ITER = 200; //(nombre d’itérations maximum s’il n’y a pas de Game Over)

    constructor(PNGs, is_AI, id_canva, canva_size) {
        this.is_AI = is_AI;
        this.PNGs = PNGs;
        this.id_canva = id_canva;
        this.canva_size = canva_size;
    }

    jouer() {
        Promise.all([
            new Promise( (resolve) => {this.PNGs[0].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[1].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[2].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[3].addEventListener('load', () => { resolve();}); })
        ])
            .then(() => {
                const app = new Controller(this.PNGs, this.is_AI, this.id_canva, this.canva_size, Joueur.MAX_ITER);
                app.Update();
            });
    }
}

class Jeu {
    static AI_GAME = true;
    static POPULATION_MAX = 50; //(nombre d’individus au sein de la population)
    static MAX_GENERATION = 50; //(nombre de générations avant de présenter les résultats finaux).
    static NB_ENFANTS = 0.50; //(50% des individus de la population vont être remplacés par de nouveaux enfants)
    static TAUX_MUTATION = 0.05; //(probabilité qu’une constante mute)
    constructor(canva_size) {
        const background = new Image();
        const lik_left = new Image();
        const lik_right = new Image();
        const tiles = new Image();

        this.canva_size = canva_size;

        background.src = '../tiles/bck@2x.png';
        lik_left.src = '../tiles/lik-left@2x.png';
        lik_right.src = '../tiles/lik-right@2x.png';
        tiles.src = '../tiles/game-tiles.png';

        this.PNGs = [background, lik_left, lik_right, tiles];
        this.nb_joueurs = Jeu.POPULATION_MAX;
        this.joueurs = new Array(this.nb_joueurs);

        for (let i = 0; i < this.nb_joueurs; i++) {
            this.creer_html_joueur(i);

            this.joueurs[i] = new Joueur(this.PNGs, Jeu.AI_GAME, i, this.canva_size);
        }
    }

    creer_html_joueur(position) {
        let div_joueur = document.createElement("div");
        div_joueur.setAttribute("id", position.toString());

        div_joueur.insertAdjacentHTML("beforeend",
            "<canvas id=\""  + position + "_canvas\" width=\"" + this.canva_size[0] + "\" height=\"" + this.canva_size[1] + "\" style=\"border: 1px solid red\"></canvas>");

        let div_score_joueur = document.createElement("div");
        div_score_joueur.insertAdjacentHTML("beforeend",
            "<p id=\"" + position + "_text_score\"> Meilleur score : </p>");
        div_score_joueur.insertAdjacentHTML("beforeend",
            "<p id=\"" + position + "_score\">0</p>");
        div_joueur.insertAdjacentElement("beforeend",div_score_joueur);

        let div_nb_jeu_joueur = document.createElement("div");
        div_nb_jeu_joueur.insertAdjacentHTML("beforeend",
            "<p id=\"" + position + "_text_tentative\"> nb tentatives restantes : </p>");
        div_nb_jeu_joueur.insertAdjacentHTML("beforeend",
            "<p id=\"" + position + "_tentative\">" + Joueur.MAX_ITER + "</p>");
        div_joueur.insertAdjacentElement("beforeend",div_nb_jeu_joueur);

        body.insertAdjacentElement("beforeend", div_joueur);
    }

    start() {
        this.joueurs.forEach((joueur) => joueur.jouer());
    }
}





const jeu = new Jeu([360, 540]);
jeu.start();



