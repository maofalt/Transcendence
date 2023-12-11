
# Stage 1: Build the React application
FROM node:19-bullseye-slim as builder

COPY ./react-app/package.json ./react-app/package-lock.json /app/src/
COPY ./react-app /app/src
WORKDIR /app/src
RUN npm install
RUN npm run build
# RUN mkdir build
# Stage 2: Serve the application with NGINX
FROM nginx:alpine

# install tini
RUN apk update && apk add tini

COPY --from=builder /app/src/dist /usr/share/nginx/html
# COPY ./config/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8033
ENTRYPOINT [ "tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
