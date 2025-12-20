<!-- async function getProfileController(req,res){
  try{

  }catch(err){
     res.status(401).json({message: err.message})
  }
} -->




USER
POST  /api/auth/register  ✅
POST  /api/auth/login ✅
POST  /api/auth/logout ✅
GET  /api/auth/me ✅

GET  /api/users/me ✅
GET /api/users/:id
PACTH /api/users/update


ADMIN
<!-- OPTIONAL -->
GET  /api/admin/users
POST /api/admin/users/:id/ban

MIDDDLEWARE 
 - AUTH middleware
 -isAdmini middleware
