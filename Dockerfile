FROM node:8

ENV PORT 80
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production

EXPOSE $PORT
VOLUME /opt/bizumie/public/uploads

WORKDIR /opt/bizumie
COPY package.json package-lock.json ./
RUN npm install
COPY . .

CMD npm start
