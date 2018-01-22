FROM node:8

ENV PORT 80
EXPOSE $PORT
ENV NPM_CONFIG_LOGLEVEL warn

COPY package.json package-lock.json ./
RUN npm install

COPY . .
CMD npm start
