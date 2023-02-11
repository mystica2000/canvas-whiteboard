import { Component, createSignal, onMount } from 'solid-js';
import "./index.css"
import { Options } from './core/Options';

const App: Component = () => {

  const [isDrawing, setIsDrawing] = createSignal<boolean>(false);
  const [color, setColor] = createSignal("black");
  const [stroke, setStroke] = createSignal(5);

  let canvasOffSetX: number, canvasOffSetY: number;
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;
  let ws: WebSocket;


  onMount(() => {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    var rect: DOMRect = canvas.getBoundingClientRect();
    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = (e) => {
      console.log('opened', e)
    }

    canvasOffSetX = rect.left;
    canvasOffSetY = rect.top;


    canvas.height = window.innerHeight - canvasOffSetY;
    canvas.width = window.innerWidth - canvasOffSetX;

    ws.onmessage = (e) => {
      const obj = JSON.parse(e.data);

      if (obj != null) {
        if (Array.isArray(obj)) {
          obj.forEach((aObj: Message) => {
            drawOnScreen(aObj);
          })
        } else {
          drawOnScreen(obj);
        }
      }

    }
  });

  const drawOnScreen = (message: Message) => {
    if (message.command == "draw") {
      ctx.lineWidth = 5;
      ctx.lineCap = "round"
      ctx.imageSmoothingEnabled = true;
      ctx.lineTo(message.x, message.y)
      ctx.strokeStyle = message.color;
      ctx.stroke()
    } else if (message.command == "start") {
      ctx.beginPath()
      ctx.stroke()
    } else {
      ctx.beginPath();
      ctx.stroke()
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    setIsDrawing(true);

    ws.send(JSON.stringify(
      {
        type: 'start',
      }))
  }

  const handleMouseUp = () => {

    ws.send(JSON.stringify(
      {
        type: 'stop',
      }))

    setIsDrawing(false);

  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing()) return;

    ws.send(JSON.stringify(
      {
        x: `${event.clientX - canvasOffSetX}`,
        y: `${event.clientY - canvasOffSetY}`,
        command: 'draw',
        color: color()
      }))
  }

  const handleDoubleClick = (event: MouseEvent) => {
    var x = event.clientX;
    var y = event.clientY;

    // can able to type text! on the (x,y) pixel
    // can change font-size (bound 20px,30px,40px)
  }

  const getWidth = () => {
    return window.innerWidth;
  }

  const getHeight = () => {
    return window.innerHeight;
  }

  return (
    <div class="container">
      <div class="header">
        <Options setColor={setColor} color={color()} setStroke={setStroke} stroke={stroke()} />
      </div>
      {/* <input type="color" value={color()} onChange={(e) => setColor(e.currentTarget.value)} /> */}
      <canvas id="canvas" onDblClick={handleDoubleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
    </div>

  );
};

export default App;
