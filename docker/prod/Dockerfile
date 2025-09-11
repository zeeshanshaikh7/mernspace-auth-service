FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine as production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 5501

USER node

CMD ["node", "dist/server.js"]
