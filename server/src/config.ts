var config = {
	user: process.env.user,
	password: process.env.password,
	server: process.env.server,
	database: process.env.database,
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