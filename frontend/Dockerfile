FROM node:18 as build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
