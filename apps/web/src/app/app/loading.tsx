import { Skeleton, SkeletonRows } from '@/components/ui/state';

/**
 * The shape of a workspace screen before its data lands: a header band, a row
 * of figures, and a table. Matched to the real heights so nothing jumps when
 * the content arrives.
 */
export default function WorkspaceLoading(): React.JSX.Element {
  return (
    <>
      <div className="sticky top-0 z-20 shrink-0 border-b border-line-subtle bg-canvas px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <p role="status" className="sr-only">
          Loading this screen
        </p>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2.5 h-6 w-64" />
        <Skeleton className="mt-2.5 h-3.5 w-80 max-w-full" />
      </div>

      <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-[5.5rem] rounded-lg" />
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface p-4">
            <SkeletonRows rows={8} />
          </div>
        </div>
      </div>
    </>
  );
}
