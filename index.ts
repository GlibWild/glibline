import { h } from "./h";
import dayjs from "dayjs";
import { mergeObjs } from "./utils/utils";
import Group from "./models/group";
import LineOption from "./models/lineOption";

class Timeline {
  //传入的父容器
  private container: HTMLElement;
  //时间轴容器
  private timeline: HTMLElement;
  //开始时间
  private startDate: Date;
  //结束时间
  private endDate: Date;
  //缩放比例
  private zoomLevel: number;
  //偏移量
  private offset: number;
  //当前时间
  private curTime: Date;
  //鼠标x轴位置
  private x: number;
  //鼠标y轴位置
  private y: number = 0;

  //提示框
  private tipDiv: HTMLElement;
  //提示框线
  private tipLineDiv: HTMLElement;
  //x轴刻度
  private xAxisScaleDiv: HTMLElement;
  //x轴线
  private xAxisLineDiv: HTMLElement;

  //x轴线高度
  private xAxisLineHeight: number = 21;

  //y轴线
  private yAxisLineDiv: HTMLElement;
  //y轴刻度
  private yAxisScaleDiv: HTMLElement;

  //数据集（y轴）
  private data: Array<Group>;

  //时间轴样式参数
  private lineOptions: LineOption = new LineOption();

  constructor(
    containerId: string,
    startDate: Date,
    endDate: Date,
    lineOptions?: LineOption
  ) {
    console.log(startDate, endDate);
    if (lineOptions) {
      mergeObjs(this.lineOptions, lineOptions);
    }
    // this.lineOptions = lineOptions!;

    this.container = document.getElementById(containerId)!;
    this.container.style.position = "relative";
    this.startDate = startDate;
    this.endDate = endDate;
    this.zoomLevel = 1;
    console.log(this.lineOptions);
    this.offset = this.lineOptions.textWidth!;

    const timelineContainer = this.createTimelineElement();
    this.container.appendChild(timelineContainer);

    this.init();
  }
  private createTimelineElement(): HTMLElement {
    this.timeline = h("div", {
      className: "timeline-zoom",
      style: "width:100%;height:100%;display:flex;",
    });

    const timelineContainer = h(
      "div",
      {
        style: `width:calc(100% - 40px);height:calc(100% - 40px);position:absolute;top:20px;left:20px;overflow:hidden;display:flex`,
      },
      this.timeline
    );
    return timelineContainer;
  }
  private init() {
    this.timeline.addEventListener("click", this.onClick.bind(this));
    this.timeline.addEventListener("wheel", this.onWheel.bind(this));
    this.timeline.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.timeline.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.timeline.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.timeline.addEventListener("mouseleave", this.onMouseUp.bind(this));

    this.drawTimeline();
  }

  //设置时间轴时间范围
  public setDate(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.drawTimeline();
  }

  //设置数据
  public setData(data: any) {
    this.data = data;
    this.drawTimeline();
  }

