var through = require('through');
var deepEqual = require('deep-equal');

module.exports = function(a, b, compare) {
    var self = {};

    var compareFcn;
    if (compare instanceof Function) {
      compareFcn = compare;
    } else if (compare) {
      compareFcn = compareBy(compare);
    } else {
      compareFcn = compareBy('id');
    }

    var sa = a.pipe(through());
    var sb = b.pipe(through());
    var output = through();

    var obja = null;
    var objb = null;
    var closeda = false;
    var closedb = false;

    var toResume = null;

    sa.pipe(through(inputa, donea));
    sb.pipe(through(inputb, doneb));

    output.on('resume', resume);

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

    function resume(streams) {
        if (streams)
            toResume = streams;

        if (!output.paused) {
            toResume.forEach(function(stream) {
                setImmediate(function() {
                    stream.resume();
                });
            });
            toResume = null;
        }
    }

    function handlePair () {
        if (obja && objb)
            compareFcn.call(self, obja, objb);
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

        resume([sa]);
    };

    self.right = function() {
        output.queue([ null, objb ]);
        objb = null;

        resume([sb]);
    };

    self.equal = self.neither = function() {
        obja = null;
        objb = null;

        resume([sa, sb]);
    };

    self.notEqual = self.both = function(obj) {
        output.queue([ obja, objb ]);
        obja = null;
        objb = null;

        resume([sa, sb]);
    };

    return output;
};

function compareBy(field) {
  return function(a, b) {
    if (a[field] < b[field])
      this.left();
    else if (a[field] > b[field])
      this.right();
    else if (deepEqual(a, b))
      this.equal();
    else
      this.notEqual();
  };
}
