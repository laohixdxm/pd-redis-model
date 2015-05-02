# pd-redis-model
To facilitate database operation in Redis

## Installation
```
npm install -save pd-redis-model
```
## Tutorial
### Create a model
```javascript
var User = require('pd-redis-model')('user'); 
```     
'user' is the saved name of the model, all capital letters are converted into lower-case letters

### C.R.U.D
#### To create: .create(profile)
```javascript
var profile = {
   email : 'myletter@email.com', 
   password : 'abc123'
};
var creatingPromise = User.create(profile); 
```
The return value of User.create is a [q.Promise](https://github.com/kriskowal/q)
The newly created record will have a sequence id, it can be got by using 'then' of the promise as follows
```javascript
creatingPromise.then(function(sid){
   //do something to the returned sid...
});
```

### Set model fields
[Set unique fields](https://github.com/pandazy/pd-redis-set-uniques)


