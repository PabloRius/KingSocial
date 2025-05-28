"use client";

import { login } from "@/lib/actions/auth";
import { User } from "@/types/types";
import { signOut } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Session = {
  profile: User;
} | null;

type SessionHandlers = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

type SessionState = {
  session: Session;
  loading: boolean;
  error: string | null;
  handlers: SessionHandlers;
};

const SessionContext = createContext<SessionState | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch session");
      }
      const data = await res.json();
      console.log(data);
      setSession(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const loginHandler = useCallback(async () => {
    await login();
    await fetchSession();
  }, [fetchSession]);

  const logoutHandler = useCallback(async () => {
    setLoading(true);
    await signOut({ redirect: false });
    await fetchSession();
  }, [fetchSession]);

  const sessionHandlers: SessionHandlers = {
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <SessionContext.Provider
      value={{ session, loading, error, handlers: sessionHandlers }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
