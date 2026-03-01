'use strict';

if (process.env.SKIP_PREBUILD === 'true') {
  console.log('prebuild: skipped (SKIP_PREBUILD=true)');
  process.exit(0);
}

const { execSync } = require('child_process');
execSync(
  'node scripts/fetch-cards.js && node scripts/fetch-price-movers.js && node scripts/fetch-videos.js',
  { stdio: 'inherit' },
);
