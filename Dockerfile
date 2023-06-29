FROM node:18-alpine
RUN apk update && apk add --no-cache git bash
WORKDIR /var/www
COPY src/package.json src/package-lock.json ./src/
RUN cd ./src && npm install
COPY src/ ./
CMD bash -c "cd ./src && npm run dev"