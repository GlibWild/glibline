import Group from "./group";

class Menu {
  public text: string = "";
  public icon: string = "";
  /**仅支持非路径图片图标 */
  public iconColor: string = "#000";
  public iconSize: number = 14;
  public textSize: number = 14;
  public textColor: string = "#000";
  public clickEvent: (
    e: MouseEvent,
    startTime: Date,
    endTime: Date,
    group: Group
  ) => void;

  constructor({
    text = "",
    icon = "",
    iconSize = 14,
    textSize = 14,
    iconColor = "#000",
    textColor = "#000",
    clickEvent = (
      e: MouseEvent,
      startTime: Date,
      endTime: Date,
      group: Group
    ) => {},
  }: Partial<Menu>) {
    this.text = text;
    this.icon = icon;
    this.iconSize = iconSize;
    this.textSize = textSize;

    this.textColor = textColor;
    this.iconColor = iconColor;
    this.clickEvent = clickEvent;
  }
}

export default Menu;
