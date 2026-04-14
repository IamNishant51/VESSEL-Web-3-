import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/agents/", "/forge", "/api/"],
    },
    sitemap: "https://vessel-agent.vercel.app/sitemap.xml",
  };
}