const express = require('express');
const router = express.Router();

const { Song } = require('../db_mongo/module/song');
const { Songlist } = require('../db_mongo/module/songlist');
const { User } = require('../db_mongo/module/user');

const replaceRegex = /[-/\\^$*+?.()|[\]{}]/g;
function escapeRegex(string) {
    return string.replace(replaceRegex, '\\$&');
}

router.get('/', async function (req, res) {
    const { type, query, limit, skip } = req.query;
    const regex = new RegExp(escapeRegex(query), 'i');

    switch (type) {
        case 'song':
            const condition = [
                { name: regex },
                { artist: regex },
                { album: regex },
            ];
            const totalSong = await Song.countDocuments({
                $or: condition
            });
            const tracks = await Song.find({
                $or: condition
            }).limit(Number(limit)).skip(Number(skip));

            return res.json({ status: 'done', tracks, total: totalSong > 9999 ? 9999 : totalSong });
        case 'songlist':
            const selecct = {
                name: regex,
                private: false,
                deleteable: true
            };
            const totalSonglist = await Songlist.countDocuments(selecct);
            const songlists = await Songlist.find(selecct, { name: 1, created_by: 1, icon: 1, size: { $size: "$tracks" } });
            const SonglistTracks = await Songlist.populate(songlists, {
                path: 'created_by',
                model: 'User',
                select: {
                    username: 1,
                    _id: 0
                }
            });
            return res.json({
                tracks: SonglistTracks, total: totalSonglist, status: 'done'
            });
        case 'username':
            const select = {
                username: regex
            };
            const users = await User.find(select, {
                _id: 1,
                username: 1,
                avatarURL: 1,
                info: {
                    description: 1
                }
            });
            return res.json({
                tracks: users, status: 'done', total: users.length
            });
        default:
            return res.status(400).json({ error: '搜索路径参数错误' });
    }
});

module.exports = router;