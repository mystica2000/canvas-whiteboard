import { Component, createSignal, onMount, Show } from 'solid-js';
import "./index.css"
import { Options } from './core/Options';

const App: Component = () => {

  const [isDrawing, setIsDrawing] = createSignal<boolean>(false);
  const [color, setColor] = createSignal("black");
  const [stroke, setStroke] = createSignal(5);
  const [displayError, setDisplayError] = createSignal(false);

  let canvasOffSetX: number, canvasOffSetY: number;
  let ctx: CanvasRenderingContext2D;
  let canvas: any;
  let ws: WebSocket;

  let first: boolean = true;

  const debounce = (callback: any) => {
    var timer: number;

    return () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(callback, 1000)
    }
  }

  onMount(() => {

    ws = new WebSocket("ws:localhost:8080/")

    ws.onclose = (e) => {
      if (e.code == 1006) {
        setDisplayError(true);
      }
    }

    const handleResize = () => {
      var rect: DOMRect = canvas.getBoundingClientRect();
      ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      canvasOffSetX = rect.left;
      canvasOffSetY = rect.top;

      canvas.height = window.innerHeight - canvasOffSetY;
      canvas.width = window.innerWidth - canvasOffSetX;

      if (first == false) {
        ws.send("all")
      }
    }
    window.addEventListener('resize', debounce(handleResize))
    handleResize();
    first = false;

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
      ctx.lineCap = "round"
      ctx.imageSmoothingEnabled = true;
      ctx.lineWidth = message.stroke;
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

  const handleMouseDown = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();

    setIsDrawing(true);

    ws.send(JSON.stringify(
      {
        type: 'start',
      }))
  }

  const handleMouseUp = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();

    ws.send(JSON.stringify(
      {
        type: 'stop',
      }))

    setIsDrawing(false);

  }

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {

    event.preventDefault();
    if (!isDrawing()) return;


    if (event instanceof MouseEvent) {

      let message = {
        x: event.clientX - canvasOffSetX,
        y: event.clientY - canvasOffSetY,
        command: 'draw',
        color: color(),
        stroke: stroke()
      }

      ws.send(JSON.stringify(message))
    } else {
      let message = {
        x: event.touches[0].clientX - canvasOffSetX,
        y: event.touches[0].clientY - canvasOffSetY,
        command: 'draw',
        color: color(),
        stroke: stroke()
      }
      ws.send(JSON.stringify(message))
    }

  }

  return (
    <Show when={displayError() == false} fallback={<div>Server is at max capacity :/ try again later!</div>} >
      <div class="container">
        <Options setColor={setColor} color={color()} setStroke={setStroke} stroke={stroke()} />
        <canvas ref={canvas} id="canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        ></canvas>
      </div>
    </Show>
  );
};

export default App;
