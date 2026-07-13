import { ReactNode } from "react";

/**
 * Translation-safe text wrapper.
 *
 * Why two spans? Google Translate replaces text nodes inside an element
 * when it translates the page. If React later tries to update the same node
 * (state change → re-render), it can't find the original text and throws
 * "Failed to execute 'removeChild' on 'Node'". The outer span is what React
 * manages; the inner span is what Google rewrites. They don't fight.
 *
 * Wrap any user-visible dynamic text in <T>:
 *   <T>{product.name}</T>
 *   <T>{`Welcome, ${user.name}`}</T>
 *
 * Static literal text in JSX usually doesn't need this, but using it
 * consistently is harmless and future-proof.
 */
export default function T({ children }: { children: ReactNode }) {
  return (
    <span>
      <span>{children}</span>
    </span>
  );
}
