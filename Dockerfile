FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"] 