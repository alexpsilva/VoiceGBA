var gbaKeys = {
    'A': 0,
    'B': 1,
    'SELECT': 2,
    'START': 3,
    'RIGHT': 4,
    'LEFT': 5,
    'UP': 6,
    'DOWN': 7,
    'R': 8,
    'L': 9
}

var toggle_wizzard = false;
var recognizer = {
    recognized: null,
    wizard: {
        index: 0,
        hardcoded: ['RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'UP', 'UP']
    },
    recognize: function(data) {
        this.recognized = this.wizard.hardcoded[this.wizard.index];
        this.wizard.index = (this.wizard.index + 1) % this.wizard.hardcoded.length;
    }
}

function getKey(e) {
    while (recognizer.recognized == null) {}
    var key = recognizer.recognized;
    recognizer.recognized = null;
    return key;
}