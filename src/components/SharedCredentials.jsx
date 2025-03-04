import React, { useState, useEffect } from "react";
import { getWeb3Provider, getContract } from "../utils/web3Utils";

const SharedCredentials = () => {
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
      
      const credentials = [];

      for (let i = 1; i <= totalCount; i++) {
        try {
          const sharedCred = await contract.sharedCredentials(i);

          // Check if this credential was shared with the current user
          if (sharedCred.sharedWith.toLowerCase() === address.toLowerCase()) {
            const originalCred = await contract.getCredentialById(sharedCred.originalCredentialId);
            
            credentials.push({
              shareId: i,
              credentialId: sharedCred.originalCredentialId,
              sharedBy: sharedCred.sharedBy,
              credentialType: originalCred.credentialType,
              issuerAddress: originalCred.verifierId,
              verified: sharedCred.verified,
              timestamp: new Date(Number(sharedCred.shareTimestamp) * 1000).toLocaleString()
            });
          }
        } catch (err) {
          console.error(`Error fetching credential #${i}:`, err);
        }
      }

      setSharedCredentials(credentials);
      
      // Store the fetched credentials in localStorage for persistence
      localStorage.setItem(`sharedCredentials-${address}`, JSON.stringify(credentials));
    } catch (error) {
      console.error("Error fetching shared credentials:", error);
      setError(error.message);
      
      // If fetching fails, try to load from localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  const loadFromLocalStorage = async () => {
    try {
      const { signer } = await getWeb3Provider();
      const address = await signer.getAddress();
      
      // Try to get cached credentials from localStorage
      const cachedData = localStorage.getItem(`sharedCredentials-${address}`);
      
      if (cachedData) {
        setSharedCredentials(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // Try to load from localStorage first for immediate display
      await loadFromLocalStorage();
      // Then fetch fresh data from the blockchain
      fetchSharedCredentials();
    };
    
    initializeData();
    
    // Set up event listener for contract events (optional, if your contract emits events)
    const setupEventListeners = async () => {
      try {
        const { signer } = await getWeb3Provider();
        const contract = await getContract(signer);
        
        // Listen for credential verification events
        contract.on("CredentialVerified", (shareId, verifier) => {
          console.log("Credential verified event:", shareId, verifier);
          fetchSharedCredentials(); // Refresh the list when a verification occurs
        });
        
        return () => {
          // Clean up event listeners when component unmounts
          contract.removeAllListeners("CredentialVerified");
        };
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };
    
    setupEventListeners();
  }, []);

  const handleVerify = async (shareId) => {
    try {
      setLoading(true);
      const { signer } = await getWeb3Provider();
      const contract = await getContract(signer);
      
      const tx = await contract.verifySharedCredential(shareId);
      await tx.wait();
      
      alert("Credential verified successfully!");
      fetchSharedCredentials();
    } catch (error) {
      console.error("Error verifying credential:", error);
      alert("Error verifying credential: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="credentials-container">
      <h2>Shared Credentials</h2>
      
      
      
      <button 
        onClick={fetchSharedCredentials} 
        disabled={loading}
        className="refresh-btn"
      >
        {loading ? "Refreshing..." : "Refresh List"}
      </button>

      {error && <div className="error-message">Error: {error}</div>}

      {loading && sharedCredentials.length === 0 ? (
        <p className="loading-message">Loading shared credentials...</p>
      ) : sharedCredentials.length === 0 ? (
        <p className="empty-message">No shared credentials found</p>
      ) : (
        <div className="table-wrapper">
          <table className="credentials-table">
            <thead>
              <tr>
                <th>Type of Document</th>
                <th>Decentralized ID</th>
                <th>Issuer Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sharedCredentials.map((cred) => (
                <tr key={cred.shareId} className={cred.verified ? "approved-row" : "pending-row"}>
                  <td>{cred.credentialType}</td>
                  <td>
                    <div className="credential-id-container">
                      <span className="credential-id">{cred.credentialId}</span>
                    </div>
                  </td>
                  <td>{cred.issuerAddress}</td>
                  <td>
                    <span className={`status-badge ${cred.verified ? "approved" : "pending"}`}>
                      {cred.verified ? "✅ Verified" : "⏳ Pending"}
                    </span>
                  </td>
                  <td>
                    {!cred.verified && (
                      <button onClick={() => handleVerify(cred.shareId)} disabled={loading} className="approve-btn">
                        Approve
                      </button>
                    )}
                    {cred.verified && <span className="verified-text">✓ Verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .credentials-container {
          padding: 20px;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #444;
        }

        h2 {
          margin-bottom: 20px;
        }

        p {
          text-align: center;
          margin-bottom: 15px;
        }

        .error-message {
          background-color: #ffeeee;
          color: #cc0000;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
          width: 100%;
          text-align: center;
        }

        .loading-message,
        .empty-message {
          margin: 20px 0;
          color: #666;
          text-align: center;
        }

        .refresh-btn {
          margin-bottom: 15px;
          background-color: #707070;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .refresh-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          max-height: calc(100vh - 150px);
        }

        .credentials-table {
          width: 100%;
          border-collapse: collapse;
        }

        .credentials-table th, 
        .credentials-table td {
          padding: 12px;
          border: 1px solid #ddd;
        }

        .credentials-table th {
          background-color: #666;
          color: white;
          font-weight: bold;
          text-align: left;
        }

        .approved-row {
          background-color: rgba(0, 128, 0, 0.05);
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .status-badge.approved {
          background-color: #008000;
          color: white;
        }

        .status-badge.pending {
          background-color: #cc7700;
          color: white;
        }

        .credential-id-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .credential-id {
          font-family: monospace;
          font-size: 0.9rem;
          color: #555;
          background-color: #d0d0d0;
          padding: 4px 8px;
          border-radius: 3px;
        }

        .approve-btn {
          background-color: #4c78af;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .approve-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .verified-text {
          color: #008000;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .credentials-container {
            padding: 10px;
          }
          
          .credentials-table th,
          .credentials-table td {
            padding: 10px 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SharedCredentials;