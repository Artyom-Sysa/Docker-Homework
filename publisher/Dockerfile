FROM node:alpine AS build

WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc

FROM node:alpine AS final
COPY --from=build /src .
CMD [ "node", "./build/index.js" ]