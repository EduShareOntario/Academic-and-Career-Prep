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
  service: process.env.mailservice, // service e.g. gmail
  user: process.env.mailuser, //email
  pass: process.env.mailpassword // password
};

module.exports = {
    db: db,
    mail: mail
};
