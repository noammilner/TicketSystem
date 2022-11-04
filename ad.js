require('dotenv').config()
var ActiveDirectory = require('activedirectory');
var config = {
    url: process.env.URL,
    baseDN: process.env.BASE_DN,
    username: process.env.AD_USERNAME,
    password: process.env.AD_PASSWORD
}
var ad = new ActiveDirectory(config);



exports.authUser = (username, password) => {
    return new Promise((resolve, reject) => {
        ad.authenticate(username, password, (err, auth) => {
            if (err) {
                return reject(err);
            }
            return resolve(auth);
        });
    });
};


exports.checkPermission = (username, groupName) => {
    return new Promise((resolve, reject) => {
        ad.isUserMemberOf(username, groupName, (err, isMember) => {
            if (err) {
                return reject(err);
            }
            return resolve(isMember);
        });

    });
};