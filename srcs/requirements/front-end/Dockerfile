
# Stage 1: Build the React application
FROM node:20-bullseye-slim as builder

COPY ./react-app/package.json ./react-app/package-lock.json /app/src/
COPY ./react-app /app/src

WORKDIR /app/src

RUN npm install -g npm@10.2.5
RUN npm install
RUN npm run build


# Stage 2: Serve the application with NGINX
FROM nginx:alpine

# install tini
RUN apk update && apk add tini

COPY --from=builder /app/src/dist /usr/share/nginx/html
COPY --from=builder /app/src/assets /usr/share/nginx/html/assets
COPY --from=builder /app/src/public /usr/share/nginx/html/public

EXPOSE 8033

ENTRYPOINT [ "tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
