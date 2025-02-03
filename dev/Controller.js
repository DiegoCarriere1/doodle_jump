import { View } from './View.js';
import { Model } from './Model.js';
import {Reseau} from "./Reseau_neurones.js";

export class Controller {

    static NB_ENTREES_IA = 6; //(vecteur rouge / vert / jeune / bleu / position x Doodle / y)
    static STRUCTURE_RESEAU = [12,6,3]; //3 couches de neurones avec respectivement 12, 6 et 3 neurones

    constructor(PNGs, IS_AI, id, canva_size, max_iter) {
        this.is_AI = IS_AI;
        this.PNGs = PNGs;
        this.id = id;
        this.bestScore = 0;
        this.canva_size = canva_size;

        if(this.is_AI) {
            this.iter_restantes = max_iter;
            this.set_isActive(true);
            this.reset_reseau();
        }


        this._initialize(canva_size);
    }

    _initialize(canva_size) {
        this._view = new View(this.PNGs, this.id, canva_size);
        this._model = new Model(this.reseau);

        this._startTime = Date.now();
        this._lag = 0;
        this._fps = 60;
        this._frameDuration = 1000 / this._fps;

        this._model.BindDisplay(this.Display.bind(this));
        this._model.BindCanvaSize(this.GetCanvaSize.bind(this));
        this._model.BindReset(this.reset.bind(this));
        this._model.BindDraw(this.draw.bind(this));
        this._view.BindSetDirection(this.SetDirection.bind(this));
        this._view.BindGetDirection(this.GetDirection.bind(this));
        this._view.BindGetDoodleHeight(this.GetDoodleHeight.bind(this));
        this._view.BindGetDoodleWidth(this.GetDoodleWidth.bind(this));
        this._view.BindGetTiles(this.GetTiles.bind(this));

        this._model.BindResetReseau(this.reset_reseau.bind(this));

        this._model.createTiles();
    }


    Display(position) { this._view.Display(position, this._model.score); }

    draw(tiles, position) { this._view.drawGame(tiles, position); }

    SetDirection(newDirection) { this._model.direction = newDirection; }
    GetDirection() { return this._model.direction; }
    GetTiles() { return this._model.All_Tiles; }
    GetDoodleHeight() { return this._model.doodle_height; }
    GetDoodleWidth() { return this._model.doodle_whidth; }
    GetCanvaSize() { return this._view.CanvaSize; }
    getScore() {return this._model.getScore(); }

    Update() {
        let currentTime = Date.now();
        let closestTiles = this._model.getClosestTiles(4);
        let deltaTime = currentTime - this._startTime;

        this._lag += deltaTime;
        this._startTime = currentTime;

        while (this._lag >= this._frameDuration) {
            this._model.Move(this._fps, this.is_AI, closestTiles);
            this._lag -= this._frameDuration;
        }

        this._model.b_drawGame(closestTiles, this._model._position);

        if(this.is_active) {
            requestAnimationFrame(this.Update.bind(this));
        }
        else {

        }
    }


    editBestScore() {
        let score_elem = document.getElementById(this.id + "_score");
        score_elem.innerText = this.bestScore;
    }

    editNbTentative() {
        let nb_tentative = document.getElementById(this.id + "_tentative");
        nb_tentative.innerText = this.iter_restantes;
    }

    editFin() {
        let canva = document.getElementById(this.id + "_canvas");
        canva.style = "border: 10px solid red";
    }

    getBestScore() { return this.bestScore; }


    reset_reseau() {
        this.reseau = new Reseau(Controller.NB_ENTREES_IA, Controller.STRUCTURE_RESEAU);
    }

    set_isActive(value) {
        this.is_active = value;
        if(this.joueurInstance) { //si l'instance d'un joueur a bien été associé au controleur
            this.joueurInstance.onControllerActiveChanged(value);
        }
    }

    setJoueurInstance(joueurInstance) { //permet de référencer le joueur associé au controleur.
        this.joueurInstance = joueurInstance;
    }


    reset() {
        const score = this.getScore();

        if(score > this.bestScore) { //alteration du meilleur score.
            this.bestScore = score;
            this.editBestScore();
        }

        if(this.is_AI) { //code à executer si le joueur est une IA
            this.iter_restantes--;
            this.editNbTentative();

            if(this.iter_restantes !== 0) { //si il n'y a plus d'essai alors on desactive le joueur.
                this._initialize();
            } else {
                this.set_isActive(false);
                this.editFin();
            }
        }
        else {
            this._initialize();
        }
    }

    //fonction quand l'IA a terminé toutes ses tentatives. récupère son score et les poids de son réseau.
    get_reseau() {
        return this.reseau;
    }

}