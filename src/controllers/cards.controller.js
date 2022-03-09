// const { findById } = require('../models/cards.model');
const Card  = require('../models/cards.model');
const DeckCards  = require('../models/deck_card.model');


// CARDS FOR ALL USERS
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
        return res.status(200).json(savedCard);
    } catch(err) { return res.status(400).json({message: err}) }

}

// RETRIEVE ALL CARDS
module.exports.getCards = getCards = async (req, res, next) => {    
    try{
        const cards = await Card.find().limit(20);
        if(!cards) return res.status(404).json("No public decks in the db");
        return res.json(cards);
        
    } catch(err) { return res.status(400).json({message: err}) }
}


// DELETE A A CARD
module.exports.deleteCard = deleteCard =  async (req, res, next) => {
    let id = req.params.id || {};
    let card_id = req.body._id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const deleteCard = await Card.deleteOne({ _id: card_id });
        if(deleteCard.deletedCount === 0) return res.status(404).json("Card not found or not yours");
        else return res.status(200).json("Card deleted!");
    } catch (err){return res.status(500).json({ message:  err  })}
}

