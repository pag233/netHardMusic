FROM node:14.16.0-alpine3.12
WORKDIR /app
ARG ORIGIN
ENV ORIGIN ${ORIGIN}
COPY . .
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories && apk add --no-cache --virtual builds-deps build-base python2 python3 && npm install --only=prod --registry https://registry.npm.taobao.org 
CMD npm run start