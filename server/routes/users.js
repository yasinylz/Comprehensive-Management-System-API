var express = require('express');
var router = express.Router();
const Enum = require('../config/Enum');
const bcrypt = require('bcrypt');
const ErrorCostumer = require('../lib/ErrorCostumer');
const Users = require('../db/models/Users');
const Role = require('../db/models/Roles');
const UserRoles = require('../db/models/UserRoles');
const is = require('is_js');
const jwt = require('jwt-simple');
const config = require('../config');
const Response = require('../lib/Response');
const auth = require('../lib/auth')();

const i18n = new (require('../lib/i18n'))(config.DEFAULT_LANG);
const { rateLimit } =require('express-rate-limit')
const MongoStore = require('rate-limit-mongo');
const limiter = rateLimit({
  store:new  MongoStore({
uri:config.CONNECTION_STRING,
  collectionName: 'rateLimit',
  expireTimeMs: 15 * 60 * 1000,
 // 15 minutes
  }),
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	
})

/* GET register user with SUPER_ADMIN role */
router.post('/register', async (req, res) => {
  try {
    const body = req.body;

    let user = await Users.findOne({});
    if (user) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    if (!body.first_name || !body.password) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.NAME_PASSWORD_NOT_FOUND", req.user?.language, ["Name", "Password"]));
    }

    if (is.not.email(body.email)) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.INVALID_EMAIL", req.user?.language, ["Email"]));
    }

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.PASSWORD_TOO_SHORT", req.user?.language, [`${Enum.PASS_LENGTH}`]));
    }

    const userExists = await Users.findOne({ email: body.email });
    if (userExists) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.EMAIL_ALREADY_EXISTS", req.user?.language, ["Email"]));
    }

    const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));
    const newUser = await Users.create({ ...body, password: hashedPassword });

    const role = await Role.create({ role_name: Enum.SUPER_ADMIN, created_by: newUser._id, is_active: true });
    if (!role) {
      throw new ErrorCostumer(Enum.HTTP_CODES.INTERNAL_ERROR, i18n.translate("USER.ROLE_NOT_FOUND", req.user?.language));
    }

    await UserRoles.create({ user_id: newUser._id, role_id: role._id });

    res.status(201).json(Response.successRespose(newUser, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* POST user authentication */
router.post('/auth',limiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    Users.validateFiledsBeforeAuth(email, password);

    const user = await Users.findOne({ email });
    if (!user) {
      throw new ErrorCostumer(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("USER.INVALID_CREDENTIALS", config.DEFAULT_LANG));
    }

    if (!user.validPassword(password)) {
      throw new ErrorCostumer(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("USER.INVALID_CREDENTIALS", config.DEFAULT_LANG));
    }

    const payload = {
      _id: user._id,
      exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE
    };

    const userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
   
    const token = jwt.encode(payload, config.JWT.SECRET);
    res.json(Response.successRespose({ token, user: userData }));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});

/* GET users listing */
router.get('/', auth.checkRoles("user_view"), async (req, res) => {
  try {
    const users = await Users.find({},{password:0}).lean();
    for(let  i=0;i<users.length;i++){
      let  roles=await UserRoles.find({user_id:users[i]._id}).populate("role_id");
      users[i].roles=roles
    }
    res.json(Response.successRespose(users));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* POST add user */ 
router.post('/add', /*auth.checkRoles("user_add"),*/ async (req, res) => {
  try {
    const { first_name, email, password } = req.body;
    if (!first_name || !password) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.NAME_PASSWORD_REQUIRED", req.user?.language));
    }
    if (is.not.email(email)) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.INVALID_EMAIL", req.user?.language, ["Email"]));
    }
    if (password.length < Enum.PASS_LENGTH) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.PASSWORD_TOO_SHORT", req.user?.language, [`${Enum.PASS_LENGTH}`]));
    }

    const userExists = await Users.findOne({ email });
    if (userExists) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.EMAIL_ALREADY_EXISTS", req.user?.language));
    }

    if (!req.body.roles || !Array.isArray(req.body.roles) || req.body.roles.length === 0) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.ROLE_REQUIRED", req.user?.language));
    }

    const roles = await Role.find({ _id: { $in: req.body.roles } });
    if (roles.length === 0) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.INVALID_ROLE", req.user?.language));
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const user = await Users.create({ ...req.body, password: hashedPassword });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        user_id: user._id,
        role_id: roles[i]._id
      });
    }

    res.status(201).json(Response.successRespose(user, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* PUT update user */
router.put('/update', auth.checkRoles("user_edit"), async (req, res) => {
  try {
    if (!req.body || !req.body._id) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.ID_REQUIRED", req.user?.language));
    }

    const { _id, password } = req.body;
    const updateData = { ...req.body };
    if (password) {
      updateData.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
    if  (req.body._id==req.user.id) req.body.roles=null;

    if (Array.isArray(req.body.roles) && req.body.roles.length > 0) {
      const userRoles = await UserRoles.find({ user_id: req.body._id });
      const removeRoles = userRoles.filter(x => !req.body.roles.includes(x.role_id.toString()));
      const newRoles = req.body.roles.filter(x => !userRoles.map(y => y.role_id.toString()).includes(x));

      if (removeRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removeRoles.map(x => x._id) } });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          await UserRoles.create({
            user_id: req.body._id,
            role_id: newRoles[i]
          });
        }
      }
    }

    const user = await Users.findByIdAndUpdate(_id, updateData, { new: true });
    if (!user) {
      throw new ErrorCostumer(Enum.HTTP_CODES.NOT_FOUND, i18n.translate("USER.NOT_FOUND", req.user?.language));
    }

    res.json(Response.successRespose(user));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* DELETE delete user */
router.delete('/delete', auth.checkRoles("user_delete"), async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("USER.ID_REQUIRED", req.user?.language));
    }

    const user = await Users.findByIdAndDelete(_id);
    await UserRoles.deleteMany({ user_id: _id });
    if (!user) {
      throw new ErrorCostumer(Enum.HTTP_CODES.NOT_FOUND, i18n.translate("USER.NOT_FOUND", req.user?.language));
    }

    res.json(Response.successRespose({ message: i18n.translate("USER.DELETE_SUCCESS", req.user?.language) }));
  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
