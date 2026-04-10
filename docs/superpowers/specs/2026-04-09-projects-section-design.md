# Projects Section Design

**Date:** 2026-04-09  
**Status:** Approved

## Overview

Add a personal projects section to the ryfolio Astro portfolio site. This includes a nav link, a paginated listing page, individual project detail pages with optional markdown write-ups, and a "Latest Projects" section on the home page below "Latest Posts".

The existing template already provides: a `projects` content collection with sample entries, a `ProjectCard` component, and a `getAllProjects()` utility. These are reused and extended rather than replaced.

## Architecture

No new collections, layouts, or dependencies are introduced. The feature is additive — new pages, minor schema tweaks, and small updates to existing files.

## Components and Data Flow

### `src/types.ts`
- Add `featuredProjectCount: number` to the `Site` type to support the new config field.

### `src/consts.ts`
- Add `{ href: '/projects', label: 'projects' }` to `NAV_LINKS` (renders in header automatically via the existing nav loop).
- Add `featuredProjectCount: 2` to the `SITE` object (controls how many projects appear on the home page).

### `src/content.config.ts`
- Change `image: image()` to `image: image().optional()` in the `projects` schema. Currently required, which would force every project to have an image. Detail pages must work without one.

### `src/lib/data-utils.ts`
- Add `getRecentProjects(count: number)` — calls `getAllProjects()` and returns `slice(0, count)`. Mirrors the existing `getRecentPosts` pattern exactly.

### `src/components/project-card.astro`
- Change the `<Link>` href from the external `project.data.link` to the internal `/projects/${project.id}`.
- Remove the `external` prop from the link.
- The external URL is now only surfaced on the detail page.

### `src/pages/projects/[...page].astro` *(new)*
- Paginated listing of all projects using `getStaticPaths` + `paginate`.
- Uses `SITE.postsPerPage` for page size (no new config needed).
- Breadcrumbs: Projects > Page N (matches blog listing pattern).
- Flat list of `ProjectCard` components — no year grouping.
- `PaginationComponent` at the bottom.

### `src/pages/projects/[...id].astro` *(new)*
- Individual project detail page generated from the `projects` collection.
- Breadcrumbs: Projects > [project name].
- Header block: name, description, date range, tags, external link button (opens `project.data.link`).
- Optional banner image (only rendered if `project.data.image` is present).
- Optional markdown body: rendered via `render(entry)` from `astro:content`. A `<Separator>` is shown before the body only when body content exists. The `prose` typography styles (already present via `typography.css`) are applied to the rendered content.

### `src/pages/index.astro`
- Import `ProjectCard` and `getRecentProjects`.
- Add a "Latest projects" `<section>` below the existing "Latest posts" section.
- Renders `featuredProjectCount` projects as a flat `<ul>` of `ProjectCard`s.
- "See all projects →" link button below the list, matching the existing "See all posts" button style.

## Error Handling

No special error handling required. Astro's static generation will fail at build time if content is malformed — this is the correct behavior for a static site.

## Testing

Manual verification:
- Home page shows "Latest projects" section with correct count.
- Nav header shows "projects" link.
- `/projects` listing paginates correctly.
- `/projects/[id]` renders metadata, image (when present), and markdown body (when present).
- Projects without images and without body content render cleanly.
- External link button on detail page opens the correct URL.
