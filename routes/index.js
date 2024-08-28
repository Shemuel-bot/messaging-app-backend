var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const MessageContoller = require('../controllers/MessageController');
const { route } = require('.');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/log-in', UserController.log_in);

router.post('/sign-up', UserController.sign_up);

router.get('/get-people', UserController.get_users);

route.get('/get-chats', UserController.get_chats);

route.post('/log-out', UserController.log_out);


router.post('/get-messages', MessageContoller.get_messages);

router.post('/send-message', MessageContoller.send_message);


module.exports = router;
