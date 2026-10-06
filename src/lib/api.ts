export const API_URL = "http://192.168.18.172:3001";

const TOKEN_KEY = "fretou_token";
let memoryToken: string | null = null;

function tokenStorage(): Storage | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

export type Profile = {
  id: string;
  name: string;
  cpf?: string;
  driver: boolean;
  thirdParty?: boolean;
  keyPix?: string;
  active: boolean;
};

export function readToken(): string | null {
  return tokenStorage()?.getItem(TOKEN_KEY) ?? memoryToken;
}

export function saveToken(token: string): void {
  memoryToken = token;
  tokenStorage()?.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  memoryToken = null;
  tokenStorage()?.removeItem(TOKEN_KEY);
}

export async function fetchProfile(token: string): Promise<Profile | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;

  const data: unknown = await response.json().catch(() => null);
  if (!data || typeof data !== "object") return null;
  if (!("name" in data) || typeof data.name !== "string") return null;
  if (!("id" in data) || typeof data.id !== "string") return null;

  return {
    id: data.id,
    name: data.name,
    cpf: "cpf" in data && typeof data.cpf === "string" ? data.cpf : undefined,
    driver: "driver" in data && typeof data.driver === "boolean" ? data.driver : false,
    thirdParty:
      "thirdParty" in data && typeof data.thirdParty === "boolean" ? data.thirdParty : false,
    keyPix: "keyPix" in data && typeof data.keyPix === "string" ? data.keyPix : undefined,
    active: "active" in data && typeof data.active === "boolean" ? data.active : true,
  };
}
