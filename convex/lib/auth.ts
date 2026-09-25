/**
 * Session + PIN authentication helpers for Convex functions.
 *
 * Model (no external auth provider in this build stage):
 * - The transaction PIN is the account credential. It is NEVER stored
 *   in plaintext: only a SHA-256(salt + pin) hash is persisted.
 * - login/register issue a random 256-bit session token stored on the
 *   user record. Every user-scoped query/mutation/action must call
 *   requireSession() with the client-supplied (userId, sessionToken).
 * - There is intentionally no ctx.auth usage: Convex auth requires an
 *   external identity provider, which is not wired yet. These helpers
 *   are the enforcement point until then.
 */

export async function generateSessionToken(): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateSalt(): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: Uint8Array<ArrayBuffer>): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Current PIN-hash version. v1 was a single SHA-256(salt:pin) round —
 * too fast for a 4–6 digit secret if the table ever leaks. v2 stretches
 * it with iterated hashing. verifyPinHash() accepts both; login/setPin
 * always upgrade stored credentials to v2.
 */
export const PIN_HASH_VERSION = 2;
const PIN_HASH_ROUNDS_V2 = 10_000;

export async function hashPin(pin: string, salt: string): Promise<string> {
    let hex = await sha256Hex(new TextEncoder().encode(`${salt}:${pin}`));
    for (let i = 1; i < PIN_HASH_ROUNDS_V2; i++) {
        hex = await sha256Hex(new TextEncoder().encode(`${salt}:${hex}`));
    }
    return hex;
}

export async function verifyPinHash(
    pin: string,
    salt: string,
    expected: string,
    version?: number,
): Promise<boolean> {
    if (version === PIN_HASH_VERSION) {
        return (await hashPin(pin, salt)) === expected;
    }
    // v1 (legacy): single SHA-256(salt:pin) round.
    const legacy = await sha256Hex(new TextEncoder().encode(`${salt}:${pin}`));
    return legacy === expected;
}

export function validatePinFormat(pin: string): void {
    if (!/^\d{4,6}$/.test(pin)) throw new Error("PIN must be 4-6 digits");
}

/**
 * Normalize a phone number to E.164-ish canonical form so "+234801…",
 * "0801…" and "234801…" resolve to the same account instead of
 * creating duplicate users/wallets. Bare 10-digit numbers are assumed
 * Nigerian (this product is Nigeria-only in this build stage).
 */
export function normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
    if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
    if (digits.length === 10) return `+234${digits}`;
    return `+${digits}`;
}

export function validatePhone(phone: string): string {
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
        throw new Error("Invalid phone number");
    return normalized;
}

/**
 * Sessions expire after SESSION_TTL_MS (rolling: refreshed on login /
 * PIN change via issueSession). Records without sessionCreatedAt
 * (pre-TTL accounts) are grandfathered, not locked out.
 */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Throws "Unauthorized" unless sessionToken matches the token stored
 * on the user record. Returns the user document for ownership checks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireSession(ctx: any, userId: string, sessionToken: string) {
    if (!sessionToken || typeof sessionToken !== "string")
        throw new Error("Unauthorized: session required");
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken)
        throw new Error("Unauthorized");
    if (
        typeof user.sessionCreatedAt === "number" &&
        Date.now() - user.sessionCreatedAt > SESSION_TTL_MS
    )
        throw new Error("Session expired: log in again");
    return user;
}

/**
 * Throws unless the document's userId field matches the authenticated user.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireOwner(doc: any, userId: string, label = "record") {
    if (!doc || doc.userId !== userId)
        throw new Error(`Not found: ${label}`);
}
