import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Ry',
  description: 'Building things, mostly in Rust.',
  href: 'https://ryder.rs',
  author: 'Ryder Casazza',
  locale: 'en-US',
  featuredPostCount: 3,
  featuredProjectCount: 3,
  postsPerPage: 5,
  projectsPerPage: 5,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/projects',
    label: 'projects',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/Ryder-C',
    label: 'GitHub',
  },
  {
    href: 'mailto:rydercasazza@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
