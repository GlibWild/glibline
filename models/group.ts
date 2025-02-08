import GroupOption from "./groupOption";
import Item from "./item";
export default class Group {
  public groupId: number;
  public groupName: string;
  public items: Array<Item>;
  public groupOptions: GroupOption = new GroupOption();

  constructor(
    groupId: number,
    groupName: string,
    items: Array<Item>,
    groupOptions?: GroupOption
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.items = items;
    if (groupOptions) this.groupOptions = groupOptions;
  }
}
