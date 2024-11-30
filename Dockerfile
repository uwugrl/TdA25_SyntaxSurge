
FROM node:20

RUN npm i -g pnpm

WORKDIR /app

COPY package.json .

RUN pnpm i

COPY . .

RUN chmod +x DockerEntrypoint.sh

RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 80

VOLUME [ "/app/prisma/data" ]

ENTRYPOINT [ "/app/DockerEntrypoint.sh" ]
