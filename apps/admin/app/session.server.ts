import { createCookie, redirect } from "@remix-run/node";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export const sessionCookie = createCookie("admin_session", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60, // 7 days
});

export async function getAdminUser(request: Request): Promise<AdminUser | null> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  if (!session || !session.user) {
    return null;
  }
  return session.user;
}

export async function requireAdminUser(request: Request): Promise<AdminUser> {
  const user = await getAdminUser(request);
  if (!user) {
    throw redirect("/auth");
  }
  return user;
}
