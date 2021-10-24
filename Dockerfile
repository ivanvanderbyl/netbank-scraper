FROM node:12 as builder

RUN mkdir /srv/workspace && chown node:node /srv/workspace
USER node
WORKDIR /srv/workspace
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --quiet

COPY . .

RUN yarn build
FROM node:12-alpine
ENV NODE_ENV=production

RUN mkdir /app && chown node:node /app
WORKDIR /app
RUN apk add --update git && rm -rf /var/cache/apk/*

USER node
COPY --from=builder /srv/workspace/package.json /srv/workspace/yarn.lock /tmp/
RUN cd /tmp && yarn install --production
RUN cp -a /tmp/node_modules /tmp/package.json /tmp/yarn.lock /app/

COPY --from=builder /srv/workspace/dist /app/

EXPOSE 5000
CMD [ "yarn", "start" ]
