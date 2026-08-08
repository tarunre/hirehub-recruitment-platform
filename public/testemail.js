const nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chinnuchakka6@gmail.com',
        pass: 'charitha@06' // If you have 2-Step Verification, use an App Password here
    }
});

// Email options
const mailOptions = {
    from: 'chinnuchakka6@gmail.com',
    to: 'bcs_2022016@iiitm.ac.in',
    subject: 'Test Email',
    text: 'This is a test email sent from Node.js'
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
