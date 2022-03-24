// const Sessions  = require('../models/sessions.model');
const Deck  = require('../models/decks.model');
const DeckCards  = require('../models/deck_card.model');
const User  = require('../models/users.model');
const { deckCreationValidation }= require('../config/validation')


// CREATE A DECK
module.exports.createDeck = createDeck = async (req, res, next) => {    
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    const { error } = await deckCreationValidation(req.body);

    if(error) return res.status(400).json(error.details[0]);

    const deck = await new Deck({
        name: req.body.name,
        category: req.body.category,
        private: true,
        description: null,
        deck_style_id: null,
        votes: []
    });

    let deck_id = deck._id;

    const deckCards = await new DeckCards({
        deck_id: deck_id,
        user_id: id,
        card_ids: []
    });

    try{
        Promise.all([
            await deck.save(),
            await deckCards.save(),
            await User.updateOne(
                {_id: id},
                {$push: { deck_ids: deck_id} }
            )
        ])
        .then( async ([ deck, deck_cards, ownership ]) => {
            return res.status(200).json({deck: deck, deckCards: deck_cards, ownership: ownership});
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
        const user =  await User.find({_id: req.params.id});
        if(!user) return res.status(404).json("You don't have any decks yet");

        let deck_ids = user[0].deck_ids;
        const decks =  await Deck.find({_id: deck_ids});

        return res.status(200).json(decks);  

    } catch(err) { res.status(400).json({message: err}) }
}


// DELETE A DECK
module.exports.deleteDecks = deleteDecks =  async (req, res, next) => {
    let [id, deck_id] = [req.params.id, req.params.deck_id] || {}
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        await Promise.all([
            DeckCards.deleteOne({ deck_id: deck_id }),
            Deck.deleteOne({_id: deck_id, creator_id: id }),
            User.updateOne(
                { _id: id },
                { $pull: { deck_ids: deck_id }}
            )
        ])
        .then( async ([ deck_cards, deck, user_update ]) => { 
            if(deck_cards.deletedCount === 0) return res.status(404).json("DeckCards not found or not yours");
            if(deck.deletedCount === 0) return res.status(404).json("Deck not found or not yours");
            if(user_update.deletedCount === 0) return res.status(404).json("User or deck not found");

            return res.status(200).json({deck: deck, deckCards: deck_cards, user_update: user_update});    
        });
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