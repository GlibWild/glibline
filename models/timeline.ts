import { h } from "../h";
import dayjs from "dayjs";
import { mergeObjs, isPath } from "../utils/utils";
import Group from "./group";
import LineOption from "./lineOption";
import ItemWithSize from "./itemWithSize";
import Menu from "./menu";

class Timeline {
  /**
   * 传入的父容器
   */
  private container: HTMLElement;
  /**时间轴容器 */
  private timeline: HTMLElement;
  /**开始时间 */
  private startDate: Date;
  /**结束时间 */
  private endDate: Date;
  /**缩放比例 */
  private zoomLevel: number;
  /**偏移量 */
  private offset: number;
  /**鼠标x轴位置 */
  private x: number;
  /**鼠标y轴位置 */
  private y: number = 0;

  /**提示框 */
  private tipDiv: HTMLElement;
  /**提示框线 */
  private tipLineDiv: HTMLElement;
  /**x轴刻度 */
  private xAxisScaleDiv: HTMLElement;
  /**x轴线 */
  private xAxisLineDiv: HTMLElement;

  /**x轴线高度 */
  private xAxisLineHeight: number = 30;

  /**y轴线 */
  private yAxisLineDiv: HTMLElement;
  /**y轴刻度 */
  private yAxisScaleDiv: HTMLElement;

  /**数据集（y轴） */
  private data: Array<Group>;
  /**数据块占用分组空间的比例 取值范围（0-1） */
  private dataInGroupScale: number = 0.5;
  /**时间轴上边距 */
  private lineTop: number = 5;
  /**时间轴左边距 */
  private lineLeft: number = 20;

  /**时间轴样式参数 */
  private lineOptions: LineOption = new LineOption();

  /**选中区域 */
  private selectedDataDiv: HTMLElement;

  /**
   * 组件尺寸修改监视器
   */
  private resizeObserver: ResizeObserver;

  constructor(
    containerId: string,
    startDate: Date,
    endDate: Date,
    lineOptions?: LineOption
  ) {
    requestAnimationFrame(() => {
      if (lineOptions) {
        mergeObjs(this.lineOptions, lineOptions);
      }
      this.container = document.getElementById(containerId)!;
      this.container.style.position = "relative";
      this.startDate = startDate;
      this.endDate = endDate;
      this.zoomLevel = 1;
      this.offset = this.lineOptions.textWidth!;

      const timelineContainer = this.createTimelineElement();
      this.container.appendChild(timelineContainer);

      this.init();
    });
  }
  private createTimelineElement(): HTMLElement {
    this.timeline = h("div", {
      className: "timeline-zoom",
      style: "width:100%;height:100%;display:flex;",
    });

    const timelineContainer = h(
      "div",
      {
        style: `width:calc(100% - ${this.lineLeft * 2}px);height:calc(100% - ${
          this.lineTop * 2
        }px);position:absolute;top:${this.lineTop}px;left:${
          this.lineLeft
        }px;overflow:hidden;display:flex`,
      },
      this.timeline
    );
    return timelineContainer;
  }

  /**
   * 关闭时注意回调
   */
  public remove() {
    this.resizeObserver?.disconnect();
  }

