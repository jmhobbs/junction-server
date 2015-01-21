"use strict";
/*jshint expr: true*/

var    should = require("should"),
 redis_client = require("fakeredis").createClient(),
         User = require("../lib/user.js"),
       APIKey = require("../lib/api_key.js"),
       Client = require("../lib/client.js");

/////////////////
// Setup

redis_client.set("user:index:email:john@example.com", 5);

redis_client.hmset("user:5", {
  id: 5,
  email: "john@example.com",
  password: "asdf",
  created: 1421549041,
  modified: 1421549047
});

redis_client.set("user:index:email:paul@example.com", 6);

redis_client.hmset("user:6", {
  id: 6,
  email: "paul@example.com",
  password: "asdf",
  created: 1421549041,
  modified: 1421549047
});

redis_client.sadd("api_key:index:user:5", "5.phuic@ah9P");

redis_client.hmset("api_key:5.phuic@ah9P", {
  key      : "5.phuic@ah9P",
  secret   : "phuic@ah9P",
  user_id  : 5,
  created  : 1421549040,
  modified : 1421549041
});

var CHALLENGE_RESPONSE = new Buffer("t8wCSXuFIQVaEPYOIpXNQ7as+HYyRrjchSCNaKsUPzc1LnBodWljQGFoOVA=", "base64");

/////////////////

describe("Client", function(){

  describe("is_authenticated", function () {
    it("should return false if a user is not authenticated", function () {
      var client = new Client.Client({});
      client.is_authenticated().should.be.false;
    });
    it("should return true if a user is authenticated", function () {
      var client = new Client.Client({});
      client.authenticated = (+ new Date());  // Fiddle with the guts
      client.is_authenticated().should.be.true;
    });
  });
  
  describe("create_challenge", function () {
    it("should return a challenge string", function () {
      var client = new Client.Client({});
      client.create_challenge().should.be.ok;
      client.challenge.should.have.length(16);
    });
  });
  
  describe("authenticate", function () {
    it("should return true if a user correctly signs the challenge", function (done) {
      var client = new Client.Client({});
      client.challenge = new Buffer("asdf", "ascii");
      client.challenge_timestamp = (+ new Date());
      client.authenticate(redis_client, CHALLENGE_RESPONSE, function (error, result) {
        (error === null).should.be.true;
        result.should.be.true;
        done();
      });
    });

    it("should return an error if a user does not correctly sign the challenge", function (done) {
      var client = new Client.Client({});
      client.challenge = new Buffer("asdff", "ascii");
      client.challenge_timestamp = (+ new Date());
      client.authenticate(redis_client, CHALLENGE_RESPONSE, function (error, result) {
        (error).should.be.an.Error;
        error.toString().should.eql("Error: Challenge failed.");
        result.should.be.false;
        done();
      });
    });
    
    it("should return an error if the challenge has expired", function (done) {
      var client = new Client.Client({});
      client.challenge = new Buffer("asdf", "ascii");
      client.challenge_timestamp = (+ new Date()) - 864000;
      client.authenticate(redis_client, CHALLENGE_RESPONSE, function (error, result) {
        (error).should.be.an.Error;
        error.toString().should.eql("Error: Challenge has expired.");
        result.should.be.false;
        done();
      });
    });
  });

});