  private drawTimeline() {
    this.timeline.innerHTML = "";
    //scale(${this.zoomLevel})
    this.timeline.style.transform = ` translateX(${this.offset}px)`;
    // console.log(this.timeline.clientWidth, this.zoomLevel);
    let timelineWidth = this.timeline.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;

    let lastDate;
    const length = 180;
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
            style:
              "background:#fff;width:1px;height:10px;position:relative;top:-10px;",
          }),
          h(
            "div",
            { style: "color:#fff;position:relative;top:0px;left:-50%" },
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
            style:
              "background:#fff;width:1px;height:10px;position:relative;top:-10px;",
          }),
          h(
            "div",
            { style: "color:#fff;position:relative;top:0px;left:-50%" },
            dayjs(date).format("HH:mm:ss")
          )
        );
        i += length;
      }
      this.timeline.appendChild(this.xAxisScaleDiv);
    }
    if (this.x) {
      let index = 0;
      if (this.data) {
        const height = this.timeline.clientHeight - this.xAxisLineHeight - 9;
        const heightPerGroup = height / this.data.length;
        const rect = this.timeline.getBoundingClientRect();
        const y = this.y - rect.top;
        index = Math.ceil(y / heightPerGroup);
      }

      this.tipDiv = h(
        "div",
        {
          style: `position:absolute;color:${
            this.lineOptions.tipColor
          };background-color:${this.lineOptions.tipBackground};font-size:${
            this.lineOptions.tipTextSize
          }px;top:${this.y - 30}px;left:${this.x + 10}px;z-index:1`,
        },
        h("div", {}, dayjs(this.curTime).format("YYYY-MM-DD HH:mm:ss")),
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

    this.xAxisLineDiv = h("div", {
      style: `position:absolute;width:${timelineWidth}px;height:1px;background-color:#fff;bottom:30px;left:${this.lineOptions.textWidth}px;`,
    });

    this.yAxisLineDiv = h("div", {
      className: "timeline-y-line",
      style: `position:absolute;width:1px;height:calc(100% - 30px);background-color:#fff;bottom:30px;left:${
        this.offset > 0
          ? 0 + this.lineOptions.textWidth!
          : -this.offset + this.lineOptions.textWidth!
      }px;z-index:1`,
    });

    this.timeline.appendChild(this.yAxisLineDiv);
    this.timeline.appendChild(this.xAxisLineDiv);

    this.drawTimeData(timelineWidth);
  }

  private drawTimeData(timelineWidth: number) {
    if (this.data) {
      const height = this.timeline.clientHeight - this.xAxisLineHeight - 9;
      const heightPerGroup = height / this.data.length;
      let index = 0;

      this.yAxisScaleDiv = h("div", {
        className: "timeline-y-scale",
        style: `width:${
          this.lineOptions.textWidth
        }px;height:${height}px;position:absolute;left:${
          this.offset > 0 ? 0 : -this.offset
        }px;top:0;display:flex;flex-direction:column;justify-content:flex-end`,
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
              style: `color:#fff;overflow-wrap:break-word;flex:0 1 ${this.lineOptions.textWidth}px;padding-right:10px;background-color:#242424;height:100%;z-index:1;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;`,
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
          const itemDiv = h(
            "div",
            {
              className: "timeline-item",
              style: `width:${width}px;height:${
                heightPerGroup * 0.5
              }px;background-color:${
                group.groupOptions.backgroundColor
              };position:absolute;left:${left}px;display:flex;justify-content:center;flex-direction:column;top:50%;transform:translate(0,-50%);`,
            },
            h(
              "div",
              {
                style: `color:${group.groupOptions.textColor};font-size:${group.groupOptions.textSize}px`,
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

  private onClick(event: MouseEvent) {
    // const rect = this.timeline.getBoundingClientRect();
    // const x = event.clientX - rect.left;
    // const range = this.endDate.getTime() - this.startDate.getTime();
    // const clickedDate = new Date(
    //   this.startDate.getTime() + (x / this.timeline.clientWidth) * range
    // );
    // console.log(
    //   "Clicked date:",
    //   dayjs(clickedDate).format("YYYY-MM-DD HH:mm:ss")
    // );
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault();
    this.zoomLevel *= 1 - event.deltaY * 0.001;

    if (this.zoomLevel < 0.1) this.zoomLevel = 0.1;
    if (this.zoomLevel > 10) this.zoomLevel = 10;
    this.drawTimeline();
  }

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  private onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const dx = event.clientX - this.lastX;
      this.offset += dx / this.zoomLevel;
      this.lastX = event.clientX;
      // this.drawTimeline();
    }

    let timelineWidth = this.timeline.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;

    const rect = this.timeline.getBoundingClientRect();

    // if (this.data) {
    //   const height = this.timeline.clientHeight - this.xAxisLineHeight - 9;
    //   const heightPerGroup = height / this.data.length;
    //   const y = event.clientY - rect.top;
    //   this.y = Math.ceil(y / heightPerGroup);
    // }
    this.y = event.clientY;

    let x = event.clientX - rect.left;
    if (x < this.lineOptions.textWidth!) x = this.lineOptions.textWidth!;
    console.log(event.clientX, rect.left, x);
    const curDate = new Date(
      this.startDate.getTime() + (x - this.lineOptions.textWidth!) / pixelsPerMs
    );

    this.curTime = curDate;
    this.x = x;
    this.drawTimeline();
  }

  private onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }
}

export default Timeline;
