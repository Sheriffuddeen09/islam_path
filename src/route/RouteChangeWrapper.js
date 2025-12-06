import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RouteLoader from "./RouteLoader";

export default function RouteChangeWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader when route changes
    setLoading(true);

    // Simulate load time (you can remove or adjust)
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <RouteLoader />}
      {children}
    </>
  );
}
