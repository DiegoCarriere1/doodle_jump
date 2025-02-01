//3 couches
//12 neurones
//6 neurones
//3 neurones de sortie

//population initiale ex:100 (le nombre de fois ou je lance au demarrage)
//selection des 30 meilleurs
//reproduction pour obtenir 50 nouveaux(faire la somme pondérée des poids entre 2 parents)
//mutation (5% de chance de modifier un poids (de 0.1 par exemple))
//ajouter 20 nouveaux sans rien (éviter les extremum locaux)

class Neurone {
    constructor(couche, numero) {
        this.couche = couche;
        this.numero = numero;
        this.valeur = 0;
    }

    calculer(entrees, matrice_poids, matrice_biais) {
        let sum = 0;
        for (let i = 0; i < matrice_poids[0].length; i++) {
            sum += entrees[i] * matrice_poids[this.numero][i];
            //console.log(" entre : " + entrees[i] + " i : " + i + " len : " + matrice_poids.length + " sum : " + sum);
        }
        this.valeur = sum + matrice_biais[this.numero];

        //console.log(this.valeur + " biais : " + matrice_biais[this.numero]);
        return this.relu(this.valeur); //activation
    }

    get_valeur() { return this.valeur; }

    relu(valeur) {
        return Math.max(0, valeur);
    }
}

export class Reseau {
    constructor(entrees, neurones) {
        this.nb_couches = neurones.length;
        this.couches = this.init_neurones(neurones);
        this.matrices_poids = this.init_matrices_poids(entrees);
        this.matrices_biais = this.init_matrices_biais();

        //console.log("nb couches : " + this.nb_couches);
        //console.log("entrees : " + this.entrees);
        //console.log("couches : " + this.couches);
        //console.log("matrices poids : " + this.matrices_poids);
        //console.log("matrices biais : " + this.matrices_biais);


    }

    /** *****************************************************************************************************************/
    /** init matrices
    /** *****************************************************************************************************************/

    init_neurones(neurones) {
        let couches = Array.from({ length: this.nb_couches }, () => []);

        for (let i = 0; i < neurones.length; i++) {
            for (let j = 0; j < neurones[i]; j++) {
                couches[i][j] = new Neurone(i,j);
            }
        }

        return couches;
    }

    init_matrice_poids(nb_neurones, nb_entrees) {
        //console.log("nb neurones : " + nb_neurones + " nb entre : " + nb_entrees);
        let poids = new Array(nb_neurones).fill(null).map(() => new Array(nb_entrees).fill(0));

        for (let i = 0; i < nb_neurones ; i++) {
            for (let j = 0; j < nb_entrees; j++) {
                poids[i][j] = Math.random() - Math.random();
            }

        }

        //console.log(poids);
        return poids;
    }

    init_matrices_poids(entrees) {
        //console.log(entrees);
        let matrices = []

        for (let i = 0; i < this.nb_couches; i++) {
            if(i === 0) {
                matrices[i] = this.init_matrice_poids(this.couches[i].length, entrees);
            }
            else {
                matrices[i] = this.init_matrice_poids(this.couches[i].length, this.couches[i - 1].length);
            }
        }

        return matrices;
    }

    init_matrice_biais(nb_neurones) {
        let biais = new Array(nb_neurones).fill(0);
        let rand;

        for (let i = 0; i < nb_neurones; i++) {
            rand = Math.random() - Math.random();
            biais[i] = rand;
        }

        return biais;
    }


    init_matrices_biais() {
        let matrices = []

        for (let i = 0; i < this.nb_couches; i++) {
            matrices[i] = this.init_matrice_biais(this.couches[i].length);
        }

        return matrices;
    }

    /** *****************************************************************************************************************/
    /** transformation linéaire
     /** *****************************************************************************************************************/

    //à appeler dans la fonction move / récup le résultat avec 3 neurones de sortie et dire si
    // on bouge à droite/gauche/pas bouger
    
    transformation_lineaire(entrees) {
        //console.log(entrees);
        let curr_entrees = entrees;

        for (let i = 0; i < this.couches.length; i++) {
            curr_entrees = this.get_entrees_couche(i, curr_entrees);
        }

        //console.log("v1 : " + curr_entrees[0] + " v2: " + curr_entrees[1] + " v3: " + curr_entrees[2]);
        return this.activation(curr_entrees); // retourne l'index de la meilleur activation (3 possiblité : 1, 2 , 3)
    }


    get_entrees_couche(num_couche, entree_precedente) {
        let entrees = [];

        for (let i = 0; i < this.couches[num_couche].length; i++) {
            entrees[i] = this.couches[num_couche][i]
                .calculer(entree_precedente, this.matrices_poids[num_couche], this.matrices_biais[num_couche]);

            //console.log(this.couches[num_couche][i]);
        }

        return entrees;
    }

    //retourne l'index de l'entrée avec la meilleure activation sur softmax
    activation(entrees) {
        const sorties = this.softmax(entrees);

        let index = 0;
        let max_valeur = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < entrees.length; i++) {

            if(sorties[i] > max_valeur) {
                index = i;
                max_valeur = sorties[i];
            }
        }

        return index;
    }

    softmax(inputs) {
        const expValues = inputs.map(x => Math.exp(x));
        const sumExp = expValues.reduce((a, b) => a + b, 0);
        return expValues.map(x => x / sumExp);
    }

}