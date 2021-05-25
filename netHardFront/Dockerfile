FROM node:14.16.0-alpine3.12
WORKDIR /app
ARG REACT_APP_BACKEND
ENV REACT_APP_BACKEND ${REACT_APP_BACKEND}
COPY . .
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories && apk add --no-cache --virtual builds-deps build-base python2 python3 && npm install --registry https://registry.npm.taobao.org
RUN npm run build
CMD npx http-server ./build -p 3000