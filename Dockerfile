FROM node:22-alpine

RUN mkdir -p /node_modules && chown -R node:node /

WORKDIR /opt/SuperVision

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "node", "app.js" ]

EXPOSE 8070
