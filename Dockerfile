FROM node:16-alpine

WORKDIR /app
COPY .env /app
COPY package*.json /app
RUN yarn install

COPY ./client /app/client
COPY webpack.config.js /app
RUN yarn build

COPY ./server /app/server
CMD [ "node", "./server/index.js" ]
