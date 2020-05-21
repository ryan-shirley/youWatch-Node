FROM node:12
RUN apt-get update || : && apt-get install ffmpeg -y

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p  /home/node/app/data/videos/analysis
RUN mkdir -p  /home/node/app/data/temp_frames
RUN mkdir -p  /home/node/app/data/outputs

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "-r", "esm", "src/app.js" ]

