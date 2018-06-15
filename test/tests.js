/* eslint-env mocha */

const MongoBackend = require('../Backends/Mongo.js')
const FsBackend = require('../Backends/Filesystem.js')
const ConfigurationHandler = require('../index.js')
const replace = require('replace-in-file')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const UnencryptedFilePath = path.join(__dirname, 'test-unencrypted.conf')
const EncryptedFilePath = path.join(__dirname, 'test-encrypted.conf')
var UnencryptedConfigurationHandler = new ConfigurationHandler(UnencryptedFilePath)
var EncryptedConfigurationHandler = new ConfigurationHandler(EncryptedFilePath, '79756c6a23666b4f584d225a2b7d3a43')

describe('ConfigurationHandler', function () {
  after(function () {
    fs.unlinkSync(UnencryptedFilePath)
    fs.unlinkSync(EncryptedFilePath)
  })

  describe('Backends', function () {
    describe('# Mongo', function () {
      describe('# store()', function () {
        it('should correctly store a file', async function () {
          let mb = new MongoBackend('test', 'Configuration')
          await mb.store('Tarasta', fs.createReadStream('LICENSE'))
          await mb.retrieve('Tarasta', fs.createWriteStream('LICENSE-1'))
        })
      })
    })
  })

  describe('Unencrypted', function () {
    describe('# set()', function () {
      it('should correctly set a retrievable value to the store', async function () {
        UnencryptedConfigurationHandler.set('testKey', 'testValue') // Set a key/value pair
        assert.equal('testValue', await UnencryptedConfigurationHandler.get('testKey')) // Retrieve it
      })
      it('should correctly retrieve value previously persisted to the filesystem', async function () {
        UnencryptedConfigurationHandler.set('testPersistentUnencryptedKey', 'testPersistentUnencryptedValue') // Set a key/value pair
        UnencryptedConfigurationHandler.persist() // Store to disk
        var testUnencryptedConfigurationHandler =
              new ConfigurationHandler(path.join(__dirname, 'test-unencrypted.conf'))
        assert.equal('testPersistentUnencryptedValue', await testUnencryptedConfigurationHandler.get('testPersistentUnencryptedKey')) // Retrieve it
      })
    })
    describe('# configFile()', function () {
      it('should exists after a call to persist, even if it\'s empty', function () {
        UnencryptedConfigurationHandler.persist() // Store to disk
        assert.ok(fs.existsSync(UnencryptedFilePath)) // Is conf file existsing
      })
      it('should be a valid JSON file', function () {
        UnencryptedConfigurationHandler.set('testKey', 'testValue') // Set a key/value pair
        UnencryptedConfigurationHandler.persist() // Store to disk
        assert.doesNotThrow(() => JSON.parse(fs.readFileSync(UnencryptedFilePath, { encoding: 'utf8' })))
      })
      it('should be reloaded when changed and a configuration key is asked', async function () {
        UnencryptedConfigurationHandler.set('testKey', 'testValue') // Set a key/value pair
        UnencryptedConfigurationHandler.persist() // Store to disk
        replace.sync({
          files: UnencryptedFilePath,
          from: 'testValue',
          to: 'testOverridenValue'
        })
        assert.equal('testOverridenValue', await UnencryptedConfigurationHandler.get('testKey'))
      })
    })
  })

  describe('Encrypted', function () {
    describe('# set()', function () {
      it('should correctly set a retrievable value to the store', async function () {
        EncryptedConfigurationHandler.set('testKey', 'testValue') // Set a key/value pair
        assert.equal('testValue', await EncryptedConfigurationHandler.get('testKey')) // Retrieve it
      })
      it('should correctly retrieve value previously persisted to the filesystem', async function () {
        EncryptedConfigurationHandler.set('testPersistentEncryptedKey', 'testPersistentEncryptedValue') // Set a key/value pair
        EncryptedConfigurationHandler.persist() // Store to disk
        var testEncryptedConfigurationHandler =
              new ConfigurationHandler(path.join(__dirname, 'test-encrypted.conf'), '79756c6a23666b4f584d225a2b7d3a43')
        assert.equal('testPersistentEncryptedValue', await testEncryptedConfigurationHandler.get('testPersistentEncryptedKey')) // Retrieve it
      })
    })
    describe('# configFile()', function () {
      it('should exists after a call to persist, even if it\'s empty', function () {
        EncryptedConfigurationHandler.persist() // Store to disk
        assert.ok(fs.existsSync(EncryptedFilePath)) // Is conf file existsing
      })
      it('shouldn\'t be a valid JSON file', function () {
        EncryptedConfigurationHandler.set('testKey', 'testValue') // Set a key/value pair
        EncryptedConfigurationHandler.persist() // Store to disk
        assert.throws(() => JSON.parse(fs.readFileSync(EncryptedFilePath, { encoding: 'utf8' })))
      })
    })
  })
})
