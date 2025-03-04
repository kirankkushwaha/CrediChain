import React from "react";
import "./RoleSelection.css"; // Import the CSS file

function RoleSelection({ setRole }) {
  return (
    <div className="container">
      <div className="content">
        <h2>Select Your Role</h2>
        <div className="button-container">
          <button className="role-btn" onClick={() => setRole("credential-holder")}>
            Credential Holder
          </button>
          <button className="role-btn" onClick={() => setRole("credential-issuer")}>
            Credential Issuer
          </button>
          <button className="role-btn" onClick={() => setRole("credential-inspector")}>
            Credential Inspector
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
