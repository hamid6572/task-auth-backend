FROM alpine:3

WORKDIR /app
COPY . .

RUN apk update
RUN apk add curl
RUN apk add nodejs npm

RUN node -v
RUN npm -v
RUN npm install

CMD ["npm", "run", "start:dev"]
