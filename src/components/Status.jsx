import React, { useState, useEffect } from "react";
import { getWeb3Provider, getContract } from "../utils/web3Utils";
import styles from "./Status.module.css";
const Status = () => {
  const [sharedCredentials, setSharedCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [error, setError] = useState(null);

  const fetchSharedCredentials = async () => {
    try {
      setLoading(true);
      const { signer } = await getWeb3Provider();
      const address = await signer.getAddress();
      setUserAddress(address);
      
      const contract = await getContract(signer);
      
      const totalCount = await contract.sharedCredentialCount();
      console.log("Total shared credentials:", totalCount.toString());
      
      const credentials = [];

      for (let i = 1; i <= totalCount; i++) {
        try {
          const sharedCred = await contract.sharedCredentials(i);
          
          if (sharedCred.sharedBy.toLowerCase() === address.toLowerCase()) {
            const originalCred = await contract.getCredentialById(sharedCred.originalCredentialId);
            
            // This assumes the actual decentralized ID is stored in the originalCred object
            // If it's stored elsewhere, you'll need to modify this part
            credentials.push({
              shareId: i,
              credentialId: sharedCred.originalCredentialId,
              // Using the actual original credential ID instead of constructing one
              decentralizedId: originalCred.decentralizedId || `Credential #${sharedCred.originalCredentialId}`,
              sharedWith: sharedCred.sharedWith,
              credentialType: originalCred.credentialType,
              enrollmentNumber: originalCred.enrollmentNumber,
              verified: sharedCred.verified,
              verifierNotes: originalCred.verifierNotes,
              timestamp: new Date(Number(sharedCred.shareTimestamp) * 1000).toLocaleString()
            });
          }
        } catch (err) {
          console.error(`Error fetching credential #${i}:`, err);
        }
      }

      console.log("Found shared credentials:", credentials);
      setSharedCredentials(credentials);

    } catch (error) {
      console.error("Error fetching shared credentials:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedCredentials();
  }, []);

  const viewVerifierDetails = (credential) => {
    alert(`
Credential Details:
------------------------
Credential Type: ${credential.credentialType}
Credential ID: ${credential.credentialId}
Enrollment Number: ${credential.enrollmentNumber}
Verifier Notes: ${credential.verifierNotes || 'No notes provided'}
    `);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Active Shares</h2>
      
      <button 
        onClick={fetchSharedCredentials} 
        disabled={loading}
        className={styles.refreshButton}
      >
        {loading ? "Refreshing..." : "Refresh List"}
      </button>

      {error && (
        <div className={styles.errorMessage}>
          Error: {error}
        </div>
      )}

      {loading ? (
        <p className={styles.loadingMessage}>Loading shared credentials...</p>
      ) : sharedCredentials.length === 0 ? (
        <p className={styles.emptyMessage}>No active shares found</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.credentialsTable}>
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Decentralized ID</th>
                <th>Shared With</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sharedCredentials.map((cred) => (
                <tr key={cred.shareId} className={cred.verified ? styles.verifiedRow : styles.pendingRow}>
                  <td>{cred.credentialType}</td>
                  <td className={styles.idCell}>
                    <div className={styles.ellipsis} title={cred.decentralizedId}>
                      {cred.credentialId} {/* Showing the original credential ID */}
                    </div>
                  </td>
                  <td>{cred.sharedWith}</td>
                  <td>
                    <span className={cred.verified ? styles.verified : styles.pending}>
                      {cred.verified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => viewVerifierDetails(cred)}
                      className={styles.detailsButton}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .${styles.container} {
          padding: 20px;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #444;
        }

        .${styles.title} {
          margin-bottom: 20px;
        }

        .${styles.errorMessage} {
          background-color: #ffeeee;
          color: #cc0000;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
          width: 100%;
          text-align: center;
        }

        .${styles.loadingMessage},
        .${styles.emptyMessage} {
          margin: 20px 0;
          color: #666;
          text-align: center;
        }

        .${styles.refreshButton} {
          margin-bottom: 15px;
          background-color: #707070;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .${styles.refreshButton}:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .${styles.tableContainer} {
          width: 100%;
          overflow-x: auto;
          max-height: calc(100vh - 150px);
        }

        .${styles.credentialsTable} {
          width: 100%;
          border-collapse: collapse;
        }

        .${styles.credentialsTable} th, 
        .${styles.credentialsTable} td {
          padding: 12px;
          border: 1px solid #ddd;
        }

        .${styles.credentialsTable} th {
          background-color: #666;
          color: white;
          font-weight: bold;
        }

        .${styles.verified} {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          background-color: #008000;
          color: white;
        }

        .${styles.pending} {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          background-color: #cc7700;
          color: white;
        }

        .${styles.verifiedRow} {
          background-color: rgba(0, 128, 0, 0.05);
        }

        .${styles.idCell} {
          max-width: 200px;
        }

        .${styles.ellipsis} {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: monospace;
          font-size: 0.9rem;
          color: #555;
          background-color: #d0d0d0;
          padding: 4px 8px;
          border-radius: 3px;
        }

        .${styles.detailsButton} {
          background-color: #4c78af;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .${styles.detailsButton}:hover {
          background-color: #3a5d89;
        }

        @media (max-width: 768px) {
          .${styles.container} {
            padding: 10px;
          }
          
          .${styles.credentialsTable} th,
          .${styles.credentialsTable} td {
            padding: 10px 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Status;