import {
  INSYTIX_ENDPOINT,
  INSYTIX_SCRIPT_URL,
  INSYTIX_TRACKING_ID,
  isInsytixEnabled,
} from "@/config/insytix";

/**
 * Insytix tracking — full dashboard embed before </head> on all pages.
 * Disable sitewide with NEXT_PUBLIC_INSYTIX_ENABLED=false.
 */
export function InsytixScript() {
  if (!isInsytixEnabled()) return null;

  const configInline = `window.__INSYTIX_CONFIG__={trackingId:"${INSYTIX_TRACKING_ID}",endpoint:"${INSYTIX_ENDPOINT}"};`;

  return (
    <>
      <script
        data-no-optimize="1"
        data-cfasync="false"
        dangerouslySetInnerHTML={{ __html: configInline }}
      />
      <meta name="insytix-tracking-id" content={INSYTIX_TRACKING_ID} />
      <meta name="insytix-endpoint" content={INSYTIX_ENDPOINT} />
      <script
        data-no-optimize="1"
        data-cfasync="false"
        defer
        src={INSYTIX_SCRIPT_URL}
        data-tracking-id={INSYTIX_TRACKING_ID}
        data-endpoint={INSYTIX_ENDPOINT}
      />
    </>
  );
}
