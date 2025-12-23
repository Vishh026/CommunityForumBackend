# commnunity
GET /api/communities      <!-- both for admin and user they are member of -->
GET /api/communities/:id <!-- get the specific community -->

# Community Requests
POST /api/community-requests/       <!--Request new community -->
GET  /api/community-requests/me     <!--List my pending requests -->

# Admin -communities 
POST    /api/community/create  ✅
DELETE  /api/community/:userid  ✅ 
EDIT    /api/community/edit ✅

POST   /api/communities/:communityId/join  ✅
DELETE /api/communities/:communityId/leave  ✅
PATCH   /api/communities/:communityId/:status/:requestId/  =>  status= ["ACCEPT","REJECT"]  ✅






<!-- Flow Overview

Actors:
User A → wants to join

Community B → the target community

Admin/Creator → optionally manages private communities

Steps:

User clicks “join Community”

Backend checks access rules:

Community exists?

Is the user blocked?

Is the user already a member?

Is the community public or private?

Depending on community type:

Public → user is automatically added to members

Private → reject join or add to pending requests (optional)

Save the update in the database

Return a response to the user -->



















# USER
POST  /api/auth/register  ✅
POST  /api/auth/login ✅
POST  /api/auth/logout ✅
GET  /api/auth/me ✅


# Loggedin user
GET  /api/users/me ✅
GET /api/users/:id ✅
PACTH /api/users/update ✅


























ADMIN
<!-- OPTIONAL -->
GET  /api/admin/users 
POST /api/admin/users/:id/ban

MIDDDLEWARE 
 - AUTH middleware
 -isAdmini middleware
