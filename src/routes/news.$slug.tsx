import { createFileRoute, redirect } from "@tanstack/react-router";

// Old links used /news/<slug>; the real article route is /article/<slug>.
// Permanently redirect so shared/bookmarked links keep working.
export const Route = createFileRoute("/news/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/article/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
});