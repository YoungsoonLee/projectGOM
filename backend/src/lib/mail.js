const nodemailer = require('nodemailer');

module.exports.getTransporter = async function() {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
        }
    });
    return transporter;
};

module.exports.getMailOptions = async function(type, token, user) {
    var mailOptions = {};
    if (type === 'confirm') {
        mailOptions = {
            to: user.email,
            from: 'support@yourdomain.com',
            subject: '✔ Confrim your email on GOMSTUDIO',
            text:
                'Dear ' +
                user.name +
                ',\n' +
                'Welcome to GOMSTUDIO!\n' +
                'You are receiving this email because you need to confirm your email.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                //'http://' +
                //req.headers.host +
                process.env.BASE_HOST +
                '/email_confirm/' +
                token +
                '\n\n' +
                'Sincerely.\n' +
                'The GOMSTUDIO Team\n' +
                'Note: replies to this email address are not monitored.\n'
        };
    } else if (type === 'reset_password') {
        mailOptions = {
            to: user.email,
            from: 'support@yourdomain.com',
            subject: '✔ Reset your password on GOMSTUDIO',
            text:
                'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                //'http://' +
                //req.headers.host +
                process.env.BASE_HOST +
                '/reset_password/' +
                token +
                '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
    } else if (type === 'changed_password') {
        mailOptions = {
            from: 'support@yourdomain.com',
            to: user.email,
            subject: 'Your GOMSTUDIO password has been changed',
            text:
                'Hello,\n\n' +
                'This is a confirmation that the password for your account ' +
                user.email +
                ' has just been changed.\n'
        };
    }

    return mailOptions;
};
