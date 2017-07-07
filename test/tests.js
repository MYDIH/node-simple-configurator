const ConfigurationHandler = require("../index.js");
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const UnencryptedFilePath = path.join(__dirname, 'test-unencrypted.conf');
const EncryptedFilePath = path.join(__dirname, 'test-encrypted.conf');
var UnencryptedConfigurationHandler = new ConfigurationHandler(UnencryptedFilePath);
var EncryptedConfigurationHandler = new ConfigurationHandler(EncryptedFilePath, "3a6b3b5d594a277234654964542f2e29414d5d5938412f564424563927");

describe('ConfigurationHandler', function() {
  after(function() {
    fs.unlinkSync(UnencryptedFilePath);
    fs.unlinkSync(EncryptedFilePath);
  });

  describe('Unencrypted', function() {
    describe('# set()', function() {
      it('should correctly set a retrievable value to the store', function() {
        UnencryptedConfigurationHandler.set("testKey", "testValue"); // Set a key/value pair
        assert.equal("testValue", UnencryptedConfigurationHandler.get("testKey")); // Retrieve it
      });
      it('should correctly retrieve value previously persisted to the filesystem', function() {
        UnencryptedConfigurationHandler.set("testPersistentUnencryptedKey", "testPersistentEncryptedValue"); // Set a key/value pair
        UnencryptedConfigurationHandler.persist(); // Store to disk
        var testUnencryptedConfigurationHandler =
              new ConfigurationHandler(path.join(__dirname, 'test-unencrypted.conf'))
        assert.equal("testPersistentEncryptedValue", testUnencryptedConfigurationHandler.get("testPersistentUnencryptedKey")); // Retrieve it
      });
    });
    describe('# configFile()', function() {
      it('should exists after a call to persist, even if it\'s empty', function() {
        UnencryptedConfigurationHandler.persist(); // Store to disk
        assert.ok(fs.existsSync(UnencryptedFilePath)); // Is conf file existsing
      });
      it('should be a valid JSON file', function() {
        UnencryptedConfigurationHandler.persist(); // Store to disk
        assert.doesNotThrow(() => JSON.parse(fs.readFileSync(UnencryptedFilePath, { encoding: "utf8" })));
      });
    });
  });

  describe('Unencrypted', function() {
    describe('# set()', function() {
      it('should correctly set a retrievable value to the store', function() {
        EncryptedConfigurationHandler.set("testKey", "testValue"); // Set a key/value pair
        assert.equal("testValue", EncryptedConfigurationHandler.get("testKey")); // Retrieve it
      });
      it('should correctly retrieve value previously persisted to the filesystem', function() {
        EncryptedConfigurationHandler.set("testPersistentEncryptedKey", "testPersistentEncryptedValue"); // Set a key/value pair
        EncryptedConfigurationHandler.persist() // Store to disk
        var testEncryptedConfigurationHandler =
              new ConfigurationHandler(path.join(__dirname, 'test-encrypted.conf'), "3a6b3b5d594a277234654964542f2e29414d5d5938412f564424563927");
        assert.equal("testPersistentEncryptedValue", testEncryptedConfigurationHandler.get("testPersistentEncryptedKey")); // Retrieve it
      });
    });
    describe('# configFile()', function() {
      it('should exists after a call to persist, even if it\'s empty', function() {
        EncryptedConfigurationHandler.persist(); // Store to disk
        assert.ok(fs.existsSync(EncryptedFilePath)); // Is conf file existsing
      });
      it('shouldn\'t be a valid JSON file', function() {
        UnencryptedConfigurationHandler.persist(); // Store to disk
        assert.throws(() => JSON.parse(fs.readFileSync(EncryptedFilePath, { encoding: "utf8" })));
      });
    });
  });
});
