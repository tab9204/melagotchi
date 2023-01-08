export class Room_object{
  constructor(sprite,cell) {
    this.sprite = PIXI.Sprite.from(sprite);
    this.cell = cell;
    this.sprite.x = cell.x;
    this.sprite.y = cell.y;
  }

}
