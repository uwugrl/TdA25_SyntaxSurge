
FROM node:20

WORKDIR /app

COPY package.json .

RUN yarn install && yarn cache clean

COPY sentry.client.config.ts .
COPY sentry.edge.config.ts .
COPY sentry.server.config.ts .
COPY DockerEntrypoint.sh .
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY tailwind.config.ts .
COPY public/. src/.
COPY prisma/. prisma/.
COPY src/. src/.

RUN chmod +x DockerEntrypoint.sh

RUN yarn prisma generate
RUN yarn build

EXPOSE 80

STOPSIGNAL SIGKILL

ENTRYPOINT [ "/app/DockerEntrypoint.sh" ]
