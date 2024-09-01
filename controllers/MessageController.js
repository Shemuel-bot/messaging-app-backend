
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();



exports.get_messages = asyncHandler(async (req, res) => {
    jwt.verify(req.token, 'mysecretkey', async (err, authData) => {
        if (err) {
            res.json({value: false}); 
        }else{
            const messages = await prisma.message.findMany({
                where: {
                    from: authData.user.id,
                    to: req.body.userId
                }
            })
            res.json({
                value: messages,
                id: authData.user.id,
            })
        }
    })
    
})

exports.send_message = [
    body('message', 'message must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res) => {
        jwt.verify(req.token, 'mysecretkey', async (err, authData) => {
            if (err) {
                res.json({value: false}); 
            }else{
                const errors = validationResult(req);

                if(!errors.isEmpty){
                console.log('type something')
                }else{
                await prisma.message.create({
                data: {
                    message:req.body.message,
                    from: authData.user.id,
                    to: req.body.userId,
                }
                })
                res.json({
                    value:true,
                });
            }
            }
        })
        
    })
]
