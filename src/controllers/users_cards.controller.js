/**
 * Refer to cards.controller.js for general information 
 * The comments from here onward are there to highlight pieces of code unique to the controller
 */
const DeckCards  = require('../models/deck_card.model');
const UserCard  = require('../models/user_card.model');
const { DateTime } = require("luxon");


// UPDATE DECK CARD REVIEW LAPSE ---------------------------------------------------------------------------------------------------------
// Function resets the data of a card if the user considers that he did not properly learnt the flashcard
module.exports.getUserCardsDetails = getUserCardsDetails =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const user_cards = await UserCard.findOne( { user_id: id })
        return res.status(200).json(user_cards) 
    } catch (err){  return res.status(500).json('No cards yet!')}
}

// UPDATE DECK CARD DETAILS ---------------------------------------------------------------------------------------------------------
// The function updates the card details in the user_cards document after a review, like updating the intervals
module.exports.updateCardDetails = updateCardDetails =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        let updates = req.body.cards;   

        const cardsUpdates = await UserCard.updateOne(
            { user_id: id },
            { $set: { 
                cards: updates
            }},
        )

        return res.status(200).json(cardsUpdates) 
    } catch (err){  return res.status(500).json({ message: "" + err  })}
}


// REMOVE THE CARDS ---------------------------------------------------------------------------------------------------------
// That function deletes the card from a profile, but this function did not make it to production
module.exports.deleteUserCards = deleteUserCards =  async (req, res, next) => {
    let [ user_id, card_id ] = [req.params.id, req.body.card_id] || {};
    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        await Promise.all([
            DeckCards.updateMany({ $pull: { 'card_ids': card_id }}),
            UserCard.updateOne(
                { user_id: user_id },
                { $pull: { cards: { card_id: card_id } } },
                { safe: true },
            )
        ])
        .then( async ([ DeckCard, UserCard ]) => { 
            return res.status(200).json({DeckCard: DeckCard, UserCard: UserCard }) 
        });
    } catch (err){  return res.status(500).json({ message: "" + err  })}
}

// REMOVE THE CARDS ---------------------------------------------------------------------------------------------------------
// If a user deems that he did not processed information well, he can put it back to the learning cue
module.exports.resetInterval = resetInterval =  async (req, res, next) => {
    let [ user_id, card_id ] = [req.params.id, req.body.card_id] || {};
    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");
    
    try{

        let interval = DateTime.local().plus({ seconds: 60 }).toString();  
        interval = interval.slice(0,10) + " " + interval.slice(11,16);  

        const reset = await UserCard.updateOne(
            { user_id: user_id ,  "cards.card_id": card_id },
            {
                $set: {
                    "cards.$.next_session": interval,
                    "cards.$.interval": 60,
                    "cards.$.fail_counter": 0,
                    "cards.$.old_ease_factor": 0,
                    "cards.$.ease_factor": 2.5,
                    "cards.$.success_streak": 0
                 }
            }
        );
        return res.status(200).json({reset}) 
    } catch (err){  return res.status(500).json({ message: "" + err  })}
}