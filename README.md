# Canvas-Whiteboard

## RealTime Collaborative WhiteBoard

- HTML Canvas API
- Web Sockets Server

It uses vector to render the drawings.
Web Socket acts Central Server that broadcasts the (x,y) vector points to the connected clients

#### Go websockets 
  - uses in-memory map and array to store clients and points ([x,y])
  - when client connects on first time, 
         - web socket sends the points (array)
  - then, client can access the current change after rendering old array points
  - broadcasts to all clients.
  
#### Client Side
  - On first load, gets the array of points from the ws server and renders the content on the screen.
  - Then on every change, web sockets sends the data to the ws server + gets the changes made by other clients and renders on the screen.


### Todo:

- Text on canvas
- Touch support
- smooth curve 
- option for color/font-size/stroke width

### Extensions
- Can enter Room Code and Collab with others
