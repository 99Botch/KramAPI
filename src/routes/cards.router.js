// REFER TO USERS.ROUTER
const router = require('express').Router();
const verify  = require('../config/tokenValidation'); 
const { createCard, getCards,searchCards, deleteCard }= require('../controllers/cards.controller');
const { addCard, deleteDeckCards, getCardsDeck }= require('../controllers/decks_cards.controller');
const { getUserCardsDetails, updateCardDetails, deleteUserCards, resetInterval }= require('../controllers/users_cards.controller');

// CARD_USER --------------------------------------------------------------------------------------------------------------------
router.get('/user/:id', verify, async function(req,res){
    await getUserCardsDetails(req,res);
});
router.put('/user/:id', verify, async function(req,res){
    await deleteUserCards(req,res);
});
router.put('/review-session/:id', verify, async function(req,res){
    await updateCardDetails(req,res);
});
router.put('/reset/:id', verify, async function(req,res){
    await resetInterval(req,res);
});

// CARDS_ONLY --------------------------------------------------------------------------------------------------------------------
router.post('/:id', verify, async function(req,res){
    await createCard(req,res);
});

router.get('/:id', verify, async function(req,res){
    await getCards(req,res);
});

router.get('/:text/:id', verify, async function(req,res){
    await searchCards(req,res);
});

router.delete('/:id', verify, async function(req,res){
    await deleteCard(req,res);
});


// DECK_CARD --------------------------------------------------------------------------------------------------------------------
router.put('/add-to-deck/:id', verify, async function(req,res){
    await addCard(req,res);
});

router.put('/deck/:id', verify, async function(req,res){
    await deleteDeckCards(req,res);
});

router.post('/deck/:id', verify, async function(req,res){
    await getCardsDeck(req,res);
});




module.exports = router;