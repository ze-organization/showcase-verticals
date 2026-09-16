import { wrapSitecoreClient } from "@/lib/registry/with-sitecore";
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

const client = wrapSitecoreClient(new SitecoreClient({
  ...scConfig,
}));

export default client;
