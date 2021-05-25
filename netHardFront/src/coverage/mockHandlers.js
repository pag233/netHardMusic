import { rest } from 'msw';
import { backendAddress } from './helper';

import base64BannerImage from './fixtures/banner.jpg';

const mockHandlerFactory = (type, path, mockJsonRes) => {
  switch (type) {
    case 'get':
      return rest.get(backendAddress + path, (req, res, ctx) => {
        return res(
          ctx.json(mockJsonRes)
        );
      });
    default:
      break;
  }
};

export const songlistCommentHandler = rest.get(backendAddress + '/songlist/comment', (req, res, ctx) => {
  return res(
    ctx.json(
      {
        comments: [
          { "like": 0, "_id": "6040a3604b871b06be1a4707", "comment": "foobar", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "replyTo": { "like": 0, "_id": "6040a3514b871b06be1a4706", "comment": "doo", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "createdAt": "2021-03-04T09:07:29.955Z", "updatedAt": "2021-03-04T09:07:29.955Z" }, "createdAt": "2021-03-04T09:07:44.380Z", "updatedAt": "2021-03-04T09:07:44.380Z" },
          { "like": 0, "_id": "6040a3604b871b06be1a4708", "comment": "foobar", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "replyTo": { "like": 0, "_id": "6040a3514b871b06be1a4706", "comment": "doo", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "createdAt": "2021-03-04T09:07:29.955Z", "updatedAt": "2021-03-04T09:07:29.955Z" }, "createdAt": "2021-03-04T09:07:44.380Z", "updatedAt": "2021-03-04T09:07:44.380Z" },
          { "like": 0, "_id": "6040a3604b871b06be1a4709", "comment": "foobar", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "replyTo": { "like": 0, "_id": "6040a3514b871b06be1a4706", "comment": "doo", "user": { "_id": "5fcaf3eb3c8c5708287edbf5", "username": "qweqwe", "avatarURL": "" }, "createdAt": "2021-03-04T09:07:29.955Z", "updatedAt": "2021-03-04T09:07:29.955Z" }, "createdAt": "2021-03-04T09:07:44.380Z", "updatedAt": "2021-03-04T09:07:44.380Z" },
        ], "featuredComments": [], "status": "done", "total": 3
      }
    )
  );
});

export const topicHandler = rest.get(backendAddress + '/topics', (req, res, ctx) => {
  return res(
    ctx.json(
      { "status": "done", "topics": ["2021，你对哪些事抱有期待", "动漫的的那些心动瞬间", "写给2021的自己", "晚安时光", "山顶上放奥特曼"] }
    )
  );
});


export const searchResultHandler = rest.get(backendAddress + '/search', (req, res, ctx) => {
  return res(
    ctx.json(
      { "status": "done", "tracks": [{ "_id": "5fcc92b66fbf583170319a2b", "name": "fake name", "artist": "James Last", "album": "The Very Best Of", "coverUrl": "/images/covers/109951164004549407.jpg", "url": "audios/DrYPf0kbFyRN3VzAp96gSA==1607235376835.mp3", "size": 5841016, "createdAt": "2020-12-06T08:13:42.902Z", "updatedAt": "2020-12-06T13:50:34.731Z", "__v": 0, "duration": 146 }], "total": 1 }
    )
  );
});

export const searchEmptyResultHandler = mockHandlerFactory('get', '/search', { "status": "done", "tracks": [], "total": 0 });


export const bannerResultHandler = mockHandlerFactory('get', '/banner',
  { "banners": [{ "imageId": 1495037955, "imageUrl": "images/banners/1495037955.jpg", "imageTitle": "数字专辑", "__v": 0 }, { "imageId": 1496602635, "imageUrl": "images/banners/1496602635.jpg", "imageTitle": "首发", "__v": 0 }, { "imageId": 1496348579, "imageUrl": "images/banners/1496348579.jpg", "imageTitle": "独家", "__v": 0 }, { "imageId": 1496283296, "imageUrl": "images/banners/1496283296.jpg", "imageTitle": "独家", "__v": 0 }, { "imageId": 0, "imageUrl": "images/banners/0.jpg", "imageTitle": "数字专辑", "__v": 0 }, { "imageId": 985155293, "imageUrl": "images/banners/985155293.jpg", "imageTitle": "数字专辑", "__v": 0 }, { "imageId": 1496602290, "imageUrl": "images/banners/1496602290.jpg", "imageTitle": "独家", "__v": 0 }, { "imageId": 1496602291, "imageUrl": "images/banners/1496602291.jpg", "imageTitle": "首发", "__v": 0 }] }
);

export const bannerImageResultHandler = rest.get('images/banners/.+.jpg', async (req, res, ctx) => {
  const bannerImageBuffer = await fetch(base64BannerImage).then((res) =>
    res.arrayBuffer()
  );
  return res(
    ctx.set('Content-Length', bannerImageBuffer.byteLength.toString()),
    ctx.set('Content-Type', 'image/jpeg'),
    // Respond with the "ArrayBuffer".
    ctx.body(bannerImageBuffer),
  );
});