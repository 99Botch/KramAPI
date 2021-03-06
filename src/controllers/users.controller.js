/**
 * Refer to cards.controller.js for general information
 * The comments from here onward are there to highlight pieces of code unique to the controller
 */

// bcryptjs is utilized to encrypt passwords
const bcrypt = require("bcryptjs");
// jsonwebtoken creates auth tokens
const jwt = require("jsonwebtoken");
// import the schema UserSchema as 'User'
const User = require("../models/users.model");
const Sessions = require("../models/sessions.model");
const Decks = require("../models/decks.model");
const DeckCards = require("../models/deck_card.model");
const UserCards = require("../models/user_card.model");
const {
    registerValidation,
    loginValidation,
    updateValidation,
} = require("../config/validation");
const { DateTime } = require("luxon");

// I use cloudinary so taht when a user updates its profile picture, the older one gets deleted from the database
const cloudinary = require("cloudinary");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// REGISTER A NEW PROFILE --------------------------------------------------------------------------------------------------------------------
module.exports.register = register = async (req, res, next) => {
    // Every user route will be accessible via /users/request_name (+ /:id to access a specific item)
    // here the request is a 'post' one since the user details are sent to the db to be saved

    // for registerValidation refer to ../config/validation -> if true, the API renders  the error
    const { error } = await registerValidation(req.body);
    if (error) return res.status(400).json(error.details[0]);

    // isCreditsTaken checks the uniqueness of the username & mail address via findOne which sends a query to the db -> if true, the API renders  the error
    const isCreditsTaken = await User.findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (isCreditsTaken)
        return res.status(400).json("Username or Email is already taken");

    // .hash takes two parameters to cypher a password:  the password in plain text & salt (a random string)
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    /* at this point, all that is left is to create a new user based on the schema of the user model By hashing a plain text password plus a salt, the hash algorithm???s output is no longer predictable. 
    // The same password will no longer yield the same hash. The salt gets automatically included with the hash, so you do not need to store it in a database. (https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/)*/
    const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        profile_pic_url: null,
    });

    // When registering, Kram creates a tutorial decks with a single card to present the user how to use the application and how sessions work
    const deck = await new Decks({
        name: "Welcome to Kram",
        category: "Other",
        private: true,
        description: "Step in Kram using this deck for a review session!",
        deck_style_id: null,
        votes: 0,
        voters: [
            {
                voter_id: newUser._id,
                vote: "none",
            },
        ],
    });

    let deck_id = deck._id;
    const deckCards = await new DeckCards({
        deck_id: deck_id,
        user_id: newUser._id,
        card_ids: ["62289678b09c5d9dddfef7d9"],
    });

    newUser.deck_ids = [deck_id];

    const user_cards = await new UserCards({
        user_id: newUser._id,
        cards: [
            {
                card_id: "62289678b09c5d9dddfef7d9",
                next_session: DateTime.now().toISO().substring(0, 10),
                interval: 0.6,
                fail_counter: 0,
                old_ease_factor: null,
                ease_factor: 2.5,
                success_streak: 0,
                style_id: null,
            },
        ],
    });

    try {
        Promise.all([
            await newUser.save(),
            await deck.save(),
            await deckCards.save(),
            await user_cards.save(),
        ]).then(async ([new_user]) => {
            res.status(200).json(new_user);
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

// LOGIN TO PROFILE --------------------------------------------------------------------------------------------------------------------
module.exports.login = login = async (req, res, next) => {
    // for loginValidation refer to ../config/validation -> if true, the API renders  the error
    const { error } = await loginValidation(req.body);
    if (error) return res.status(400).json(error.details[0]);

    // checking if the usermail is valid -> if true, the API renders  the error
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({ message: "Email not found or invalid" });

    // .compare checks the validity of the req.body.password (from the form) against user.password (hashed) -> if true, the API renders  the error
    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!validPassword)
        return res.status(400).json({ message: "Invalid password" });

    await Sessions.deleteOne({ user_id: user._id.toString() });

    // tokens are made of: 1. User _id 2. user mail 3. Secret key (.env) and will expire after 3 hours
    const session = await new Sessions({
        user_id: user._id,
        token: jwt.sign(
            { _id: user.id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: "6h" }
        ),
    });

    try {
        const token = await session.save();
        res.status(200).json(token);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// FIND SESSION BY /:ID --------------------------------------------------------------------------------------------------------------------
module.exports.getSession = getSession = async (req, res, next) => {
    try {
        const session = await Sessions.findOne({ user_id: req.params.id });
        if (!session) return res.status(404).json("session not found");
        res.json(session);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// LOGOUT PROFILE --------------------------------------------------------------------------------------------------------------------
module.exports.logout = logout = async (req, res, next) => {
    // first, API checks if the user's id matches the request's id, if so .deleteOne deletes the User
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try {
        const logout = await Sessions.deleteOne({ user_id: id });
        res.json(logout);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// FIND ALL USERS - getUsers will retrieve all of the users in the db via .find regardless of their information
module.exports.getUsers = getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users) return res.status(404).json("no users in the db");
        res.json(users);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// FIND USER BY /:ID - refer to the above function for further explanation
module.exports.getUser = getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json("user not found");
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// GET USER PIC --------------------------------------------------------------------------------------------------------------------
module.exports.getUserPic = getUserPic = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id, {
            _id: 0,
            profile_pic_url: 1,
        });
        if (!user) return res.status(404).json("user not found");
        return res.status(200).json(user);
    } catch (err) {
        return res.status(400).json({ message: err });
    }
};

// DELETE USER PROFILE --------------------------------------------------------------------------------------------------------------------
module.exports.deleteUser = deleteUser = async (req, res, next) => {
    // first, API checks if the user's id matches the request's id, if so .deleteOne deletes the User
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const userData = await Promise.all([
        User.findById({ _id: id }),
        Sessions.findOne({ user_id: id }),
        DeckCards.find({ user_id: id }),
    ]);

    if (!userData) {
        try {
            const removeUser = await User.deleteOne({ _id: id });
            return res.status(200).json(removeUser);
        } catch (err) {
            res.json({ message: err });
        }
    } else {
        try {
            Promise.all([
                Sessions.deleteOne({ user_id: id }),
                User.deleteOne({ _id: id }),
                Decks.deleteMany(
                    {
                        $and: [
                            { _id: { $in: userData[0].deck_ids } },
                            { private: true },
                        ],
                    },
                    { multi: true }
                ),
                DeckCards.deleteMany({ user_id: id }),
                UserCards.deleteMany({ user_id: id }),
            ]);
            return res.status(200).json({ message: "Deletion is successful" });
        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }
};

// UPDATE USER PROFILE --------------------------------------------------------------------------------------------------------------------
module.exports.updateUser = updateUser = async (req, res, next) => {
    try {
        // first step consists to ccheck whether the user tries to update his profile or not
        let id = req.params.id || {};
        if (id != req.user._id)
            return res.status(401).json("Ids aren't matching");

        // for updateValidation refer to ../config/validation -> if the format attributes format aren't respected, API throws an error
        const { error } = await updateValidation(req.body);
        if (error) return res.status(400).json(error.details[0]);

        // Promise.all sends to request with the promise to return both queries or none
        // the first query gets the user details while the second checks whether the update details already exists
        Promise.all([
            User.findOne({ _id: id }),
            User.findOne({
                $or: [
                    { username: req.body.username },
                    { email: req.body.email },
                ],
            }),
        ]).then(async ([user, isCreditsTaken]) => {
            // user details
            let old_username = user.username,
                old_email = user.email;

            // create new object to push to the query
            const updUser = await new User({
                _id: id,
                username: req.body.username,
                email: req.body.email,
            });

            // User is pushed to the database if the details don't exists or if the user is not updating is mail/username
            if (
                !isCreditsTaken ||
                (isCreditsTaken &&
                    old_username == req.body.username &&
                    old_email == req.body.email)
            ) {
                let updateValidation = await updateQuery(updUser);
                return res.status(200).json(updateValidation);
            }

            // if either req has old mail and anew username or if req has old username and new mail
            if (
                (isCreditsTaken &&
                    old_username == req.body.username &&
                    old_email != req.body.email) ||
                (old_email == req.body.email &&
                    old_username != req.body.username)
            ) {
                let updateValidation = await updateQuery(updUser);
                return res.status(200).json(updateValidation);
            }

            return res.status(400).json("Username or Email is already taken");
        });
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

async function updateQuery(_updUser) {
    // updateUser is a new object of the user schema which may take the profile_pic_url attribute. _id act as the identifier for the db
    const updateUser = await User.updateOne(
        { _id: _updUser._id },
        {
            $set: {
                username: _updUser.username,
                email: _updUser.email,
            },
        }
    );
    return updateUser;
}

// UPDATE USER PROFILE PICTURE --------------------------------------------------------------------------------------------------------------------
module.exports.updateUserPic = updateUserPic = async (req, res, next) => {
    try {
        // first step consists to ccheck whether the user tries to update his profile or not
        let id = req.params.id || {};
        if (id != req.user._id)
            return res.status(401).json("Ids aren't matching");

        try {
            const user = await User.findById(req.params.id, {
                _id: 0,
                profile_pic_url: 1,
            });
            if (!user) return res.status(404).json("user not found");

            if (user.profile_pic_url) {
                let final = user.profile_pic_url.substr(
                    user.profile_pic_url.lastIndexOf("/") + 1
                );
                let result = final.indexOf(".");
                final = final.slice(0, result);

                cloudinary.uploader.destroy(final, function (result) {
                    console.log(result);
                });
            }

            const updatePic = await User.updateOne(
                { _id: id },
                { $set: { profile_pic_url: req.body.profile_pic_url } },
                { upsert: true }
            );
            return res.status(200).json(updatePic);
        } catch (err) {
            return res.status(400).json({ message: err });
        }
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

// UPDATE USER PASSWOR --------------------------------------------------------------------------------------------------------------------
module.exports.updateUserPassword = updateUserPassword = async (
    req,
    res,
    next
) => {
    try {
        // first step consists to ccheck whether the user tries to update his profile or not
        let id = req.params.id || {};
        if (id != req.user._id)
            return res.status(401).json("Ids aren't matching");

        // for updateValidation refer to ../config/validation -> if the format attributes format aren't respected, API throws an error
        const { error } = await updatePasswordValidation(req.body);
        if (error) return res.status(400).json(error.details[0]);

        const verified = bcrypt.compareSync(
            req.body.old_password,
            req.body.current_password
        );

        if (!verified)
            return res
                .status(400)
                .json("Old password is not matching database");

        const hashPassword = await bcrypt.hash(req.body.new_password, 10);

        const updatePassword = await User.updateOne(
            { _id: id },
            { $set: { password: hashPassword } }
        );

        return res.status(200).json(updatePassword);
    } catch (err) {
        res.status(400).json({ message: err });
    }
};
