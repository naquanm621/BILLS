export interface Bill {
  id: number;
  vendor: string;
  amount: number;
  dueDate: string;
  color: string; // for the circle
}

export const bills: Bill[] = [
  {
    id: 1,
    vendor: "Netflix",
    amount: 9.99,
    dueDate: "4/22",
    color: "bg-red-500",
  },
  {
    id: 2,
    vendor: "ConEd",
    amount: 87.41,
    dueDate: "4/28",
    color: "bg-blue-500",
  },
  {
    id: 3,
    vendor: "Spectrum",
    amount: 64.99,
    dueDate: "4/30",
    color: "bg-yellow-500",
  },
  {
    id: 4,
    vendor: "NYC Water",
    amount: 41.2,
    dueDate: "5/03",
    color: "bg-cyan-500",
  },
];