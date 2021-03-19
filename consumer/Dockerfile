FROM node:alpine AS build

WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . ./
RUN npx tsc
CMD [ "node", "./build/index.js" ]
