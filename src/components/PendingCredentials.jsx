import React, { useEffect, useState } from "react";
import { getWeb3Provider, getContract } from "../utils/web3Utils";

const PendingCredentials = ({ isVerifier }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [verifierNotes, setVerifierNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      const { signer } = await getWeb3Provider();
      const contract = await getContract(signer);
      const currentAddress = await signer.getAddress();
      
      const totalRequests = await contract.requestCount();
      let fetchedCredentials = [];

      for (let i = 1; i <= totalRequests; i++) {
        const request = await contract.requests(i);
        
        if (isVerifier) {
          if (request.verifierId.toLowerCase() === currentAddress.toLowerCase()) {
            fetchedCredentials.push({
              id: i,
              type: request.credentialType,
              enrollmentNumber: request.enrollmentNumber,
              requester: request.requester,
              approved: request.approved,
              credentialId: request.credentialId
            });
          }
        } else {
          if (request.requester.toLowerCase() === currentAddress.toLowerCase()) {
            fetchedCredentials.push({
              id: i,
              type: request.credentialType,
              enrollmentNumber: request.enrollmentNumber,
              verifierId: request.verifierId,
              approved: request.approved,
              credentialId: request.credentialId
            });
          }
        }
      }

      setCredentials(fetchedCredentials);
    } catch (err) {
      console.error("Error fetching credentials:", err);
      setError("Failed to fetch credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [isVerifier]);

  
  const initiateApprove = (requestId) => {
    setSelectedRequestId(requestId);
    setVerifierNotes("");
    setShowNotesModal(true);
  };

  
  const handleApprove = async () => {
    if (!selectedRequestId) return;
    
    try {
      setApprovingId(selectedRequestId);
      setError(null);
      setShowNotesModal(false);
      
      const { signer } = await getWeb3Provider();
      const contract = await getContract(signer);
      
      
      const tx = await contract.approveCredential(selectedRequestId, verifierNotes);
      await tx.wait();
      
      
      await fetchCredentials();
      
    } catch (err) {
      console.error("Error approving credential:", err);
      setError(`Failed to approve credential #${selectedRequestId}: ${err.message}`);
    } finally {
      setApprovingId(null);
      setSelectedRequestId(null);
    }
  };

  return (
    <div className="credentials-container">
      <h2>{isVerifier ? "All Verification Requests" : "Your Credential Requests"}</h2>
      
      <button className="refresh-btn" onClick={fetchCredentials} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh List"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {credentials.length === 0 ? (
        <p>No credentials found</p>
      ) : (
        <div className="table-wrapper">
          <table className="credentials-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Enrollment Number</th>
                <th>{isVerifier ? "Requester" : "Verifier"}</th>
                <th>Status</th>
                <th>Decentralized ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred) => (
                <tr key={cred.id} className={cred.approved ? "approved-row" : "pending-row"}>
                  <td>{cred.id}</td>
                  <td>{cred.type}</td>
                  <td>{cred.enrollmentNumber}</td>
                  <td>{isVerifier ? cred.requester : cred.verifierId}</td>
                  <td>
                    <span className={`status-badge ${cred.approved ? "approved" : "pending"}`}>
                      {cred.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {cred.credentialId && cred.credentialId !== "0x0000000000000000000000000000000000000000000000000000000000000000" 
                      ? <div className="credential-id-container">
                          <span className="credential-id">
                            {`${cred.credentialId.substring(0, 10)}...${cred.credentialId.substring(58)}`}
                          </span>
                          <button 
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(cred.credentialId);
                              alert("Credential ID copied to clipboard!");
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      : "Not yet assigned"}
                  </td>
                  <td>
                    {isVerifier && !cred.approved && (
                      <button
                        onClick={() => initiateApprove(cred.id)}
                        disabled={loading || approvingId === cred.id}
                        className="approve-btn"
                      >
                        {approvingId === cred.id ? "Processing..." : "Approve"}
                      </button>
                    )}
                    {cred.approved && <span className="verified-text">✓ Verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {}
      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Verifier Notes</h3>
            <p>Please provide any notes about this credential approval:</p>
            <textarea
              value={verifierNotes}
              onChange={(e) => setVerifierNotes(e.target.value)}
              placeholder="Enter verification notes (optional)"
              rows={4}
              className="notes-textarea"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowNotesModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleApprove} className="confirm-btn">Approve Credential</button>
            </div>
          </div>
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

  .error-message {
    background-color: #ffeeee;
    color: #cc0000;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    width: 100%;
    text-align: center;
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

  .credentials-table th, .credentials-table td {
    padding: 12px;
    border: 1px solid #ddd;
  }

  .credentials-table th {
    background-color: #666;
    color: white;
    font-weight: bold;
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

  .approved-row {
    background-color: rgba(0, 128, 0, 0.05);
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

  .verified-text {
    color: #008000;
    font-weight: 500;
  }

  .credential-id {
    font-family: monospace;
    font-size: 14px;
    color: #555;
    background-color: #d0d0d0;
    padding: 4px 8px;
    border-radius: 3px;
  }

  .credential-id-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .copy-btn {
    background-color: #888;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .copy-btn:hover {
    background-color: #555;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .notes-textarea {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
  }

  .cancel-btn {
    background-color: #dddddd;
    color: #333;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .confirm-btn {
    background-color: #4c78af;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
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

export default PendingCredentials;