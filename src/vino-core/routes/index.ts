import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res)
{
   res.sendFile('index.html');
});

export default router;