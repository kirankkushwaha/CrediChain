import React, { useState } from "react";
import SharedCredentials from "./SharedCredentials";
import "./Dashboard.css";

function CredentialInspectorDashboard({ setRole }) {
  const [activeView, setActiveView] = useState("main");

  return (
    <div className="container">
      <div className="content">
        {activeView === "main" && (
          <>
            <h2>Credential Inspector Dashboard</h2>
            <div className="button-container">
              <button className="role-btn" onClick={() => setActiveView("verifyShared")}>
                Verify Shared Credentials
              </button>
            </div>
          </>
        )}

        {activeView === "verifyShared" && (
          <div className="sub-view">
            <SharedCredentials />
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
          
          {/* New Back to Dashboard button that returns to role selector */}
          <button className="role-btn" onClick={() => setRole(null)}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default CredentialInspectorDashboard;