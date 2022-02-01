const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

    const accounts = await hre.ethers.getSigners();
    contract_cryptoBanana =  '0x62fE70e1C08B5dB42eA9d5E68f7ceD3d1BEC8c95';
    contract_cryptoMonkey =  '0xabcF2Ee9bcEC03EC0C9C64327a9d6FE7A0a1C7c2';
    contract_NFTMarketPlace =  '0x1fe83A61ae28bCd9B4599bA2FaA8Ea4CE6bF86f6';
    testOwner = '0x743c9E764b788C8e21fF70108Ee1C34a5d713E60';
    testAccount1 = '0x2D751a936E6f59CaF65097E2a8E737ccf9eA25de';
    testAccount2 = '0x8101E668E68804b703DF59dfEb1262c47bEc2acd';
    // [testOwner, testAccount1, testAccount2, a4 ,a5, a6] = await ethers.getSigners();
    await hre.run("compile");
    const cryptoBanana = await ethers.getContractFactory("TestNFT1");
    // const banana = await cryptoBanana.deploy();
    // await banana.deployed();
    // console.log("Crypto Banana Deployed to : ", banana.address);
    const CryptoBanana = new ethers.Contract(contract_cryptoBanana, cryptoBanana.interface, accounts[0]);

    // await banana.mintNFT(testOwner, 10);
    // await banana.mintNFT(testAccount1, 20);
    // await banana.mintNFT(testAccount2, 30);
    

    const cryptoMonkey = await ethers.getContractFactory("TestNFT2");
    // const monkey = await cryptoMonkey.deploy();
    // await monkey.deployed();
    // console.log("Crypto Monkey Deployed to : ", monkey.address);

    const CryptoMonkey = new ethers.Contract(contract_cryptoMonkey, cryptoMonkey.interface, accounts[0]);

    // await monkey.mintNFT(testOwner, 40);
    // await monkey.mintNFT(testAccount2, 50);
    // await monkey.mintNFT(testAccount2, 60);


    const NFTMarketPlace = await ethers.getContractFactory("MarketPlace");
    // const market = await NFTMarketPlace.deploy();
    // await market.deployed();
    // console.log("NFT MarketPlace Deployed to : ", market.address);
    const NFTMarketplace = new ethers.Contract(contract_NFTMarketPlace, NFTMarketPlace.interface, accounts[0]);

//   await banana.connect(testAccount1).approve(market.address, 20);
//   const enlistedBanana = await market.connect(testAccount1).enlist(banana.address, 20, 10,{
//     value : ethers.utils.parseUnits("0.2" , "ether")
//   });
//   console.log("Banana enlisted = ", enlistedBanana);
}




main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });