package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/shirou/gopsutil/v3/process"
)

type KillResponse struct {
	Success bool    `json:"success"`
	Killed  []int32 `json:"killed"`  // PIDs we terminated
	Message string  `json:"message"` // human-readable
}

func killHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	// Read ?name=ClueLy.exe (default)
	target := r.URL.Query().Get("name")
	if target == "" {
		target = "ClueLy.exe"
	}
	targetLower := strings.ToLower(target)

	// Enumerate all processes
	procs, err := process.Processes()
	if err != nil {
		http.Error(w, `{"success":false,"message":"`+err.Error()+`"}`, 500)
		return
	}

	var killed []int32
	for _, p := range procs {
		// p.Name() returns e.g. "ClueLy.exe" on Windows or just "cluely" on Unix
		name, err := p.Name()
		if err != nil {
			continue
		}
		if strings.ToLower(name) == targetLower {
			// Attempt to kill
			if err := p.Kill(); err != nil {
				log.Printf("failed to kill PID %d: %v\n", p.Pid, err)
				continue
			}
			killed = append(killed, p.Pid)
		}
	}

	resp := KillResponse{
		Success: len(killed) > 0,
		Killed:  killed,
	}
	if len(killed) > 0 {
		resp.Message = target + " terminated (" +
			strings.Trim(strings.Join(strings.Fields(fmt.Sprint(killed)), ", "), "[]") + ")"
	} else {
		resp.Message = target + " not found"
	}

	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/kill", killHandler)
	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
