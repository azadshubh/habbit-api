# Smart Habit Tracker

This repository contains the code for the Smart Habit Tracker application. The Smart Habit Tracker is designed to help users track and manage their habits effectively.

## Features

- Add new habits
- Track daily progress
- View habit statistics
- Set reminders for habits

## Code Structure



## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/SmartHabitTracker.git
    cd SmartHabitTracker
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    npm start
    ```

### Running Tests

To run tests, use the following command:
```bash
npm test
```

## Using Postman to Test the API

1. Open Postman and create a new request.

2. Set the request method and URL:
    - For example, to add a new habit, set the method to `POST` and the URL to `http://localhost:3000/habits`.

3. Set the request body:
    - For a `POST` request to add a new habit, set the body to:
    ```json
    {
        "name": "Exercise",
        "frequency": "Daily"
    }
    ```

4. Send the request and check the response.

### Example Endpoints

- **Add a new habit**
    - Method: `POST`
    - URL: `/habits`
    - Body:
    ```json
    {
        "name": "Exercise",
        "frequency": "Daily"
    }
    ```

- **Get all habits**
    - Method: `GET`
    - URL: `/habits`

- **Update a habit**
    - Method: `PUT`
    - URL: `/habits/:id`
    - Body:
    ```json
    {
        "name": "Read",
        "frequency": "Weekly"
    }
    ```

- **Delete a habit**
    - Method: `DELETE`
    - URL: `/habits/:id`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.


