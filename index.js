const crypto = require('crypto')
const fs = require('fs')

const defaultConfiguration = {}

function checksum (filepath, algorithm) {
  return new Promise((resolve, reject) => {
    let sum = crypto.createHash(algorithm)
    fs.createReadStream(filepath)
      .on('data', function (data) {
        sum.update(data)
      })
      .on('end', function () {
        resolve(sum.digest('hex'))
      })
      .on('error', (error) => {
        let clearerError = new Error('Can\'t read the file to checksum')
        clearerError.stack += '\nCaused by: ' + error.stack
        reject(clearerError)
      })
  })
}

function encrypt (text, encryptKey, algorithm, ivsize) {
  // Encryption disabled
  if (encryptKey == null) return text

  let iv = crypto.randomBytes(ivsize)
  let cipher = crypto.createCipheriv(algorithm, encryptKey, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return iv.toString('hex') + ':' + crypted
}

function decrypt (text, encryptKey, algorithm) {
  // Encryption disabled
  if (encryptKey == null) return text

  let splitted = text.split(':')
  let iv = Buffer.from(splitted[0], 'hex')
  let decipher = crypto.createDecipheriv(algorithm, encryptKey, iv)
  let dec = decipher.update(splitted[1], 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

function readConfFromFile (filepath, encryptKey, algorithm) {
  if (!fs.existsSync(filepath)) { return { needStore: true, obj: defaultConfiguration } }
  return { needStore: false, obj: JSON.parse(decrypt(fs.readFileSync(filepath, { encoding: 'utf8' }), encryptKey, algorithm)) }
}

function storeConfToFile (filepath, obj, encryptKey, algorithm, ivsize) { fs.writeFileSync(filepath, encrypt(JSON.stringify(obj), encryptKey, algorithm, ivsize)) }

module.exports = class Configurator {
  constructor (filepath, encryptKey = null, checksum = 'md5', algorithm = 'aes-256-ctr', ivsize = 16) {
    this.checksumAlgorithm = checksum
    this.encryptKey = encryptKey
    this.internalConfObj = null
    this.algorithm = algorithm
    this.filepath = filepath
    this.needStore = false
    this.checksum = null
    this.ivsize = ivsize
  }

  async get (key) {
    // Lazy initialize configuration
    if (!this.__init()) {
      try {
        let sum = await checksum(this.filepath, this.checksumAlgorithm)
        if (this.checksum === null) {
          this.checksum = sum
        } else if (this.checksum !== sum) {
          this.internalConfObj = readConfFromFile(this.filepath, this.encryptKey, this.algorithm).obj
        }
      } catch (err) {
        console.warn('Can\'t checksum the configuration file, check that the file hasn\'t been removed and that your system supports "' + this.checksumAlgorithm + '"', err)
      }
    }
    return this.internalConfObj[key]
  }

  set (key, value) {
    this.__init()
    this.internalConfObj[key] = value
    this.needStore = true
  }

  persist () {
    if (this.needStore) { storeConfToFile(this.filepath, this.internalConfObj, this.encryptKey, this.algorithm, this.ivsize) }
  }

  __init () {
    // Lazy initialize configuration
    if (this.internalConfObj == null) {
      var res = readConfFromFile(this.filepath, this.encryptKey, this.algorithm)
      this.internalConfObj = res.obj
      this.needStore = res.needStore
      this.persist()
      return true
    }
    return false
  }
}
