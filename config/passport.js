import {
    MYSQL_USERNAME,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PORT,
} from './keys.js';
import mysql from 'mysql2';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import DB from '../db/connection.js'

const passportConfig = (passport) =>{
    //LOCAL STRATEGY
    passport.use(
        new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
            const Q = `SELECT * FROM user WHERE email="${email}"`;
            DB.query(Q, (err, result) => {
                console.log("result", result)
                if (err) throw err;

                if (result.length === 0) {
                    return done(null, false, {
                        message: "Email not registered",
                    });
                } else {
                    bcrypt.compare(password, result[0].password, function (err, isMatch) {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, result[0]);
                        } else {
                            return done(null, false, { message: "Password incorrect" });
                        }
                    });
                }
            });
        })
    );

    //SERIAL DESERIAL
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        const Q = `SELECT * FROM user WHERE id="${id}"`;
        DB.query(Q, (err, result) => {
            done(err, result[0]);
        });
    });
};

export default passportConfig;