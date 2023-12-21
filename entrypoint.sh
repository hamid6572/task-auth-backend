#!/bin/bash
ls
tsc;\ 
npm run typeorm migration:run -- -d dist/typeOrm.config.js;\ 
if [ "$NODE_ENV" = "prod" ]; then \
    npm run start:prod; \
else \
    npm run start:dev; \
fi