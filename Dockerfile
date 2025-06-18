FROM node:18
WORKDIR /src
COPY . .
RUN npm install && npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000
