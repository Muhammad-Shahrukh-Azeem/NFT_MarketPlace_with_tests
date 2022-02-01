const mongoose = require('mongoose');

const delistSchema = new mongoose.Schema({
    _nftAddress : {
        type: String,
        required: true
    },
    _nftId: {
        type: String,
        required: true
    },
    _nftOwner: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Delist_Nfts', delistSchema);