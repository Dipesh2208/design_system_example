import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { AppButton, AppBadge } from "@repo/ui/atoms";
import { ThemeDropdownOrganism } from "@repo/ui/organisms";
import { getAdminUser, sessionCookie } from "../session.server";
import { LanguageSelector } from "../components/LanguageSelector";
import { useTheme, THEME_OPTIONS } from "../components/ThemeProvider";
import { ShieldCheck, Lock } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAdminUser(request);
  if (user) {
    return redirect("/dashboard");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const provider = formData.get("provider");

  if (provider === "google") {
    const mockGoogleUser = {
      id: "usr_admin_google_9823",
      name: "Admin User",
      email: "admin@enterprise.org",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Super Admin",
    };

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize({ user: mockGoogleUser }),
      },
    });
  }

  return json({ error: "Unsupported provider" }, { status: 400 });
}

export default function AuthPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen w-full flex flex-col justify-between items-center p-3 sm:p-6 md:p-8 bg-background text-foreground transition-colors duration-200">
      {/* Top Header with Language Selector & Solid ThemeDropdownOrganism */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-sm shrink-0">
            A
          </div>
          <span className="font-semibold tracking-tight text-sm sm:text-base hidden xs:inline">
            Enterprise Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeDropdownOrganism
            currentTheme={theme}
            onThemeSelect={(tId) => setTheme(tId as any)}
            themes={THEME_OPTIONS}
          />
        </div>
      </header>

      {/* Main Authentication Card - 100% Solid Opaque Background */}
      <div className="@container w-full max-w-md my-auto px-1 sm:px-0">
        <div className="shadow-2xl border border-border bg-card text-card-foreground p-6 sm:p-9 rounded-3xl transition-all space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <AppBadge
              variant="default"
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              className="px-3 py-1 text-xs"
            >
              SSO Security Portal
            </AppBadge>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-card-foreground">
              {t("auth.title")}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("auth.subtitle")}
            </p>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="provider" value="google" />

            <AppButton
              type="submit"
              variant="outline"
              size="lg"
              fullWidth
              iconLayout="responsive"
              isLoading={isSubmitting}
              leftIcon={
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              }
              className="w-full min-h-12 border-border hover:bg-secondary text-card-foreground font-medium rounded-2xl shadow-xs"
            >
              <span>{t("auth.googleSignIn")}</span>
            </AppButton>
          </Form>

          <div className="pt-2 border-t border-border flex items-center justify-center text-xs text-muted-foreground gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{t("auth.secureNotice")}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-muted-foreground py-3">
        © 2026 Admin Portal. Built with Remix, Turborepo &amp; @repo/ui
      </footer>
    </main>
  );
}
