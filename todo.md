# AI Pulse 升级 Todo

## 1. 升级为全栈项目（用户认证+数据库）
- [x] 运行 webdev_add_feature web-db-user
- [x] 创建数据库表：用户收藏表 (user_archives)
- [x] 配置 OAuth 登录流程

## 2. 登录页面与认证流程
- [x] 创建登录页面（进入网站即显示登录页）
- [x] 实现认证保护路由（未登录无法访问内容）
- [x] 登录后跳转到首页

## 3. 收藏夹功能（数据库版）
- [x] 后端API：保存/取消收藏、获取用户收藏列表
- [x] 前端：替换 localStorage 为 API 调用
- [x] 每个用户独立的收藏夹

## 4. 按设计文档完善数据
- [x] 人数：从27人扩展到完整名单（约45人）
  - 新增：Jong Wook Kim, Josh Tobin (OpenAI)
  - 新增：Koray Kavukcuoglu, Raia Hadsell, Shane Legg (DeepMind)
  - 新增：Jared Kaplan, Mike Krieger (Anthropic)
  - 新增：Guodong Zhang, Zihang Dai, Yao Fu, Daniel Rowland (xAI)
  - 新增：Aidan Gomez, Noam Shazeer, Allie K. Miller, Gavin Baker, Nat Friedman (行业)
  - 新增：arxiv_sanity (学术)
- [ ] 帖子数：每人最近15篇推文（当前只有1-3篇）
- [ ] Highlight：标记6位重点人物（Karpathy, LeCun, Jim Fan, Sam Altman, Raschka, Mensch）
- [x] 学术区：请求获取20-30个项目，覆盖12个分类
- [x] 学术分类：完善为12个分类

## 5. 暗色模式切换
- [x] 在 ThemeProvider 中启用 switchable
- [x] 在导航栏添加主题切换按钮
- [x] 确保暗色模式下配色协调

## 6. 测试与交付
- [x] 全面测试登录流程
- [x] 测试收藏夹功能
- [x] 保存 checkpoint
