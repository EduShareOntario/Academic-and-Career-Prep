var db = {
	user: process.env.dbuser,
	password: process.env.dbpassword,
	server: process.env.dbserver,
	database: process.env.dbname,
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
