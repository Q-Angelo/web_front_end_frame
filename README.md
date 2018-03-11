# react-cnode
基于react、webpack实现cnode社区

## 项目文件结构
<pre>
├── client                   业务代码目录
  ├── components             定义Redux的各个action 
  ├── config                 配置目录
  ├── views                  项目功能模块的页面
  ├── store                  store相关的文件，包括数据获取的封装等。 

</pre>

Mobx是flux实现的后起之秀，其以更简单的使用和更少的概念，让flux使用起来变得更加简单。相比Redux有mutation、action、dispatch等概念，Mobx则更符合对一个store增删改查的操作概念。