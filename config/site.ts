export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Safely",
  description: "A simple SAFE generator",
  url: "https://safe-ly.vercel.app", // Don't end with a slash /
  ogImage: "https://safe-ly.vercel.app/opengraph-image",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
  links: {
    twitter: "https://twitter.com/alanaagoyal",
    github: "https://github.com/alanagoyal",
  },
}
