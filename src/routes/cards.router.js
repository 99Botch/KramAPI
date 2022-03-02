// REFER TO USERS.ROUTER
const router = require('express').Router();
const verify  = require('../config/tokenValidation'); 
const { createCard, getCards, deleteCard, getCardsDeck, updateReviewLapse }= require('../controllers/cards.controller');

router.post('/:id', verify, async function(req,res){
    await createCard(req,res);
});

router.get('/:id', verify, async function(req,res){
    await getCards(req,res);
});

router.get('/deck/:id', verify, async function(req,res){
    await getCardsDeck(req,res);
});

router.put('/add-to-deck/:id', verify, async function(req,res){
    await addCard(req,res);
});

router.put('/review-session/:id', verify, async function(req,res){
    await updateReviewLapse(req,res);
});

router.delete('/:id', verify, async function(req,res){
    await deleteCard(req,res);
});


module.exports = router;