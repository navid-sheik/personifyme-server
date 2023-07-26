import nodemailer from 'nodemailer'

//generate send confirmation email using mongoDB and nodemailer


export const sendEmail = async(options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        port : Number(process.env.EMAIL_PORT),
        secure:  Boolean(process.env.EMAIL_SECURE), // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // send mail with defined transport object
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
    };

    try {
        await transporter.sendMail(message, (err, info) => {
            if (err) {
                // respone to client with error email 
                console.log(err);

            } else {
                console.log(info);
            }
        });
        
    } catch (error) {
        console.log(error)

    }

}
