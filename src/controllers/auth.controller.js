const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const generateToken = require("../utils/jwt");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../services/email.service");
const {
  sendWelcomeEmail,
} = require("../services/user.email");


// REGISTER
const register = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
    } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }


    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });


    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }


    const hashedPassword =
      await bcrypt.hash(password, 10);


    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });



    // Send welcome email in background
    // Registration will still succeed if email fails
    sendWelcomeEmail(user)
      .catch((error) => {
        console.error(
          "Welcome email failed:",
          error.message
        );
      });



    const token =
      generateToken(user.id);



    res.status(201).json({

      message: "Account created successfully",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },

    });



  } catch (error) {

    console.error(error);


    res.status(500).json({
      message: error.message,
    });

  }
};





// LOGIN
const login = async (req, res) => {

  try {


    const {
      email,
      password,
    } = req.body;



    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }



    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });



    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }




    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );



    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }




    const token =
      generateToken(user.id);



    res.json({

      message: "Login successful",

      token,


      user: {

        id: user.id,

        name: user.name,

        email: user.email,

      },

    });



  } catch (error) {


    console.error(error);


    res.status(500).json({
      message: error.message,
    });


  }

};


// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;


    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }


    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });


    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }



    const resetToken = uuidv4();


    const resetTokenExpiry =
      new Date(
        Date.now() + 15 * 60 * 1000
      );



    await prisma.user.update({

      where: {
        id: user.id,
      },


      data: {

        resetToken,

        resetTokenExpiry,

      },

    });



    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;



    sendEmail({

      to: user.email,

      subject: "Reset your StuHealth AI password",

      html: `

        <h2>Password Reset Request</h2>

        <p>Hello ${user.name},</p>

        <p>
          You requested to reset your StuHealth AI password.
        </p>

        <p>
          Click the link below:
        </p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>
          This link expires in 15 minutes.
        </p>

      `,

    })
    .catch((error)=>{
      console.error(
        "Reset email failed:",
        error.message
      );
    });



    res.json({

      message:
      "Password reset link sent to your email",

    });



  } catch(error){

    console.error(error);

    res.status(500).json({
      message:error.message,
    });

  }
};





// RESET PASSWORD
const resetPassword = async (req,res)=>{

  try {


    const {
      token,
      password,
    } = req.body;



    if(!token || !password){

      return res.status(400).json({

        message:
        "Token and password are required",

      });

    }



    const user =
      await prisma.user.findFirst({

        where:{

          resetToken: token,

          resetTokenExpiry:{
            gt:new Date(),
          },

        },

      });



    if(!user){

      return res.status(400).json({

        message:
        "Invalid or expired reset link",

      });

    }



    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );



    await prisma.user.update({

      where:{
        id:user.id,
      },


      data:{

        password:hashedPassword,

        resetToken:null,

        resetTokenExpiry:null,

      },

    });



    res.json({

      message:
      "Password reset successful",

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      message:error.message,

    });


  }

};





module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};