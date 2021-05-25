# netHardMusic
仿网易云音乐demo
```
environment: Linux version 4.18.0-301.1.el8.x86_64  
dependencies: nodejs npm@6 docker docker-compose
stack: React全家桶 + express.js + mongoose + mongodb + Cypress
```
## How to run
```
git clone https://github.com/pag233/netHardMusic
cd netHardMusic && docker-compose up  
默认页面位置http://localhost:3000  
.env文件配置docker端口映射  
测试账号: qwe@qwe.com:qweqweqwe
```
## 截屏
### 播放单曲
![play](https://github.com/pag233/netHardMusic/tree/master/screenplay/play.gif)
### 评论
![comment](https://github.com/pag233/netHardMusic/tree/master/screenplay/comment.gif)
### 私信
![message](https://github.com/pag233/netHardMusic/tree/master/screenplay/message.gif)
### 收藏
![collection](https://github.com/pag233/netHardMusic/tree/master/screenplay/collection.gif)
### 列表
![liststyle](https://github.com/pag233/netHardMusic/tree/master/screenplay/liststyle.gif)
### 搜索
![search](https://github.com/pag233/netHardMusic/tree/master/screenplay/search.gif)

## 总结
- 入门玩具级,别笑应该有比我差的
- cypress确实比selenium方便,国内用的相对少...写完才知道POM在cypress中是anti-designs
- 没考虑过兼容,感觉又是一个大坑
- 一开始写api时发现比前端上手,后来发现是达克效应,人菜瘾大
- 最后发现都是达克效应