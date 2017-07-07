const crypto = require('crypto');
const fs = require("fs");

const defaultConfiguration = {};

function encrypt(text, encryptKey, algorithm) {
  // Encryption disabled
  if(encryptKey == null) return text;

  var cipher = crypto.createCipher(algorithm, encryptKey);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text, encryptKey, algorithm) {
  // Encryption disabled
  if(encryptKey == null) return text;

  var decipher = crypto.createDecipher(algorithm, encryptKey);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

function readConfFromFile(filepath, encryptKey, algorithm) {
  if(!fs.existsSync(filepath))
    return { needStore: true, obj: defaultConfiguration };
  return { needStore: false, obj: JSON.parse(decrypt(fs.readFileSync(filepath, { encoding: "utf8" }), encryptKey, algorithm)) };
}

function storeConfToFile(filepath, obj, encryptKey, algorithm)
{ fs.writeFileSync(filepath, encrypt(JSON.stringify(obj), encryptKey, algorithm)); }

module.exports = class ConfigurationHandler {
  constructor(filepath, encryptKey = null, algorithm = 'aes-256-ctr') {
    this.internalConfObj = null;
    this.encryptKey = encryptKey;
    this.algorithm = algorithm;
    this.filepath = filepath;
    this.needStore = false;
  }

  get(key) {
    // Lazy initialize configuration
    if(this.internalConfObj == null) {
      var res = readConfFromFile(this.filepath, this.encryptKey, this.algorithm);
      this.internalConfObj = res.obj;
      this.needStore = res.needStore;
    }
    return this.internalConfObj[key];
  }

  set(key, value) {
    // Lazy initialize configuration
    if(this.internalConfObj == null)
      this.internalConfObj = readConfFromFile(this.filepath, this.encryptKey, this.algorithm).obj;
    this.internalConfObj[key] = value;
    this.needStore = true;
  }

  persist() {
    if(this.needStore)
      storeConfToFile(this.filepath, this.internalConfObj, this.encryptKey, this.algorithm);
  }
}
