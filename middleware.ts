import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Protected routes - all routes under (app) route group
// Include locale prefix in patterns
const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/properties(.*)",
  "/:locale/profile(.*)",
  "/:locale/onboarding(.*)",
  "/:locale/deals(.*)",
  "/:locale/chat(.*)",
  "/:locale/clients(.*)",
  "/:locale/settings(.*)",
  "/:locale/analytics(.*)",
  "/:locale/feed(.*)",
  "/:locale/search(.*)",
  "/:locale/providers(.*)",
  "/:locale/accounting(.*)",
  "/:locale/appraisal(.*)",
  "/:locale/legal(.*)",
  "/:locale/mortgage(.*)",
  "/:locale/notary(.*)",
  "/:locale/leads(.*)",
  "/:locale/tax(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
