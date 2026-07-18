import Script from "next/script";

/**
 * Microsoft Clarity — free, unlimited heatmaps + session recordings +
 * basic analytics dashboard (clarity.microsoft.com). Renders nothing if
 * NEXT_PUBLIC_CLARITY_PROJECT_ID isn't set, so local dev / forks without
 * a Clarity project don't load the script at all.
 *
 * Set up: create a project at https://clarity.microsoft.com (free), copy
 * its Project ID (Settings > Overview), add
 * NEXT_PUBLIC_CLARITY_PROJECT_ID=<that id> to .env.local (and to the
 * hosting provider's environment variables for production).
 */
export function ClarityAnalytics() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
