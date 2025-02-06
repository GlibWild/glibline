class Menu {
  public text: string = "";
  public icon: string = "";
  public iconSize: number = 14;
  public textSize: number = 14;
  public clickEvent: (e: MouseEvent, startTime: Date, endTime: Date) => void;

  constructor({
    text = "",
    icon = "",
    iconSize = 14,
    textSize = 14,
    clickEvent = (e: MouseEvent, startTime: Date, endTime: Date) => {},
  }: Partial<Menu>) {
    this.text = text;
    this.icon = icon;
    this.iconSize = iconSize;
    this.textSize = textSize;
    this.clickEvent = clickEvent;
  }
}

export default Menu;
