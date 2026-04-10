# Projects Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personal projects section with a nav link, paginated listing page, individual detail pages with optional markdown write-ups, and a "Latest Projects" section on the home page.

**Architecture:** Additive changes only — no new collections, layouts, or dependencies. Reuses existing `ProjectCard`, `getAllProjects()`, and collection schema. Two new pages are created following the blog page patterns exactly.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, shadcn/ui, astro:content glob loader

> **Note on testing:** This is a static Astro site with no test runner. Verification steps use `pnpm build` (catches type errors and build failures) and `pnpm dev` (visual browser check). Run `pnpm build` from `/home/ryder/Code/ryfolio`.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/types.ts` | Add `featuredProjectCount` to `Site` type |
| Modify | `src/consts.ts` | Add nav link and `featuredProjectCount` to `SITE` |
| Modify | `src/content.config.ts` | Make `image` optional in projects schema |
| Modify | `src/lib/data-utils.ts` | Add `getRecentProjects(count)` |
| Modify | `src/components/project-card.astro` | Link to internal detail page instead of external URL |
| Create | `src/pages/projects/[...page].astro` | Paginated project listing |
| Create | `src/pages/projects/[...id].astro` | Individual project detail page |
| Modify | `src/pages/index.astro` | Add "Latest projects" section |

---

## Task 1: Foundation — types, config, schema

**Files:**
- Modify: `src/types.ts`
- Modify: `src/consts.ts`
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add `featuredProjectCount` to the `Site` type**

  In `src/types.ts`, add the field after `featuredPostCount`:

  ```typescript
  export type Site = {
    title: string
    description: string
    href: string
    author: string
    locale: string
    featuredPostCount: number
    featuredProjectCount: number  // add this line
    postsPerPage: number
  }
  ```

- [ ] **Step 2: Add nav link and config value to `src/consts.ts`**

  Add `featuredProjectCount: 2` to the `SITE` object after `featuredPostCount`:

  ```typescript
  export const SITE: Site = {
    title: 'Ryfolio',
    description:
      'astro-erudite is a opinionated, unstyled blogging template—built with Astro, Tailwind, and shadcn/ui.',
    href: 'https://astro-erudite.vercel.app',
    author: 'Ryder-C',
    locale: 'en-US',
    featuredPostCount: 2,
    featuredProjectCount: 2,
    postsPerPage: 3,
  }
  ```

  Add the projects nav link to `NAV_LINKS` (between blog and about):

  ```typescript
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
  ```

- [ ] **Step 3: Make `image` optional in the projects schema**

  In `src/content.config.ts`, change line 43:

  ```typescript
  // Before:
  image: image(),

  // After:
  image: image().optional(),
  ```

- [ ] **Step 4: Verify build passes**

  Run: `pnpm build`
  Expected: Build completes without TypeScript errors.

---

## Task 2: Add `getRecentProjects` utility

**Files:**
- Modify: `src/lib/data-utils.ts`

- [ ] **Step 1: Add `getRecentProjects` after `getRecentPosts`**

  In `src/lib/data-utils.ts`, add after the `getRecentPosts` function (after line 121):

  ```typescript
  export async function getRecentProjects(
    count: number,
  ): Promise<CollectionEntry<'projects'>[]> {
    const projects = await getAllProjects()
    return projects.slice(0, count)
  }
  ```

- [ ] **Step 2: Verify build passes**

  Run: `pnpm build`
  Expected: No errors.

---

## Task 3: Update `ProjectCard` to link internally

**Files:**
- Modify: `src/components/project-card.astro`

The card currently links to `project.data.link` (external). Change it to link to the internal detail page. The external link moves to the detail page.

- [ ] **Step 1: Update the `<Link>` in `project-card.astro`**

  Replace the `<Link>` opening tag (lines 19–23):

  ```astro
  // Before:
  <Link
    href={project.data.link}
    class="flex flex-col gap-4 sm:flex-row"
    external
  >

  // After:
  <Link
    href={`/projects/${project.id}`}
    class="flex flex-col gap-4 sm:flex-row"
  >
  ```

- [ ] **Step 2: Verify build passes**

  Run: `pnpm build`
  Expected: No errors.

---

## Task 4: Create the paginated projects listing page

**Files:**
- Create: `src/pages/projects/[...page].astro`

Follows the exact same pattern as `src/pages/blog/[...page].astro` but without year grouping.

- [ ] **Step 1: Create `src/pages/projects/[...page].astro`**

  ```astro
  ---
  import Breadcrumbs from '@/components/breadcrumbs.astro'
  import PageHead from '@/components/page-head.astro'
  import ProjectCard from '@/components/project-card.astro'
  import PaginationComponent from '@/components/ui/pagination'
  import { SITE } from '@/consts'
  import Layout from '@/layouts/layout.astro'
  import { getAllProjects } from '@/lib/data-utils'
  import type { PaginateFunction } from 'astro'

  export async function getStaticPaths({
    paginate,
  }: {
    paginate: PaginateFunction
  }) {
    const allProjects = await getAllProjects()
    return paginate(allProjects, { pageSize: SITE.postsPerPage })
  }

  const { page } = Astro.props
  ---

  <Layout class="max-w-3xl">
    <PageHead slot="head" title="Projects" />
    <Breadcrumbs
      items={[
        { label: 'Projects', href: '/projects', icon: 'lucide:folder-open' },
        { label: `Page ${page.currentPage}`, icon: 'lucide:folder' },
      ]}
    />

    <div class="flex min-h-[calc(100vh-18rem)] flex-col gap-y-4">
      <ul class="flex flex-col gap-4">
        {
          page.data.map((project) => (
            <li>
              <ProjectCard project={project} />
            </li>
          ))
        }
      </ul>
    </div>

    <PaginationComponent
      currentPage={page.currentPage}
      totalPages={page.lastPage}
      baseUrl="/projects/"
      client:load
    />
  </Layout>
  ```

- [ ] **Step 2: Verify build passes**

  Run: `pnpm build`
  Expected: No errors. `/projects` and `/projects/2` etc. are generated.

- [ ] **Step 3: Visual check**

  Run: `pnpm dev`, navigate to `http://localhost:4321/projects`
  Expected: Flat list of project cards, pagination controls at bottom, breadcrumbs at top.

