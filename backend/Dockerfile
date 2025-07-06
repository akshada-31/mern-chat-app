FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY backend ./backend
COPY backend/.env ./backend/.env

EXPOSE 5001
CMD ["npm", "start"]
