import nodemailer from "nodemailer";

export const sendServiceFailMail = async (email: string, cronjob: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_SECRET,
      },
      secure: false,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Cronjob Failure Alert",
      text: "A cronjob has failed.",
      html: `<p><strong>Cronjob ${cronjob} has failed.</strong></p>
             <p>Try Disable and Re-enable the cronjob.It may resolve the issue.</p>
             <p style="font-style: italic;">This is an automatically generated email. Please do not reply.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(`Error sending mail to ${email} : `, err);
      } else {
        console.log(`Email sent to ${email} : `, info.response);
      }
    });
  } catch (err) {
    console.error("Error in nodemailer : ", err);
  }
};
