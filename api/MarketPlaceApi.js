require('dotenv').config();
//all the libraries needed for the api and database, ethers is being used sincewe are passing some preefined values.


const express = require('express');
const app = express();
const MarketPlaceArtifacts = require('../artifacts/contracts/MarketPlace.sol/MarketPlace.json');
const ERC721Artifacts = require('../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json');
const { ethers, Wallet } = require('ethers');
const mongoose = require('mongoose');
const Enlist = require('./enlistSchema');
const Delist = require('./delistSchema');
const Approve = require('./approveSchema');
const Purchase = require('./purchaseSchema');
app.use(express.json());

// const mnemonic = process.env.mnemonic;
// const walletMnemonic = Wallet.fromMnemonic(mnemonic);

// const walletPrivateKey = new Wallet(walletMnemonic.privateKey);
// walletMnemonic.address === walletPrivateKey.address;

// let provider = ethers.getDefaultProvider();
// let walletWithProvider = new ethers.Wallet(walletPrivateKey, provider);

//Connecting to local DataBase.

const INFURA_API_KEY = process.env.INFURA_API_KEY;

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connection to DataBase has been established.'));
// console.log("My address is : ", walletMnemonic.address);


main();
async function main() {
    //Getting predefined values instead of using metamask for now.
    const provider = await new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${INFURA_API_KEY}`);
    const testuser1 = await provider.getSigner(0);
    const testuser2 = await provider.getSigner(1);

    // Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
    // Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    // Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
    // Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

    // Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
    // Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

    const marketAddress = '0x1fe83A61ae28bCd9B4599bA2FaA8Ea4CE6bF86f6';
    const market = new ethers.Contract(marketAddress, MarketPlaceArtifacts.abi, testuser1);

    const cryptoBanana = '0x62fE70e1C08B5dB42eA9d5E68f7ceD3d1BEC8c95';
    const banana = new ethers.Contract(cryptoBanana, ERC721Artifacts.abi, testuser2);

    app.get('/', async (req, res) => {
        try {
            const enlist = await Enlist.find();
            res.json(enlist);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post('/approve', async (req, res) => {
        try {
            await banana.connect(testuser1).approve(marketAddress, req.body.tokenId);
            const approve = new Approve({
                tokenAddress: req.body.tokenAddress,
                tokenId: req.body.tokenId,
                tokenOwner: req.body.tokenOwner
            });
            try {
                const newApprove = await approve.save();
                res.status(201).json(newApprove);
                console.log("Saved!");
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
        catch (error) {
            res.json({ message: error.message });
        }
    });

    app.post('/checkApprove', async (req, res) => {
        try {
            const approve = await Approve.find(req.body.tokenAddress, req.body.tokenId, req.body.tokenOwner);
            res.status(200).json(approve);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    app.post('/enlist', async (req, res) => {
        try {
            const enlisted = await market.connect(testuser1).enlist(req.body._nftAddress, req.body._nftId, req.body._price, {
                value: ethers.utils.parseUnits(req.body.value, 'ether')
            });
            const enlist = new Enlist({
                nftAddress: req.body._nftAddress,
                nftId: req.body._nftId,
                price: req.body._price,
                status: true
            });
            try {
                const newenlist = enlist.save();
                res.status(201).send(newenlist);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });

    app.delete('/delist', async (req, res) => {
        try {
            await market.connect(testuser1).delist(req.body._nftAddress, req.body._nftId, req.body._nftOwner);
            const delist = new Delist({
                nftAddress: req.body._nftAddress,
                nftId: req.body._nftId,
                nftOwner: req.body._nftOwner
            });
            const enlist = Enlist.updateOne({
                nftAddress: req.body._nftAddress,
                nftId: req.body._nftId,
                price: req.body._price,
                status: false
            })
            try {
                const updatedNFT = await enlist.save();
                res.status(201).json(updatedNFT);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    //wind up this function
    app.post('/purchase', async (req, res) => {
        await market.connect(testuser1).purchase(req.body._nftAddress, req.body._buyer, req.body._nftId, {
            value: ethers.utils.parseUnits(req.body.value, "ether")
        });
        try {
            const purchase = new Purchase({
                nftAddress: req.body._nftAddress,
                buyer: req.body._buyer,
                nftId: req.body._nftId
            });
            try {
                const purchased = await purchase.save();
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    app.listen(3000, () => console.log(`Listening to port 3000...`));
}
