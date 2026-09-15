FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080
ENV VUE_APP_PROXY_TARGET=http://host.docker.internal:3000

# Start the app
CMD ["npm","run", "serve"]

