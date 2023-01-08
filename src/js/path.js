/***pathfinding helper methods ***/

//creates a path from a starting cell to an ending cell using A*
//grid => grid object to use in the search
//start => starting cell
//end => ending cell
var create_path = (grid,start,end) =>{
  var path = [];//finalized path from start to end
  var open_set = [start];//unevaluated grid points
  var closed_set = [];//completely evaluated grid points

  reset_heuristic_vars(grid);

  open_set.push(start);

  while(open_set.length > 0){
    var lowest_index = 0;
    for(var i = 0; i < open_set.length; i++){
      if(open_set[i].f < open_set[lowest_index].f){
        lowest_index = i;
      }
    }

    var current_cell = open_set[lowest_index];

    //if there are no more cells to search through
    if(current_cell === end){
      var temp = current_cell;
      //convert the current cells x and y values to a vector
      //we do this since we need vectors to actually move along the path
      path.push(new Victor(temp.x,temp.y));
      //check the cells parent
      while(temp.parent){
        path.push(new Victor(temp.parent.x,temp.parent.y));

        temp = temp.parent;
      }
      console.log("done");
      //reverse the path so it displays first to last
      return path.reverse();
    }

    open_set.splice(lowest_index,1);
    closed_set.push(current_cell);
    //get the current cells neighbors
    var neighbors = grid.get_cell_neighbors(current_cell);

    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      if (!closed_set.includes(neighbor)) {
        //estimate the g value
        var possible_g = current_cell.g + 1;
        if (!open_set.includes(neighbor)) {
          //add to the open set
          open_set.push(neighbor);
        }
        else if (possible_g >= neighbor.g) {
          //break out of the loop
          continue;
        }
        //set the g, h, f, and parent values
        neighbor.g = possible_g;
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current_cell;
      }
    }

  }
  //no solution by default
  console.log("no solution");
  return [];
}

//calculates the heuristic using the Manhattan distance
var heuristic = (pos_0,pos_1)=>{
  var d1 = Math.abs(pos_1.x - pos_0.x);
  var d2 = Math.abs(pos_1.y - pos_0.y);

  return d1 + d2;
}

//resets the variables used in pathfinding to their defaultvalues
//if we did not do this these values would grow to the point that the program crashes
var reset_heuristic_vars = (grid)=>{
  var row = 0;
  while(row < grid.cells.length){
    var column = 0;
    while(column < grid.cells[row].length){
      grid.cells[row][column].f = 0;
      grid.cells[row][column].g = 0;
      grid.cells[row][column].h = 0;
      grid.cells[row][column].parent = undefined;

      column += 1;
    }
    row += 1;
  }
}

export {create_path,heuristic,reset_heuristic_vars}
