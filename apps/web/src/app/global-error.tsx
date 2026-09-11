"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "sans-serif",
          padding: "10vw",
          background: "#f5f3ed",
          color: "#202722",
        }}
      >
        <h1>This page couldn’t load.</h1>
        <p>Please try again.</p>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
