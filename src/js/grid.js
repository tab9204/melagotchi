export class Grid{
  constructor(screen_width,screen_height) {
    this.cell_size = 64;
    this.grid_width = Math.floor(screen_width / this.cell_size);
    this.grid_height = Math.floor(screen_height / this.cell_size);
    //array of column and row pairs to toggle which cells are walkable
    this.blocked_cells = [];
    //all the cells within the grid
    this.cells = this.create_cells();
  }
  //creates cells for the grid based on the width and height of the grid and the size of the cells
  create_cells(){
    var y = 0;
    var x = 0;
    var rows = [];
    var columns = [];
    var cell;
    var total_cells = this.grid_width * this.grid_height;
    //used to store the px values for each cell
    var i = 0;
    //create each row in the grid
    while(y < this.grid_height){
      //set x and columns to its default
      x = 0;
      columns = [];
      //create each column in the current row
      while(x < this.grid_width){
        //create the cell object
        cell = {
          row: y,//grid row position
          column: x,//grid column position
          x: (i % this.grid_width) * this.cell_size,//canvas px x position
          y: (Math.floor(i / this.grid_width)) * this.cell_size,//canvas px y position
          walkable: true,//flags that the cell cannot be moved through
          //pathfinding variables
          f:0,//total movment cost
          g:0,//movement cost from start to current grid cell
          h:0,//heuristic estimated  movment cost from current grid point to the goal
          parent: undefined// the parent cell along a path
        }
        //check if this cell is listed within the blocked array
        this.blocked_cells.forEach((pair) => {
          //first number is the column, second is the row
          if(pair[0] == x && pair[1] == y){
            cell.walkable = false;
          }
        });
        columns.push(cell);
        i+= 1;
        x += 1;
      }
      rows.push(columns);
      y += 1;
    }

    return rows;
  }
  //returns a cell by a given canvas pixel position
  get_cell_by_pixel_pos(x,y){
    //convert the px coordinates to grid coordinates
    var column = Math.floor(x / this.cell_size);
    var row = Math.floor(y / this.cell_size);
    //only return the cell if it is within the grid
    if(this.is_in_bounds(column,row)){
        return this.cells[row][column];
    }
    //return nothing if the cell could not be found
    return null;
  }

  //checks to see if a cell is within the grid given a column and row
  is_in_bounds(column,row){
    return (column >= 0 && column < this.grid_width) && (row >= 0 && row < this.grid_height);
  }

  //checks if a cell is walkable given the column and row of the cell
  is_walkable(column,row){
    if(this.is_in_bounds(column,row)){
      return this.cells[row][column].walkable;
    }
    return false;
  }

  //gets the top, bottom, left, and right neighbors of a given cell
  get_cell_neighbors(cell){
    var neighbors = [];
    //check the top neighbor
    if(this.is_walkable(cell.column, cell.row - 1)){
      neighbors.push(this.cells[cell.row - 1][cell.column]);
    }
    //check the bottom
    if(this.is_walkable(cell.column, cell.row + 1)){
      neighbors.push(this.cells[cell.row + 1][cell.column]);
    }
    //check the left
    if(this.is_walkable(cell.column - 1, cell.row)){
      neighbors.push(this.cells[cell.row][cell.column - 1]);
    }
    //check the right
    if(this.is_walkable(cell.column + 1, cell.row)){
      neighbors.push(this.cells[cell.row][cell.column + 1]);
    }
    return neighbors;
  }
  //visually displays the grid
  //used for debugging
  //app => pixi application reference to draw the grid
  display_grid(app){
    var row = 0;
    while(row < this.cells.length){
      var column = 0;
      while(column < this.cells[row].length){
        var cell = new PIXI.Graphics();
        if(this.cells[row][column].walkable){
          cell.beginFill(0xAA33BB);
        }
        else{
          cell.beginFill(0x000000);
        }
        cell.lineStyle(4, 0xFFEA22)
        cell.drawRect(this.cells[row][column].x,this.cells[row][column].y,this.cell_size,this.cell_size);
        cell.endFill();
        app.stage.addChild(cell);
        column += 1;
      }
      row += 1;
    }
  }

}
