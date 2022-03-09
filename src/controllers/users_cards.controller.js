// const Deck  = require('../models/decks.model');
const Cards  = require('../models/cards.model');
const DeckCards  = require('../models/deck_card.model');
const Users  = require('../models/users.model');

// GET ALL CARDS OF A SPECIFIC DECK
// module.exports.getCardsDeck = getCardsDeck = async (req, res, next) => {    
//     try{
//         const cardsInDeck = await DeckCards.find({
//             $and: [{ deck_id: req.body.deck_id }, { user_id: req.params.id }]
//         }).limit(20);
//         if(!cardsInDeck) return res.status(404).json("Error | no cards in the deck");
        
//         let ids = cardsInDeck[0].cards
//         const card_ids = ids.map(card =>{
//             return card.card_id
//         })
//         const cardsQuery = await Card.find({ '_id': { $in: card_ids } });

//         let deck = {
//             _id: cardsInDeck[0]._id,
//             user_id: cardsInDeck[0].user_id,
//             deck_id: cardsInDeck[0].deck_id,
//             cards: []
//         }

//         cardsInDeck[0].cards.map(item => {
//             console.log(cardsQuery);

//             const found = cardsQuery.find(card => card._id.toString() == item.card_id.toString());

//             if(found){
//                 let card = {
//                     creator_id: found.creator_id,
//                     img_url: found.img_url,
//                     question: found.question,
//                     answer: found.answer,
//                     card_id: item.card_id,
//                     _id: item._id,
//                     last_review: item.last_review,
//                     review_lapse: item.review_lapse,
//                     fail_counter: item.fail_counter,
//                     ease_factor: item.ease_factor,
//                     is_new: item.is_new,
//                     style_id: item.style_id
//                 };
//                 deck.cards.push(card);
//             }
//         });
        
//         return res.status(200).json(deck);
        
//     } catch(err) { return res.status(400).json({message: err}) }
// }

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
