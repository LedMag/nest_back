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

WORKDIR /usr/src/app/

COPY package.json .

RUN npm config set legacy-peer-deps true
RUN npm install --production

COPY . .

COPY --from=dev /usr/src/app/dist/ ./dist/

CMD ["node", "dist/main"]