# express-rest-observer

A node.js module that provides [REST observer](https://www.dropbox.com/s/adinujoywzdm9nc/chapter.pdf) functionality to express.js applications.

## Installation

```bash
npm install git://github.com/vstirbu/express-rest-observer.git
```

## Usage

```javascript
var app = require('express')(),
    observer = require('express-rest-observer')(options);

// install the observer application
app.use(observer);

// use the middleware per route
app.get('/test', observer.middleware, requestHandler);
```

## Initialization options

The observer accepts a the following initialization options:

* ```path``` The observer path (default ```/observers```)

## License

The code is available under MIT license.


