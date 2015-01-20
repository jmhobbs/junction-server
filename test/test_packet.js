"use strict";
/*jshint expr: true*/

var    should = require("should"),
       Packet = require("../lib/packet.js");

/////////////////
// Setup

var signed_by_derp = "VfDMhLYLwDtwPOy7Ugea5UtqE9Z8osYldg+tlv9ZKeOGomlkAaV\
0aXRsZaxIZWxsbyBXb3JsZCGkYm9kebJKdW5jdGlvbiBKdW5jdG\
lvbiGjdXJst2h0dHA6Ly92ZWx2ZXRjYWNoZS5vcmcvqWltYWdlX3\
VybNoAT2h0dHA6Ly93d3cudmVsdmV0Y2FjaGUub3JnL3dwLWNvbnR\
lbnQvdGhlbWVzL3ZlbHZldGNhY2hlLTIwMTIvaW1hZ2VzL2F2YXR\
hci5wbmepdGltZXN0YW1wzlSQnzU=";

var signed_by_hi = "Ig6t4T28fqomfW0lTrGlA1kBhbdW5xxWQNbOkDGIdmmGomlkAaV0aX\
RsZaxIZWxsbyBXb3JsZCGkYm9kebJKdW5jdGlvbiBKdW5jdGlvbiGj\
dXJst2h0dHA6Ly92ZWx2ZXRjYWNoZS5vcmcvqWltYWdlX3VybNoAT2\
h0dHA6Ly93d3cudmVsdmV0Y2FjaGUub3JnL3dwLWNvbnRlbnQvdGhl\
bWVzL3ZlbHZldGNhY2hlLTIwMTIvaW1hZ2VzL2F2YXRhci5wbmepdG\
ltZXN0YW1wzlSQnzU=";

/////////////////

describe("Packet", function(){

  describe("unpack", function () {
    it("should raise an exception if signature doesn't match", function () {
      var raw = new Buffer(signed_by_derp, "base64");
      Packet.unpack.bind(null, raw, "hi").should.throw();
    });

    it("should not raise an exception if signature matches", function () {
      var raw = new Buffer(signed_by_hi, "base64");
      Packet.unpack.bind(null, raw, "hi").should.not.throw();
    });

    it("should self-populate if signature matches", function () {
      var raw = new Buffer(signed_by_hi, "base64"),
       packet = Packet.unpack(raw, "hi");

      packet.id.should.eql(1);
      packet.title.should.eql("Hello World!");
      packet.body.should.eql("Junction Junction!");
      packet.url.should.eql("http://velvetcache.org/");
      packet.image_url.should.eql("http://www.velvetcache.org/wp-content/themes/velvetcache-2012/images/avatar.png");
      packet.timestamp.should.eql(1418764085);
    });
  });
  
  describe("pack", function () {
    it("should pack and sign the message", function () {
      var packet = new Packet.Packet();
      packet.id        = 1;
      packet.title     = "Hello World!";
      packet.body      = "Junction Junction!";
      packet.url       = "http://velvetcache.org/";
      packet.image_url = "http://www.velvetcache.org/wp-content/themes/velvetcache-2012/images/avatar.png";
      packet.timestamp = 1418764085;
      
      var raw = new Buffer(signed_by_hi, "base64");
      packet.pack("hi").should.eql(raw);
    });
  });

});
