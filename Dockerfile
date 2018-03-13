FROM node:8

ENV DB_URI mongodb://bizumie-mongo/bizumie-production
ENV NPM_CONFIG_LOGLEVEL warn
ENV PORT 80

EXPOSE $PORT
VOLUME /opt/bizumie/public/uploads

WORKDIR /opt/bizumie
COPY package.json package-lock.json ./
RUN npm install
COPY . .

CMD npm start
