// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HealthcareRegistry
 * @dev Manages the "Circle of Trust" for Health Chain. Stores authorized hospitals and providers.
 *      Allows SuperAdmin to whitelist or revoke access.
 */
contract HealthcareRegistry is AccessControl {
    bytes32 public constant SUPER_ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    struct HospitalProfile {
        bool isWhitelisted;     // True if authorized
        string name;            // Human-readable name
        bytes32 licenseHash;    // Hash of the physical license/certification
        address adminWallet;    // Main wallet for hospital admin operations
        uint256 createdAt;      // Timestamp of adding
        bool isRevoked;         // "Kill-Switch" state
    }

    // Mapping from wallet address to Hospital Profile
    mapping(address => HospitalProfile) private hospitals;
    
    // Event emitted when a hospital is whitelisted
    event HospitalWhitelisted(address indexed hospitalAddress, string name, uint256 timestamp);
    
    // Event emitted when a hospital is revoked
    event HospitalRevoked(address indexed hospitalAddress, string reason, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Whitelists a new hospital. Only callable by SuperAdmin.
     * @param _hospital Address of the hospital wallet
     * @param _name Name of the hospital
     * @param _licenseHash Hash of their license document/number
     */
    function whitelistHospital(
        address _hospital, 
        string calldata _name, 
        bytes32 _licenseHash
    ) external onlyRole(SUPER_ADMIN_ROLE) {
        require(_hospital != address(0), "Invalid hospital address");
        require(!hospitals[_hospital].isWhitelisted, "Hospital already whitelisted");

        hospitals[_hospital] = HospitalProfile({
            isWhitelisted: true,
            name: _name,
            licenseHash: _licenseHash,
            adminWallet: _hospital,
            createdAt: block.timestamp,
            isRevoked: false
        });

        emit HospitalWhitelisted(_hospital, _name, block.timestamp);
    }

    /**
     * @notice Revokes a hospital's access immediately. "Kill-Switch".
     * @param _hospital Address to revoke
     * @param _reason Reason for revocation (for audit trail)
     */
    function revokeHospital(address _hospital, string calldata _reason) external onlyRole(SUPER_ADMIN_ROLE) {
        require(hospitals[_hospital].isWhitelisted, "Hospital not found or not whitelisted");
        require(!hospitals[_hospital].isRevoked, "Hospital already revoked");

        hospitals[_hospital].isWhitelisted = false;
        hospitals[_hospital].isRevoked = true;

        emit HospitalRevoked(_hospital, _reason, block.timestamp);
    }

    /**
     * @notice Checks if a hospital is authorized and active.
     * @param _hospital Address to check
     * @return bool True if authorized, False otherwise
     */
    function isAuthorized(address _hospital) external view returns (bool) {
        return hospitals[_hospital].isWhitelisted && !hospitals[_hospital].isRevoked;
    }

    /**
     * @notice Returns full details of a hospital. Restricted to Admins to prevent data scraping of sensitive info if any.
     *         (Though on-chain data is public, this adds a semantic layer).
     * @param _hospital Address to lookup
     */
    function getHospitalDetails(address _hospital) external view returns (HospitalProfile memory) {
        return hospitals[_hospital];
    }
}
