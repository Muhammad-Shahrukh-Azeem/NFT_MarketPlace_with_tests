const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Writting tests for NFT_MarketPlace", () => {
    let Banana;
    let banana;
    let Monkey;
    let monkey;
    let MarketPlace;
    let marketPlace;
    let testOwner;
    let testAccount1;
    let testAccount2;
    let testAccount3;

    beforeEach(async function () {
        Banana = await ethers.getContractFactory('TestNFT1');
        banana = await Banana.deploy();
        Monkey = await ethers.getContractFactory('TestNFT2');
        monkey = await Monkey.deploy();
        MarketPlace = await ethers.getContractFactory('MarketPlace');
        marketPlace = await MarketPlace.deploy();
        [testOwner, testAccount1, testAccount2, testAccount3] = await ethers.getSigners();
        await banana.mintNFT(testAccount1.address, 10);
        await monkey.mintNFT(testAccount1.address, 22);
        await banana.mintNFT(testAccount2.address, 33);
        await monkey.mintNFT(testAccount2.address, 69);
    });

    describe("Checking enlisting NFT function.", function () {
        it("Should check that NFT shouldn't be already enlisted.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await expect(marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            })).to.be.revertedWith("NFT already enlisted.");
        });

        it("Should be reverted if someone else calls the enlist function.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await expect(marketPlace.connect(testAccount2).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            })).to.be.revertedWith("Invalid address of owner of NFT.");
        });

        it("Should be reverted if someone doesn't pay the required listing fee.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await expect(marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.3", "ether")
            })).to.be.revertedWith("Please pay the required amount for listing.");
        });

        it("Should check if the NFT is transfered from owner to marketplace.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            const currentOwner = await banana.ownerOf(10);
            expect(currentOwner).to.equal(marketPlace.address);
        });

        it("Should check if contract balance is being added.", async function () {
            const beforeEnlist = await marketPlace.getContractBalance();
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            afterEnlist = await marketPlace.getContractBalance();
            expect(afterEnlist).to.equal(beforeEnlist.add(ethers.utils.parseUnits("0.2", "ether")));
        });

        it("Should check if contract balance is being added.", async function () {
            const beforeEnlist = await marketPlace.getContractBalance();
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            afterEnlist = await marketPlace.getContractBalance();
            expect(afterEnlist).to.equal(beforeEnlist.add(ethers.utils.parseUnits("0.2", "ether")));
        });

        it("Should emit NFT being listed event.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await expect(marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            })).to.emit(marketPlace, 'enlisted').withArgs(banana.address, 10);
        });
    });

    describe("Checking delist function.", function () {
        it("Should check that NFT exists doesn't exists.", async function () {
            await expect(marketPlace.connect(testAccount1).deList(banana.address, 10, testAccount1.address)).to.be.revertedWith("This NFT does not exists.");
        });

        it("Should fail if NFT is not being delisted by the owner.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await expect(marketPlace.connect(testAccount2).deList(banana.address, 10, testAccount2.address)).to.be.revertedWith("Caller is not the address.");
        });

        it("Should check that NFT is being deleted from marketPlace.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await marketPlace.connect(testAccount1).deList(banana.address, 10, testAccount1.address);
            await expect(marketPlace.getNFT(banana.address, 10)).to.be.revertedWith("NFT does not exist!");
        });

        it("Should emit NFT being delisted event.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await expect(marketPlace.connect(testAccount1).deList(banana.address, 10, testAccount1.address)).to.emit(marketPlace, 'deListed').withArgs(banana.address, 10);
        });
    });

    describe("Checking Purchase function.", function () {
        it("Should fail if cost of NFT is incorrect.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await expect(marketPlace.connect(testAccount2).purchase(banana.address, testAccount2.address, 40, 10, {
                value: 30
            })).to.be.revertedWith("Invalid price.");
        });

        it("Should check that NFT doesn't exists.", async function () {
            await expect(marketPlace.connect(testAccount1).purchase(banana.address, testAccount2.address, 40, 10, {
                value: 40
            })).to.be.revertedWith("This token does not exists in this market place.");
        });

        it("Should check if contract balance is being added.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            const balanceBefore = await marketPlace.getContractBalance();
            await marketPlace.connect(testAccount2).purchase(banana.address, testAccount2.address, 40, 10, {
                value : 40
            });
            const balanceAfter = await marketPlace.getContractBalance();
            expect(balanceBefore).to.equal(balanceAfter);
        });

        it("Should emit NFT being purchase event.", async function () {
            await banana.connect(testAccount1).approve(marketPlace.address, 10);
            await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
                value: ethers.utils.parseUnits("0.2", "ether")
            });
            await expect(marketPlace.connect(testAccount2).purchase(banana.address, testAccount2.address, 40, 10, {
                value : 40
            })).to.emit(marketPlace,'nftPurchased').withArgs(banana.address, 10, testAccount2.address);
        });

        // it("Should check if contract balance is being reduced after paying the seller.", async function () {
        //     await banana.connect(testAccount1).approve(marketPlace.address, 10);
        //     await marketPlace.connect(testAccount1).enlist(banana.address, 10, 40, {
        //         value: ethers.utils.parseUnits("0.2", "ether")
        //     });
        //     const balanceBefore = await marketPlace.getContractBalance();
        //     await marketPlace.connect(testAccount2).purchase(banana.address, testAccount2.address, 40, 10, {
        //         value : 40
        //     });
        //     const balanceAfter = balanceBefore.add(40);
        //     expect(balanceBefore.add(40)).to.equal(balanceAfter);
        // });

    });



});