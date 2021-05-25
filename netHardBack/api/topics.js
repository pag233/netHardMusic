const express = require('express');
const router = express.Router();

//fake
router.get('/', function (req, res) {
    return res.json({
        status: 'done', topics: [
            '2021，你对哪些事抱有期待',
            '动漫的的那些心动瞬间',
            '写给2021的自己',
            '晚安时光',
            '山顶上放奥特曼'
        ]
    });
});

module.exports = router;