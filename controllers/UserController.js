const PrismaClient = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

