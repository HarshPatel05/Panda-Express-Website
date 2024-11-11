FROM node:18 AS build-react

WORKDIR /react

COPY react/package.json react/package-lock.json ./
RUN npm install

COPY react/ .
RUN npm run build

FROM node:18

WORKDIR /express

COPY express/package.json express/package-lock.json ./
RUN npm install

COPY --from=build-react /app/react/build ./react/build
COPY express/ .

EXPOSE 5000

CMD ["node", "server.js"]