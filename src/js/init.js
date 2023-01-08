import {Mel} from "./mel.js";
import {Grid} from "./grid.js";
import {Room_object} from "./object.js"
import {create_path} from "./path.js";

window.onload = ()=>{
  //initalize the application
  var app = new PIXI.Application({width: 320, height: 640});
  var loader = new PIXI.Loader();
  //create the grid
  var grid = new Grid(320, 640);
  //sprite assets
  var sprites = {};
  var mel;
  //resize the app to fit the grid
  //app.renderer.resize(window.innerWidth - window.innerWidth % grid.cell_size, window.innerHeight - window.innerHeight % grid.cell_size);
  //add the app to the html
  document.querySelector("#content").appendChild(app.view);
  //draw the grid to the screen
  grid.display_grid(app);

  //load the needed sprites
  loader.add("mel", "./assets/the_boy.png");
  loader.add("test","./assets/test.png");

  //once the sprites have been loaded
  loader.load((loader,resources)=>{
    mel = new Mel(resources.mel.texture,grid.cells[5][2]);
    sprites.bed = new Room_object(resources.test.texture,grid.cells[0][0]);
    sprites.tv = new Room_object(resources.test.texture,grid.cells[0][2]);
    sprites.plant = new Room_object(resources.test.texture,grid.cells[9][4]);
    sprites.desk = new Room_object(resources.test.texture,grid.cells[4][4]);
    sprites.books = new Room_object(resources.test.texture,grid.cells[4][0]);
    sprites.chair = new Room_object(resources.test.texture,grid.cells[3][4]);
    sprites.kitchen = new Room_object(resources.test.texture,grid.cells[9][0]);
    //create the mel
    //add the mel to the stage
    app.stage.addChild(mel.sprite);
    app.stage.addChild(sprites.bed.sprite);
    app.stage.addChild(sprites.tv.sprite);
    app.stage.addChild(sprites.plant.sprite);
    app.stage.addChild(sprites.desk.sprite);
    app.stage.addChild(sprites.books.sprite);
    app.stage.addChild(sprites.chair.sprite);
    app.stage.addChild(sprites.kitchen.sprite);
  });

  //list of row and column pairs that should should be blocked from walking through
  var blocked = [
    [0,0],
    [0,2],
    [9,4],
    [4,4],
    [4,0],
    [2,4],
    [9,0],
  ];
  //block each cell listed in the array
  blocked.forEach((cell) => {
    grid.cells[cell[0]][cell[1]].walkable = false;
  });



  loader.onComplete.add(() => {
    //update loop
    app.ticker.add(()=>{
      mel.move();
    });
  });


  document.querySelector("canvas").addEventListener("touchstart",(e)=>{
    //THIS FUNCTIONALITY WILL NEED TO BE MOVED INTO A FUNCTION WITHIN THE MEL CLASS
    //the x and y coordinates of the touch event on the canvas grid
    var x = e.touches[0].clientX - (55 / 2);
    var y = e.touches[0].clientY - (27 / 2);
    //the starting position of the search
    var start;
    //if there is no points in the path use mel's current location as its starting point
    if (mel.path.length <= 0) {
      start = grid.get_cell_by_pixel_pos(Math.round(mel.location.x),Math.round(mel.location.y));
    }
    //if there are already points in the path we need the search to start at the last point on the path
    //we do this since that is where mel will be
    else{
      start = grid.get_cell_by_pixel_pos(mel.path[mel.path.length - 1].x,mel.path[mel.path.length - 1].y);
    }
    //the ending point of the search
    var end = grid.get_cell_by_pixel_pos(x,y);
    //create a new path
    var path = create_path(grid,start,end);
    //add each of the points in the path to mel's path
    path.forEach((vec, i) => {
      mel.path.push(vec);
    });
  })
}
