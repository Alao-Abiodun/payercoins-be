FROM node:latest
RUN mkdir -p /usr/app/payercoinsbackend
WORKDIR /usr/app/payercoinsbackend
COPY package.json /usr/app/payercoinsbackend/
RUN npm install
COPY . /usr/app/payercoinsbackend/
EXPOSE 8888
CMD [ "npm", "run", "start" ]