<!-- [![license](https://img.shields.io/github/license/anncwb/vue-vben-admin.svg)](LICENSE) -->
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/GlibWild/glibline/blob/master/LICENSE)

### 安装
~~~
npm install glibline
~~~

### 提醒
##### 1. 选中菜单支持图片类型路径，以及fontawesome等样式，但是需要调用本组件项目已经完成对fontawesome的样式支持，否则无法展示
##### 2. 当为图片类型路径时，iconColor无效

### 使用
定义容器
~~~
<div id="container" style="width: 100%; height: 300px"></div>
~~~
初始化对象。LineOption参考引入：import {LineOption} from "glibline"
~~~
import GlibLine,{LineOption,GroupOption} from 'glibline'
const gline = new GlibLine(
    "container",
    new Date(2025, 0, 1),
    new Date(2025, 0, 4, 23, 59, 59),
    {
      textWidth: 100,
      tipBackground: "#cccccc7f",
      menus: [
        {
          text: "",
          icon: VueIcon,
          textSize: 12,
          clickEvent: (e: MouseEvent, startTime: Date, endTime: Date) => {
            console.log(e, startTime, endTime);
          },
        },
        {
          text: "测试",
          icon: VueIcon,
          textSize: 12,
          clickEvent: (e: MouseEvent, startTime: Date, endTime: Date) => {
            console.log(e, startTime, endTime);
          },
        },
      ],
      dblClickEvent: (e: MouseEvent, curTime: Date, item) => {
        console.log("double click", curTime, item);
      },
    } as LineOption
  );
~~~
设置组对象。GroupOption参考引入：import {GroupOption} from "glibline"
~~~
const groups = [
    new Group(1, "Group 1", [
      new Item(
        1,
        "Item 1",
        new Date(2025, 0, 1, 9, 0, 0),
        new Date(2025, 0, 1, 12, 0, 0)
      ),
      new Item(
        2,
        "Item 2",
        new Date(2025, 0, 2, 0, 0, 0),
        new Date(2025, 0, 2, 3, 0, 0)
      ),
    ]),

    new Group(
      2,
      "Group 2",

      [
        new Item(
          3,
          "Item 3",
          new Date(2025, 0, 1, 3, 0, 0),
          new Date(2025, 0, 1, 6, 0, 0)
        ),
        new Item(
          4,
          "Item 4",
          new Date(2025, 0, 2, 0, 0, 0),
          new Date(2025, 0, 2, 3, 0, 0)
        ),
      ],
      {
        textColor: "#ff0000",
        backgroundColor: "#000000",
        textSize: 13,
      } as GroupOption
    ),
  ];
  gline.setData(groups);
~~~