# Academic and Career Preparation Administration Tool
Georgian College

September 15, 2017


## Team Members:

* Nicholas Rowlandson


## Dev Environment Install Instructions:

1. git clone repository
2. cd
3. npm install
4. bower install
5. setup config.ts in server/src (see example below)
6. npm run quickstart
7. http://localhost:3000


## Config.ts

```javascript
var db = {
    user: '',
    password: '',
    server: '',
    database: '',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

var mail = {
  user: '', //email
  pass: '' // password
};

module.exports = {
    db: db,
    mail: mail
};
```


## Project Info/Status:

https://waffle.io/EduShareOntario/Academic-and-Career-Prep
