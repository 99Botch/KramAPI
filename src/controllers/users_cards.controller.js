const DeckCards  = require('../models/deck_card.model');
const UserCard  = require('../models/user_card.model');


// UPDATE DECK CARD REVIEW LAPSE
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


// REMOVE THE CARDS
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