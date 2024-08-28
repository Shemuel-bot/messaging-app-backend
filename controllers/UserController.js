const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


exports.sign_up = [
    body('firstName', 'first name must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('lastName', 'last name must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('email', 'email must not be empty')
        .trim()
        .isLength({ min: 1 })
        .isEmail()
        .escape(),
    body('password', 'password must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const password = await bcrypt.hash(req.body.password, 10)
                            .then(hash => hash)
                            .catch(err => {console.log(err.message)})
        
        
        if (!errors.isEmpty()) {
            res.json({
                message: false
            })
        }else{
            prisma.user.create({
                data:{
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: password,
                }
            })
        }
    })
]

exports.log_in = passport.authenticate('local',{
    successMessage: true,
    failureMessage: false,
  });

exports.get_users = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany();

    res.json({
        users: users,
    })

})

exports.get_chats = asyncHandler(async (req, res) => {
    const chats = [];
    const messages = await prisma.message.findMany({
        where:{
            from: req.user.id
        }
    })

    messages.forEach(async element => {
        const user = await prisma.findUnique({
            where:{
                id: element.to,
            }
        })
        if(!chats.includes(user))
            chats.push(user);
    });

    res.json({
        chats: chats
    });
})

exports.log_out = asyncHandler(async () => {
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.json({
            message: 'success',
        })
      });
})



passport.use(
    new LocalStrategy(async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
            where:{
                email: email,
            }
        })
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        };
        const match = await bcrypt.compare(password, user.password);
  if (!match) {
    // passwords do not match!
    return done(null, false, { message: "Incorrect password" })
  }
  
        return done(null, user);
      } catch(err) {
        return done(err);
      };
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await prisma.user.findUnique({
        where:{
            id: id,
        }
    })
      const user = rows[0];
  
      done(null, user);
    } catch(err) {
      done(err);
    };
  });
  