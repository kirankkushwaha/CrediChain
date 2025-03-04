import React, { useState } from "react";
import NavBar from "./components/NavBar";
import RoleSelection from "./components/RoleSelection";
import CredentialHolderDashboard from "./components/CredentialHolderDashboard";
import CredentialIssuerDashboard from "./components/CredentialIssuerDashboard";
import CredentialInspectorDashboard from "./components/CredentialInspectorDashboard";
import "./styles.css";

function App() {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <div className="app-container">
      <NavBar account={account} setAccount={setAccount} />
      <div className="main-content">
        {!account ? (
          <div className="welcome-screen">
            <h1>CrediChain :</h1> 
            <h3> Decentralized & Secure Credential Verification</h3>
          </div>
        ) : !role ? (
          <RoleSelection setRole={setRole} />
        ) : (
          <>
            {role === "credential-holder" && <CredentialHolderDashboard setRole={setRole} />}
            {role === "credential-issuer" && <CredentialIssuerDashboard setRole={setRole} />}
            {role === "credential-inspector" && <CredentialInspectorDashboard setRole={setRole} />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
