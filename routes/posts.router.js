const router = require('express').Router();
const Post  = require('../models/posts.model'); 
const verify  = require('../config/tokenValidation'); 

// find all
router.get('/', verify, async (req, res) => {
    try{
        const posts = await Post.find();
        res.json(posts);
    } catch(err) {
        res.json({message: err})
    }
});

// find by id
router.get('/:id', async (req, res) => {
    try{
        const post =  await Post.findById(req.params.id);
        res.json(post);    
    } catch(err) {
        res.json({message: err})
    }
});    

// submit
router.post('/', async (req, res) => {
    const post = new Post({
         title: req.body.title,
         description: req.body.description
    })

    try{
        const savedPost = await post.save()
        res.json(savedPost);    
    } catch(err) {
        res.json({message: err})
    }
});

// update
router.put('/:id', async (req, res) => {
    try{
        const updatedPost = await Post.updateOne(
            {_id: req.params.id}, 
            { $set: { 
                title: req.body.title, 
                description: req.body.description 
            } }
        );
        res.json(updatedPost);
    } catch(err) {
        res.json({message: err})
    }
});    

// delete
router.delete('/:id', async (req, res) => {
    try{
        const removedPost = await Post.deleteOne({_id: req.params.id});
        res.json(removedPost);
    } catch(err) {
        res.json({message: err})
    }
});    

module.exports = router;
