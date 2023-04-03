import passport from "passport";
import local from 'passport-local'
import userModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy
const initializePassport = () =>{

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) =>{
        const { first_name, last_name, email, age } = req.body
        try {
            const user = await userModel.findOne({ email: username })
            if (user){
                console.log('User alredy exist')
                return done(null, false)
            }

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }

            const result = await userModel.create(newUser)
            return done(null, result)

        } catch(error){
            return done(error)
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async(username, password, done) =>{
        try {
            const user = await userModel.findOne({ email: username})
            if(!user){
                console.log('User not found')
                return done(null, user)
            }
            if(!isValidPassword(user, password)) return done(null, false)
            
            return done(null, user)
        } catch (error) {
            
        }
    }))

    passport.serializeUser((user, done) =>{
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) =>{
        const user = await userModel.findById(id)
        done(null, user)
    })
}

export default initializePassport