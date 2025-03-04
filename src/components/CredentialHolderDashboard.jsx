import React, { useState } from "react";
import RequestCredentials from "./RequestCredentials";
import PendingCredentials from "./PendingCredentials";
import ShareCredentials from "./ShareCredentials";
import Status from "./Status";
import "./Dashboard.css";

function CredentialHolderDashboard({ setRole }) {
  const [activeView, setActiveView] = useState("main");
  const [viewHistory, setViewHistory] = useState([]);

  // Function to navigate to a new view while saving history
  const navigateToView = (newView) => {
    setViewHistory([...viewHistory, activeView]);
    setActiveView(newView);
  };

  // Function to handle back button
  const handleBack = () => {
    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setActiveView(previousView);
      setViewHistory(viewHistory.slice(0, -1));
    } else {
      setRole(null);
    }
  };

  // Function to go directly back to role selection
  const handleBackToDashboard = () => {
    setRole(null);
  };

  return (
    <div className="container">
      <div className="content">
        {activeView === "main" && (
          <>
            <h2>Credential Holder Dashboard</h2>
            <div className="button-container">
              <button className="role-btn" onClick={() => navigateToView("request")}>
                Request New Credential
              </button>
              <button className="role-btn" onClick={() => navigateToView("pending")}>
                View My Credentials
              </button>
              <button className="role-btn" onClick={() => navigateToView("share")}>
                Share Credentials
              </button>
              <button className="role-btn" onClick={() => navigateToView("status")}>
                View Sharing Status
              </button>
            </div>
          </>
        )}

        {activeView === "request" && (
          <div className="sub-view">
            <RequestCredentials 
              setShowRequestForm={(value) => {
                if (value === "main") navigateToView("main");
              }} 
              onRequestSubmitted={() => navigateToView("main")} 
            />
          </div>
        )}

        {activeView === "pending" && (
          <div className="sub-view">
            <PendingCredentials isVerifier={false} />
          </div>
        )}

        {activeView === "share" && (
          <div className="sub-view">
            <ShareCredentials 
              setShowShareForm={(value) => {
                if (value === "main") navigateToView("main");
              }} 
            />
          </div>
        )}

        {activeView === "status" && (
          <div className="sub-view">
            <Status />
          </div>
        )}

        {/* Hide navigation buttons when sharing credentials */}
        {activeView !== "share" && (
          <div className="navigation-buttons">
            <button className="role-btn" onClick={handleBack}>
              Back
            </button>
            <button className="role-btn" onClick={handleBackToDashboard}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CredentialHolderDashboard;
