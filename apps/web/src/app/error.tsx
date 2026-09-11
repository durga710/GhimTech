"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container page-intro">
      <p className="eyebrow">Something went wrong</p>
      <h1>Let’s try that again.</h1>
      <p>This page couldn’t load. You can retry without leaving the site.</p>
      <button className="button" onClick={reset}>
        Try again ↗
      </button>
    </section>
  );
}
