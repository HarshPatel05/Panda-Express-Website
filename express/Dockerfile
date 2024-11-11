FROM node:18

COPY express/package.json express/package-lock.json ./

RUN npm install

COPY express/ .

EXPOSE 5000

CMD ["node", "server.js"]