  private init() {
    // this.timeline.addEventListener("click", this.onClick.bind(this));
    this.timeline.addEventListener("dblclick", this.onDbClick.bind(this));
    this.timeline.addEventListener("wheel", this.onWheel.bind(this));
    this.timeline.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.timeline.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.timeline.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.timeline.addEventListener("mouseleave", this.onMouseUp.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
    this.timeline.addEventListener("resize", this.onResize.bind(this));

    this.resizeObserver = new ResizeObserver((t) => {
      this.onResize();
    });
    this.resizeObserver.observe(this.timeline);

    this.drawTimeline();
  }

  /**设置时间轴时间范围 */
  public setDate(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.drawTimeline();
  }

  /**设置数据 */
  public setData(data: any) {
    this.data = data;
    this.drawTimeline();
  }
  /**绘制时间轴 */
  private drawTimeline() {
    if (!this.timeline || this.timeline.clientWidth == 0) {
      setTimeout(() => {
        this.drawTimeline();
      }, 10);
      return;
    }
    this.timeline.innerHTML = "";
    this.timeline.style.transform = ` translateX(${this.offset}px)`;
    let timelineWidth = this.timeline.clientWidth * this.zoomLevel;

    this.drawXAxis(timelineWidth);

    this.drawYAxisLine();

    this.drawTimeData(timelineWidth);

    this.drawSelectArea();
    this.drawTipArea();
  }
  /**
   * 绘制x轴
   */
  private drawXAxis(timelineWidth) {
    this.xAxisLineDiv = h("div", {
      style: `position:absolute;width:${timelineWidth}px;height:1px;background-color:${this.lineOptions.xAxisColor};bottom:30px;left:${this.lineOptions.textWidth}px;`,
    });
    this.timeline.appendChild(this.xAxisLineDiv);

    let lastDate;
    const length = 180;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;
    for (let i = 0; i <= timelineWidth; ) {
      const date = new Date(this.startDate.getTime() + i / pixelsPerMs);
      if (!lastDate || date.getDate() != lastDate.getDate()) {
        this.xAxisScaleDiv = h(
          "div",
          {
            className: "timeline-x-scale",
            style: `width:${length}px;font-size:14px;flex:0 0 auto;user-select:none;display:flex;justify-content:flex-end;flex-direction:column;position:relative;left:${this.lineOptions.textWidth}px;z-index:1`,
          },
          h("div", {
            style: `background:${this.lineOptions.xAxisColor};width:1px;height:10px;position:relative;bottom:10px;`,
          }),
          h(
            "div",
            {
              style: `background-color:${this.lineOptions.xAxisBgColor};color:${this.lineOptions.xAxisColor};position:relative;top:0px;left:-50%;text-align:center;height:20px`,
            },
            dayjs(date).format("YYYY-MM-DD HH:mm:ss")
          )
        );
        lastDate = date;
        i += length;
      } else {
        this.xAxisScaleDiv = h(
          "div",
          {
            className: "timeline-x-scale",
            style: `width:${length}px;font-size:14px;flex:0 0 auto;user-select:none;display:flex;justify-content:flex-end;flex-direction:column;position:relative;left:${this.lineOptions.textWidth}px;z-index:1`,
          },
          h("div", {
            style: `background:${this.lineOptions.xAxisColor};width:1px;height:10px;position:relative;bottom:10px;`,
          }),
          h(
            "div",
            {
              style: `background-color:${this.lineOptions.xAxisBgColor};color:${this.lineOptions.xAxisColor};position:relative;top:0px;left:-50%;text-align:center;height:20px`,
            },
            dayjs(date).format("HH:mm:ss")
          )
        );
        i += length;
      }
      this.timeline.appendChild(this.xAxisScaleDiv);
    }
  }
  /**
   * 绘制y轴
   */
  private drawYAxisLine() {
    if (this.data) {
      this.yAxisLineDiv = h("div", {
        className: "timeline-y-line",
        style: `position:absolute;width:1px;height:calc(100% - 30px);background-color:${
          this.lineOptions.yAxisColor
        };bottom:30px;left:${
          this.offset > 0
            ? 0 + this.lineOptions.textWidth!
            : -this.offset + this.lineOptions.textWidth!
        }px;z-index:1`,
      });

      this.timeline.appendChild(this.yAxisLineDiv);
    } else {
      this.yAxisLineDiv = h("div", {
        className: "timeline-y-line",
        style: `position:absolute;width:1px;height:calc(100% - 30px);background-color:${
          this.lineOptions.yAxisColor
        };bottom:30px;left:${0 + this.lineOptions.textWidth!}px;z-index:1`,
      });

      this.timeline.appendChild(this.yAxisLineDiv);
    }
  }
  /**
   * 计算时间轴工作区高度以及分组高度
   * @returns
   */
  private getHeightPerGroup() {
    const height = this.timeline.clientHeight - this.xAxisLineHeight;
    let heightPerGroup = 0;
    if (this.data) {
      heightPerGroup = height / this.data.length;
    }
    return { height, heightPerGroup };
  }
  /**
   * 获取分组下标序号
   * @param heightPerGroup
   * @returns
   */
  private getGroupIndex(heightPerGroup) {
    const y = this.y;
    const index = Math.ceil(y / heightPerGroup);
    return index;
  }
  /**
   * 绘制数据
   * @param timelineWidth
   */
  private drawTimeData(timelineWidth: number) {
    if (this.data) {
      const { height, heightPerGroup } = this.getHeightPerGroup();
      let index = 0;

      this.yAxisScaleDiv = h("div", {
        className: "timeline-y-scale",
        style: `width:${
          this.lineOptions.textWidth
        }px;height:${height}px;position:absolute;left:${
          this.offset > 0 ? 0 : -this.offset
        }px;top:0;display:flex;flex-direction:column;justify-content:flex-end;border-top:1px solid #666;`,
      });

      this.timeline.appendChild(this.yAxisScaleDiv);

      this.data.forEach((group) => {
        const scaleLineDiv = h("div", {
          style: `background:#666;width:${timelineWidth}px;height:1px;position:absolute;left:${
            this.lineOptions.textWidth
          }px;top:${index * heightPerGroup}px`,
        });
        this.timeline.appendChild(scaleLineDiv);

        const groupDiv = h(
          "div",
          {
            className: "timeline-group",
            style: `width:100%;height:${heightPerGroup}px;display:flex;position:relative;`,
          },
          h(
            "div",
            {
              style: `color:${this.lineOptions.yAxisColor};overflow-wrap:break-word;flex:0 1 ${this.lineOptions.textWidth}px;padding-right:10px;background-color:${this.lineOptions.yAxisBgColor};height:100%;z-index:1;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;`,
            },
            group.groupName
          )
        );
        this.yAxisScaleDiv.appendChild(groupDiv);
        group.items.forEach((item) => {
          let start = item.startTime.getTime() - this.startDate.getTime();
          let end = item.endTime.getTime() - this.startDate.getTime();
          let width =
            ((end - start) /
              (this.endDate.getTime() - this.startDate.getTime())) *
            timelineWidth;
          let left =
            (start / (this.endDate.getTime() - this.startDate.getTime())) *
            timelineWidth;
          //由于offset小于0会发生位置偏移，因此需要对绘制的数据进行同等偏移
          if (this.offset < 0) {
            left = left + this.offset;
          }
          left += this.lineOptions.textWidth!;

          (item as ItemWithSize).width = width;
          (item as ItemWithSize).height =
            heightPerGroup * this.dataInGroupScale;
          (item as ItemWithSize).left = left;
          (item as ItemWithSize).top =
            (heightPerGroup - heightPerGroup * this.dataInGroupScale) / 2;
          const itemDiv = h(
            "div",
            {
              className: "timeline-item",
              style: `width:${width}px;height:${
                heightPerGroup * this.dataInGroupScale
              }px;background-color:${
                group.groupOptions.backgroundColor
              };position:absolute;left:${left}px;top:${
                (heightPerGroup - heightPerGroup * this.dataInGroupScale) / 2
              }px`,
              // };position:absolute;left:${left}px;display:flex;justify-content:center;flex-direction:column;top:50%;transform:translate(0,-50%);`,
            },
            h(
              "div",
              {
                style: `color:${group.groupOptions.textColor};font-size:${group.groupOptions.textSize}px;`,
              },
              item.itemName
            )
          );
          groupDiv.appendChild(itemDiv);
        });
        index++;
      });
    }
  }
  /**
   * 绘制tip提示区域
   */
  private drawTipArea() {
    const { height, heightPerGroup } = this.getHeightPerGroup();
    if (this.x) {
      let index = 0;
      if (this.data) {
        index = this.getGroupIndex(heightPerGroup);
      }
      if (this.data) {
        const left =
          this.offset >= 0
            ? 0 + this.lineOptions.textWidth!
            : -this.offset + this.lineOptions.textWidth!;
        if (this.x < left) {
          this.x = left;
        }
      } else {
        const left = this.lineOptions.textWidth!;
        if (this.x < left) {
          this.x = left;
        }
      }
      if (
        this.x >
        this.timeline.clientWidth * this.zoomLevel + this.lineOptions.textWidth!
      ) {
        this.x =
          this.timeline.clientWidth * this.zoomLevel +
          this.lineOptions.textWidth!;
      }
      this.tipDiv = h(
        "div",
        {
          style: `position:absolute;color:${
            this.lineOptions.tipColor
          };background-color:${this.lineOptions.tipBackground};font-size:${
            this.lineOptions.tipTextSize
          }px;top:${this.y}px;left:${this.x + 10}px;z-index:1;min-width:150px;`,
        },
        h(
          "div",
          {},
          dayjs(this.getTimeByPx(this.x)).format("YYYY-MM-DD HH:mm:ss")
        ),
        h(
          "div",
          {},
          this.data && index <= this.data.length && index > 0
            ? this.data[index - 1].groupName
            : ""
        )
      );

      this.tipLineDiv = h("div", {
        style: `position:absolute;width:1px;height:calc(100% - 30px);background-color:${this.lineOptions.tipLineColor};left:${this.x}px;bottom:30px;z-index:1`,
      });
      this.timeline.appendChild(this.tipLineDiv);
      this.timeline.appendChild(this.tipDiv);
    }
  }

  /**
   * 绘制选中区域
   */
  private drawSelectArea() {
    if (this.isSelecting) {
      //绘制选中区域
      let start = Math.min(this.lastX, this.endX);
      let end = Math.max(this.lastX, this.endX);
      if (end - start > 1) {
        //由于offset小于0会发生位置偏移，因此需要对绘制的数据进行同等偏移
        const crect = this.container.getBoundingClientRect();

        let left = start - this.offset - this.lineLeft - crect.left;

        let menus = [] as HTMLElement[];
        if (this.lineOptions.menus) {
          const defaultMenu = {
            text: "",
            icon: "",
            iconSize: 14,
            textSize: 14,
            clickEvent: (e: MouseEvent) => {},
          };
          menus = this.lineOptions.menus.map((t) => {
            const menu = new Menu({ ...defaultMenu, ...t });
            return h(
              "div",
              {
                style: `z-index:2;display:flex;justify-content:center;flex-direction:column;cursor:pointer;padding:0 5px;align-items:center`,
                onmousedown: (e: MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                },
                onclick: (e: MouseEvent) => {
                  let startPx = Math.min(this.lastX, this.endX);
                  let endPx = Math.max(this.lastX, this.endX);
                  const startTime = this.getTimeByPx(startPx);
                  const endTime = this.getTimeByPx(endPx);
                  const { heightPerGroup } = this.getHeightPerGroup();
                  const index = this.getGroupIndex(heightPerGroup);
                  menu.clickEvent(e, startTime, endTime, this.data[index - 1]);
                },
              },
              isPath(menu.icon)
                ? h("img", {
                    src: menu.icon,
                    style: `width:${menu.iconSize + 2}px;height:${
                      menu.iconSize
                    }px;color:${menu.iconColor}`,
                  })
                : h("i", {
                    class: `${menu.icon}`,
                    style: `font-size:${menu.iconSize}px`,
                  }),
              h(
                "div",
                {
                  style: `font-size:${menu.textSize}px;color:${menu.textColor}`,
                },
                menu.text
              )
            );
          });
        }

        this.selectedDataDiv = h(
          "div",
          {
            class: "select-item",
            style: `position:absolute;top:${this.selectTop}px;left:${left}px;display:flex`,
          },
          [
            h("div", {
              style: `background-color:${
                this.lineOptions.selectedColor
              };height:${this.selectHeight}px;width:${
                end - start
              }px;z-index:2;`,
            }),

            ...(this.lineOptions.menus ? menus : ""),
          ]
        );
        this.timeline.appendChild(this.selectedDataDiv);
      }
    }
  }

  /**
   * 判断是否处于块数据中
   * @returns
   */
  private isInItems() {
    let flag = false;
    let height = 0;
    let curItem;
    let top = 0;
    const crect = this.container.getBoundingClientRect();
    const rect = this.timeline.getBoundingClientRect();
    const { heightPerGroup } = this.getHeightPerGroup();
    const index = this.getGroupIndex(heightPerGroup);
    if (index <= 0 || index > this.data.length) flag = false;
    else {
      const x = this.x;
      const y = this.y;
      for (let i = 0; i < this.data[index - 1].items.length; i++) {
        const t = this.data[index - 1].items[i];
        const item = t as ItemWithSize;
        let left = 0;
        if (this.offset < 0) {
          left = item.left - this.offset;
        } else {
          left = item.left;
        }
        if (
          x >= left &&
          x <= left + item.width &&
          y >=
            item.top + //自身顶点
              heightPerGroup * (index - 1) + //上一组的高度
              this.lineTop - //时间轴边距
              (rect.top - crect.top) && //timeline对象与父容器的距离
          y <=
            item.top +
              heightPerGroup * (index - 1) +
              this.lineTop -
              (rect.top - crect.top) +
              item.height
        ) {
          top = item.top + heightPerGroup * (index - 1);
          height = item.height;
          curItem = item;
          flag = true;
          break;
        }
      }
    }
    return { flag, top, height, item: curItem, group: this.data[index - 1] };
  }

  private onDbClick(event: MouseEvent) {
    event.preventDefault();
    if (this.lineOptions.dblClickEvent) {
      const curDate = this.getTimeByPx(this.x);
      const { item, group } = this.isInItems();
      this.lineOptions.dblClickEvent(
        event,
        curDate,
        Object.assign({}, item),
        Object.assign({}, group)
      );
    }
  }

  private onResize() {
    this.isSelecting = false;
    this.drawTimeline();
  }
  private onWheel(event: WheelEvent) {
    event.preventDefault();

    const old_time = this.getTimeByPx(this.x);

    this.zoomLevel -= event.deltaY * 0.001;

    if (this.zoomLevel < 0.1) this.zoomLevel = 0.1;
    if (this.zoomLevel > 10) this.zoomLevel = 10;

    this.isSelecting = false;

    const x = this.getPxByTime(old_time);
    this.offset -= x - this.x;
    this.x = x;

    this.drawTimeline();
  }

  //是否处于拖拽状态
  private isDragging = false;
  //是否处于选中状态，即当鼠标处于数据块中时不再触发拖动时间轴而是开始选中，当未处于数据块中则为拖动
  private isSelecting = false;
  private lastX = 0;
  private endX = 0;
  private selectTop = 0;
  private selectHeight = 0;

  private onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.lastX = event.clientX;
    this.endX = event.clientX;
    if (this.data) {
      const { flag, top, height } = this.isInItems();
      this.isSelecting = flag;
      this.selectTop = top;
      this.selectHeight = height;
    }
  }

