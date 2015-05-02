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
#### To create:
```javascript
var profile = {
   email : 'myletter@email.com', 
   password : 'abc123'
};
var creatingPromise = User.create(profile); 
```
The returning value of User.create is a [q.Promise](https://github.com/kriskowal/q)
The newly created record will have a sequence id which is unique of the type. It can be fetched by using 'then' of the promise as follows
```javascript
creatingPromise.then(function(sid){
   //do something to the returned sid...
});
```
#### To read:
##### To find one record
```javascript
var readingPromise = User.findBySid('1')
```
Again the returning value of User.findBySid is a [q.Promise](https://github.com/kriskowal/q). The record information can be read by using 'then' as follows
```javascript
readingPromise.then(function(rec){
   // => rec's content is: {  'pd-sid' : '1', email: 'myletter@email.com' ....}
});
```
##### To find a list of records
```javascript
var option = {
  latest: (new Date()).getTime(), //the ending time point of list
  earliest : 0                    //the starting time point of list
}
var listPromise = User.range(option);
```
It will return all available records in a list in descending order of time. They can be reached as follows
```javascript
listPromise.then(function(list){
   // list's content ==>  
   // [
   //    {'pd-sid' : 1 ,  email : 'myletter1@email.com' ... }, 
   //    {'pd-sid' : 2,  email: 'myletter2@email.com' ...}
   //    .....
   // ]
});
```


### Set model fields
[Set unique fields](https://github.com/pandazy/pd-redis-set-uniques)


