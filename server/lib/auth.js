const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const config = require('../config');
const Response = require('./Response');
const Enum = require('../config/Enum');
const priv = require('../config/role_privileges');
const ErrorCostumer = require('./ErrorCostumer');

module.exports = function () {
    const strategy = new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.JWT.SECRET
    }, async (payload, done) => {
        try {
            const user = await Users.findOne({ _id: payload._id });
            if (user) {
                const userRoles = await UserRoles.find({ user_id: payload._id });
                const rolePrivileges = await RolePrivileges.find({ role_id: { $in: userRoles.map(ur => ur.role_id) } });
                
                const privileges = rolePrivileges
                    .map(ur => priv.privileges.find(p => p.key === ur.permission))
                    .filter(Boolean); // Filter out undefined values

                done(null, {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    language: user.language,
                    roles: privileges,
                    exp: Math.floor(Date.now() / 1000) + config.JWT.EXPIRE
                });
            } else {
                done(null, false);
            }
        } catch (error) {
            return done(new Error("User not found", error), false);
        }
    });

    passport.use(strategy);

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate("jwt", { session: false }),
        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {
                if (!req.user || !req.user.roles) {
                    const response = Response.errorRespose(new ErrorCostumer(Enum.HTTP_CODES.UNAUTHORIZED, "User roles not found", "User roles not found"));
                    return res.status(403).json(response);
                }

                const privileges = req.user.roles.map(x => x.key);
                const hasAccess = expectedRoles.every(role => privileges.includes(role));

                if (!hasAccess) {
                    const response = Response.errorRespose(new ErrorCostumer(Enum.HTTP_CODES.UNAUTHORIZED, "Insufficient permissions", "Insufficient permissions"));
                    return res.status(403).json(response);
                }

                next();
            };
        }
    };
};
