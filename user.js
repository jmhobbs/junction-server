var crypto = require('crypto');
var hmac = crypto.createHmac('sha512', 'yourkeyhere');
hmac.update('why hello there');
hmac.digest('base64');
