"use client";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@resume-builder/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@resume-builder/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@resume-builder/ui/components/input-otp";
import { toast } from "@resume-builder/ui/components/sonner";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getClerkErrorMessage, handleClerkError } from "@/libs/clerk-toast";

function VerifyOTPContent() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(60);
  const [error, setError] = React.useState("");

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const formSchema = React.useMemo(
    () =>
      z.object({
        code: z
          .string()
          .min(6, t("validation.codeIncomplete"))
          .max(6, t("validation.codeSixDigits")),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success(t("verify.success"));
        router.push("/");
      } else {
        setError(t("verify.incomplete"));
      }
    } catch (error) {
      setError(getClerkErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    if (!isLoaded || !signUp || resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success(t("verify.resendSuccess"));
      setResendCooldown(60);
    } catch (error) {
      handleClerkError(error, { fallbackMessage: t("verify.resendFailed") });
    } finally {
      setIsResending(false);
    }
  }

  const codeValue = form.watch("code");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Icon */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className={`
            bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center
            justify-center rounded-full
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        >
          <Mail className="text-primary h-8 w-8" />
        </motion.div>
        <h2 className="font-display mb-2 text-3xl font-bold">
          {t("verify.title")}
        </h2>
        <p className="text-muted-foreground">{t("verify.sentTo")}</p>
        <p className="text-foreground mt-1 font-medium">
          {email || t("verify.emailFallback")}
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            bg-destructive/10 text-destructive mb-6 rounded-lg p-3 text-center
            text-sm
          `}
        >
          {error}
        </motion.div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <InputOTP maxLength={6} disabled={isLoading} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            whileHover={
              isLoading || codeValue.length !== 6 ? {} : { scale: 1.02 }
            }
            whileTap={
              isLoading || codeValue.length !== 6 ? {} : { scale: 0.98 }
            }
          >
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={isLoading || codeValue.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("verify.verifying")}
                </>
              ) : (
                <>
                  {t("verify.submit")}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Resend & Back Links */}
          <motion.div
            className="space-y-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-muted-foreground text-sm">
              <p>{t("verify.didNotReceive")}</p>{" "}
              <Button
                variant={"ghost"}
                type="button"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className={`
                  text-primary inline-flex items-center gap-1 font-medium
                  hover:underline
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                <RefreshCw
                  className={`
                    h-4 w-4
                    ${isResending ? "animate-spin" : ""}
                  `}
                />
                {resendCooldown > 0
                  ? t("verify.resendIn", { seconds: resendCooldown })
                  : t("verify.resendCode")}
              </Button>
            </div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
