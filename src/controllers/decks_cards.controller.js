// const Deck  = require('../models/decks.model');
const Cards  = require('../models/cards.model');
const DeckCards  = require('../models/deck_card.model');
const UserCard  = require('../models/user_card.model');

// ADD CARD TO DECK
module.exports.addCard = addCard = async (req, res, next) => {    
    let [user_id, card_id, deck_id] = [req.params.id, req.body.card_id, req.body.deck_id] || {};

    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");
            
    try{
        await Promise.all([
            DeckCards.findOne({ 
                $and: [ { deck_id: deck_id}, {card_ids: card_id }] 
            }),
            Cards.findOne({ _id: card_id })
        ])
        .then( async ([ DeckCard, Card ]) => { 
            
            if(DeckCard) return res.status(404).json("Error | Do not duplicate duplicate cards");
            if(!Card) return res.status(404).json("Error | Card not found");

            try{
                const deck_card = await DeckCards.updateOne(
                    { deck_id: deck_id }, 
                    { $push: { card_ids: card_id }}
                );

                if(deck_card.modifiedCount == 0) return res.status(404).json("Error | Coudln't not add card to deck");

                if(deck_card.modifiedCount == 1){
                    const user_card = await UserCard.findOne(
                        { $and: [{ user_id: user_id }, { 'cards': { $elemMatch: { card_id: card_id } } }]}                
                    )
                    
                    if(user_card) return res.status(200).json(deck_card);

                    const card = await UserCard.updateOne(
                        { user_id: user_id }, 
                        { $push: { cards: [{
                            card_id: card_id,
                            next_session: null,
                            interval: null,
                            fail_counter: 0,
                            old_ease_factor: null,
                            ease_factor: 2.5,
                            success_streak: 0,
                            style_id: null
                        }] }},
                        { upsert: true }
                    )
                    return res.status(200).json({deck_card: deck_card, card: card});

                }
            } catch(err) { return res.json(err) }
        });
    } catch(err) { return res.status(400).json({message: "Error | Deck is not found"}) }
}


// GET ALL CARDS OF A SPECIFIC DECK
module.exports.getCardsDeck = getCardsDeck = async (req, res, next) => {    
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const deck = await DeckCards.findOne({ deck_id: req.body.deck_id });
        if(!deck) return res.status(404).json("Error | no cards in the deck");
        
        let card_ids = deck.card_ids;
        const getCards = await Cards.find({ '_id': { $in: card_ids } });
        const getUserCards = await UserCard.findOne({ "cards.card_id": { $in: card_ids } });

        let userDeck = {
            user_id: id,
            deck_id: deck.deck_id,
            cards: []
        }

        getCards.forEach(item => {
            userDeck.cards.push({
                card_id: item._id,
                question: item.question,
                answer: item.answer,
                img_url: item.img_url
            })
        });

        let userCardsIds = getUserCards.cards

        userDeck.cards.forEach(item => {
            userCardsIds.forEach(element => {
                if(item.card_id.toString() == element.card_id.toString()){
                    let bite = {
                        next_session: element.next_session,
                        interval: element.interval,
                        fail_counter: element.fail_counter,
                        old_ease_factor: element.old_ease_factor,
                        ease_factor: element.ease_factor,
                        success_streak: element.success_streak,
                        style_id: element.style_id
                    }
                    Object.assign(item, bite);
                }
            });
        });

        return res.status(200).json({userDeck: userDeck});
        
    } catch(err) { return res.status(400).json({message: err}) }
}


// REMOVE CARD FROM DECK
module.exports.deleteDeckCards = deleteDeckCards = async (req, res, next) => {    
    let [user_id, card_id, deck_id] = [req.params.id, req.body.card_id, req.body.deck_id] || {};

    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        await Promise.all([
            DeckCards.findOne({ deck_id: deck_id }),
            DeckCards.findOne({ card_ids: card_id }),
        ])
        .then( async ([ deck, card ]) => {

            if(deck === null || !deck) return res.status(404).json("Error | Deck not found !");
            if(card === null || !card) return res.status(404).json("Error | Card not found !");

            try{
                const deleteCard = await DeckCards.updateOne(
                    { deck_id: deck_id }, 
                    { $pull: { card_ids: card_id }}
                )
                return res.status(200).json(deleteCard);
            } catch(err) { return res.status(400).json({message: err}) }
        })

    } catch(err) { return res.status(400).json({message: "Error | Deck is not found or card duplicate !"}) }
}