---

## Task 5: Create the project detail page

**Files:**
- Create: `src/pages/projects/[...id].astro`

Simpler than the blog detail page — no TOC, no subposts, no navigation between projects. Shows metadata header, optional image, optional markdown body.

- [ ] **Step 1: Create `src/pages/projects/[...id].astro`**

  ```astro
  ---
  import Breadcrumbs from '@/components/breadcrumbs.astro'
  import Link from '@/components/link.astro'
  import PageHead from '@/components/page-head.astro'
  import { Badge } from '@/components/ui/badge'
  import { buttonVariants } from '@/components/ui/button'
  import { Separator } from '@/components/ui/separator'
  import Layout from '@/layouts/layout.astro'
  import { getAllProjects } from '@/lib/data-utils'
  import { formatDate } from '@/lib/utils'
  import { Icon } from 'astro-icon/components'
  import { Image } from 'astro:assets'
  import { render } from 'astro:content'

  export async function getStaticPaths() {
    const projects = await getAllProjects()
    return projects.map((project) => ({
      params: { id: project.id },
      props: project,
    }))
  }

  const project = Astro.props
  const { Content } = await render(project)
  const hasBody = project.body && project.body.trim().length > 0
  ---

  <Layout class="max-w-3xl">
    <PageHead slot="head" title={project.data.name} />
    <section class="flex flex-col gap-y-6">
      <Breadcrumbs
        items={[
          { label: 'Projects', href: '/projects', icon: 'lucide:folder-open' },
          { label: project.data.name, icon: 'lucide:folder' },
        ]}
      />

      {
        project.data.image && (
          <Image
            src={project.data.image}
            alt={project.data.name}
            width={1200}
            height={630}
            class="w-full rounded-lg object-cover"
          />
        )
      }

      <div class="flex flex-col gap-y-3">
        <h1 class="text-3xl font-medium leading-tight">{project.data.name}</h1>
        <p class="text-muted-foreground">{project.data.description}</p>

        {
          project.data.startDate && (
            <p class="text-muted-foreground flex items-center gap-x-1.5 text-sm">
              <Icon name="lucide:calendar" class="size-4" />
              <span>
                {formatDate(project.data.startDate)}
                {project.data.endDate
                  ? ` → ${formatDate(project.data.endDate)}`
                  : ' → Present'}
              </span>
            </p>
          )
        }

        {
          project.data.tags && project.data.tags.length > 0 && (
            <div class="flex flex-wrap gap-2">
              {project.data.tags.map((tag: string) => (
                <Badge variant="muted">{tag}</Badge>
              ))}
            </div>
          )
        }

        <div>
          <Link
            href={project.data.link}
            external
            class={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Icon name="lucide:external-link" class="mr-2 size-4" />
            View Project
          </Link>
        </div>
      </div>

      {
        hasBody && (
          <>
            <Separator />
            <article class="prose max-w-none">
              <Content />
            </article>
          </>
        )
      }
    </section>
  </Layout>
  ```

