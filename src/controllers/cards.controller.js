// const { findById } = require('../models/cards.model');
const Card = require("../models/cards.model");
const DeckCards = require("../models/deck_card.model");
const UserCards = require("../models/user_card.model");

// CARDS FOR ALL USERS
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

// RETRIEVE ALL CARDS
module.exports.getCards = getCards = async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try {
        Promise.all([
            await Card.find({}, { creator_id: 0 }),
            await UserCards.findOne(
                { user_id: id },
                { "cards.card_id": 1, "cards.fail_counter": 1, "cards.next_session": 1, "cards.interval": 1, "cards.success_streak": 1 }
            ),
        ])
            .then(async ([cards, user_cards]) => {
                user_cards.cards.forEach((item) => {
                    cards.find((elem) => {
                        if (item.card_id.toString() == elem._id.toString()){
                            elem.fail_counter = item.fail_counter;
                            elem.next_session = item.next_session;
                            elem.interval = item.interval;
                            elem.success_streak = item.success_streak;
                        }
                    });
                });

                console.log(cards);
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

// SEARCH FOR CARDS
module.exports.searchCards = searchCards = async (req, res, next) => {
    try {
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

// DELETE A A CARD
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
