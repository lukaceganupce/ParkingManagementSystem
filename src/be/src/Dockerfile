FROM node:22-alpine
RUN npm install -g nodemon
WORKDIR /usr/src/app
EXPOSE 3000
# Sources are mounted as a volume (see docker-compose.yaml), not copied into the image
CMD ["sh", "-c", "npm install && nodemon -L server.js"]
