import { Controller } from './Controller.js';



export class Joueur {
    static MAX_ITER = 10; //(nombre d’itérations maximum s’il n’y a pas de Game Over)

    constructor(PNGs, is_AI, id, canva_size, reseau) {
        this.is_AI = is_AI;
        this.PNGs = PNGs;
        this.id = id;
        this.canva_size = canva_size;
        this.best_score = 0;
        this.is_active = true;

        console.log("is AI : " + is_AI + "\nreseau : " + reseau);
        if (is_AI && reseau) { //si c'est une IA et que le réseau est donné dans le controleur
            this.reseau = reseau;
        }
    }

    jouer() {
        console.log("debut jouer");
        Promise.all(this.PNGs.map((img, index) => {
            return new Promise((resolve, reject) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.addEventListener('load', () => {
                        resolve();
                    });
                    img.addEventListener('error', () => {
                        console.error(`Failed to load image ${index}`);
                        reject(new Error(`Failed to load image ${index}`));
                    });
                }
            });
        }))
            .then(() => {
                this.app = new Controller(this.PNGs, this.is_AI, this.id, Joueur.MAX_ITER);
                this.app.setJoueurInstance(this);
                this.app.Update();
            })
            .catch(error => {
                console.error('Error loading images:', error);
            });
    }

    get_best_score() {
        return this.best_score;
    }

    set_best_score(score) {
        this.best_score = score;
    }

    onControllerActiveChanged(is_active) {
        if (!is_active && this.app) {
            this.best_score = this.app.getBestScore();
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
    static AI_GAME = document.getElementById("isAi").checked;
    static POPULATION_MAX = 50; //(nombre d’individus au sein de la population)
    static NB_ENFANTS = 0.70; //(50% des individus de la population vont être remplacés par de nouveaux enfants)
    constructor(PNGs, canva_size, joueurs) {

        this.canva_size = canva_size;

        this.nb_survivants = Jeu.POPULATION_MAX;
        this.nb_joueurs = Jeu.POPULATION_MAX;

        if (Jeu.AI_GAME) {
            if (joueurs) {
                this.joueurs = joueurs;

            } else { //creation de joueurs avec des reseaux aleatoires (premiere iteration)
                this.joueurs = new Array(this.nb_joueurs);

                for (let i = 0; i < this.nb_joueurs; i++) {
                    this.joueurs[i] = new Joueur(PNGs, Jeu.AI_GAME, i, this.canva_size);
                }
            }

            for (let i = 0; i < this.nb_joueurs; i++) {
                this.creer_html_joueur(i);
                this.joueurs[i].set_jeu_instance(this);
            }
        } else {
            this.creer_html_joueur(0);
            this.joueur = new Joueur(PNGs, Jeu.AI_GAME, 0, this.canva_size);
            this.joueur.set_jeu_instance(this);
        }
    }

    creer_html_joueur(position) {
        console.log(position, this.canva_size);
        let div_joueur = document.createElement("div");
        div_joueur.setAttribute("id", position.toString());
        div_joueur.classList.add("joueur-container");

        div_joueur.insertAdjacentHTML("beforeend",
            "<canvas id=\"" + position + "_canvas\" width=\"" + this.canva_size[0] + "\" height=\"" + this.canva_size[1] + "\" style=\"border: 1px solid red\"></canvas>");

        if (Jeu.AI_GAME) {
            let div_score_joueur = document.createElement("div");
            div_score_joueur.classList.add("score-container");
            div_score_joueur.insertAdjacentHTML("beforeend",
                "<p id=\"" + position + "_text_score\"> Meilleur score : </p>");
            div_score_joueur.insertAdjacentHTML("beforeend",
                "<p id=\"" + position + "_score\">0</p>");
            div_joueur.insertAdjacentElement("beforeend", div_score_joueur);

            let div_nb_jeu_joueur = document.createElement("div");
            div_nb_jeu_joueur.classList.add("tentative-container");
            div_nb_jeu_joueur.insertAdjacentHTML("beforeend",
                "<p id=\"" + position + "_text_tentative\"> nb tentatives restantes : </p>");
            div_nb_jeu_joueur.insertAdjacentHTML("beforeend",
                "<p id=\"" + position + "_tentative\">" + Joueur.MAX_ITER + "</p>");
            div_joueur.insertAdjacentElement("beforeend", div_nb_jeu_joueur);
        }

        document.body.insertAdjacentElement("beforeend", div_joueur);
    }

    changer_generation(callback) {
        this.b_changer_gen = callback;
    }

    lancer() {
        if (Jeu.AI_GAME) {
            this.joueurs.forEach((joueur) => joueur.jouer());
        } else {
            this.joueur.jouer();
        }
    }

    reduce_nb_survivant() {
        this.nb_survivants--;
        if (this.nb_survivants === 0) {
            this.b_changer_gen();
        }
        return null;
    }

    //retourne les meilleurs joueurs du jeu selon Jeu.NB_ENFANTS
    arreter() {
        //récupérer les meilleurs joueurs (futurs parents)
        this.joueurs.sort((joueur_a, joueur_b) => { return joueur_b.get_best_score() - joueur_a.get_best_score(); });
        const nb_parents = Math.round(Jeu.POPULATION_MAX * (1.0 - Jeu.NB_ENFANTS));
        //console.log("nb_parents : " + nb_parents);

        let parents = new Array(nb_parents);
        //console.log(this.joueurs);

        for (let i = 0; i < nb_parents; i++) {
            parents[i] = (this.joueurs[i]);
        }

        //console.log(parents);
        return parents;
    }
}

