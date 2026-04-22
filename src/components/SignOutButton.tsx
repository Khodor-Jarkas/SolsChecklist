import { signOut } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-ghost ml-2">
        Sign out
      </button>
    </form>
  );
}