- [ ] **Step 2: Verify build passes**

  Run: `pnpm build`
  Expected: No errors. `/projects/project-a` etc. are generated.

- [ ] **Step 3: Visual check — project without body**

  Run: `pnpm dev`, navigate to `http://localhost:4321/projects/project-a`
  Expected: Name, description, dates, tags, "View Project" button. No separator or body section.

- [ ] **Step 4: Visual check — project with body**

  Add some markdown body content to `src/content/projects/project-a.md` below the frontmatter (e.g., `## About\n\nThis is a test.`), then check `http://localhost:4321/projects/project-a`.
  Expected: Separator appears, markdown renders below it with prose styles.
  Revert the test content after verifying.

---

## Task 6: Add "Latest Projects" section to home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add imports to `src/pages/index.astro`**

  Add `ProjectCard` and `getRecentProjects` to the imports at the top of the frontmatter:

  ```astro
  ---
  import BlogCard from '@/components/blog-card.astro'
  import ProjectCard from '@/components/project-card.astro'
  import Link from '@/components/link.astro'
  import PageHead from '@/components/page-head.astro'
  import { buttonVariants } from '@/components/ui/button'
  import { SITE } from '@/consts'
  import Layout from '@/layouts/layout.astro'
  import { getRecentPosts, getRecentProjects } from '@/lib/data-utils'

  const blog = await getRecentPosts(SITE.featuredPostCount)
  const projects = await getRecentProjects(SITE.featuredProjectCount)
  ---
  ```

- [ ] **Step 2: Add "Latest projects" section below "Latest posts"**

  After the closing `</section>` of the "Latest posts" section (after line 84), add:

  ```astro
  <section class="flex flex-col gap-y-4">
    <h2 class="text-2xl font-medium">Latest projects</h2>
    <ul class="flex flex-col gap-y-4">
      {
        projects.map((project) => (
          <li>
            <ProjectCard project={project} />
          </li>
        ))
      }
    </ul>
    <div class="flex justify-center">
      <Link
        href="/projects"
        class={buttonVariants({ variant: 'ghost' }) + ' group'}
      >
        See all projects <span
          class="ml-1.5 transition-transform group-hover:translate-x-1"
          >&rarr;</span
        >
      </Link>
    </div>
  </section>
  ```

- [ ] **Step 3: Verify build passes**

  Run: `pnpm build`
  Expected: No errors.

- [ ] **Step 4: Visual check**

  Run: `pnpm dev`, navigate to `http://localhost:4321`
  Expected:
  - "Latest posts" section shows 2 posts (unchanged)
  - "Latest projects" section shows 2 projects below it
  - "See all projects →" link navigates to `/projects`
  - Nav header shows: blog · projects · about
