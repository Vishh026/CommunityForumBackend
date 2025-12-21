
# USER
POST  /api/auth/register  ✅
POST  /api/auth/login ✅
POST  /api/auth/logout ✅
GET  /api/auth/me ✅


# Loggedin user
GET  /api/users/me ✅
GET /api/users/:id
PACTH /api/users/update ✅



# commnunity
GET /api/communities 
GET /api/communities/:id
POST /api/communities/:id/join ===========================================
POST /api/communities/:id /leave ==========================================

# Community Requests

POST /api/community-requests        <!--Request new community -->
GET  /api/community-requests/me     <!--List my pending requests -->



















ADMIN
<!-- OPTIONAL -->
GET  /api/admin/users 
POST /api/admin/users/:id/ban

MIDDDLEWARE 
 - AUTH middleware
 -isAdmini middleware
