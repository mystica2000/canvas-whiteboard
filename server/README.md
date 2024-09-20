## Setup Instructions

### Prerequisites

- Ensure Go is installed (version **1.17 or later**). You can check your installed version using:

  ```bash
  go version
  ```

### Install Dependencies

- To clean up unused dependencies and ensure all required modules are installed, run the following:

```bash
go mod tidy
```

- Running the Server
  To start the server, use:

```bash
go run main.go
```

Open http://localhost:8080/servertest to check if server is up in the browser.
