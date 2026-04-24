import { useState, useEffect } from "react";

export function usePlatformLogo(): string {
  const [logoUrl, setLogoUrl] = useState("");
  useEffect(() => {
    fetch("/api/landing-page")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.logoUrl) setLogoUrl(data.logoUrl); })
      .catch(() => {});
  }, []);
  return logoUrl;
}
