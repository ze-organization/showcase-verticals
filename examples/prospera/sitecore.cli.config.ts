import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';

import { mapGenerator } from '@/lib/registry/component-map-template';
export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSites(),
      extractFiles(),
      writeImportMap({
        paths: ['src/components'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    exclude: [
      'src/components/content-sdk/*',
      'src/components/registry/primitives/**',
      'src/components/registry/experiences/**',
      'src/components/registry/graphics/**',
      'src/components/registry/blocks/**',
      'src/components/registry/components/models/**',
      // Verticals leftover — the live rendering is page-details/destination-details.
      'src/components/registry/components/unfinished/destination-details.tsx',
    ],
    generator: mapGenerator,
    includeVariants: true,
  },
});
