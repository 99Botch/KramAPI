// REFER TO USERS.ROUTER
const router = require('express').Router();
const verify  = require('../config/tokenValidation'); 
const { createDeck, publicDecks, userDecks, deleteUser }= require('../controllers/decks.controller');

router.post('/:id', verify, async function(req,res){
    await createDeck(req,res);
});
router.get("/repository", publicDecks);
router.get('/:id', verify, async function(req,res){
    await userDecks(req,res);
});
router.delete('/:id', verify, async function(req,res){
    await deleteUser(req,res);
});

module.exports = router;