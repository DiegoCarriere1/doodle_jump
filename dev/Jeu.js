import { Controller } from './Controller.js';



export class Joueur {
    static MAX_ITER = 20;//(nombre d’itérations maximum s’il n’y a pas de Game Over)

    constructor(PNGs, is_AI, id, canva_size) {
        this.is_AI = is_AI;
        this.PNGs = PNGs;
        this.id = id;
        this.canva_size = canva_size;
        this.bestScore = 0;
        this.is_active = true;
    }

    jouer() {
        Promise.all([
            new Promise( (resolve) => {this.PNGs[0].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[1].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[2].addEventListener('load', () => { resolve();}); }),
            new Promise( (resolve) => {this.PNGs[3].addEventListener('load', () => { resolve();}); })
        ])
            .then(() => {
                this.app = new Controller(this.PNGs, this.is_AI, this.id, this.canva_size, Joueur.MAX_ITER);
                this.app.setJoueurInstance(this);
                this.app.Update();
            });
    }

    get_best_score() {
        return this.bestScore;
    }

    onControllerActiveChanged(is_active) {
        if(!is_active && this.app) {
            this.bestScore = this.app.getBestScore();
            this.is_active = false;
            this.jeu.reduce_nb_survivant();
        }
    }

    set_jeu_instance(jeu) {
        this.jeu = jeu;
    }

    get_reseau() {
        return this.app.get_reseau();
    }

}

export class Jeu {
    static AI_GAME = true;
    static POPULATION_MAX = 50; //(nombre d’individus au sein de la population)
    static NB_ENFANTS = 0.70; //(50% des individus de la population vont être remplacés par de nouveaux enfants)
    constructor(PNGs, canva_size, joueurs= null) {

        this.canva_size = canva_size;
        this.nb_survivants = Jeu.POPULATION_MAX;

        this.nb_joueurs = Jeu.POPULATION_MAX;

        if(joueurs) {
            this.joueurs = joueurs;

        }
        else { //creation de joueurs avec des reseaux aleatoires (premiere iteration)
            this.joueurs = new Array(this.nb_joueurs);

            for (let i = 0; i < this.nb_joueurs; i++) {
                this.joueurs[i] = new Joueur(PNGs, Jeu.AI_GAME, i, this.canva_size);
            }
        }

        for (let i = 0; i < this.nb_joueurs; i++) {
            this.creer_html_joueur(i);
            this.joueurs[i].set_jeu_instance(this);
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

        document.body.insertAdjacentElement("beforeend", div_joueur);
    }

    lancer() {
        this.joueurs.forEach((joueur) => joueur.jouer());
    }

    reduce_nb_survivant() {
        this.nb_survivants--;
        if(this.nb_survivants === 0) {
            this.arreter();
        }
    }


    //retourne les meilleurs joueurs du jeu selon Jeu.NB_ENFANTS
    arreter() {
        //récupérer les meilleurs joueurs (futurs parents)
        this.joueurs.sort((joueur_a,joueur_b) => { return joueur_b.get_best_score() - joueur_a.get_best_score(); });
        const nb_parents = Math.round(Jeu.POPULATION_MAX * ( 1 - Jeu.NB_ENFANTS));

        let parents = new Array(nb_parents);

        for (let i = 0; i < nb_parents; i++) {
            parents.push(this.joueurs[i]);
        }

        return parents;
    }
}

