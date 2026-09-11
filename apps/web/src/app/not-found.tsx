import { PageIntro, Action } from "@/components/primitives";
export default function NotFound() {
  return (
    <PageIntro label="404 / Page not found" title="This path ends here.">
      <p>The page may have moved, or the address may be incomplete.</p>
      <Action href="/">Back to GhimTech</Action>
    </PageIntro>
  );
}
