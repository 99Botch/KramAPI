const Deck  = require('../models/decks.model');
const Card  = require('../models/cards.model');
const UserDeckCard  = require('../models/user_deck_card.model');
// const { deckCreationValidation }= require('../config/validation')


// CREATE A DECK
module.exports.createCard = createCard = async (req, res, next) => {    
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const newCard = new Card({
        creator_id: id,
        question: req.body.question,
        answer: req.body.answer,
        img_url: (!req.body.img_url) ? null : req.body.img_url
    });

    const cardUniqueness = await Card.findOne({ question: req.body.question });
    if(cardUniqueness) return res.status(404).json("Error | Don't duplicate cards !");

    try{
        const savedCard = await newCard.save();
        res.status(200).json(savedCard);
    } catch(err) { res.status(400).json({message: err}) }

}


// RETRIEVE ALL CARDS
module.exports.getCards = getCards = async (req, res, next) => {    
    try{
        const cards = await Card.find().limit(20);
        if(!cards) return res.status(404).json("No public decks in the db");
        return res.json(cards);
        
    } catch(err) { res.status(400).json({message: err}) }
}


// ADD CARD TO DECK
module.exports.addCard = addCard = async (req, res, next) => {    
    let id = req.params.id || {};
    let deck_id = req.body.deck_id || {};

    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const deck = await Deck.findById({ _id: deck_id });
    if(deck === null || !deck) return res.status(404).json("Error | Deck not found !");

    const cardUniqueness = await Card.findOne({
        $and: [{ age: deck_id }, { card_id: req.body.card_id }]
    });
    console.log(cardUniqueness)
    if(cardUniqueness) return res.status(404).json("Error | Don't duplicate cards !");

    const newCardDeck = new UserDeckCard({
        deck_id: deck_id,
        card_id: req.body.card_id,
        last_review: null,
        review_laspe: "15m",
        fail_counter: 0,
        ease_factor: 0,
        is_new: true,
        style_id: null,
    });

    try{
        const addedCard = await newCardDeck.save();
        res.status(200).json(addedCard);
    } catch(err) { res.status(400).json({message: err}) }

}

// DELETE A A CARD
module.exports.deleteCard = deleteCard =  async (req, res, next) => {
    let id = req.params.id || {};
    let card_id = req.body._id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const deleteCard = await UserDeckCard.deleteOne({ _id: card_id });
        if(deleteCard.deletedCount === 0) return res.status(404).json("Deck not found or not yours");
        else return res.status(200).json("Card deleted!");
    } catch (err){res.status(500).json({ message:  err  })}
}

