//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";
import "./TestNFT1.sol";
import "./TestNFT2.sol";

contract MarketPlace is IERC721Receiver{

    uint costOfListing = 0.2 ether; 
    uint contractBalance;

    struct nftData{

        address nftOwner;
        address nftAddress;
        uint nftId;
        uint price;
        bool exists;
    }

    mapping(address => mapping(uint => nftData)) public enlistedNft;

    event enlisted(address _nftAddress, uint _nftId);
    event deListed(address _nftAddress, uint _nftId);
    event nftPurchased(address _nftAddress, uint _nftId, address _buyer);
    event valueReceived(address _reciver, uint _value);
    event valuePaid(address _reciver, uint _value);


    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4) {
        // return IERC721.onERC721Received.selector;
        return IERC721Receiver.onERC721Received.selector;
    }
    function enlist(address _nftAddress, uint _nftId, uint _price) public payable {
        require(msg.value == costOfListing, "Please pay the required amount for listing.");
        require(enlistedNft[_nftAddress][_nftId].exists == false, "NFT already enlisted.");
        IERC721 newNFT = IERC721(_nftAddress);
        require(newNFT.ownerOf(_nftId) == msg.sender, "Invalid address of owner of NFT.");
        contractBalance += 0.2 ether;
        newNFT.safeTransferFrom(msg.sender ,address(this), _nftId);
        enlistedNft[_nftAddress][_nftId] = nftData(msg.sender, _nftAddress, _nftId, _price, true);
        emit enlisted(_nftAddress,_nftId);
    }

    function deList(address _nftAddress, uint _nftId, address _nftOwner) public {
        require(enlistedNft[_nftAddress][_nftId].exists == true, "This NFT does not exists.");
        require(enlistedNft[_nftAddress][_nftId].nftOwner == msg.sender, "Caller is not the address.");
        IERC721 newNFT =  IERC721(_nftAddress);
        newNFT.safeTransferFrom(address(this), _nftOwner, _nftId);
        delete enlistedNft[_nftAddress][_nftId];
        emit deListed(_nftAddress, _nftId);
    }

    // function payingSeller(address payable seller, uint _price) private  {
    //     (bool sucess, ) = seller.call{value: _price}("");
    //     require(sucess,"Transaction failed.");
    //     contractBalance -= _price;
    //     emit valuePaid(seller,_price);
    // }

    function purchase(address _nftAddress, address payable _buyer, uint _price, uint _nftId ) public payable {
        _price = msg.value;
        require(enlistedNft[_nftAddress][_nftId].exists == true,"This token does not exists in this market place.");
        require(enlistedNft[_nftAddress][_nftId].price == _price,"Invalid price.");
        IERC721 newNFT = IERC721(_nftAddress);
        (bool sucess, ) = payable(address(this)).call{value: _price}("");
        require(sucess, "Transaction failed.");
        contractBalance += _price;
        emit valueReceived(_buyer, _price);
        // payable(_buyer).transfer(_price);
        newNFT.safeTransferFrom(address(this), _buyer, _nftId);
        address payable seller = payable(enlistedNft[_nftAddress][_nftId].nftOwner);
         (sucess, ) = seller.call{value: _price}("");
        require(sucess,"Transaction failed.");
        contractBalance -= _price;
        emit valuePaid(seller,_price);
        delete enlistedNft[_nftAddress][_nftId];
        emit nftPurchased(_nftAddress, _nftId, _buyer);
    }
    function getNFT(address _nftAddress, uint _nftId) public view returns (nftData memory){
        require(enlistedNft[_nftAddress][_nftId].exists == true, "NFT does not exist!");
        return enlistedNft[_nftAddress][_nftId];
    }

    function getContractBalance() public view returns(uint){
        return contractBalance;
    }
    receive() external payable {

    }
}