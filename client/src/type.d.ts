type state = "draw" | "start" | "end"


interface Message {
  command: state;
  x:  number;
  y: number;
  stroke: number;
  color: string;
}
