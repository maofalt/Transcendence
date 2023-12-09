
# Stage 1: Build the React application
FROM node:latest as builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY ./react-srcs ./src
RUN npm run build

# Stage 2: Serve the application with NGINX
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8033
ENTRYPOINT [ "tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
