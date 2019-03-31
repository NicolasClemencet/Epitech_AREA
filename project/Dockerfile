FROM node:11
COPY . .
RUN apt-get update
RUN apt-get install -y apt-transport-https
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install