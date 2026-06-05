import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/u/"],
      disallow: ["/dashboard", "/edit", "/login", "/signup", "/claim", "/auth"],
    },
    host: SITE_URL,
  };
}
