import item from "./item";
class Group {
  public groupId: number;
  public groupName: string;
  public items: Array<item>;

  constructor(groupId: number, groupName: string, items: Array<item>) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.items = items;
  }
}

export default Group;
