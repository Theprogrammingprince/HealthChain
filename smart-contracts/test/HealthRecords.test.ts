import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("HealthChainRecords", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
        const [owner, patient, doctor, stranger] = await ethers.getSigners();

        const HealthChainRecords = await ethers.getContractFactory("HealthChainRecords");
        const healthChain = await HealthChainRecords.deploy();

        return { healthChain, owner, patient, doctor, stranger };
    }

    describe("Access Control", function () {
        it("Should allow patient to add their own record", async function () {
            const { healthChain, patient } = await loadFixture(deployFixture);

            await expect(healthChain.connect(patient).addRecord(patient.address, "QmHash123", "Lab"))
                .to.emit(healthChain, "RecordAdded")
                .withArgs(patient.address, patient.address, "QmHash123", "Lab");
        });

        it("Should fail if stranger tries to add record for patient", async function () {
            const { healthChain, patient, stranger } = await loadFixture(deployFixture);

            await expect(healthChain.connect(stranger).addRecord(patient.address, "QmHashFail", "Lab"))
                .to.be.revertedWithCustomError(healthChain, "UnauthorizedAccess");
        });

        it("Should allow authorized doctor to add record", async function () {
            const { healthChain, patient, doctor } = await loadFixture(deployFixture);

            // 1. Patient grants access
            await expect(healthChain.connect(patient).grantAccess(doctor.address))
                .to.emit(healthChain, "AccessGranted")
                .withArgs(patient.address, doctor.address);

            // 2. Doctor adds record
            await expect(healthChain.connect(doctor).addRecord(patient.address, "QmHashDoc", "Prescription"))
                .to.emit(healthChain, "RecordAdded")
                .withArgs(patient.address, doctor.address, "QmHashDoc", "Prescription");
        });

        it("Should revoke access correctly", async function () {
            const { healthChain, patient, doctor } = await loadFixture(deployFixture);

            // Grant then Revoke
            await healthChain.connect(patient).grantAccess(doctor.address);
            await healthChain.connect(patient).revokeAccess(doctor.address);

            // Doctor tries to add record -> Fail
            await expect(healthChain.connect(doctor).addRecord(patient.address, "QmHashFail", "Lab"))
                .to.be.revertedWithCustomError(healthChain, "UnauthorizedAccess");
        });
    });
});
