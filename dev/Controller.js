import { View } from './View.js';
import { Model } from './Model.js';
import {Reseau} from "./reseau_neurones.js";

export class Controller {

    static NB_ENTREES_IA = 6; //(vecteur rouge / vert / jeune / bleu / position x Doodle / y)
    static STRUCTURE_RESEAU = [12,6,3]; //3 couches de neurones avec respectivement 12, 6 et 3 neurones

    static POPULATION_MAX = 200; //(nombre d’individus au sein de la population)
    static MAX_ITER = 500; //(nombre d’itérations maximum s’il n’y a pas de Game Over)
    static MAX_GENERATION = 50; //(nombre de générations avant de présenter les résultats finaux).
    static NB_ENFANTS = 0.50; //(50% des individus de la population vont être remplacés par de nouveaux enfants)
    static TAUX_MUTATION = 0.05; //(probabilité qu’une constante mute)
    constructor(PNGs, IS_AI, id_canva, canva_size) {
        this.is_AI = IS_AI;
        this.PNGs = PNGs;
        this.id_canva = id_canva;
        console.log(this.id_canva);
        this._initialize(canva_size);
    }

    _initialize(canva_size) {
        let reseau = new Reseau(Controller.NB_ENTREES_IA, Controller.STRUCTURE_RESEAU);
        this._view = new View(this.PNGs, this.id_canva, canva_size);
        this._model = new Model(reseau);

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

        this._model.All_Tiles.forEach(tile => this._model.MoveTile(tile));
        requestAnimationFrame(this.Update.bind(this));
    }

    reset() {
        this._initialize();
    }
}