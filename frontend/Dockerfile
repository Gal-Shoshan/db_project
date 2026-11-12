# Builds the db_project frontend with Vite, then serves the static files with nginx.
#
# Build: docker build -t db_project_frontend .
# Run:   docker run --rm -p 8080:80 db_project_frontend
# Open:  http://localhost:8080

FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.30-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
