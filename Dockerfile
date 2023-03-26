FROM node:16-alpine3.16 as dev

RUN mkdir -p /usr/src/app/

WORKDIR /usr/src/app/
COPY package.json .

RUN npm config set legacy-peer-deps true
RUN npm install

COPY . .

RUN npm run build

FROM node:16-alpine3.16 as prod

RUN mkdir -p /usr/src/app/

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=9000
ENV MYSQL_HOST=lu_db
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=lusine
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=root

WORKDIR /usr/src/app/

COPY package.json .

RUN npm config set legacy-peer-deps true
RUN npm install --production

COPY . .

COPY --from=dev /usr/src/app/dist/ ./dist/

CMD ["node", "dist/main"]