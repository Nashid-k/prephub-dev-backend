FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production --no-audit --no-fund
COPY . .
EXPOSE 6001
CMD ["node", "index.js"]
