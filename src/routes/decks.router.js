// REFER TO USERS.ROUTER
const router = require('express').Router();
const verify  = require('../config/tokenValidation'); 
const { createDeck, publicDecks, userDecks, addDeck, getDeckCnt, searchDecks, searchPublicDecks,
    deleteDecks, updateDeck, updatePrivacy, updateDeckVote}= require('../controllers/decks.controller');

router.post('/:id', verify, async function(req,res){
    await createDeck(req,res);
});

router.get('/repository/:id', verify, async function(req,res){
    await publicDecks(req,res);
});

router.get('/repository/:name/:id', verify, async function(req,res){
    await searchPublicDecks(req,res);
});

router.get('/:id', verify, async function(req,res){
    await userDecks(req,res);
});

router.get('/table/:id', verify, async function(req,res){
    await getDeckCnt(req,res);
});

router.get('/:name/:id', verify, async function(req,res){
    await searchDecks(req,res);
});


router.delete('/:id/:deck_id', verify, async function(req,res){
    await deleteDecks(req,res);
});

router.put('/:id', verify, async function(req,res){
    await updateDeck(req,res);
});

router.put('/privacy/:id', verify, async function(req,res){
    await updatePrivacy(req,res);
});

router.put('/add/:id', verify, async function(req,res){
    await addDeck(req,res);
});

router.put('/vote/:id', verify, async function(req,res){
    await updateDeckVote(req,res);
});

module.exports = router;