import Group from "./group";
import Item from "./item";
import Menu from "./menu";

export default class LineOption {
  public xAxisColor?;
  public xAxisBgColor?;
  public yAxisColor?;
  public yAxisBgColor?;

  public textWidth?;
  public tipTextSize?;
  public tipColor?;
  public tipBackground?;
  public tipLineColor?;
  public selectedColor?;
  public menus?: Array<Menu>;
  public dblClickEvent?: (
    e: MouseEvent,
    curTime: Date,
    item: Item | undefined,
    group: Group | undefined
  ) => void;
  constructor(
    xAxisColor: string = "#fff",
    xAxisBgColor: string = "transparent",
    yAxisColor: string = "#fff",
    yAxisBgColor: string = "transparent",
    textWidth: number = 60,
    tipTextSize: number = 14,
    tipColor: string = "#fff",
    tipBackground: string = "#ffffff00",
    tipLineColor: string = "#fff",
    selectedColor: string = "#acce46bf",
    menus: Array<Menu> | undefined = undefined,
    dblClickEvent?: (
      e: MouseEvent,
      curTime: Date,
      item: Item | undefined,
      group: Group | undefined
    ) => void
  ) {
    this.xAxisColor = xAxisColor;
    this.xAxisBgColor = xAxisBgColor;
    this.yAxisColor = yAxisColor;
    this.yAxisBgColor = yAxisBgColor;
    this.tipColor = tipColor;
    this.textWidth = textWidth;
    this.tipTextSize = tipTextSize;
    this.tipBackground = tipBackground;
    this.tipLineColor = tipLineColor;
    this.selectedColor = selectedColor;
    this.dblClickEvent = dblClickEvent;
    // if (menus) {
    //   this.menus = menus.map((t) => {
    //     return new Menu(t.text, t.icon, t.iconSize, t.textSize, t.clickEvent);
    //   });
    // }
    this.menus = menus;
  }
}
