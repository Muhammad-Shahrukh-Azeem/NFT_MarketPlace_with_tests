const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    _nftAddress : {
        type: String,
        required: true
    },
    _buyer : {
        type: String,
        required: true
    },
    _nftId : {
        type: String,
        required: true
    }
});

module.export = mongoose.model('Purchase_NFTs', purchaseSchema);