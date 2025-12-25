export const HealthChainABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "patient",
                "type": "address"
            }
        ],
        "name": "UnauthorizedAccess",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidInput",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "patient",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "addedBy",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "recordType",
                "type": "string"
            }
        ],
        "name": "RecordAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "patient",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            }
        ],
        "name": "AccessGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "patient",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            }
        ],
        "name": "AccessRevoked",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "patient",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "recordType",
                "type": "string"
            }
        ],
        "name": "addRecord",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "provider",
                "type": "address"
            }
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "provider",
                "type": "address"
            }
        ],
        "name": "revokeAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "patient",
                "type": "address"
            }
        ],
        "name": "getRecords",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "ipfsHash",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "recordType",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "addedBy",
                        "type": "address"
                    },
                    {
                        "internalType": "uint40",
                        "name": "timestamp",
                        "type": "uint40"
                    }
                ],
                "internalType": "struct HealthChainRecords.Record[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "patient",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "provider",
                "type": "address"
            }
        ],
        "name": "isAuthorized",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
