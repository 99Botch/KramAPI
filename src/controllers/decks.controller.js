// const Sessions  = require('../models/sessions.model');
const Deck  = require('../models/decks.model');
const { deckCreationValidation }= require('../config/validation')


// CREATE A DECK
module.exports.createDeck = createDeck = async (req, res, next) => {    
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const { error } = await deckCreationValidation(req.body);

    if(error) return res.status(400).json(error.details[0]);

    const deck = await new Deck({
        creator_id: id,
        name: req.body.name,
        category: req.body.category,
        sub_category: req.body.sub_category,
        private: true
    });

    try{
        const saveDeck = await deck.save();
        res.status(200).json(saveDeck);
    } catch(err) { res.status(400).json({message: err}) }
}


// RETRIEVE ALL DECKS THAT ARE PUBLIC
module.exports.publicDecks = publicDecks = async (req, res, next) => {    
    try{
        const decks = await Deck.find({ private: false });
        if(!decks) return res.status(404).json("No public decks in the db");
        res.json(decks);
        
    } catch(err) { res.status(400).json({message: err}) }
}


// RETRIEVE PERSONNAL DECKS
module.exports.userDecks = userDecks = async (req, res, next) => {    
        try{
            const decks =  await Deck.find({creator_id: req.params.id});
            if(!decks) return res.status(404).json("You don't have any decks yet");
            res.json(decks);  

        } catch(err) { res.status(400).json({message: err}) }
}


// DELETE A DECK
module.exports.deleteUser = deleteUser =  async (req, res, next) => {
    // first, API checks if the user's id matches the request's id, if so .deleteOne deletes the User
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");
    console.log(req.body.deck_id)
    let deck_id = req.body.deck_id

    // const deck = await Deck.find({ _id: req.body.deck_id }, { creator_id: id });
    // const deck = await Deck.find( { creator_id: id });
    const deck = await Deck.findById(  req.body.deck_id );

    if (!deck) res.status(400).json({message:err}) 

    res.json(deck)
}