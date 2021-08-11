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
### 播放
<img src="screen_record/play.gif" width="569" height="405"/>

### 登录
<img src="screen_record/login.gif" width="569" height="405"/>

### 评论
<img src="screen_record/theme-comment.gif" width="569" height="405"/>

### 头像
<img src="screen_record/avatar.gif" width="569" height="405"/>

### banner
<img src="screen_record/banner.gif" width="569" height="405"/>

### 列表
<img src="screen_record/listimage.gif" width="569" height="405"/>

### 搜索
<img src="screen_record/search.gif" width="569" height="405"/>

### 标签
<img src="screen_record/tag.gif" width="569" height="405"/>


## 总结
- 入门玩具级，尤其是组件复用；别笑应该有比我差的
- cypress确实比selenium方便,国内用的相对少...写完才知道POM在cypress中是anti-designs
- 没考虑过兼容,感觉又是一个大坑
- 其实完全没有必要用Router...
- 明白为啥不爱写单元测试了
- 一开始写api时发现比前端上手,后来发现是达克效应,人菜瘾大
- 最后发现都是达克效应
