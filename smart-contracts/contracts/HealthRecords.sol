// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HealthChainRecords
 * @author HealthChain Dev Team
 * @notice Decentralized Medical Record Storage System on Polygon
 * @dev Manages patient record references (IPFS hashes) and provider permissions.
 */
contract HealthChainRecords is AccessControl, Pausable, ReentrancyGuard {
    
    // --- Roles ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIED_PROVIDER_ROLE = keccak256("VERIFIED_PROVIDER_ROLE");

    // --- Structs ---
    struct Record {
        string ipfsHash;     // CID v0 or v1
        string recordType;   // E.g., "Lab Report", "X-Ray", "Prescription"
        address addedBy;     // Address of the uploader (Patient or Doctor)
        uint40 timestamp;    // Block timestamp
    }

    // --- State Variables ---
    
    // Mapping: Patient Address -> Array of Records
    mapping(address => Record[]) private _patientRecords;

    // Mapping: Patient Address -> Provider Address -> Is Authorized?
    mapping(address => mapping(address => bool)) private _patientProviderAccess;

    // --- Events ---
    event RecordAdded(address indexed patient, address indexed addedBy, string ipfsHash, string recordType);
    event AccessGranted(address indexed patient, address indexed provider);
    event AccessRevoked(address indexed patient, address indexed provider);

    // --- Errors ---
    error UnauthorizedAccess(address caller, address patient);
    error InvalidInput();

    // --- Constructor ---
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // --- Modifiers ---
    
    /**
     * @dev Checks if msg.sender is the patient OR an authorized provider.
     */
    modifier onlyAuthorized(address patient) {
        if (msg.sender != patient && !_patientProviderAccess[patient][msg.sender]) {
            revert UnauthorizedAccess(msg.sender, patient);
        }
        _;
    }

    // --- Core Functions ---

    /**
     * @notice Adds a new medical record hash for a patient.
     * @dev Can be called by the patient themselves or an authorized provider.
     * @param patient The address of the patient the record belongs to.
     * @param ipfsHash The IPFS CID of the encrypted file.
     * @param recordType The category of the record (e.g., "Lab", "Imaging").
     */
    function addRecord(
        address patient, 
        string calldata ipfsHash, 
        string calldata recordType
    ) external nonReentrant whenNotPaused onlyAuthorized(patient) {
        if (bytes(ipfsHash).length == 0) revert InvalidInput();

        _patientRecords[patient].push(Record({
            ipfsHash: ipfsHash,
            recordType: recordType,
            addedBy: msg.sender,
            timestamp: uint40(block.timestamp)
        }));

        emit RecordAdded(patient, msg.sender, ipfsHash, recordType);
    }

    /**
     * @notice Grants a provider access to view/add records for the caller (Patient).
     * @param provider The address of the doctor/hospital.
     */
    function grantAccess(address provider) external whenNotPaused {
        if (provider == address(0)) revert InvalidInput();
        
        _patientProviderAccess[msg.sender][provider] = true;
        emit AccessGranted(msg.sender, provider);
    }

    /**
     * @notice Revokes a provider's access.
     * @param provider The address to remove.
     */
    function revokeAccess(address provider) external whenNotPaused {
        _patientProviderAccess[msg.sender][provider] = false;
        emit AccessRevoked(msg.sender, provider);
    }

    // --- View Functions ---

    /**
     * @notice Retrieves all records for a patient.
     * @dev CAUTION: This may be gas-heavy if the array is large. Recommend using The Graph for indexing in production.
     * @param patient The patient's address.
     * @return An array of Record structs.
     */
    function getRecords(address patient) external view returns (Record[] memory) {
        // In a real strict privacy model, we might want to restrict this view too.
        // However, data on-chain is public anyway (just hashes). 
        // We restrict write, but read is technically public unless encrypted.
        return _patientRecords[patient];
    }

    /**
     * @notice Checks if a provider has access to a patient's records.
     */
    function isAuthorized(address patient, address provider) external view returns (bool) {
        return _patientProviderAccess[patient][provider];
    }
    
    // --- Admin Functions ---

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
