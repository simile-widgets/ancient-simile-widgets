/******************************************************************************
 * Grid
 *   Grid is the primary data structure that stores events for Timegrid to 
 *   process and render out to the client.
 *****************************************************************************/

Timegrid.Grid = function(objs, xSize, ySize, xMapper, yMapper) {
    Timegrid.Grid.superclass.call(this);
    // Construct the actual array container for objects
    this.grid = new Array(xSize);
    for (i = 0; i < xSize; i++) {
        this.grid[i] = new Array(ySize);
        for (j = 0; j < ySize; j++) {
            this.grid[i][j] = [];
        }
    }
    this.xMapper = xMapper;
    this.yMapper = yMapper;
    this.size = 0;

    this.addAll(objs);
};
$.inherit(Timegrid.Grid, Timegrid.ListenerAware);

Timegrid.Grid.prototype.add = function(obj) {
    var x = this.xMapper(obj);
    var y = this.yMapper(obj);
    this.get(x,y).push(obj);
    this.size++;
};

Timegrid.Grid.prototype.addAll = function(objs) {
    for (i in objs) { this.add(objs[i]); }
};

Timegrid.Grid.prototype.remove = function(obj) {
    var x = this.xMapper(obj);
    var y = this.yMapper(obj);
    var objs = this.get(x,y);
    for (i = 0; i < objs.length; i++) {
        if (obj == objs[i]) {
            objs.splice(i, 1);
            this.size--;
            return true;
        }
    }
    return false;
};

Timegrid.Grid.prototype.get = function(x, y) {
    return this.grid[x][y];
};

Timegrid.Grid.prototype.getSize = function() {
    return this.size;
};
