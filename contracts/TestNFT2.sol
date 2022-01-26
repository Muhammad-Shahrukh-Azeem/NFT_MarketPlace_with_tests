//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT2 is ERC721{
    constructor() ERC721("CryptoMonkey","CM"){}

    function mintNFT(address _to, uint _tokenId) public {
        _mint(_to,_tokenId);
    }
}
