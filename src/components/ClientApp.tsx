"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";

import Loading from "@/components/Loading";
import SignedInScreen from "@/components/SignedInScreen";
import SignInScreen from "@/components/SignInScreen";

/**
 * A component that displays the client app.
 */
export default function ClientApp() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  return (
    <div className="flex min-h-screen flex-col">
      {!isInitialized && <Loading />}
      {isInitialized && (!isSignedIn ? <SignInScreen /> : <SignedInScreen />)}
    </div>
  );
}
