var diffStream = require('../index.js');

var assert = require('assert');
var through = require('through');
var fromArray = require('read-stream/array');

var toArray = function(cb) {
  var result = [];
  return through(
      function(buf) {
          result.push(buf);
      },
      function() {
          cb(result);
      });
};

compare = function(obj1, obj2) {
  if (obj1.id < obj2.id)
    this.left();
  else if (obj1.id > obj2.id)
    this.right();
  else if (obj1.id == obj2.id && obj1.name == obj2.name)
    this.equal();
  else
    this.notEqual();
};

var stream1 = fromArray([{id: 0, name: 'first'}, {id: 1, name: 'albert'}, {id: 2, name: 'bob'}, {id: 3, name: 'cathy'}, {id: 5, name: 'jerry'}, {id: 7, name: 'xavier'}]);
var stream2 = fromArray([{id: 1, name: 'albert'}, {id: 2, name: 'joe'}, {id: 4, name: 'thomas'}, {id: 5, name: 'jerry'}, {id: 6, name: 'william'}]);

var diff = diffStream(stream1, stream2, compare);

diff.pipe(toArray(function(arr) {
  assert.deepEqual(arr, [
    [{id: 0, name: 'first'}, null],
    [{id: 2, name: 'bob'}, {id: 2, name: 'joe'}],
    [{id: 3, name: 'cathy'}, null],
    [null, {id: 4, name: 'thomas'}],
    [null, {id: 6, name: 'william'}],
    [{id: 7, name: 'xavier'}, null]
  ]);
  console.log("ok");
}));

//diff.pipe(through(console.log));
