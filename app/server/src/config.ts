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
