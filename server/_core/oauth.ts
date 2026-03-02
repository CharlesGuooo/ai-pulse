import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import axios from "axios";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

async function exchangeGitHubCode(code: string, redirectUri: string): Promise<GitHubTokenResponse> {
  const response = await axios.post<GitHubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      client_id: ENV.githubClientId,
      client_secret: ENV.githubClientSecret,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: { Accept: "application/json" },
      timeout: 10000,
    }
  );
  return response.data;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await axios.get<GitHubUser>("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    timeout: 10000,
  });
  return response.data;
}

export function registerOAuthRoutes(app: Express) {
  // GitHub OAuth login redirect
  app.get("/api/auth/github", (req: Request, res: Response) => {
    const returnPath = getQueryParam(req, "return") || "/";
    const state = Buffer.from(JSON.stringify({ returnPath })).toString("base64");

    // Determine redirect URI based on request origin
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    const params = new URLSearchParams({
      client_id: ENV.githubClientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
      state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  });

  // GitHub OAuth callback
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      // Determine redirect URI (must match what was sent in the authorization request)
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const redirectUri = `${protocol}://${host}/api/auth/callback`;

      // Exchange code for access token
      const tokenData = await exchangeGitHubCode(code, redirectUri);

      if (!tokenData.access_token) {
        console.error("[GitHub OAuth] No access token received:", tokenData);
        res.status(400).json({ error: "Failed to get access token from GitHub" });
        return;
      }

      // Get GitHub user info
      const githubUser = await getGitHubUser(tokenData.access_token);
      const openId = `github_${githubUser.id}`;

      // Upsert user in our database
      await db.upsertUser({
        openId,
        name: githubUser.name || githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      // Create session JWT
      const sessionToken = await sdk.createSessionToken(openId, {
        name: githubUser.name || githubUser.login,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to return path
      let returnPath = "/";
      if (state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, "base64").toString());
          returnPath = decoded.returnPath || "/";
        } catch {
          returnPath = "/";
        }
      }

      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[GitHub OAuth] Callback failed:", error);
      res.redirect(302, "/login?error=oauth_failed");
    }
  });

  // Keep backward compatibility with old Manus OAuth callback
  app.get("/api/oauth/callback", (req: Request, res: Response) => {
    res.redirect(302, "/login");
  });
}
