import { useEffect, useState } from "react";
import { getAppSite, type AppSiteResponse } from "../lib/api";

type AppSiteStatus = "loading" | "ready" | "error";

export function useAppSite(): {
  data: AppSiteResponse | null;
  status: AppSiteStatus;
} {
  const [data, setData] = useState<AppSiteResponse | null>(null);
  const [status, setStatus] = useState<AppSiteStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    getAppSite(controller.signal)
      .then((response) => {
        setData(response);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return { data, status };
}
