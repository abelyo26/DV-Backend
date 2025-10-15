FROM node:20-alpine

RUN apk update

RUN apk add --no-cache build-base bash

WORKDIR /app

ADD package.json yarn.lock /app/

RUN yarn

COPY . /app/

EXPOSE 5000

CMD ["yarn", "start:prod"]