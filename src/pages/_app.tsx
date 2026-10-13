import type { AppProps } from "next/app";
import "@/app/globals.css";
import { ContextualPopupProvider } from "@/components/popups/ContextualPopupProvider";

/** Minimal Pages Router shell for legacy WordPress /page/N archive URLs only */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextualPopupProvider>
      <Component {...pageProps} />
    </ContextualPopupProvider>
  );
}
