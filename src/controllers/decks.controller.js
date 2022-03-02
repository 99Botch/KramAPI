// const Sessions  = require('../models/sessions.model');
const Deck  = require('../models/decks.model');
const UserDeckCards  = require('../models/user_deck_cards.model');
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
        private: true,
        description: null,
        owners_id: [],
        deck_style_id: null,
        votes: []
    });

    const userDeckCards = await new UserDeckCards({
        user_id: id,
        deck_id: deck._id,
        cards: []
    });

    try{
        Promise.all([
            await deck.save(),
            await userDeckCards.save()
        ])
        .then( async ([ deck, user_deck_cards ]) => {
            return res.status(200).json({deck: deck, userDeckCards: user_deck_cards});
        })
    } catch(err) { res.status(400).json({message: err}) }
}


// RETRIEVE ALL DECKS THAT ARE PUBLIC
module.exports.publicDecks = publicDecks = async (req, res, next) => {    
    try{
        const decks = await Deck.find({ private: false });
        if(!decks) return res.status(404).json("No public decks in the db");
        return res.json(decks);
        
    } catch(err) { res.status(400).json({message: err}) }
}


// RETRIEVE PERSONNAL DECKS
module.exports.userDecks = userDecks = async (req, res, next) => {    
    try{
        const decks =  await Deck.find({creator_id: req.params.id});
        if(!decks) return res.status(404).json("You don't have any decks yet");
        return res.json(decks);  

    } catch(err) { res.status(400).json({message: err}) }
}


// DELETE A DECK
module.exports.deleteDecks = deleteDecks =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    let deck_id = req.body.deck_id

    try{
        const deleteDeck = await Deck.deleteOne({_id: deck_id, creator_id: id });
        if(deleteDeck.deletedCount === 0) return res.status(404).json("Deck not found or not yours");
        return res.status(200).json(deleteDeck);    
    } catch (err){res.status(500).json({ message:  err  })}
}


// UPDATE A DECK
module.exports.updateDeck = updateDeck =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");
    
    let deck_id = req.body.deck_id
    
    try{
        let currentDate = new Date();
        
        const updateDeck = await Deck.updateOne(
            { _id: deck_id, creator_id: id }, 
            { $set: { 
                name: req.body.name, 
                category: req.body.category, 
                sub_category: req.body.sub_category, 
                last_update: currentDate
            }}
        );

        if(!updateDeck) return res.status(404).json("Deck not found or not yours");
        return res.status(200).json(updateDeck);    
    } catch (err){res.status(500).json({ message: "" + err  })}
}

// UPDATE DECK PRIVACY
module.exports.updatePrivacy = updatePrivacy =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");
    
    let deck_id = req.body.deck_id
    
    try{
        const switchPrivacy = await Deck.updateOne(
            { _id: deck_id, creator_id: id }, 
            { $set: { 
                private: req.body.private,
                description: req.body.description
            }}
        );
        if(switchPrivacy.modifiedCount == 0) return res.status(404).json("Deck not found or not yours");
        return res.status(200).json(switchPrivacy);    
    } catch (err){res.status(500).json({ message: "" + err  })}
}


// UPDATE DECK VOTES
module.exports.updateDeckVote = updateDeckVote =  async (req, res, next) => {
    let id = req.params.id || {};    
    let deck_id = req.body.deck_id

    try{
        const voting = await Deck.updateOne(
            { _id: deck_id }, 
            { $push: { votes: [{ 
                voter_id: id,
                vote: req.body.vote
                }]
            }},
            {upsert: true}
        );
        if(!voting) return res.status(404).json("Deck not found or not yours");
        return res.status(200).json(voting);    
    } catch (err){res.status(500).json({ message: "" + err  })}
}