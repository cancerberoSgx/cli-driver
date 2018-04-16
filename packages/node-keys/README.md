# node-keycodes

High level API for key codes in node.js desktop applications. Examples: 

# Install

```sh
npm install --save node-keys
```

# Usage 

Return the correct unicode sequence representing given key and control combination. Supports [a-zA-Z0-9] as input characters with any combination of ctrl - meta - shift modifiers. Usage example:


```js
import {keys} from 'node-keys'

process.stdin.write(keys({ ctrl: true, name: 'c'})
```




# TODO: 

High level string-based API

```
key('ctrl+c+x')
key('ctrl+shirt+arrow_left')



 * support altgr for example the following is altgr-u y alt-u :
 *
 * ```
 * ↓ 	226 0342 0xe2
 * 134 0206 0x86
 * 147 0223 0x93
 *
 * ^[u 	 27 0033 0x1b
 * 117 0165 0x75
 * ```