  private onMouseMove(event: MouseEvent) {
    event.preventDefault();
    if (this.isDragging) {
      if (!this.isSelecting) {
        const dx = event.clientX - this.lastX;
        this.offset += dx;
        this.lastX = event.clientX;
      } else {
        //处理选中显示
        this.endX = event.clientX;
      }
    }
    const rect = this.timeline.getBoundingClientRect();
    this.y = event.clientY - rect.top;
    this.x = event.clientX - rect.left;

    this.drawTimeline();
  }

  private onMouseUp(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = false;
  }
  /**
   * 像素点转时间点
   * @param x
   * @returns
   */
  private getTimeByPx(x) {
    let timelineWidth = this.timeline.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;
    if (x < this.lineOptions.textWidth!) x = this.lineOptions.textWidth!;
    const curDate = new Date(
      this.startDate.getTime() + (x - this.lineOptions.textWidth!) / pixelsPerMs
    );
    return curDate;
  }

  /**
   * 时间点转像素点
   * @param date
   * @returns
   */
  private getPxByTime(date: Date) {
    let timelineWidth = this.timeline.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;
    let offsetTime = date.getTime() - this.startDate.getTime();
    let x = offsetTime * pixelsPerMs + this.lineOptions.textWidth!;
    return x;
  }
}

export default Timeline;
