
# Stage 1: Build the application with Vite
FROM node:20-bullseye-slim as builder

# copy package.json and package-lock.json
COPY ./vanilla/package.json ./vanilla/package-lock.json /app/src/
# copy app source code
COPY ./vanilla /app/src

WORKDIR /app/src

# install npm 10.2.5
RUN npm install -g npm@10.2.5
# install dependencies (just vite)
RUN npm install
# build and optimize with vite
RUN npm run build


# Stage 2: Serve the application with NGINX
FROM nginx:alpine

# install tini
RUN apk update && apk add tini

# copy nginx config to serve spa
COPY config/default.conf /etc/nginx/conf.d/default.conf
# copy dist folder which contains the built application
COPY --from=builder /app/src/dist /usr/share/nginx/html
# copy public folder which contains static files (images, fonts, etc.)
COPY --from=builder /app/src/public /usr/share/nginx/html/public

EXPOSE 8033

# use tini to handle zombie processes
ENTRYPOINT [ "tini", "--"]

# start nginx
CMD ["nginx", "-g", "daemon off;"]
