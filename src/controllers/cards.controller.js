/**
 * Import schemas required to manipulate cards and user_cards documents
 */
const Card = require("../models/cards.model");
const UserCards = require("../models/user_card.model");

// CREATE A CARD --------------------------------------------------------------------------------------------------------------------
/**
 * Most crontroller functions repeats the same prodecdural sequence as bellow
 * First it checks the validity of the id. It is not necessary when the app enter production, but was a way to check
 * The user authentivity at first and during development when using Insomnia. I left them here as extra firewall
 * 
 * A new object is created. The controller receives the JSON request and the content is transposed to the newly created object
 * Its attributes must fit to the schema's rules it is bounded to
 * 
 * .save() is a mongoose function that sends a request to the database to store the object
 */
module.exports.createCard = createCard = async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const newCard = new Card({
        creator_id: id,
        question: req.body.question,
        answer: req.body.answer,
        img_url: !req.body.img_url ? null : req.body.img_url,
    });

    try {
        const savedCard = await newCard.save();
        return res.status(200).json(savedCard);
    } catch (err) {
        return res.status(400).json({ message: err });
    }
};

// GET ALL CARDS --------------------------------------------------------------------------------------------------------------------
// The function gets all the cards from the database for display in the client
module.exports.getCards = getCards = async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try {
        /**
         * Promise.all():The Promise.all() method takes an iterable of promises as an input, 
         * and returns a single Promise that resolves to an array of the results of the input promises. 
         * This returned promise will resolve when all of the input's promises have resolved, or if the input iterable contains no promises. 
         * It rejects immediately upon any of the input promises rejecting or non-promises throwing an error, and will reject with this first rejection message / error. 
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
         * 
         * A mongoose request is made out of sections. The first one is responsible to fetch information based on a criterion (or many ones) such as the use_id
         * 
         * Programmers may then specifies response rules. In this example, the request will only return the ids, fail_counter, next_session & interval
         * attributes. 
         * 
         * Lastly, they may provide additional rules, such as a limtie of returned elements using the .limit() function
         * 
         * find() returns all the matching elements
         * while findOne() returns a single element
         */
        Promise.all([
            await Card.find({}, { creator_id: 0 }),
            await UserCards.findOne(
                { user_id: id },
                { "cards.card_id": 1, "cards.fail_counter": 1, "cards.next_session": 1, "cards.interval": 1}
            ),
        ])
            /**
             * the aim of the function below is to merge cards and user_cards together by comparing their ids
             * so taht when the user gets in the cards page, he may identify which cards he already owns and what information are bound to them
             */
            .then(async ([cards, user_cards]) => {
                user_cards.cards.forEach((item) => {
                    cards.find((elem) => {
                        if (item.card_id.toString() == elem._id.toString()){
                            elem.fail_counter = item.fail_counter;
                            elem.next_session = item.next_session;
                            elem.interval = item.interval;
                        }
                    });
                });
                return res.status(200).json({ cards: cards });
            })
            .catch((err) => {
                res.status(404).json({
                    message: err,
                    error: "Error | Cards not retrieved",
                });
            });
    } catch (err) {
        return res.status(400).json({ message: err });
    }
};

// SEARCH CARDS --------------------------------------------------------------------------------------------------------------------
module.exports.searchCards = searchCards = async (req, res, next) => {
    try {
        /**
         * the request gets from the URI strings of words of characters
         * using a regex function, the request will fetch cards that may match the search
         * .split removes the pluses and .join erges the string using spaces
         */
        const cards = await Card.find({
            $or: [
                {
                    question: {
                        $regex: new RegExp(
                            req.params.text.split("+").join(" "),
                            "i"
                        ),
                    },
                },
                {
                    answer: {
                        $regex: new RegExp(
                            req.params.text.split("+").join(" "),
                            "i"
                        ),
                    },
                },
            ],
        });
        if (!cards) return res.status(404).json("No public decks in the db");

        return res.json(cards);
    } catch (err) {
        return res.status(400).json({ message: err });
    }
};

// DELETE A CARD --------------------------------------------------------------------------------------------------------------------
// The function did not make to prodution. It simply deletes a card item using it card_id
module.exports.deleteCard = deleteCard = async (req, res, next) => {
    let id = req.params.id || {};
    let card_id = req.body._id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try {
        const deleteCard = await Card.deleteOne({ _id: card_id });
        if (deleteCard.deletedCount === 0)
            return res.status(404).json("Card not found or not yours");
        else return res.status(200).json("Card deleted!");
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};
