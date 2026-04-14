import { MetadataRoute } from "next";

const BASE_URL = "https://vessel-agent.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/agents`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/marketplace`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/forge`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/preview`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  return staticPages;
}