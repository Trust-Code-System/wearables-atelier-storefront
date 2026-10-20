import { AuthExperience } from "@/components/account/auth-experience";

export default function AccountAccessLayout({ children }: { children: React.ReactNode }) {
  return <><AuthExperience />{children}</>;
}
