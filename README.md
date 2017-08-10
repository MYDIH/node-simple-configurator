# Simple and Secure Configurator

This is a very basic class made to handle basic configuration needs. This class shouldn't being used in big projects because of it's lack (on purpous) of functionnality. But if you need very simple persistent key/value pairs, you should definitly take a look below.

# Features

* Store and retrieve key/value pairs
* Can be persisted to filesystem
* Handles configuration file encryption
* Handles bulk configuration changes

# A note about encryption

Be aware that encrypting the configuration file doesn't add a tough layer of extra security. Actually, to encrypt the configuration file, you need to store the encryption key somehow, and someone who has access to the configuration file should, in the majority of the case, have also access to the key. Moreover, you can't specify a * readable * configuration file when the encryption is activated (but you could pre-encode one).

# API

`constructor(filepath, [encryptionKey], [algorithm])` :

Constructs a Configurator object

* `key` => The path where the configuration file will be stored
* `encryptionKey` => *[optional]* The key to use while encrypting

  **Default :** null

* `algorithm` => *[optional]* The algorithm to use to encrypt the configuration file

  **Default :** aes-256-ctr

**Returns :** The newly created Configurator.

> **Note :** To disable encryption, do not specify `encryptKey` and `algorithm`

`.get(key)` :

Retrieves a key from the Configurator

* `key` => The key to retrieve the value of

**Returns :** The value associated with the key or undefined if the key isn't existing

`.set(key, value)` :

Stores a key/value pair to the Configurator

 * `key` => The key associated with the value
 * `value` => The value to store

**Returns :** Nothing.

> **Note :** This method will overwrite any previously declared key's value

`.persist()` :

Writes the configurator underlying object to the file system.

**Returns :** Nothing.

> **Note :** This method will only write to the file system if needed, it's safe to call it in a loop. You can achieve bulk insertions of key/value pairs by inserting them using `store(key, value)` and calling this method after the insertions are finished

# Tests

Run `npm test`

# License

MIT to MYDIH <mailmydih@gmail.com>
