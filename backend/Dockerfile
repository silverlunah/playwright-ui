FROM mcr.microsoft.com/playwright:v1.41.1
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npx playwright install --with-deps

COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
