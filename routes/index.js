var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const MessageContoller = require('../controllers/MessageController');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/log-in', UserController.log_in);

router.post('/api/sign-up', UserController.sign_up);

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
