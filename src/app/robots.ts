import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/customer/"], // Prevents indexing of admin/customer areas
    },
    sitemap: "https://mydiveskydiving.com/sitemap.xml",
  };
}
