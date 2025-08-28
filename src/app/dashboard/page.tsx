import { Button } from "@/components/ui/button";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";

async function Page() {
//   const user = await currentUser();
//   if (!user) redirect("/");
  return (
    <div>
      Dashboard{" "}
      <div className="flex gap-4">
        <SignedOut>
          <SignInButton>
            <Button variant={"outline"}>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default Page;
