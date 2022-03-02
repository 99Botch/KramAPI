// const { findById } = require('../models/cards.model');
const Card  = require('../models/cards.model');
const UserDeckCards  = require('../models/user_deck_cards.model');


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


// UPDATE UserDeckCards REVIEW LAPSE
module.exports.updateReviewLapse = updateReviewLapse =  async (req, res, next) => {
    let id = req.params.id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        let updates = req.body.cards;   

        const updateReviewLapse = await UserDeckCards.updateOne(
            { $and: [{ user_id: id }, { deck_id: req.body.deck_id } ] },
            { $set: { 
                cards: updates
            }},
        )

        return res.status(200).json(updateReviewLapse) 

        // return res.status(200).json(card_ids) 
    } catch (err){  return res.status(500).json({ message: "" + err  })}
}


// CARDS SPECIFIC TO USERS
// ADD CARD TO DECK
module.exports.addCard = addCard = async (req, res, next) => {    
    let [user_id, card_id, deck_id] = [req.params.id, req.body.card_id, req.body.deck_id] || {};

    if (user_id != req.user._id) return res.status(401).json("Ids aren't matching");
    
    try{
        await Promise.all([
            UserDeckCards.findOne({ deck_id: deck_id }),
            UserDeckCards.findOne({
                $and: [{ deck_id: deck_id }, { "cards.card_id": card_id }]
            })
        ])
        .then( async ([ deck, cardUniqueness ]) => {

            if(deck === null || !deck) return res.status(404).json("Error | Deck not found !");
            if(cardUniqueness) return res.status(404).json("Error | Don't duplicate cards !");

            try{
                const addedCard = await UserDeckCards.updateOne(
                    {
                        $and: [{ user_id: user_id }, { deck_id: deck_id }]
                    }, 
                    { $push: { 
                        cards:[{
                            card_id: card_id,
                            last_review: null,
                            review_lapse: "15m",
                            fail_counter: 0,
                            ease_factor: 0,
                            is_new: true,
                            style_id: null,
                        }],
                    }}
                );
                return res.status(200).json(addedCard);
            } catch(err) { return res.status(400).json({message: err}) }
        })

    } catch(err) { res.status(400).json({message: "Error | Deck is not found or card duplicate !"}) }



}

// GET ALL CARDS OF A SPECIFIC DECK
module.exports.getCardsDeck = getCardsDeck = async (req, res, next) => {    
    try{
        const cardsInDeck = await UserDeckCards.find({
            $and: [{ deck_id: req.body.deck_id }, { user_id: req.params.id }]
        }).limit(20);
        if(!cardsInDeck) return res.status(404).json("Error | no cards in the deck");
        
        let ids = cardsInDeck[0].cards
        const card_ids = ids.map(card =>{
            return card.card_id
        })
        const cardsQuery = await Card.find({ '_id': { $in: card_ids } });

        let deck = {
            _id: cardsInDeck[0]._id,
            user_id: cardsInDeck[0].user_id,
            deck_id: cardsInDeck[0].deck_id,
            cards: []
        }

        cardsInDeck[0].cards.map(item => {
            console.log(cardsQuery);

            const found = cardsQuery.find(card => card._id.toString() == item.card_id.toString());

            if(found){
                let card = {
                    creator_id: found.creator_id,
                    img_url: found.img_url,
                    question: found.question,
                    answer: found.answer,
                    last_review: item.last_review,
                    review_lapse: item.review_lapse,
                    fail_counter: item.fail_counter,
                    ease_factor: item.ease_factor,
                    is_new: item.is_new,
                    style_id: item.style_id
                };
                deck.cards.push(card);
            }
        });
        
        return res.status(200).json(deck);
        
    } catch(err) { return res.status(400).json({message: err}) }
}

// DELETE A A CARD
module.exports.deleteCard = deleteCard =  async (req, res, next) => {
    let id = req.params.id || {};
    let card_id = req.body._id || {};
    if (id != req.user._id) return res.status(401).json("Ids aren't matching");

    try{
        const deleteCard = await UserDeckCards.deleteOne({ _id: card_id });
        if(deleteCard.deletedCount === 0) return res.status(404).json("Deck not found or not yours");
        else return res.status(200).json("Card deleted!");
    } catch (err){return res.status(500).json({ message:  err  })}
}

