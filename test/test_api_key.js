"use strict";
/*jshint expr: true*/

var    should = require("should"),
 redis_client = require("fakeredis").createClient(),
       APIKey = require("../lib/api_key.js");

/////////////////
// Setup

redis_client.sadd("api_key:index:user:5", "phuic@ah9P");
redis_client.sadd("api_key:index:user:5", "Oa9ei@t}ed");

redis_client.hmset("api_key:phuic@ah9P", {
  key      : "phuic@ah9P",
  user_id  : 5,
  created  : 1421549040,
  modified : 1421549041
});

redis_client.hmset("api_key:Oa9ei@t}ed", {
  key      : "Oa9ei@t}ed",
  user_id  : 5,
  created  : 1421549041,
  modified : 1421549042
});

/////////////////

describe("APIKey", function(){

  describe("save", function () {
    it("should save the api key to a redis hash", function (done) {
      var api_key      = new APIKey.APIKey("raeMSi{ur7");
      api_key.user_id  = 1;
      api_key.created  = 2;
      api_key.modified = 3;
      api_key.save(redis_client, function (error) {
        (error === null).should.be.true;
        redis_client.hgetall("api_key:" + api_key.key, function (error, hash) {
          hash.key.should.eql(api_key.key.toString());
          hash.user_id.should.eql(api_key.user_id.toString());
          hash.created.should.eql(api_key.created.toString());
          hash.modified.should.eql(api_key.modified.toString());
          done();
        });
      });
    });

    it("should save the key to a user index", function (done) {
      var api_key      = new APIKey.APIKey("vo2lie;Kea");
      api_key.user_id  = 2;
      api_key.created  = 3;
      api_key.modified = 4;
      api_key.save(redis_client, function (error) {
        (error === null).should.be.true;
        redis_client.sismember("api_key:index:user:" + api_key.user_id, api_key.key, function (error, is_member) {
          is_member.should.be.ok;
          done();
        });
      });
    });
  }); // APIKey.save

  describe("createAPIKey", function () {
    it("should throw an exception if a number is not passed", function () {
      APIKey.createAPIKey.should.throw();
      APIKey.createAPIKey.bind(null, "derp").should.throw();
    });
    
    it("should throw an exception if the number passed is not an integer", function () {
      APIKey.createAPIKey.bind(null, 0.5).should.throw();
    });

    it("should return a new APIKey", function () {
      var api_key = APIKey.createAPIKey(1);
      should(api_key).be.ok;
    });
  });
  
  describe("findByKey", function() {
    it("should return null when the key does not exist", function(done){
      APIKey.findByKey(redis_client, "nopenopeno", function (error, api_key) {
        (api_key === null).should.be.true;
        done();
      });
    });

    it("should return an APIKey when the key exists", function(done){
      APIKey.findByKey(redis_client, "phuic@ah9P", function (error, api_key) {
        (api_key === null).should.be.false;
        api_key.should.have.property("key", "phuic@ah9P");
        api_key.should.have.property("user_id", 5);
        api_key.should.have.property("created", 1421549040);
        api_key.should.have.property("modified", 1421549041);
        done();
      });
    });
  });

  describe("findAllByUserID", function() {
    it("should return an empty array when the user has no keys", function(done){
      APIKey.findAllByUserID(redis_client, 999, function (error, keys) {
        (error === null).should.be.true;
        (keys === null).should.be.false;
        keys.should.have.length(0);
        done();
      });
    });

    it("should return an array of APIKey objects when the user has keys", function(done){
      APIKey.findAllByUserID(redis_client, 5, function (error, keys) {
        (error === null).should.be.true;
        (keys === null).should.be.false;
        keys.should.have.length(2);
        done();
      });
    });
  });

});
