import { Tile } from './Tile.js';


export class View {

    constructor(PNGs, id) {
        const id_canva = id + "_canvas";

        this._canvas = document.getElementById(id_canva);

        this.ctx = this._canvas.getContext('2d');
        this._hold_right = false;
        this._hold_left = false;

        this.background = PNGs[0];
        this.tiles = PNGs[3];
        this.doodle_left = PNGs[1];
        this.doodle_right = PNGs[2];

        this.Events();
    }

    Display(position, score) {

        this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.ctx.drawImage(this.background, 0, 0, this._canvas.width, this._canvas.height);

        //plateformes
        this.b_GetTiles().forEach((tile) => {
            tile.dessiner(this.ctx, this.tiles);
        })

        //personnage
        if (position.x > this._canvas.width) { position.x = -29; }
        if (position.x < -30) { position.x = this._canvas.width; }

        let x = position.x;
        let y = position.y;

        if (this.b_GetDirection() !== 0) {
            this.direction = this.b_GetDirection();
        }

        if (this.direction === 1) {
            this.ctx.drawImage(this.doodle_right, x, y, this.b_GetDoodleWidth(), this.b_GetDoodleHeight());
        } else {
            this.ctx.drawImage(this.doodle_left, x, y, this.b_GetDoodleWidth(), this.b_GetDoodleHeight());
        }

        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`${score}`, 20, 30);
    }

    BindSetDirection(callback) { this.b_SetDirection = callback; }
    BindGetDirection(callback) { this.b_GetDirection = callback; }
    BindGetTiles(callback) { this.b_GetTiles = callback; }
    BindGetDoodleHeight(callback) { this.b_GetDoodleHeight = callback; }
    BindGetDoodleWidth(callback) { this.b_GetDoodleWidth = callback; }
    get CanvaSize() { return [this._canvas.width, this._canvas.height]; }

    Events() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
                switch (evt.key) {
                    case 'ArrowLeft': // Move left.
                        this._hold_left = true;
                        this.b_SetDirection(-1);
                        break;
                    case 'ArrowRight': // Move right.
                        this._hold_right = true;
                        this.b_SetDirection(1);
                        break;
                }
            }
        });

        document.addEventListener('keyup', (evt) => {
            switch (evt.key) {
                case 'ArrowLeft': // Move left.
                    if (!this._hold_right) {
                        this.b_SetDirection(0);
                    }
                    this._hold_left = false;
                    break;
                case 'ArrowRight': // Move right.
                    if (!this._hold_left) {
                        this.b_SetDirection(0);
                    }
                    this._hold_right = false;
                    break;
            }
        });
    }

    drawLine(x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1 + this.b_GetDoodleWidth() / 2, y1 + this.b_GetDoodleHeight() / 2);
        this.ctx.lineTo(x2 + Tile._widthCell / 2, y2 + Tile._heightCell / 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawGame(tiles, position) {
        let colors = ['blue', 'red', 'yellow', 'green'];
        let i = 0;

        tiles.forEach(tile => {
            this.drawLine(position.x, position.y, tile.x, tile.y, colors[i]);
            i++;
        })
    }
}