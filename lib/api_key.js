"use strict";

var async = require("async");

var APIKey = function (key, user_id) {
  this.key      = (typeof key === "undefined") ? null : key;
  this.user_id  = (typeof user_id === "undefined") ? null : user_id;
  this.created  = null;
  this.modified = null;
};

var createAPIKey = function (user_id) {
  if(typeof user_id !== "number") { throw new Error("A number is required for user_id."); }
  if(parseInt(user_id, 10) !== user_id) { throw new Error("user_id must be an integer."); }

  // TODO: This is suspect. Unsure about Number widths, randomness, etc.
  var base = new Buffer(16);
  base.writeFloatLE(Math.random(), 0);
  base.writeFloatLE(Math.random(), 3);
  base.writeFloatLE(Math.random(), 7);
  base.writeFloatLE(Math.random(), 11);

  var api_key = new APIKey(user_id.toString() + "." + base.toString("base64"), user_id);
  api_key.created = (+new Date());

  return api_key;
};

APIKey.prototype.save = function (redis_client, callback) {
  this.modified = (+new Date());

  var multi = redis_client.multi();

  multi.hmset("api_key:" + this.key, {
    key      : this.key,
    user_id  : this.user_id,
    created  : this.created,
    modified : this.modified
  });

  multi.sadd("api_key:index:user:" + this.user_id, this.key);

  multi.exec(function (error, replies) { return callback(error); });
};

var findByKey = function (redis_client, key, callback) {
    redis_client.hgetall("api_key:" + key, function (error, hash) {

    if(error) { return callback(error); }
    if(hash === null) { return callback(null, null); }

    var api_key = new APIKey(hash.key);
    api_key.user_id  = Number(hash.user_id);
    api_key.created  = Number(hash.created);
    api_key.modified = Number(hash.modified);

    return callback(null, api_key);
  });
};


var findAllByUserID = function (redis_client, user_id, callback) {

  redis_client.smembers("api_key:index:user:" + user_id, function (error, members) {
    if(error) { return callback(error); }
    if(members.length === 0) { return callback(null, []); }
    async.map(members, findByKey.bind(null, redis_client), function(error, results) {
      // TODO: This is a HACK.
      // async.map is making my error callback undefined
      // I don't know why.
      if(typeof error === "undefined") { return callback(null, results); }
      return callback(error, results);
    });
  });
};

module.exports = {
  APIKey          : APIKey,
  createAPIKey    : createAPIKey,
  findByKey       : findByKey,
  findAllByUserID : findAllByUserID
};
