import { h } from "./h";
import dayjs from "dayjs";
import Group from "./models/group";

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
  //鼠标y轴位置（暂时未赋值）
  private y: number = 100;

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
  //y轴文本
  private yAxisTextDiv: HTMLElement;
  //y轴文本显示宽度
  private yAxisTextWidth: number = 40;

  //数据集（y轴）
  private data: Array<Group>;

  constructor(containerId: string, startDate: Date, endDate: Date) {
    console.log(startDate, endDate);
    this.container = document.getElementById(containerId)!;
    this.container.style.position = "relative";
    this.startDate = startDate;
    this.endDate = endDate;
    this.zoomLevel = 1;
    this.offset = 100;

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
            style: `width:${length}px;font-size:14px;flex:0 0 auto;user-select:none;display:flex;justify-content:flex-end;flex-direction:column;`,
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
            style: `width:${length}px;font-size:14px;flex:0 0 auto;user-select:none;display:flex;justify-content:flex-end;flex-direction:column;`,
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
    this.tipDiv = h(
      "div",
      {
        style: `position:absolute;color:#fff;top:${this.y}px;left:${this.x}px`,
      },
      h("div", {}, dayjs(this.curTime).format("YYYY-MM-DD HH:mm:ss")),
      h("div", {}, this.offset + ";" + this.x)
    );

    this.tipLineDiv = h("div", {
      style: `position:absolute;width:1px;height:calc(100% - 40px);background-color:#fff;left:${this.x}px;bottom:30px`,
    });

    this.xAxisLineDiv = h("div", {
      style: `position:absolute;width:${timelineWidth}px;height:1px;background-color:#fff;bottom:30px`,
    });

    this.yAxisLineDiv = h("div", {
      className: "timeline-y-line",
      style: `position:absolute;width:1px;height:calc(100% - 40px);background-color:#fff;bottom:30px;left:${
        this.offset > 0 ? 0 : -this.offset
      }px`,
    });

    this.timeline.appendChild(this.yAxisLineDiv);
    this.timeline.appendChild(this.xAxisLineDiv);
    this.timeline.appendChild(this.tipLineDiv);
    this.timeline.appendChild(this.tipDiv);

    this.drawTimeData();
  }

  private drawTimeData() {
    if (this.data) {
      const height = this.timeline.clientHeight - this.xAxisLineHeight;
      const heightPerGroup = height / this.data.length;
      let index = 0;

      this.yAxisScaleDiv = h("div", {
        className: "timeline-y-scale",
        style: `width:20px;height:${height}px;position:absolute;left:${
          this.offset > 0 ? 0 : -this.offset
        }px;top:0;display:flex;flex-direction:column;justify-content:flex-end;`,
      });

      this.timeline.appendChild(this.yAxisScaleDiv);

      this.data.forEach((group) => {
        const groupDiv = h(
          "div",
          {
            className: "timeline-group",
            style: `width:100%;height:${heightPerGroup}px;display:flex;flex-direction:column;`,
          },
          h("div", { style: "color:#fff" }, group.groupName)
        );
        this.yAxisScaleDiv.appendChild(groupDiv);
        let timelineWidth = this.timeline.clientWidth * this.zoomLevel;
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
          const itemDiv = h(
            "div",
            {
              className: "timeline-item",
              style: `width:${width}px;height:${
                heightPerGroup * 0.8
              }px;background-color:rgba(255,255,255,0.5);position:absolute;left:${left}px;top:${
                heightPerGroup * index
              }px;display:flex;justify-content:center;flex-direction:column`,
            },
            h("div", { style: "color:#fff" }, item.itemName)
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

  private onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastX = event.clientX;
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
    const x = event.clientX - rect.left;
    const curDate = new Date(this.startDate.getTime() + x / pixelsPerMs);

    this.curTime = curDate;
    this.x = x;
    // this.y = 0;
    this.drawTimeline();
  }

  private onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }
}

export default Timeline;
