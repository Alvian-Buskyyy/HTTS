// contracts/HalalTraceability.sol
pragma solidity ^0.8.0;

contract HalalTraceability {
    struct Batch {
        string id;
        string ipfsHash;
        string statusHalal;
        address createdBy;
    }

    mapping(string => Batch) public batches;

    function addBatch(string memory _id, string memory _ipfsHash, string memory _statusHalal) public {
        batches[_id] = Batch(_id, _ipfsHash, _statusHalal, msg.sender);
    }

    function getBatch(string memory _id) public view returns (string memory, string memory, string memory, address) {
        Batch memory batch = batches[_id];
        return (batch.id, batch.ipfsHash, batch.statusHalal, batch.createdBy);
    }
}
