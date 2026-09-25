"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Session {
    userId: string;
    sessionToken: string;
    name: string;
    phone: string;
}

interface SessionContextValue {
    session: Session | null;
    /** Loaded from storage on mount; false during SSR/first paint. */
    ready: boolean;
    saveSession: (s: Session) => void;
    clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
    session: null,
    ready: false,
    saveSession: () => {},
    clearSession: () => {},
});

const STORAGE_KEY = "kumba.session.v1";

function load(): Session | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.userId || !parsed?.sessionToken) return null;
        return parsed as Session;
    } catch {
        return null;
    }
}

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setSession(load());
        setReady(true);
    }, []);

    const saveSession = useCallback((s: Session) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch {
            /* storage unavailable — session lasts for this tab only */
        }
        setSession(s);
    }, []);

    const clearSession = useCallback(() => {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
        setSession(null);
    }, []);

    return (
        <SessionContext.Provider value={{ session, ready, saveSession, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}
