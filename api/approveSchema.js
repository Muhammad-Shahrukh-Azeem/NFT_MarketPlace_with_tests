const mongoose = require('mongoose');
const { isModuleNamespaceObject } = require('util/types');

const approveSchema = new mongoose.Schema({
    tokenAddress:{
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    tokenOwner:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Approve_transaction', approveSchema);