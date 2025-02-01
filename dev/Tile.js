export class Tile {
    static _widthCell = 57; // Largeur d'une cellule en pixel.
    static _heightCell = 17; // Hauteur d'une cellule en pixel.

    constructor(type, x, y) {
        this.speed = 0;
        this.direction = type === 1 ? Math.random() < 0.5 ? 1 : -1 : 1;
        this.falling = false;

        this.type = type;
        if (this.type === 0) { this.tileY = 1; }
        else if (this.type === 1) { this.tileY = 19; }
        else if (this.type === 2) { this.tileY = 55; }

        this.x = x;
        this.y = y;


    }
    setY(y) {
        this.y = y;
    }
    getY() { return this.y; }

    static getWidthCell() { return Tile._widthCell; }

    static getHeightCell() { return Tile._heightCell; }

    isActive(canvasY) {
        return (this.y < canvasY);
    }

    dessiner(ctx, tiles) {
        ctx.drawImage(tiles, 1, this.tileY, Tile._widthCell, Tile._heightCell, this.x, this.y, Tile._widthCell, Tile._heightCell);
    }

    touche(x, y, marge) {
        return (x >= this.x - marge &&
            x <= this.x + Tile._widthCell + marge &&
            y >= this.y &&
            y <= this.y + (Tile._heightCell)
        );
    }
}