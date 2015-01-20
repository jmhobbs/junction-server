"use strict";

//var APIKey = require("./api_key");

// Redis hash stored at "user:<id>"
// Index on email at "user:index_email:<email.toLowerCase()>"

var User = function () {
  this.id       = null;
  this.email    = null;
  this.password = null;
  this.created  = null;
  this.modified = null;
};

//User.prototype.getAPIKeys = function (redis_client, callback) {
//  callback(Error("Not Implemented"));
//};

User.prototype.save = function (redis_client, callback) {
  this.modified = (+new Date());

  var multi = redis_client.multi();

  multi.hmset("user:" + this.id, {
    id: this.id,
    email: this.email,
    password: this.password,
    created: this.created,
    modified: this.modified
  });

  multi.set("user:index:email:" + this.email.toLowerCase(), this.id);

  multi.exec(function (error, replies) { return callback(error); });
};

var findByID = function (redis_client, id, callback) {
  redis_client.hgetall("user:" + id, function (error, hash) {
    if(error) { return callback(error); }
    if(hash === null) { return callback(null, null); }

    var user = new User();

    user.id       = Number(hash.id);
    user.email    = hash.email;
    user.password = hash.password;
    user.created  = Number(hash.created);
    user.modified = Number(hash.modified);

    return callback(null, user);
  });
};

var findByEmail = function (redis_client, email, callback) {
  redis_client.get("user:index:email:" + email.toLowerCase(), function (error, reply) {
    if(error) { return callback(error); }
    if(reply === null) { return callback(null, null); }
    findByID(redis_client, reply, callback);
  });
};


module.exports = {
  user: User,
  findByID: findByID,
  findByEmail: findByEmail
};
