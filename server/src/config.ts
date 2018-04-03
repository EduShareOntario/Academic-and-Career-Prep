var config = {
	user: process.env.dbuser,
	password: process.env.dbpassword,
	server: process.env.dbserver,
	database: process.env.dbname,
	options: {
		encrypt: true // Use this if you're on Windows Azure
	},
	mail: {
		service: process.env.mailservice,
		user: process.env.mailuser,
		pass: process.env.mailpassword
	}
};
module.exports = config;