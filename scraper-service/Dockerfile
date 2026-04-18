FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

# Playwright browsers are pre-installed in the base image
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]
