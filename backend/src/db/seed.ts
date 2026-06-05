import '../loadEnv';
import { db, pool } from './index';
import { aiAnalyses, comments, issues } from './schema';

async function seed() {
  console.log('Seeding database...');

  await db.delete(aiAnalyses);
  await db.delete(comments);
  await db.delete(issues);

  const [issue1] = await db
    .insert(issues)
    .values({
      title: 'Login page crashes on mobile Safari',
      description:
        'When users tap the login button on iOS Safari (versions 16+), the page freezes and then reloads with a blank screen. Reproducible on iPhone 13 and 14. Works fine on Chrome mobile and desktop browsers.',
      status: 'open',
      priority: 'critical',
      label: 'bug',
    })
    .returning();

  const [issue2] = await db
    .insert(issues)
    .values({
      title: 'Add dark mode support',
      description:
        'Users have requested a dark theme option across the application. Should support system preference detection and a manual toggle in user settings. All components need to be audited for contrast compliance.',
      status: 'in_progress',
      priority: 'medium',
      label: 'feature',
    })
    .returning();

  const [issue3] = await db
    .insert(issues)
    .values({
      title: 'Performance degradation on search with 1000+ results',
      description:
        'The global search endpoint takes 8-12 seconds to respond when the result set exceeds 1000 items. Pagination exists but the initial count query and full-text scan appear to be the bottleneck. Needs indexing review.',
      status: 'open',
      priority: 'high',
      label: 'improvement',
    })
    .returning();

  const [issue4] = await db
    .insert(issues)
    .values({
      title: 'Update API documentation for v2 endpoints',
      description:
        'Several v2 endpoints were shipped last sprint but the public API docs still reference v1 paths and schemas. Need to update OpenAPI spec, add migration guide, and deprecate notices for removed fields.',
      status: 'resolved',
      priority: 'low',
      label: 'question',
    })
    .returning();

  const [issue5] = await db
    .insert(issues)
    .values({
      title: 'Users cannot reset password via email link',
      description:
        'Password reset emails are delivered successfully, but clicking the link returns a 404 error. Token validation endpoint appears to reject valid tokens generated within the last hour. Affects all users on production.',
      status: 'open',
      priority: 'high',
      label: 'bug',
    })
    .returning();

  await db.insert(comments).values([
    {
      issueId: issue1.id,
      author: 'Sarah Chen',
      content:
        'I can reproduce this consistently on my iPhone 14 Pro running iOS 17.2. Happens every time I use autofill for credentials.',
    },
    {
      issueId: issue1.id,
      author: 'Marcus Webb',
      content:
        'Checked Safari Web Inspector — seeing an unhandled TypeError in the form validation script. Likely related to the password visibility toggle.',
    },
    {
      issueId: issue1.id,
      author: 'Priya Patel',
      content:
        'This is blocking our mobile QA sign-off. Can we hotfix the validation script or disable autofill temporarily?',
    },
    {
      issueId: issue1.id,
      author: 'Alex Rivera',
      content:
        'Confirmed the crash does not occur in Safari Technology Preview. Might be a WebKit-specific regression introduced in the last deploy.',
    },

    {
      issueId: issue2.id,
      author: 'Jordan Lee',
      content:
        'I have a working prototype using CSS variables and prefers-color-scheme. PR is ready for review on the design-system branch.',
    },
    {
      issueId: issue2.id,
      author: 'Emily Foster',
      content:
        'Design team finalized the dark palette. All colors meet WCAG AA contrast ratios. Figma link is in the project wiki.',
    },
    {
      issueId: issue2.id,
      author: 'David Kim',
      content:
        'The settings page toggle is done. Still need to update the issue list, detail view, and comment section components.',
    },
    {
      issueId: issue2.id,
      author: 'Sarah Chen',
      content:
        'Can we persist the user preference in localStorage as a fallback before the backend settings API is ready?',
    },

    {
      issueId: issue3.id,
      author: 'Marcus Webb',
      content:
        'EXPLAIN ANALYZE shows a sequential scan on the issues table for the search query. A GIN index on the title and description columns should help significantly.',
    },
    {
      issueId: issue3.id,
      author: 'Priya Patel',
      content:
        'We should also cap the initial response to 50 results and lazy-load the count. Users rarely scroll past the first page anyway.',
    },
    {
      issueId: issue3.id,
      author: 'Alex Rivera',
      content:
        'Staging environment with 50k records shows 2.1s response after adding the index. Still above our 500ms target but much improved.',
    },
    {
      issueId: issue3.id,
      author: 'Jordan Lee',
      content:
        'Consider caching frequent search queries in Redis. The top 20 search terms account for 60% of traffic according to analytics.',
    },
    {
      issueId: issue3.id,
      author: 'David Kim',
      content:
        'I will draft a migration for the GIN index and open a PR by end of day. Need DBA review before running on production.',
    },

    {
      issueId: issue4.id,
      author: 'Emily Foster',
      content:
        'The v2 /api/issues endpoint now returns nested comment objects. Old docs show flat comment_id references. Updated the changelog section.',
    },
    {
      issueId: issue4.id,
      author: 'Sarah Chen',
      content:
        'Added a migration guide with before/after examples for the three most common integration patterns. Feedback from two partner teams was positive.',
    },
    {
      issueId: issue4.id,
      author: 'Marcus Webb',
      content:
        'Swagger UI is updated and deployed to docs.ourapp.dev. Closing this out unless anyone has objections.',
    },

    {
      issueId: issue5.id,
      author: 'Priya Patel',
      content:
        'Users report the reset link URL points to /reset-password?token=... but our route is /auth/reset-password. Possible path mismatch from the email template.',
    },
    {
      issueId: issue5.id,
      author: 'Alex Rivera',
      content:
        'Found it — the email template was not updated when we moved auth routes under /auth. The token itself validates fine when hitting the correct endpoint manually.',
    },
    {
      issueId: issue5.id,
      author: 'Jordan Lee',
      content:
        'Also seeing expired tokens not returning a helpful error message. Users just get a generic 404. We should return 410 Gone with a "request new link" CTA.',
    },
    {
      issueId: issue5.id,
      author: 'David Kim',
      content:
        'Hotfix PR #847 updates the email template URL. Deploying to staging now for verification before production rollout.',
    },
    {
      issueId: issue5.id,
      author: 'Emily Foster',
      content:
        'Support team confirmed 23 tickets in the last 48 hours related to this. Please prioritize the hotfix for today\'s release window.',
    },
  ]);

  console.log('Seed complete:');
  console.log(`  - 5 issues created`);
  console.log(`  - 21 comments created`);
  console.log(`  - 0 AI analyses (generated on demand)`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
