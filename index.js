var through = require('through');

module.exports = function(a, b, compare) {
    var self = {};

    var sa = a.pipe(through());
    var sb = b.pipe(through());
    var output = through();

    var obja = null;
    var objb = null;
    var closeda = false;
    var closedb = false;

    sa.pipe(through(inputa, donea));
    sb.pipe(through(inputb, doneb));

    function inputa(buf) {
        obja = buf;
        sa.pause();

        if (objb !== null || closedb)
            handlePair();
    }

    function inputb(buf) {
        objb = buf;
        sb.pause();

        if (obja !== null || closeda)
            handlePair();
    }
    
    function donea() {
        closeda = true;

        if (obja || objb)
            handlePair();
        else if (closedb)
            output.queue(null);
    }

    function doneb() {
        closedb = true;

        if (obja || objb)
            handlePair();
        else if (closeda)
            output.queue(null);
    }

    function handlePair () {
        if (obja && objb)
            compare.call(self, obja, objb);
        else if (obja)
            self.left();
        else if (objb)
            self.right();
        else
            throw new Error("should never get here");
    }

    self.left = function() {
        output.queue([ obja, null ]);
        obja = null;

        sa.resume();
    };

    self.right = function() {
        output.queue([ null, objb ]);
        objb = null;

        sb.resume();
    };

    self.equal = this.neither = function() {
        obja = null;
        objb = null;

        sa.resume();
        sb.resume();
    };

    self.notEqual = this.both = function() {
        output.queue([ obja, objb ]);
        obja = null;
        objb = null;

        sa.resume();
        sb.resume();
    };

    return output;
};
