import React, { useState } from "react";
import { getWeb3Provider, getContract } from "../utils/web3Utils";
import "./RequestCredentials.css";

const RequestCredentials = ({ setShowRequestForm, onRequestSubmitted }) => {
  const [credentialType, setCredentialType] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [verifierId, setVerifierId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentialType || !enrollmentNumber || !verifierId) {
      alert("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const { signer } = await getWeb3Provider();
      const contract = await getContract(signer);
      
      const requesterAddress = await signer.getAddress();
      console.log("Submitting request from address:", requesterAddress);
      console.log("Request details:", {
        credentialType,
        enrollmentNumber,
        verifierId
      });

      const tx = await contract.requestCredential(
        credentialType,
        enrollmentNumber,
        verifierId  // Now passing the address directly
      );
      
      console.log("Transaction submitted:", tx.hash);
      await tx.wait();

      alert("Credential request sent successfully!");
      if (onRequestSubmitted) onRequestSubmitted();
      setShowRequestForm(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error sending request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Request Credentials</h2>
        <form onSubmit={handleSubmit}>
          <label>Credential Type:</label>
          <input
            type="text"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            placeholder="Enter credential type"
            required
            disabled={loading}
          />

          <label>Enrollment Number:</label>
          <input
            type="text"
            value={enrollmentNumber}
            onChange={(e) => setEnrollmentNumber(e.target.value)}
            placeholder="Enter enrollment number"
            required
            disabled={loading}
          />

          <label>Verifier ID (Ethereum Address):</label>
          <input
            type="text"
            value={verifierId}
            onChange={(e) => setVerifierId(e.target.value)}
            placeholder="Enter verifier's Ethereum address"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default RequestCredentials;