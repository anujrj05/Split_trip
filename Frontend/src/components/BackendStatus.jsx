import React, { useEffect, useState } from "react";
import axios from "axios";

function BackendStatus() {
  const [status, setStatus] = useState("checking");

  const checkBackend = async () => {
    try {
      await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/health`, {
        timeout: 4000,
      });
      setStatus("online");
    } catch (error) {
      setStatus("offline");
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusStyles = {
    online: "bg-green-100 text-green-700 border-green-300",
    offline: "bg-red-100 text-red-700 border-red-300",
    checking: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  const statusText = {
    online: "Backend: Running",
    offline: "Backend: Not reachable",
    checking: "Backend: Checking...",
  };

  // Keep UI clean: only show banner when action is needed.
  if (status === "online") {
    return null;
  }

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-20">
      <div className={`border rounded-md px-3 py-2 text-sm ${statusStyles[status]}`}>
        {statusText[status]}
      </div>
    </div>
  );
}

export default BackendStatus;
