const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PW,
    },
});

exports.sendResetEmail = (recipient, token) => {
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipient,
        subject: '[NO REPLY] Password reset link',
        html: `
        <html>
        <body style="text-align: center">
            <img src="cid:spiqueLogo">
            <p>A password reset has been requested for the Spique account associated with this email.</p>
            <p>If you did not request a password reset, you may ignore and delete this email.</p>
            <br>
            <p>Click on the following link to open a page where you can set a new password.</p>
            <p><a href="${
                process.env.MODE === 'dev' ? process.env.DEV_CLIENT : process.env.PROD_CLIENT
            }/password-reset/${token}">Password reset link</a></p>
            <p>This link cannot be reused once opened and will expire 10 minutes after this email was sent.</p>
        </body>
        </html>
    `,
        attachments: [
            {
                filename: 'spique-logo.png',
                path: `${process.cwd()}/images/spique-logo.png`,
                cid: 'spiqueLogo',
            },
        ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(`Password reset email sent: ${info.response}`);
        }
    });
};

exports.sendDeletionEmail = (recipient, token) => {
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipient,
        subject: '[NO REPLY] Delete account confirmation',
        html: `
        <html>
        <body style="text-align: center">
            <img src="cid:spiqueLogo">
            <p>The deletion of a Spique account associated with this email address has been requested.</p>
            <p>If you did not request to delete your account, you may ignore and delete this email.</p>
            <br>
            <p>Click on the following link to confirm account deletion.</p>
            <p><a href="${
                process.env.MODE === 'dev' ? process.env.DEV_CLIENT : process.env.PROD_CLIENT
            }/delete-account/${token}">Click to confirm account deletion</a></p>
            <p>This link will expire 10 minutes after this email was sent.</p>
        </body>
        </html>
    `,
        attachments: [
            {
                filename: 'spique-logo.png',
                path: `${process.cwd()}/images/spique-logo.png`,
                cid: 'spiqueLogo',
            },
        ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(`Deletion email sent: ${info.response}`);
        }
    });
};
