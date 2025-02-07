import { Tile } from './Tile.js';

export class Model {
    static GRAVITY = 20;
    static JUMP_FORCE = 750;
    static SPEED = 300;

    constructor(reseau) {
        this.reseau = reseau;

        this._direction = 0;
        this._gravitySpeed = 0;
        this._position = { x: 150, y: 225 };
        this.previousY = this._position.y;
        this.temps_immobile = 0;

        this.doodleHeight = 124 / 2;
        this.doodleWidth = 120 / 2;
        this.toMoveTiles = 0;

        this.AllTiles = [new Tile(0, this.b_canvaSize)];

        this.score = 0;
    }

    get position() { return this._position; }

    get doodle_height() { return this.doodleHeight; }
    get doodle_whidth() { return this.doodleWidth; }

    get All_Tiles() { return this.AllTiles; }

    get direction() { return this._direction; }
    set direction(value) { return this._direction = value; }

    getScore() {return this.score; }

    BindDisplay(callback) { this.b_Display = callback; }
    BindCanvaSize(callback) { this.b_canvaSize = callback; }
    BindReset(callback) { this.b_reset = callback; }
    BindDraw(callback) { this.b_drawGame = callback; }
    BindResetReseau(callback) {this.b_reset_reseau = callback; }

    Move(fps, is_AI, closestTiles) {
        this._gravitySpeed += Model.GRAVITY;
        this._position.y += this._gravitySpeed / fps;
        this._position.x += this._direction * Model.SPEED / fps;
        let canvaSize = this.b_canvaSize();

        let doodleCenter = this.getDoodleCenter();
        let marge = this.doodleWidth / 4;

        if (this._position.y > canvaSize[1]) {
            this.b_reset();
        }

        let moveAmount = 0;
        let toMoveTiles = this.toMoveTiles;


        this.AllTiles.forEach((tile) => {
            if (this._gravitySpeed > 0 && tile.isActive(canvaSize[1]) && tile.touche(doodleCenter[0], doodleCenter[1], marge)) {
                this._Jump(tile, canvaSize);
                toMoveTiles = canvaSize[1] - tile.getY() - 30;

                if (tile.type === 2) {
                    tile.falling = true;
                }
            }

            if (toMoveTiles > 0) {
                moveAmount = Math.min(2, toMoveTiles) * (canvaSize[1] / doodleCenter[1]); // Limite pour un mouvement fluide
                tile.setY(tile.getY() + moveAmount);
            }

            this.MoveTile(tile, canvaSize);
        });

        this.toMoveTiles = toMoveTiles - moveAmount;

        if (this._position.y < this.previousY) {
            this.score += 1;
            this.temps_immobile = 0;
        } else {
            this.temps_immobile++;
            if (this.temps_immobile > 500) {
                this.b_reset();
            }
        }

        if (is_AI) {
            // les entrées sont : distance pour les 4 tiles les plus proches, position en x et y de Doodle
            let entrees = [closestTiles[0].distance, closestTiles[1].distance, closestTiles[2].distance,
                closestTiles[3].distance, doodleCenter[0], doodleCenter[1]];

            let index = this.reseau.transformation_lineaire(entrees);

            switch (index) {
                case 0:
                    this._direction = -1;
                    break;
                case 1:
                    this._direction = 0;
                    break;
                case 2:
                    this._direction = 1;
                    break;
            }
        }

        this.b_Display(this._position);
    }

    MoveTile(tile, canvaSize) {
        if (tile.type === 1) {
            tile.speed = 1;
            tile.x += tile.speed * tile.direction;

            if (tile.x <= 0 || tile.x + Tile._widthCell >= canvaSize[0]) {
                tile.direction *= -1;
            }
        } else if (tile.type === 2 && tile.falling) {
            tile.speed = 1.5;
            tile.y += tile.speed * tile.direction;
        }
    }

    _Jump(tile, canvaSize) {
        this._gravitySpeed = -(Model.JUMP_FORCE) * (tile.getY() / canvaSize[1]);
    }

    getDoodleCenter() {
        return [this._position.x + (this.doodleWidth / 2), this._position.y + this.doodleHeight];
    }

    createTiles() {
        this.AllTiles = [];
        let canvaSize = this.b_canvaSize();
        let tile_max_range_start = canvaSize[1] / 4;
        let tile_max_range_end = canvaSize[1] / 3;

        let lastY = 475;

        this.AllTiles.push(new Tile(0, 150, lastY));

        lastY -= 50;

        while (lastY > -10000) {
            let progress = Math.abs(lastY / 10000);
            let tile_max_range = (tile_max_range_start + (tile_max_range_end - tile_max_range_start)) * progress;

            let randX = Math.max(
                parseInt(Math.random() * (canvaSize[0] - Tile.getWidthCell())),
                Tile.getWidthCell()
            );

            let randY = lastY - (parseInt(Math.random() * tile_max_range) + 25);

            let type0Chance = 0.7 - (0.7 - 0.15) * progress;
            let randType = Math.random() < type0Chance ? 0 : parseInt(Math.random() * 3);

            this.AllTiles.push(new Tile(randType, randX, randY));
            lastY = randY;
        }

        // Add a full platform at the end
        this.AllTiles.push(new Tile(0, 0, lastY - 50));
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    getClosestTiles(nb_retrieve) {
        let closestTiles = [];
        let maxDistance = Number.MAX_VALUE;

        this.AllTiles.forEach(tile => {
            tile.distance = this.getDistance(this._position.x, this._position.y, tile.x, tile.y);
            if (closestTiles.length < nb_retrieve) {
                closestTiles.push(tile);
                if (tile.distance < maxDistance) {
                    maxDistance = tile.distance;
                }
            } else if (tile.distance < maxDistance) {
                closestTiles.sort((a, b) => a.distance - b.distance);
                closestTiles.pop();
                closestTiles.push(tile);
                maxDistance = closestTiles[closestTiles.length - 1].distance;
            }
        });

        return closestTiles.sort((a, b) => a.distance - b.distance);
    }
}