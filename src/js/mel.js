export class Mel {
  constructor(sprite,cell) {
    /************
    Movement simulation variables
    used to render and move the mel model on the screen
    ***********/
    //the visual mel sprite
    this.sprite = PIXI.Sprite.from(sprite);
    //defaul the sprite position to center screen
    this.sprite.x = cell.x;
    this.sprite.y = cell.y;
    //vector for the current location of the model
    this.location = new Victor(this.sprite.x,this.sprite.y);
    //rate of change of location
    this.velocity = new Victor(0,0);
    //rate of change of velocity
    this.acceleration = new Victor(0,0);
    //maximum velocity
    this.maxSpeed = 4;
    //the maximum force that can applied to acceleration
    this.maxForce = 10;
    /***************/
    //list of locations mel can move to
    this.locations = {
      center: {x: 400, y: 300},
      bed: {x: 84, y: 62},
      desk: {x: 722, y: 114},
      tv: {x: 495, y: 549}
    }
    //listo of actions mel can take
    this.actions = {
      sleep: {
        text:"ZZZZZ...",
        callback: ()=>{
          setTimeout(() => {
            this.tiredness = 0;
            this.decisionLock = false;
          }, Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000)
        }
      },
      eat:{
        text:"Nom Nom Nom",
        callback: ()=>{
          setTimeout(() => {
            this.hunger = 0;
            this.decisionLock = false;
          }, Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000)
        }
      },
      game:{
        text: "I hate Dark Souls....",
        callback: ()=>{
          setTimeout(() => {
            this.boredom = 0;
            this.decisionLock = false;
          }, Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000)
        }
      }
    }
    //flags if mel currently has her attention on the user
    this.attentionOnUser = true;
    //where on the screen where mel wants to be
    this.desiredLocation = new Victor(0,0);
    //array of coordinates to travel to get to the desiredLocation
    this.path = [];
    //the action mel wishes to do when she reaches her desired location
    this.desiredAction = null;
    //locks mel from making a new decision
    this.decisionLock = true;
    //how hungry mel is
    this.hunger = 0;
    this.isEating = false;
    //how sleepy mel is
    this.tiredness = 0;
    this.isSleeping = false;
    //how dirty mel or her cage is
    this.cleanliness = 0;
    this.isCleaning = false;
    //how borded mel is
    this.boredom = 7;
    this.isPlaying = false;
    //how much mel trusts the user
    this.relationship = 0;

  }
  //makes a decision on what mel should do based on her current state
  decide(){
    //if mel is not currently locked from making decisions
    if(!this.decisionLock){
      //mel is hungry
      if(this.hunger >= 5){
        //go eat
        this.eat();
      }
      //mel is tired
      else if(this.tiredness >= 7){
        //go sleep
        this.sleep();
      }
      //mel is bored
      else if(this.boredom >= 5){
        //go play
        this.game();
      }
    }
  }
  //moves mel towards her desired location along the points specified in the path
  move() {
    //exit out if mel has no path to follow
    if(this.path.length <= 0){
      return;
    }
    //seek the first point along the path
    this.seek(this.path[0]);
    //increase velocity based on acceleration
    this.velocity.add(this.acceleration);
    //limit velocity by max speed
    this.velocity.clampLength(this.maxSpeed);
    //round to whole numbers
    //the grid we are moving on contains whole number increments so we only want to move in whole numbers
    this.velocity.unfloat();
    //update the location based on the velocty
    this.location.add(this.velocity);
    //update the model position
    this.sprite.x = this.location.x;
    this.sprite.y = this.location.y;
    //check if the first point on the path has been reached
    if(Math.round(this.location.x) == this.path[0].x && Math.round(this.location.y) == this.path[0].y){
      //remove the point from the path
      this.path.shift();
    }
    //clear out the acceleration so that it does not accumulate
    this.acceleration.multiply(new Victor(0,0));
  }
  //checks if mel is in her desired location and if so plays her desired action
  act(){
    if(this.desiredLocation.x == this.location.x && this.desiredLocation.y == this.location.y){
      console.log(this.desiredAction.text);
      this.desiredAction.callback();
    }
  }
  //changes mels stats over time
  live(){
    this.hunger = this.hunger >= 10 ? 10 : this.hunger += Math.random();
    this.tiredness = this.tiredness >= 10 ? 10 : this.tiredness += Math.random();
    this.boredom = this.boredom >= 10 ? 10 : this.boredom += Math.random();
    console.log("Hunger: " + this.hunger + " Tired: " + this.tiredness + " Bored: " + this.boredom);
  }
  /******list of decisions mel can make****/
  eat(){
    //set the desrired location towards the tv
    this.desiredLocation.x = this.locations.tv.x;
    this.desiredLocation.y = this.locations.tv.y;
    //set mels action to eat
    this.desiredAction = this.actions.eat;
    //lock mel to her decision to eat
    this.decisionLock = true;
  }
  sleep(){
    //move mel towards the bed
    this.desiredLocation.x = this.locations.bed.x;
    this.desiredLocation.y = this.locations.bed.y;
    this.desiredAction = this.actions.sleep;
    this.decisionLock = true;
  }
  game(){
    this.desiredLocation.x = this.locations.desk.x;
    this.desiredLocation.y = this.locations.desk.y;
    this.desiredAction = this.actions.game;
    this.decisionLock = true;
  }
  //calculates the force needed to move towards a target
  seek(target){
    //the velocity needed to reach the target from the current location
    var desired = target.clone().subtract(this.location);
    //if the target is within 3 px of the current location
    if(desired.length() <= 1){
        var scale = this.map_range(desired.length(),0,5,0,this.maxSpeed);
        desired.normalize().multiply(new Victor(scale,scale));
    }
    else{
      //otherwise scale the desired velocity to the max speed
      desired.normalize().multiply(new Victor(this.maxSpeed,this.maxSpeed));
    }
    //the force needed to chance the current velocity to the desired velocity
    var steer = desired.clone().subtract(this.velocity);
    //limit the steering force to the max force
    steer.clampLength(this.maxForce);
    //apply the steer force to mel
    this.applyForce(steer);
  }
  //applys a simulated force to mel's acceleration
  //force => 3d vector representing a force to apply
  applyForce(force){
    this.acceleration.add(force);
  }
  //equivalent of processing's map function
  map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
}
