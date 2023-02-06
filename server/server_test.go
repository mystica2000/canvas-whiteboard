package main

import (
	"encoding/json"
	"strings"
	"testing"

	"net/http"
	"net/http/httptest"

	"github.com/gorilla/websocket"
)

func TestMain(t *testing.T) {
	// new server
	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		draw(w, r)
	}))
	defer testServer.Close()

	url := "ws" + strings.TrimPrefix(testServer.URL, "http")

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)

	if err != nil {
		t.Fatalf("Failed to dial websocket server %v", err)
	}
	defer conn.Close()

	vec := Vectors{X: 100, Y: 150}

	p, err := json.Marshal(vec)
	if err != nil {
		t.Fatalf("Failed to encode json %v", err)
	}

	if err := conn.WriteMessage(websocket.TextMessage, p); err != nil {
		t.Fatalf("Failed to send msg %v", err)
	}

	// read message back
	_, p, err = conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}

	// Decode the JSON Response
	var vec2 Vectors
	if err := json.Unmarshal(p, &vec2); err != nil {
		t.Fatalf("Failed to decode JSON: %v", err)
	}

	if vec.X != vec2.X || vec.Y != vec2.Y {
		t.Fatalf("Unexcepted response %v", vec2)
	}

}
