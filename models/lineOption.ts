class LineOption {
  public textWidth?: number = 60;
  public tipTextSize?: number = 14;
  public tipColor?: string = "#fff";
  public tipBackground?: string = "#ffffff00";
  public tipLineColor?: string = "#fff";
  constructor(
    textWidth: number = 60,
    tipTextSize: number = 14,
    tipColor: string = "#fff",
    tipBackground: string = "#ffffff00",
    tipLineColor: string = "#fff",
  ) {
    this.tipColor = tipColor;
    this.textWidth = textWidth;
    this.tipTextSize = tipTextSize;
    this.tipBackground = tipBackground;
    this.tipLineColor = tipLineColor;
  }
}

export default LineOption;
