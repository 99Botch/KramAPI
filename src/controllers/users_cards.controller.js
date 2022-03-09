// const Deck  = require('../models/decks.model');
const Cards  = require('../models/cards.model');
const DeckCards  = require('../models/deck_card.model');
const UserCard  = require('../models/user_card.model');

// UPDATE DECK CARD REVIEW LAPSE
// module.exports.updateReviewLapse = updateReviewLapse =  async (req, res, next) => {
//     let id = req.params.id || {};
//     if (id != req.user._id) return res.status(401).json("Ids aren't matching");

//     try{
//         let updates = req.body.cards;   

//         const updateReviewLapse = await DeckCards.updateOne(
//             { $and: [{ user_id: id }, { deck_id: req.body.deck_id } ] },
//             { $set: { 
//                 cards: updates
//             }},
//         )

//         return res.status(200).json(updateReviewLapse) 

//         // return res.status(200).json(card_ids) 
//     } catch (err){  return res.status(500).json({ message: "" + err  })}
// }
