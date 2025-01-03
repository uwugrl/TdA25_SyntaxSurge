
FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN yarn install && yarn cache clean

COPY src/. src/.
COPY public/. src/.
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY tailwind.config.ts .

RUN chmod +x DockerEntrypoint.sh

RUN yarn prisma generate
RUN yarn build

EXPOSE 80

STOPSIGNAL SIGKILL

ENTRYPOINT [ "/app/DockerEntrypoint.sh" ]
