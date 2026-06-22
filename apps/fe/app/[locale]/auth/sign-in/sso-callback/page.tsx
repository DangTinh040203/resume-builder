import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SSOCallback() {
  const t = await getTranslations("Auth");

  return (
    <>
      <AuthenticateWithRedirectCallback />

      <div className="flex w-full items-center justify-center gap-2">
        <Loader className="text-primary h-5 w-5 animate-spin" />
        <span className="text-primary">{t("sso.almostThere")}</span>
      </div>
      {/* Required for sign-up flows
      Clerk's bot sign-up protection is enabled by default */}
      <div id="clerk-captcha" />
    </>
  );
}
