# Academic and Career Preparation Administration Tool

[![Build Status](https://georgiancollege-dev.visualstudio.com/_apis/public/build/definitions/fd8fc73f-58da-44d9-9f86-4aef3cefe817/4/badge)](https://georgiancollege-dev.visualstudio.com/Academic%20and%20Career%20Prep/_build/index?definitionId=4)

Georgian College

September 15, 2017


## Team Members:

* Nicholas Rowlandson


## Dev Environment Install Instructions:

1. git clone repository
2. cd
3. npm install
4. setup config.ts in server/src (see example below)
5. npm run quickstart
6. http://localhost:3000


## /server/src/config.ts

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
    service: '', // service e.g. 'gmail'
    user: '', //email
    pass: '' // password
};

var site_settings = {
		url: '', // site url
		client_pass: '' // default pass for client users without email access
};

module.exports = {
    db: db,
    mail: mail,
    site_settings: site_settings
};
```


## Project Info/Status:

https://waffle.io/EduShareOntario/Academic-and-Career-Prep
