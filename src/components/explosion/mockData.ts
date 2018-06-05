import { ICategory, IFlatNode } from "./types";

// 设备爆炸图的数据，平面结构
export const allData: IFlatNode[] = [
  { title: "港机1", key: "P001", parent: "" },
  { title: "A", key: "A", parent: "P001" },
  { title: "B", key: "B", parent: "P001" },
  { title: "C", key: "C", parent: "P001" },
  { title: "A-1", key: "A-1", parent: "A" },
  { title: "A-2", key: "A-2", parent: "A" },
  { title: "A-3", key: "A-3", parent: "A" },
  { title: "B-1", key: "B-1", parent: "B" },
  { title: "B-1-1", key: "B-1-1", parent: "B-1" },
  { title: "B-1-2", key: "B-1-2", parent: "B-1" },
  { title: "B-2", key: "B-2", parent: "B" },
  { title: "B-2-1", key: "B-2-1", parent: "B-2" },
  { title: "B-2-1-1", key: "B-2-1-1", parent: "B-2-1" },
  { title: "B-2-1-2", key: "B-2-1-2", parent: "B-2-1" },
  { title: "B-2-1-2-1", key: "B-2-1-2-1", parent: "B-2-1-2" },
  { title: "B-2-2", key: "B-2-2", parent: "B-2" },
  { title: "C-1", key: "C-1", parent: "C" },
  { title: "C-1-1", key: "C-1-1", parent: "C-1" },
  { title: "C-1-2", key: "C-1-2", parent: "C-1" },
  { title: "C-2", key: "C-2", parent: "C" },
  { title: "C-3", key: "C-3", parent: "C" },
  { title: "C-3-1", key: "C-3-1", parent: "C-3" },
  { title: "C-4", key: "C-4", parent: "C" }
];

export const mockCategories: ICategory[] = [
  {
    pType: "岸桥",
    items: [
      { pName: "工号1-1", pic: "pic1-1", active: true },
      { pName: "工号1-2", pic: "pic1-2", active: true },
      { pName: "工号1-3", pic: "pic1-3", active: false },
      { pName: "工号1-4", pic: "pic1-4", active: false },
      { pName: "工号1-5", pic: "pic1-5", active: true }
    ]
  },
  {
    pType: "轮胎吊",
    items: [
      { pName: "工号2-1", pic: "pic2-1", active: true },
      { pName: "工号2-2", pic: "pic2-2", active: true },
      { pName: "工号2-3", pic: "pic2-3", active: false }
    ]
  },
  {
    pType: "塔机",
    items: [
      { pName: "工号3-1", pic: "pic3-1", active: false },
      { pName: "工号3-2", pic: "pic3-2", active: false },
      { pName: "工号3-3", pic: "pic3-3", active: true }
    ]
  }
];
