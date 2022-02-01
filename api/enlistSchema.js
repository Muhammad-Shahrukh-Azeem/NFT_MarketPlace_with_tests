const mongoose = require('mongoose');

const enlistschema = new mongoose.Schema({
    _nftAddress : {
        type: String,
        required: true
    },
    _nftId : {
        type: String,
        required: true
    },
    _price : {
        type: String,
        required: true
    },
    status :{
        type: Boolean,
        required: true
    }
});

module.export = mongoose.model('Enlist_Nfts', enlistschema);