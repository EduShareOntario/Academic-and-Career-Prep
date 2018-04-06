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
  service: '', // service e.g. gmail
  user: '', //email
  pass: '' // password
};

module.exports = {
    db: db,
    mail: mail
};
