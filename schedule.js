var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'loganford17@gmail.com', // Your email id
        pass: 'samgamgee' // Your password
    }
});

var text = 'Howdy Ags! \n\n';

var mailOptions = {
    from: 'loganford17@gmail.com', // sender address
    to: 'loganford17@gmail.com', // list of receivers
    subject: 'Howdy', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    };
});