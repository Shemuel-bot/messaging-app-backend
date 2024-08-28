
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();



exports.get_messages = asyncHandler(async (req, res) => {
    const messages = await prisma.message.findMany({
        where: {
            from: req.user.id,
            to: req.body.userId
        }
    })

    res.json({
        messages: messages,
    })
})

exports.send_message = [
    body('message', 'message must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty){
            console.log('type something')
        }else{
            await prisma.message.create({
                data: {
                    message:req.body.message,
                    from: req.user.id,
                    to: req.body.userId,
                }
            })
        }
    })
]
