export default class GroupOption {
  public textColor?;
  public backgroundColor?;
  public textSize?;

  constructor(
    textColor: string = "#fff",
    backgroundColor: string = "#999",
    textSize: number = 14
  ) {
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
    this.textSize = textSize;
  }
}
