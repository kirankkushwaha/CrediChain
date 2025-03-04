import React, { useState } from "react";
import PendingCredentials from "./PendingCredentials";
import "./Dashboard.css";

function CredentialIssuerDashboard({ setRole }) {
  const [activeView, setActiveView] = useState("main");
  const [showContent, setShowContent] = useState(true);
  
  
  const hideContent = () => {
    setShowContent(false);
  };

  return (
    <div className="container">
      {showContent && (
        <div className="content">
          {activeView === "main" && (
            <>
              <h2>Credential Issuer Dashboard</h2>
              <div className="button-container">
                <button className="role-btn" onClick={() => setActiveView("verifyPending")}>
                  Verify Credential Requests
                </button>
              </div>
            </>
          )}

          {activeView === "verifyPending" && (
            <div className="sub-view">
              <PendingCredentials isVerifier={true} />
            </div>
          )}

          {/* Navigation buttons section - always visible */}
          <div className="navigation-buttons">
            {/* Back button to navigate to previous view */}
            <button className="role-btn" onClick={() => {
              if (activeView !== "main") {
                setActiveView("main");
              } else {
                setRole(null);
              }
            }}>
              Back
            </button>
            
            {/* Back to Dashboard button */}
            <button className="role-btn" onClick={() => {
              hideContent(); 
              setRole(null); 
            }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CredentialIssuerDashboard;