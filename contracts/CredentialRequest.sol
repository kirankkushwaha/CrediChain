// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRequest {
    struct Credential {
        string credentialType;
        string enrollmentNumber;
        address verifierId;
        address requester;
        bool approved;
        bytes32 credentialId;
        uint256 approvalTimestamp;
        string verifierNotes;
    }

    struct SharedCredential {
        bytes32 originalCredentialId;
        address sharedWith;
        address sharedBy;
        bool verified;
        string credentialType;
        uint256 shareTimestamp;
    }

    mapping(uint256 => Credential) public requests;
    mapping(bytes32 => uint256) public credentialIdToRequest;
    mapping(uint256 => SharedCredential) public sharedCredentials;
    mapping(address => uint256[]) public employerSharedCredentials;
    
    uint256 public requestCount;
    uint256 public sharedCredentialCount;

    event CredentialRequested(uint256 indexed requestId, address indexed requester, address indexed verifierId, string credentialType);
    event CredentialApproved(uint256 indexed requestId, bytes32 indexed credentialId, address indexed verifierId, uint256 timestamp);
    event CredentialShared(bytes32 indexed originalCredentialId, address indexed sharedWith, address indexed sharedBy, string credentialType, uint256 shareId);
    event CredentialVerified(uint256 indexed shareId, bytes32 indexed credentialId, address indexed verifier);

    function requestCredential(string memory _credentialType, string memory _enrollmentNumber, address _verifierId) public {
        requestCount++;
        
        requests[requestCount] = Credential({
            credentialType: _credentialType,
            enrollmentNumber: _enrollmentNumber,
            verifierId: _verifierId,
            requester: msg.sender,
            approved: false,
            credentialId: bytes32(0),
            approvalTimestamp: 0,
            verifierNotes: ""
        });

        emit CredentialRequested(requestCount, msg.sender, _verifierId, _credentialType);
    }

    function approveCredential(uint256 _requestId, string memory _verifierNotes) public returns (bytes32) {
        Credential storage credential = requests[_requestId];
        require(msg.sender == credential.verifierId, "Only verifier can approve");
        require(!credential.approved, "Already approved");
        
        bytes32 credentialId = keccak256(abi.encodePacked(_requestId, credential.requester, msg.sender, block.timestamp));
        credential.approved = true;
        credential.credentialId = credentialId;
        credential.approvalTimestamp = block.timestamp;
        credential.verifierNotes = _verifierNotes;
        
        credentialIdToRequest[credentialId] = _requestId;
        emit CredentialApproved(_requestId, credentialId, msg.sender, block.timestamp);

        return credentialId;
    }

    function shareCredential(bytes32 _credentialId, address _sharedWith) public {
        require(credentialIdToRequest[_credentialId] != 0, "Credential does not exist");
        require(_sharedWith != address(0), "Invalid address");

        sharedCredentialCount++;
        sharedCredentials[sharedCredentialCount] = SharedCredential({
            originalCredentialId: _credentialId,
            sharedWith: _sharedWith,
            sharedBy: msg.sender,
            verified: false,
            credentialType: requests[credentialIdToRequest[_credentialId]].credentialType,
            shareTimestamp: block.timestamp
        });

        employerSharedCredentials[_sharedWith].push(sharedCredentialCount);

        emit CredentialShared(_credentialId, _sharedWith, msg.sender, requests[credentialIdToRequest[_credentialId]].credentialType, sharedCredentialCount);
    }

    function verifySharedCredential(uint256 _shareId) public {
        require(sharedCredentials[_shareId].sharedWith == msg.sender, "Not authorized");

        sharedCredentials[_shareId].verified = true;
        emit CredentialVerified(_shareId, sharedCredentials[_shareId].originalCredentialId, msg.sender);
    }

    function getSharedCredentialsForEmployer(address _employer) public view returns (SharedCredential[] memory) {
        uint256[] memory sharedIds = employerSharedCredentials[_employer];
        SharedCredential[] memory result = new SharedCredential[](sharedIds.length);

        for (uint256 i = 0; i < sharedIds.length; i++) {
            result[i] = sharedCredentials[sharedIds[i]];
        }
        return result;
    }

    function getCredentialById(bytes32 _credentialId) public view returns (Credential memory) {
        require(credentialIdToRequest[_credentialId] != 0, "Credential does not exist");
        return requests[credentialIdToRequest[_credentialId]];
    }
}
