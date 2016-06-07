FROM node:latest
MAINTAINER Roman Volkov
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY bower.json /usr/src/app/
COPY .bowerrc /usr/src/app/

# Bundle app source
RUN mkdir -p /usr/src/app/app_node
RUN mkdir -p /usr/src/app/public
COPY ./app_node /usr/src/app/app_node
COPY ./public /usr/src/app/public
COPY www /usr/src/app/

# install modules
RUN npm install

EXPOSE 3001

CMD [ "npm", "start" ]
