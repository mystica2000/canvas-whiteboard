type state = "move" | "down"


interface Message {
  command: state;
  x:  number;
  y: number;
  stroke: number;
  color: string;
}