'use client';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { useEffect, JSX } from 'react';
import { pageView } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';
import { whenCdpSdkReady } from 'src/lib/registry/analytics/cdp-provider';

/**
 * This is the CDP page view component.
 * See Sitecore Content SDK documentation for details.
 * https://www.npmjs.com/package/@sitecore-content-sdk/events
 */
const CdpPageView = (): JSX.Element => {
  const {
    page: { layout, siteName, mode },
  } = useSitecore();
  const { route, context } = layout.sitecore;

  /**
   * Determines if the page view events should be turned off.
   * IMPORTANT: You should implement based on your cookie consent management solution of choice.
   * By default it is disabled in development mode
   */
  const disabled = () => {
    return process.env.NODE_ENV === 'development';
  };

  useEffect(() => {
    // Do not create events in editing or preview mode or if missing route data
    if (!mode.isNormal || !route?.itemId) {
      return;
    }
    // Do not create events if disabled (e.g. we don't have consent)
    if (disabled()) {
      return;
    }

    const language = route.itemLanguage || config.defaultLanguage;
    const scope = config.personalize?.scope;

    const pageVariantId = CdpHelper.getPageVariantId(
      route.itemId,
      language,
      context.variantId as string,
      scope
    );
    let cancelled = false;
    // Wait until Bootstrap's single init has written the visitor cookie.
    // pageView() before that throws, or sends an empty browser_id.
    whenCdpSdkReady()
      .then((ready) => {
        if (!ready || cancelled) return;
        return pageView({
          channel: 'WEB',
          currency: 'USD',
          page: route.name,
          pageVariantId,
          language,
        });
      })
      .catch((e) => console.debug(e));
    return () => {
      cancelled = true;
    };
  }, [mode, route, context.variantId, siteName]);

  return <></>;
};

export default CdpPageView;
