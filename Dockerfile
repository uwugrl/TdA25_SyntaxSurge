
FROM node:20

RUN npm i -g pnpm

WORKDIR /app

COPY package.json .

RUN pnpm i

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 80

VOLUME [ "/app/prisma/data" ]

ENTRYPOINT [ "./DockerEntrypoint.sh" ]
