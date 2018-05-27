FROM node:9
ADD ./test ./test
ADD ./package.json ./package.json
RUN npm install
ENTRYPOINT ["npm", "test"]