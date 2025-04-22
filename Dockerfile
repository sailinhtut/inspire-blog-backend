FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent

# Copy the build and environment files
COPY build ./build
COPY .env ./.env

# Create the storage directories
RUN mkdir -p storage/temp storage/backup storage/logs storage/private storage/public

EXPOSE 5000
CMD ["npm", "start"]
