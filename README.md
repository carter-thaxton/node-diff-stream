diff-stream
===========

Compare two ordered object streams and produce a new stream consisting of the differences.

This can be used, for example, to compare records from a database with a long stream of JSON objects, without having to actually buffer large amounts of data into memory.

Similar to the behavior of the ubiquitous `diff` command:

- Identical records are not output
- Corresponding but differing records are output as [record1, record2]
- Records that only exist in stream1 are output as [record1, null]
- Records that only exist in stream2 are output as [null, record2]


Example
-------
```javascript
  var diffStream = require('diff-stream');

  var fromArray = require('read-stream').array;
  var stream1 = fromArray([{id: 1, name: 'albert'}, {id: 2, name: 'bob'}, {id: 3, name: 'cathy'}]);
  var stream2 = fromArray([{id: 1, name: 'albert'}, {id: 2, name: 'joe'}, {id: 4, name: 'thomas'}]);

  var diff = diffOrderedStream(stream1, stream2, function(obj1, obj2) {
    if (obj1.id < obj2.id)
      this.left();
    else if (obj1.id > obj2.id)
      this.right();
    else if (obj1.id == obj2.name && obj1.name == obj2.name)
      this.equal();
    else
      this.notEqual();
  });

  diff.pipe(process.stdout);
```

This would produce a stream consisting of tuples, like so:

```
  [{id: 2, name: 'bob'}, {id: 2, name: 'joe'}]
  [{id: 3, name: 'cathy'}, null]
  [null, {id: 4, name: 'thomas'}]
```
