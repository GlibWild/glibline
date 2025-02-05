import GroupOption from "./groupOption";
import item from "./item";
class Group {
  public groupId: number;
  public groupName: string;
  public items: Array<item>;
  public groupOptions: GroupOption = new GroupOption();

  constructor(
    groupId: number,
    groupName: string,
    items: Array<item>,
    groupOptions?: GroupOption
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.items = items;
    if (groupOptions) this.groupOptions = groupOptions;
  }
}

export default Group;
