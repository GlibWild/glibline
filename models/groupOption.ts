class GroupOption {
  public textColor?: string = "#fff";
  public backgroundColor?: string = "#999";
  public textSize?: number = 14;

  constructor(textColor: string = "#fff", backgroundColor: string = "#999", textSize: number = 14) {
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
    this.textSize = textSize;
  }
}

export default GroupOption;
