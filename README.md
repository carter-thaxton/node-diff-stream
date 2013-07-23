diff-stream
===========

Compare two ordered object streams and produce a new stream consisting of the differences.


example
-------
```javascript
  var diffStream = require('diff-stream');

  var fromArray = require('read-stream').array;
  var stream1 = fromArray([{id: 1, name: 'albert'}, {id: 2, name: 'bob'}, {id: 3, name: 'cathy'}]);
  var stream2 = fromArray([{id: 1, name: 'albert'}, {id: 2, name: 'joe'}, {id: 4, name: 'thomas'}, {id: 5, name: 'xavier'}]);

  diffStream(stream1, stream2).pipe(process.stdout);
```

produces a stream of tuples:

```
  [{id: 2, name: 'bob'}, {id: 2, name: 'joe'}]
  [{id: 3, name: 'cathy'}, null]
  [null, {id: 4, name: 'thomas'}]
  [null, {id: 5, name: 'xavier'}]
```

This can be used, for example, to compare rows from streaming database queries, or long streams of JSON objects such as those produced by [JSONStream](http://github.com/dominictarr/JSONStream), without having to actually buffer large amounts of data into memory.

Similar to the behavior of the ubiquitous `diff` command:

- Identical objects are not output
- Corresponding but differing objects are output as `[obj1, obj2]`
- Objects that only exist in stream1 are output as `[obj1, null]`
- Objects that only exist in stream2 are output as `[null, obj2]`


diffStream(stream1, stream2, [compare])
---------------------------------------
Compare the readable streams `stream1` and `stream2`, returning a new readable stream, which consists of tuple pairs.


compare
-------
The optional `compare` parameter may be a string key, used to determine the order of the objets.  This defaults to `id`, which is a common key used to order objects in an object stream, such as results from a database query.

`compare` may also be a function, like the following:

```
  diffStream(stream1, stream1, function(obj1, obj2) {
    if (obj1.id < obj2.id)
      this.left();
    else if (obj1.id > obj2.id)
      this.right();
    else if (obj1.id == obj2.id && obj1.name == obj2.name)
      this.equal();
    else
      this.notEqual();
  }).pipe(process.stdout);
```

The function is called with pairs of objects from each stream.  The function should call `left`, `right`, `equal`, or `notEqual`, to produce the corresponding output, and advance either `stream1`, or `stream2`, or both.

- `left` will output `[obj1, null]`, and advance `stream1`
- `right` will output `[null, obj2]`, and advance `stream2`
- `equal` will output nothing, and advance both streams
- `notEqual` will output `[obj1, obj2]`, and advance both streams

ordering
--------
Note, it is important that the two object streams be ordered, and that this ordering matches the `compare` method as described above.  If the streams consist of unordered objects, then pairs will not be aligned appropriately.

license
-------
MIT
