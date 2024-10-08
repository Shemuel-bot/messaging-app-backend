var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const MessageContoller = require('../controllers/MessageController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler');

/* GET home page. */
router.get('/', asyncHandler(async function(req, res, next) {
  const result = await prisma.$queryRaw`SELECT * FROM information_schema.tables`
  res.json({
    result
  })
}));

router.post('/api/log-in', UserController.log_in);

router.post('/api/sign-up', UserController.sign_up);

router.post('/api/update', verifyToken, UserController.update_user)

router.get('/api/get-people', verifyToken, UserController.get_users);

router.get('/api/get-chats', verifyToken, UserController.get_chats);

router.post('/api/log-out', UserController.log_out);


router.get('/api/home', verifyToken, UserController.user_names_match);


router.post('/api/get-messages', verifyToken, MessageContoller.get_messages);

router.post('/api/send-message', verifyToken, MessageContoller.send_message);


function verifyToken (req, res, next){
  const bearerHeader = req.headers['authorization'];
  
if(typeof bearerHeader !== 'undefined' &&  bearerHeader !== 'null'){

    const bearer = bearerHeader.split(' ');
   
    const bearerToken = bearer[1];
  
    req.token = bearerToken;
    
    next();
  }else{
      
    res.send(403);
  }
}


module.exports = router;
