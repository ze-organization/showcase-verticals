'use client';
import { useEffect, JSX } from 'react';
import { initContentSdk } from '@sitecore-content-sdk/nextjs';
import { eventsPlugin } from '@sitecore-content-sdk/events';
import { analyticsBrowserAdapter, analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import config from 'sitecore.config';
import {
  markCdpSdkReady,
  registerCdpSiteName,
} from 'src/lib/registry/analytics/cdp-provider';

const Bootstrap = ({
  siteName,
  isPreviewMode,
}: {
  siteName: string;
  isPreviewMode: boolean;
}): JSX.Element | null => {
  const resolvedSiteName = siteName || config.defaultSite;
  registerCdpSiteName(resolvedSiteName);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Browser Events SDK is not initialized in development environment');
      markCdpSdkReady(false);
      return;
    }

    if (isPreviewMode) {
      console.debug('Browser Events SDK is not initialized in edit and preview modes');
      markCdpSdkReady(false);
      return;
    }

    if (!config.api.edge?.clientContextId || !resolvedSiteName) {
      console.error('Client Edge API settings missing from configuration');
      markCdpSdkReady(false);
      return;
    }

    let cancelled = false;
    initContentSdk({
      config: {
        contextId: config.api.edge.clientContextId,
        edgeUrl: config.api.edge.edgeUrl,
        siteName: resolvedSiteName,
      },
      plugins: [
        analyticsPlugin({
          options: {
            enableCookie: true,
            cookieDomain: window.location.hostname.replace(/^www\./, ''),
          },
          adapter: analyticsBrowserAdapter(),
        }),
        eventsPlugin(),
      ],
    })
      .then(() => {
        if (!cancelled) markCdpSdkReady(true);
      })
      .catch((error) => {
        console.error('Browser Events SDK failed to initialize', error);
        if (!cancelled) markCdpSdkReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedSiteName, isPreviewMode]);

  return null;
};

export default Bootstrap;
