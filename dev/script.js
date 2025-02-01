import { Controller } from './Controller.js';

const body = document.body;


class Joueur {
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
                const app = new Controller(this.PNGs, this.is_AI, this.id_canva, this.canva_size);
                app.Update();
            });
    }
}

class Jeu {
    static ai_game = true;
    constructor(nb_joueurs, canva_size) {
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
        this.nb_joueurs = nb_joueurs;
        this.joueurs = [this.nb_joueurs];

        for (let i = 0; i < this.nb_joueurs; i++) {
            body.insertAdjacentHTML("beforeend",
                "<canvas id=\""  + i + "_canvas\" width=\"" + this.canva_size[0] + "\" height=\"" + this.canva_size[1] + "\" style=\"border: 1px solid red\"></canvas>");

            this.joueurs[i] = new Joueur(this.PNGs, Jeu.ai_game, i, this.canva_size);
        }
    }


    start() {
        this.joueurs.forEach((joueur) => joueur.jouer());
    }
}





const jeu = new Jeu(10, [360, 540]);
jeu.start();



