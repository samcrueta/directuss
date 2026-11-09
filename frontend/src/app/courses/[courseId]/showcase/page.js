import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdvancedContent } from "@/lib/advancedContent";
import { isUrlReachable } from "@/lib/reachability";
import styles from "./showcase.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const content = await getAdvancedContent(courseId);
  return {
    title: content?.showcase
      ? `Showcase · ${content.section.title}`
      : "Showcase · Advanced"
  };
}

export default async function AdvancedShowcasePage({ params }) {
  const { courseId } = await params;
  const content = await getAdvancedContent(courseId);

  if (!content?.showcase) notFound();

  const { showcase, section, lessons } = content;
  const capstone =
    lessons.find((lesson) => lesson.slug === "capstone-the-showcase") ||
    lessons[lessons.length - 1];
  const online = await isUrlReachable(showcase.healthUrl);
  const provider = showcase.provider || "CMS";

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>{section.title} showcase</h1>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} />
          LUMINA ACADEMY
        </Link>
        <nav className={styles.topLinks}>
          {capstone ? (
            <Link
              href={`/courses/${courseId}/advanced/${capstone.slug}`}
              className={styles.topLink}
            >
              <ArrowLeft size={13} />
              Capstone lesson
            </Link>
          ) : null}
          <Link href={`/courses/${courseId}`} className={styles.topLink}>
            Course curriculum
          </Link>
          <a
            href={showcase.externalUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.topLink}
          >
            Open in {provider} <ExternalLink size={12} />
          </a>
        </nav>
      </header>

      {online ? (
        <iframe
          src={showcase.iframeUrl}
          title={`${section.title} showcase`}
          className={styles.frame}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
        />
      ) : (
        <section className={styles.offline}>
          <h2>{provider} is offline</h2>
          <p>
            The showcase is rendered by {provider} at{" "}
            <code>{showcase.externalUrl}</code>. Start the {provider} server, then
            reload this page.
          </p>
          <a
            href={showcase.externalUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.openButton}
          >
            Try the {provider} showcase <ExternalLink size={13} />
          </a>
        </section>
      )}
    </main>
  );
}
