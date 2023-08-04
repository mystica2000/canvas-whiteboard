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


### Supports:

- Touch support
- smooth curve 
- option for color/font-size/stroke width

Thought Process: https://twitter.com/CuriouZmystee/status/1623052597287612417?s=20

https://user-images.githubusercontent.com/45729256/219873892-17a98693-5532-4a51-8b48-5be0464f848f.mp4



### Extensions
- Can enter Room Code and Collab with others
