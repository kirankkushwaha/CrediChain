import React, { useState } from "react";
import { getWeb3Provider, getContract } from "../utils/web3Utils";
import styles from "./ShareCredentials.module.css";

const ShareCredentials = ({ setShowShareForm }) => {
  const [credentialId, setCredentialId] = useState("");
  const [employerId, setEmployerId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [customType, setCustomType] = useState("");

  // Predefined document types
  const documentTypes = [
    "Academic Certificate",
    "Employment Verification",
    "Identity Document",
    "Professional License",
    "Medical Record",
    "Financial Document",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentialId || !employerId || !documentType) {
      alert("Please fill all required fields!");
      return;
    }

    const finalDocumentType = documentType === "Other" ? customType : documentType;

    if (documentType === "Other" && !customType) {
      alert("Please specify the document type!");
      return;
    }

    try {
      setLoading(true);
      const { signer } = await getWeb3Provider();
      const contract = await getContract(signer);

      const tx = await contract.shareCredential(credentialId, employerId, {
        documentType: finalDocumentType,
      });
      await tx.wait();

      alert("Credential shared successfully!");
      handleCancel();
    } catch (error) {
      console.error("Error sharing credential:", error);
      alert("Error sharing credential: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCredentialId("");
    setEmployerId("");
    setDocumentType("");
    setCustomType("");
    setShowShareForm("main");
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <h2 className={styles.header}>Share Credential</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Credential ID:</label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter your credential ID"
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Document Type:</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              disabled={loading}
              className={styles.select}
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {documentType === "Other" && (
            <div className={styles.formGroup}>
              <label>Specify Document Type:</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom document type"
                required
                disabled={loading}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Employer Address:</label>
            <input
              type="text"
              value={employerId}
              onChange={(e) => setEmployerId(e.target.value)}
              placeholder="Enter employer's Ethereum address"
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

         

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Sharing..." : "Share Credential"}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareCredentials;
