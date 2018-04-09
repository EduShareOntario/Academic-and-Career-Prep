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
    user: 'academic.career.prep@gmail.com',
    pass: 'Academics4u2018' // password
};

module.exports = {
    db: db,
    mail: mail
};
