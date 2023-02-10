import { Component, createSignal, onMount } from 'solid-js';
import "./index.css"


const App: Component = () => {

  const [isDrawing, setIsDrawing] = createSignal<boolean>(false);
  const [color, setColor] = createSignal<string>("#000");
  const [stroke, setStroke] = createSignal<string>("");
  let canvasOffSetX: number, canvasOffSetY: number;
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;
  let ws: WebSocket;


  onMount(() => {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    var rect: DOMRect = canvas.getBoundingClientRect();
    ctx.lineWidth = 10;
    ctx.lineCap = "round"
   // ctx.strokeStyle = "#000";

    canvasOffSetX = rect.left;
    canvasOffSetY = rect.top;

    canvas.width = window.innerWidth - canvasOffSetX;
    canvas.height = window.innerHeight - canvasOffSetY;

    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = (e) => {
      console.log('opened', e)
    }
    ws.onmessage = (e) => {

      const obj = JSON.parse(e.data);

      if (obj != null && Object.keys(obj).length) {

        if (Array.isArray(obj)) { // at first, former drawing from other clients
          obj.forEach((aObj: Message) => {
            if (aObj.command === "move") {
             // ctx.strokeStyle = color()
              ctx.lineTo(aObj.x, aObj.y)
              ctx.stroke()
            } else if (aObj.command === "down") {
              ctx.beginPath()
              ctx.stroke()
            }
          })
        } else {
          if (obj.command == "move") {
           // ctx.strokeStyle = color()
            ctx.lineTo(obj.x, obj.y)
            ctx.stroke()
          } else if (obj.command == "down") {
            ctx.beginPath()
            ctx.stroke()
          }
        }
      }

    }
  });

  const handleMouseDown = (e: MouseEvent) => {
    setIsDrawing(true);
    ws.send(JSON.stringify(
      {
        type: 'down'
      }))
  }

  const handleMouseUp = () => {
    ctx.beginPath();
    ctx.stroke()
    setIsDrawing(false);
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing()) return;
    ws.send(JSON.stringify(
      {
        x: `${event.clientX - canvasOffSetX}`,
        y: `${event.clientY}`,
        type: 'move',
       // color: color()
      }))
  }

  return (
    <div class="container">
      <div>
        <input type="color" value={color()} onChange={(e) => { setColor(e.currentTarget.value) }} />
      </div>
      <canvas id="canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
    </div>

  );
};

export default App;
