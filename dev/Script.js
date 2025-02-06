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
class Genetique {

    static MAX_GENERATION = 50; //(nombre de générations avant de présenter les résultats finaux).
    static TAUX_MUTATION = 0.05; //(probabilité qu’une constante mute)
    static CANVA_SIZE = [360, 540];

    constructor() {

        Jeu.AI_GAME = document.getElementById("isAi").checked;

        this.joueurs = null;
        this.gen_restantes = Genetique.MAX_GENERATION;
        this.jeu_actuel = new Jeu(PNGs, Genetique.CANVA_SIZE, this.joueurs);

        //graphique :
        this.score_chart = null;
        this.bestScores = [];
        this.averageScores = [];
    }


    lancer() {
        if (Jeu.AI_GAME) {
            this.jeu_actuel.lancer();
            this.jeu_actuel.changer_generation(this.algorithme_genetique.bind(this));
        } else {
            this.jeu_actuel.lancer();
        }
    }


    algorithme_genetique() {
        this.gen_restantes--;
        if (this.gen_restantes !== 0) {

            let meilleurs_joueurs = this.jeu_actuel.arreter();
            this.collectScores(meilleurs_joueurs); //graphique
            this.displayChart();

            this.joueurs = this.generer_enfants(meilleurs_joueurs);

            this.clearGameElements();
            setTimeout(() => { }, 100);

            this.jeu_actuel = new Jeu(PNGs, Genetique.CANVA_SIZE, this.joueurs);
            this.jeu_actuel.lancer();

            this.jeu_actuel.changer_generation(this.algorithme_genetique.bind(this));

        }
    }


    generer_enfants(parents) {
        const max_joueurs = Jeu.POPULATION_MAX;
        const nb_parents = parents.length;

        //console.log("max joueurs : " + max_joueurs);
        let joueurs = [];

        for (let i = 0; i < parents.length; i++) {
            joueurs.push(new Joueur(PNGs, Jeu.AI_GAME, joueurs.length, Genetique.CANVA_SIZE, parents[i].get_reseau()));
        }

        let parent1, parent2;
        let reseau1, reseau2;
        let rand1, rand2;
        let enfant;

        while (joueurs.length < max_joueurs) {

            //récupération aléatoire de 2 des parents
            rand1 = Math.round(Math.random() * (nb_parents - 1));
            rand2 = Math.round(Math.random() * (nb_parents - 1));
            while (rand2 === rand1) { //eviter de faire un enfant avec lui meme
                rand2 = Math.round(Math.random() * (nb_parents - 1));
            }

            //console.log("p.length : " + parents.length + "\nrand1 : " + rand1 + "\nrand2 : " + rand2);
            //console.log("p1 : " + parents[rand1] + "\np2 : " + parents[rand2]);
            //console.log(parents);

            parent1 = parents[rand1];
            parent2 = parents[rand2];
            reseau1 = parent1.get_reseau();
            reseau2 = parent1.get_reseau();
            const [ratio_p1, ratio_p2] = this.get_ratio(parent1.get_best_score(), parent2.get_best_score());

            const reseau_enfant = reseau1.fusionner(reseau2, ratio_p1, ratio_p2);
            enfant = new Joueur(PNGs, Jeu.AI_GAME, joueurs.length, Genetique.CANVA_SIZE, reseau_enfant);
            joueurs.push(enfant);
        }

        joueurs.forEach((joueur) => joueur.set_best_score(0)); //reset des meilleurs scores
        //console.log(joueurs);
        return joueurs;
    }


    get_ratio(score1, score2) {
        let ratio_parents1, ratio_parents2;
        if (score1 === 0) score1++;
        if (score2 === 0) score2++;

        if (score1 > score2) {
            ratio_parents1 = 1 - ((score2 / score1) / 2);
            ratio_parents2 = (score2 / score1) / 2;
        } else {
            ratio_parents1 = 1 - ((score1 / score2) / 2);
            ratio_parents2 = score1 / score2;
        }

        return [ratio_parents1, ratio_parents2];
    }

    clearGameElements() {
        const joueurContainers = document.querySelectorAll('.joueur-container');
        joueurContainers.forEach(container => container.remove());
    }

    collectScores(joueurs) {
        const scores = joueurs.map(joueur => joueur.get_best_score());
        const bestScore = Math.max(...scores);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        this.bestScores.push(bestScore);
        this.averageScores.push(averageScore);
    }

    displayChart() {
        const ctx = document.getElementById('scoreChart').getContext('2d');

        // Destroy the existing chart instance if it exists
        if (this.score_chart !== null) {
            this.score_chart.destroy();
        }

        // Create a new chart instance
        this.score_chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: Genetique.MAX_GENERATION - this.gen_restantes }, (_, i) => i + 1),
                datasets: [
                    {
                        label: 'Best Score',
                        data: this.bestScores,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Average Score',
                        data: this.averageScores,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Epoch'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    }
                }
            }
        });
    }

}


const gen = new Genetique();
gen.lancer();

const aiCheckbox = document.getElementById("isAi");

aiCheckbox.addEventListener("change", () => {
    Jeu.AI_GAME = aiCheckbox.checked;
    gen.clearGameElements();
});




//présentation < 5 min :
// Max 5 diapos
//respect cahier des charges
//respect de MVC
//choix d'implémentation

//questions 5/10 min