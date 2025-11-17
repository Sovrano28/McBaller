export type UserRole = "player" | "org_admin" | "coach" | "finance" | "analyst" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  playerId?: string;
  name?: string;
}

export interface PlayerAuthData extends AuthUser {
  role: "player";
  playerId: string;
  name: string;
  username: string;
  avatar?: string;
  banner?: string;
  subscriptionTier?: string; // "free" | "pro" | "elite"
  subscriptionExpiry?: string;
  trialUsed?: boolean;
}

export interface OrgAuthData extends AuthUser {
  role: "org_admin" | "coach" | "finance" | "analyst";
  organizationId: string;
  organizationName?: string;
}

export interface SuperAdminAuthData extends AuthUser {
  role: "super_admin";
  organizationId: null;
}

export type AuthSession = PlayerAuthData | OrgAuthData | SuperAdminAuthData;
