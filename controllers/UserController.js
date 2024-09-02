const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

exports.sign_up = [
  body("firstName", "first name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "last name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email", "email must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "password must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const password = await bcrypt
      .hash(req.body.password, 10)
      .then((hash) => hash)
      .catch((err) => {
        console.log(err.message);
      });

    if (!errors.isEmpty()) {
      res.json({
        message: false,
      });
    } else {
      await prisma.user.create({
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: password,
          about: "Its me!",
        },
      });
      res.json({
        message: true,
      });
    }
  }),
];

exports.log_in = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: 'req.body.email',
    },
  });

  if (!user) {
    res.json({
      message: false,
    });
  }

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) {
    res.json({
      message: false,
    });
  }

  jwt.sign({ user }, "mysecretkey", { expiresIn: "2 days" }, (err, token) => {
    res.json({
      message: token,
    });
  });
});

exports.update_user = asyncHandler(async (req, res) => {
  jwt.verify(req.token, "mysecretkey", async (err, authData) => {
    if (err) {
      res.json({ value: false });
    } else {
      if (req.body.password.length > 1) {
        const password = await bcrypt
          .hash(req.body.password, 10)
          .then((hash) => hash)
          .catch((err) => console.log(err));
        await prisma.user.update({
          where: {
            id: authData.user.id,
          },
          data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: password,
            about: req.body.about,
          },
        });
      } else {
        await prisma.user.update({
          where: {
            id: authData.user.id,
          },
          data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            about: req.body.about,
          },
        });
      }
      const user = await prisma.user.findUnique({
        where: {
            id: authData.user.id
        }
      })
      console.log(req.body)
      jwt.sign({ user }, "mysecretkey", { expiresIn: "2 days" }, (err, token) => {
        res.json({
          value: token,
        });
      });
    }
  });
});

exports.user_names_match = asyncHandler(async (req, res) => {
  jwt.verify(req.token, "mysecretkey", async (err, authData) => {
    if (err) {
      res.json({ value: false });
    } else {
      res.json({ value: authData });
    }
  });
});

exports.get_users = asyncHandler(async (req, res) => {
  jwt.verify(req.token, "mysecretkey", async (err, authData) => {
    if (err) {
      res.json({ value: false });
    } else {
      const users = await prisma.user.findMany();
      const filtered = [];
      users.forEach((x) => {
        if (x.email !== authData.user.email) filtered.push(x);
      });

      res.json({
        users: filtered,
      });
    }
  });
});

exports.get_chats = asyncHandler(async (req, res) => {
  jwt.verify(req.token, "mysecretkey", async (err, authData) => {
    if (err) {
      res.json({ value: false });
    } else {
      const list = [];
      const conditions = [];
      const messages = await prisma.message.findMany({
        where: {
          from: authData.user.id,
        },
      });

      messages.forEach((element) => {
        if (!list.includes(element.to)) list.push(element.to);
      });

      list.forEach((element) => {
        conditions.push({
          id: element,
        });
      });

      const chats = await prisma.user.findMany({
        where: {
          OR: conditions,
        },
      });

      res.json({
        chats: chats,
      });
    }
  });
});

exports.log_out = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "success",
    });
  });
});

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      console.log(user);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});
