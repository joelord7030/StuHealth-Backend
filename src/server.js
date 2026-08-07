const app = require("./app");

const {
 PORT
} = require("./config/env");


app.listen(PORT,()=>{

 console.log(
  `🚀 StuHealth AI API running on ${PORT}`
 );

});