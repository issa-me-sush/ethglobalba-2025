"use client";

import { useCallback, useState } from "react";

import { signInWithOAuth } from "@coinbase/cdp-core";
import { Button } from "@coinbase/cdp-react/components/ui/Button";

/**
 * A button that initiates X (Twitter) OAuth via CDP.
 *
 * This requires "oauth:x" to be enabled in the CDP config and X
 * to be configured as a social provider in the CDP Portal.
 */
export default function LinkXAccountButton() {
  const [isPending, setIsPending] = useState(false);

  const handleClick = useCallback(() => {
    try {
      setIsPending(true);
      // This call will redirect the user to X for authentication.
      // After completion, the SDK will finalize login when it re-initializes.
      void signInWithOAuth("x");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to start X OAuth flow:", error);
      setIsPending(false);
    }
  }, []);

  return (
    <Button className="tx-button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Redirecting to X..." : "Link X account"}
    </Button>
  );
}


