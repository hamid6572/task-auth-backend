FROM alpine:3


ARG NODE_ENV=dev
ENV NODE_ENV=${NODE_ENV}
COPY . .

RUN apk update
RUN apk add curl
RUN apk add nodejs npm
RUN npm install -g typescript

RUN if [ "$NODE_ENV" = "prod" ]; then \
      npm ci; \
    else \
      npm install; \
    fi

CMD tsc;\ 
    npm run typeorm migration:run -- -d dist/typeOrm.config.js;\ 
    if [ "$NODE_ENV" = "prod" ]; then \
      npm run start:prod; \
    else \
      npm run start:dev; \
    fi
