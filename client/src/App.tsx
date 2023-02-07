import { Component, createSignal, onMount } from 'solid-js';
import "./index.css"

const App: Component = () => {

  const [isDrawing, setIsDrawing] = createSignal<boolean>(false);
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

    canvasOffSetX = rect.left;
    canvasOffSetY = rect.top;

    canvas.width = window.innerWidth - canvasOffSetX;
    canvas.height = window.innerHeight - canvasOffSetY;

    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = (e) => {
      console.log('opened',e)
    }
    ws.onmessage = (e) => {

      const obj = JSON.parse(e.data);

      if(Array.isArray(obj)) {
        obj.forEach((aObj: any) => {
          if (aObj.type == "move") {
            ctx.lineTo(aObj.x, aObj.y)
            ctx.stroke()
          } else if (aObj.type == "down") {
            ctx.beginPath()
            ctx.stroke()
          }
        })
      } else {
          if (obj.type == "move") {
            ctx.lineTo(obj.x, obj.y)
            ctx.stroke()
          } else if (obj.type == "down") {
            ctx.beginPath()
            ctx.stroke()
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
        type: 'move'
      }))
  }

  return (
    <div class="container">
      <div>Side bar</div>
      <canvas id="canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
    </div>

  );
};

export default App;
