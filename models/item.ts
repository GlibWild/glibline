class Item {
  public itemId: number;
  public itemName: string;
  public startTime: Date;
  public endTime: Date;

  constructor(
    itemId: number,
    itemName: string,
    startTime: Date,
    endTime: Date
  ) {
    this.itemId = itemId;
    this.itemName = itemName;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export default Item;
