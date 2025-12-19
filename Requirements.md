#APP SETUP

- npm install express mongoose dotenv cookie-parser bcryptjs jsonwebtoken cors
- mongodb connection
- schema defined
- route +validator function
- middleware

schama =>
USER -> firstName,lastName,role,email,password,bio,skills,headline,avtar,userName,commmunities,connections


<!-- login -->
<!-- // get the data from req.body
  // validate both
  // find mail in db
  // validate pass = bcrypt.comapre()
  // if passsword valid,generate jwt(jet.sign()) token=> validate=> send token (res.cookies())
  // send response -->

  <!-- signup -->
  <!-- // get user data from req body
  // validate user data -> validateUser()
  // check user already exists
  // encrypt the passowrd => bcrypt.hash()
  // create new user
  // store user in db
  // send response -->