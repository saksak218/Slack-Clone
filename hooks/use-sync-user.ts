import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

export function useSyncUser() {
  const session = authClient.useSession();
  const mutation = useMutation(api.functions.users.mutations.createUser);
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Check if user exists in Convex
  const existingUser = useQuery(
    api.functions.users.queries.getUserBySessionId,
    session.data?.user?.id ? { sessionId: session.data.user.id } : "skip"
  );

  useEffect(() => {
    const syncUser = async () => {
      // Only sync if:
      // 1. Session is not pending
      // 2. User exists in session
      // 3. User has email
      // 4. Query has finished (existingUser is not undefined)
      // 5. User doesn't exist in Convex (existingUser === null)
      // 6. Not already syncing
      // 7. Not already synced
      if (
        !session.isPending &&
        session.data?.user &&
        session.data.user.email &&
        existingUser !== undefined && // Query has finished
        existingUser === null && // User doesn't exist in Convex
        !isSyncing &&
        !hasSynced
      ) {
        console.log("🔄 User not found in Convex, syncing...", {
          userId: session.data.user.id,
          email: session.data.user.email,
        });

        setIsSyncing(true);
        try {
          const result = await mutation({
            sessionId: session.data.user.id,
            name: session.data.user.name || "User",
            email: session.data.user.email,
            image: session.data.user.image || undefined,
          });

          console.log("✅ User synced to Convex successfully:", result);
          setHasSynced(true);
        } catch (error: any) {
          console.error("❌ Error syncing user to Convex:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
          });
          // Don't set hasSynced on error so it can retry
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncUser();
  }, [
    session.isPending,
    session.data?.user?.id,
    session.data?.user?.email,
    existingUser,
    mutation,
    isSyncing,
    hasSynced,
  ]);

  return { isSyncing, hasSynced };
}

