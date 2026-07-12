import { useQuery } from "@tanstack/react-query";

interface ServerInfo {
  provider: "gemini" | "mock";
  faultDemo: boolean;
}

const FALLBACK: ServerInfo = { provider: "mock", faultDemo: true };

/**
 * Fetches which provider is active and whether the fault demo is enabled, so the
 * UI can show the engine and conditionally render the failure-demo menu.
 */
export function useServerInfo(): ServerInfo {
  const { data } = useQuery({
    queryKey: ["server-info"],
    queryFn: async ({ signal }): Promise<ServerInfo> => {
      const response = await fetch("/api/health", { signal });
      if (!response.ok) return FALLBACK;
      const json = (await response.json()) as Partial<ServerInfo>;
      return {
        provider: json.provider === "gemini" ? "gemini" : "mock",
        faultDemo: Boolean(json.faultDemo),
      };
    },
    staleTime: Infinity,
    retry: 1,
  });

  return data ?? FALLBACK;
}
