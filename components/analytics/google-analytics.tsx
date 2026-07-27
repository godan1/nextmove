import Script from "next/script";

/**
 * Google Analytics 4 — free traffic/conversion analytics (pageviews,
 * sources, events). Complements Microsoft Clarity: GA4 answers "how many
 * people, from where, did what," Clarity answers "what did it look like
 * when they did it" (heatmaps + session recordings). Google has no direct
 * heatmap/recording product, hence running both.
 *
 * Renders nothing if NEXT_PUBLIC_GA_MEASUREMENT_ID isn't set, so local dev
 * / forks without a GA4 property don't load the script at all.
 *
 * Set up: create a GA4 property at https://analytics.google.com (free),
 * copy its Measurement ID (starts with "G-", Admin > Data Streams > your
 * stream), add NEXT_PUBLIC_GA_MEASUREMENT_ID=<that id> to .env.local (and
 * to the hosting provider's environment variables for production).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
