/******************************************************************************
 * EventGrid
 *   EventGrid is the primary data structure that stores events for Timegrid
 *   to process and render out to the client.
 *****************************************************************************/

Timegrid.EventGrid = function(events, xSize, ySize, xMapper, yMapper) {
    // Construct the actual array container for events
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

    this.addAll(events);
};

Timegrid.EventGrid.prototype.add = function(evt) {
    var x = this.xMapper(evt);
    var y = this.yMapper(evt);
    this.get(x,y).push(evt);
    this.size++;
};

Timegrid.EventGrid.prototype.addAll = function(evts) {
    for (evt in evts) { this.add(evt); }
};

Timegrid.EventGrid.prototype.remove = function(evt) {
    var x = this.xMapper(evt);
    var y = this.yMapper(evt);
    var evts = this.get(x,y);
    for (i = 0; i < evts.length; i++) {
        if (evt == evts[i]) {
            evts.splice(i, 1);
            this.size--;
            return true;
        }
    }
    return false;
};

Timegrid.EventGrid.prototype.get = function(x, y) {
    return this.grid[x][y];
};

Timegrid.EventGrid.prototype.getSize = function() {
    return this.size;
};
