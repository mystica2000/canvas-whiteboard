package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Vectors struct {
	X      json.Number `json:"x"`
	Y      json.Number `json:"y"`
	Type   string      `json:"command"`
	Color  string      `json:"color"`
	Stroke json.Number `json:"stroke"`
}

// struct{} takes no byte, so used it here instead of bool
var clients = make(map[*websocket.Conn]time.Time)
var mux sync.Mutex

// concurrent user
var semaphore = make(chan struct{}, 100)
var idleTimeout = time.Minute * 2

var VectorsArray []Vectors

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { // CORS
		return true // remove and add r.Header.Get("Origin") == "http://localhost:3000"
	},
}

func draw(res http.ResponseWriter, req *http.Request) {

	select {
	case semaphore <- struct{}{}:
		{
			defer func() {
				<-semaphore
			}()
			// upgrade the http to websocket request
			conn, err := upgrader.Upgrade(res, req, nil) // upgraded to web socket protocol

			if err != nil {
				fmt.Print(err)
				return
			}

			clients[conn] = time.Now() // create new client
			fmt.Println("New client created")

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

				mux.Lock()
				clients[conn] = time.Now()
				mux.Unlock()

				if err != nil {
					delete(clients, conn)
					conn.Close()
					break
				}

				if string(p) == "all" {

					vectorsJSON, err := json.Marshal(VectorsArray)
					if err != nil {
						fmt.Println(err)
						return
					}

					fmt.Println("all sending")
					conn.WriteMessage(websocket.TextMessage, vectorsJSON)
					continue
				}

				if !json.Valid(p) {
					fmt.Println("Not a Valid JSON", string(p))
					continue
				}

				var points Vectors

				errs := json.Unmarshal(p, &points)
				if errs != nil {
					fmt.Println("Error Decoding JSON: ", errs)
					continue
				}

				// fmt.Println("Received Vectors", points.X, points.Y, points.Type, points.Color)

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

			mux.Lock()
			delete(clients, conn)
			mux.Unlock()
			conn.Close()
		}
	default:
		fmt.Println("overloaded")
		http.Error(res, "Too many connections", http.StatusTooManyRequests)
		return
	}
}

func handleIdle() {
	for {
		time.Sleep(50 * time.Second)
		mux.Lock()

		for conn, t := range clients {
			if time.Since(t) > idleTimeout {
				fmt.Println("connection closing...")
				delete(clients, conn)
				conn.Close()
			}
		}
		mux.Unlock()
	}
}

func main() {
	// Create Http Server
	http.HandleFunc("/servertest", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("server is up"))
	})
	http.HandleFunc("/", draw)

	go handleIdle()
	fmt.Println("WebSocket server running!")
	err := http.ListenAndServe("0.0.0.0:8080", nil)
	if err != nil {
		fmt.Println(err)
	}
}
