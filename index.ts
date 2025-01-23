import { h } from "./h";
import dayjs from "dayjs";

class Timeline {
  private container: HTMLElement;
  private timeline: HTMLElement;
  private startDate: Date;
  private endDate: Date;
  private zoomLevel: number;
  private offset: number;

  private curTime: Date;
  private x: number;
  private y: number = 100;

  private tagDiv: HTMLElement;
  private lineDiv: HTMLElement;
  private xAxisDiv: HTMLElement;

  constructor(containerId: string, startDate: Date, endDate: Date) {
    console.log(startDate, endDate);
    this.container = document.getElementById(containerId)!;
    this.startDate = startDate;
    this.endDate = endDate;
    this.zoomLevel = 1;
    this.offset = 0;

    this.timeline = this.createTimelineElement();
    this.container.appendChild(this.timeline);

    this.init();
  }
  private createTimelineElement(): HTMLElement {
    return h("div", {
      className: "timeline-zoom",
      style: "width:100%;height:100%;display:flex;align-items:center;",
    });
  }
  private init() {
    this.container.addEventListener("click", this.onClick.bind(this));
    this.container.addEventListener("wheel", this.onWheel.bind(this));
    this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.container.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.container.addEventListener("mouseleave", this.onMouseUp.bind(this));

    this.drawTimeline();
  }
  private drawTimeline() {
    this.timeline.innerHTML = "";
    //scale(${this.zoomLevel})
    this.timeline.style.transform = ` translateX(${this.offset}px)`;
    console.log(this.container.clientWidth, this.zoomLevel);
    let timelineWidth = this.container.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;

    let lastDate;
    for (let i = 0; i <= timelineWidth; ) {
      const date = new Date(this.startDate.getTime() + i / pixelsPerMs);
      if (!lastDate || date.getDate() != lastDate.getDate()) {
        this.xAxisDiv = h(
          "div",
          {
            className: "timeline-event",
            style: `left: ${i}px;width:${180}px;font-size:14px;border:1px solid #fff;box-sizing:border-box;flex:0 0 auto;user-select:none;`,
          },
          dayjs(date).format("YYYY-MM-DD HH:mm:ss")
        );
        lastDate = date;
        i += 180;
      } else {
        this.xAxisDiv = h(
          "div",
          {
            className: "timeline-event",
            style: `left: ${i}px;width:${180}px;font-size:14px;border:1px solid #fff;box-sizing:border-box;flex:0 0 auto;user-select:none;`,
          },
          dayjs(date).format("HH:mm:ss")
        );
        i += 180;
      }
      this.timeline.appendChild(this.xAxisDiv);
    }
    this.tagDiv = h(
      "div",
      {
        style: `position:absolute;color:#fff;top:${this.y}px;left:${this.x}px`,
      },
      h("div", {}, dayjs(this.curTime).format("YYYY-MM-DD HH:mm:ss")),
      h("div", {}, this.offset + ";" + this.x)
    );

    this.lineDiv = h("div", {
      style: `position:absolute;width:1px;height:100%;background-color:#fff;left:${this.x}px`,
    });

    this.timeline.appendChild(this.lineDiv);
    this.timeline.appendChild(this.tagDiv);
  }

  private onClick(event: MouseEvent) {
    // const rect = this.container.getBoundingClientRect();
    // const x = event.clientX - rect.left;
    // const range = this.endDate.getTime() - this.startDate.getTime();
    // const clickedDate = new Date(
    //   this.startDate.getTime() + (x / this.container.clientWidth) * range
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

    let timelineWidth = this.container.clientWidth * this.zoomLevel;
    let range = this.endDate.getTime() - this.startDate.getTime();
    let pixelsPerMs = timelineWidth / range;

    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // console.log(event.clientX, rect.left, pixelsPerMs, this.offset);
    const curDate = new Date(
      this.startDate.getTime() + (x - this.offset) / pixelsPerMs
    );

    this.curTime = curDate;
    this.x = x - this.offset;
    // this.y = 0;
    this.drawTimeline();
  }

  private onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }
}

export default Timeline;
