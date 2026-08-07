const sendEmail = require("./email.service");


async function sendWelcomeEmail(user) {

  await sendEmail({

    to: user.email,

    subject: "Welcome to StuHealth AI 🎉",

    html: `
      <h2>Welcome ${user.name}</h2>

      <p>
        Your StuHealth AI account has been created successfully.
      </p>

      <p>
        You can now start using your AI health assistant.
      </p>

      <br/>

      <p>
        Thank you for joining StuHealth AI.
      </p>
    `,

  });

}


module.exports = {
  sendWelcomeEmail,
};