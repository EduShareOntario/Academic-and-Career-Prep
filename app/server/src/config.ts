// var db = {
// 	user: process.env.dbuser,
// 	password: process.env.dbpassword,
// 	server: process.env.dbserver,
// 	database: process.env.dbname,
// 	options: {
// 		encrypt: true // Use this if you're on Windows Azure
//     }
// };
//
// var mail = {
//   service: process.env.mailservice, // service e.g. gmail
//   user: process.env.mailuser, //email
//   pass: process.env.mailpassword // password
// };
//
// var site_settings = {
// 		url: process.env.siteurl, // site url
// 		client_pass: process.env.clientpass // default pass for client users without email access
// };
//
// module.exports = {
//     db: db,
//     mail: mail,
// 		site_settings: site_settings
// };

var db = {
    user: 'NickRowlandson',
    password: 'georgianTest1',
    server: 'nr-comp2007.database.windows.net',
    database: 'GeorgianApp',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

var mail = {
		service: 'gmail',
    user: 'academic.career.prep@gmail.com', // email address
    pass: 'Academics4u2018' // password
};

var site_settings = {
		url: 'https://gcacademicprep.azurewebsites.net', // site url
		client_pass: 'Georgian2018' // default pass for client users without email access
};

module.exports = {
    db: db,
    mail: mail,
		site_settings: site_settings
};
