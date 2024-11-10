
FROM node:20

WORKDIR /app

COPY package.json .

RUN npm i

COPY src/. src/
COPY public/. public/
COPY .eslintrc.json .
COPY next.config.ts .
COPY postcss.config.mjs .
COPY tailwind.config.ts .
COPY tsconfig.json .

RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
