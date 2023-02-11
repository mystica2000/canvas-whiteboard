package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

type Vectors struct {
	X     json.Number `json:"x"`
	Y     json.Number `json:"y"`
	Type  string      `json:"command"`
	Color string      `json:"color"`
}

// struct{} takes no byte, so used it here instead of bool
var clients = make(map[*websocket.Conn]struct{})

var VectorsArray []Vectors

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { // CORS
		return true // remove and add r.Header.Get("Origin") == "http://localhost:3000"
	},
}

func draw(res http.ResponseWriter, req *http.Request) {
	// upgrade the http to websocket request
	conn, err := upgrader.Upgrade(res, req, nil) // upgraded to web socket protocol

	if err != nil {
		fmt.Print(err)
		return
	}

	clients[conn] = struct{}{} // create new client
	fmt.Print("New client created \n")

	// on connection open, send the data (x,y) made by other clients to the connected client to render the client
	vectorsJSON, err := json.Marshal(VectorsArray)
	if err != nil {
		fmt.Println(err)
		return
	}

	// bulk amount of data
	conn.WriteMessage(websocket.TextMessage, vectorsJSON)

	for { // loop forever to receive/send msg
		messageType, p, err := conn.ReadMessage() // read if any client sends message

		if err != nil {
			delete(clients, conn)
			conn.Close()
			break
		}

		if !json.Valid(p) {
			fmt.Print("Not a Valid JSON", string(p))
			continue
		}

		var points Vectors

		errs := json.Unmarshal(p, &points)
		if errs != nil {
			fmt.Print("Error Decoding JSON: ", errs)
			continue
		}

		fmt.Println("Received Vectors", points.X, points.Y, points.Type, points.Color)

		// add the current to the vectors
		// useful when new client joins in
		VectorsArray = append(VectorsArray, points)

		// Encode the array of User structs as JSON
		vectorsJSON, err := json.Marshal(points)
		if err != nil {
			fmt.Println(err)
			return
		}

		for client := range clients { // go thru every client and send the msg
			err := client.WriteMessage(messageType, vectorsJSON) // broadcast the current json value only

			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}

}

func main() {
	// Create Http Server
	http.HandleFunc("/", draw)

	fmt.Println("WebSocket server running on localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err)
	}
}
