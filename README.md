# Freight Flow

## Description

Freight Flow is a routing and trip-planning application designed specifically for freight trucks. This project addresses the complexities of routing large vehicles by incorporating constraints like height and weight restrictions, ensuring truck drivers can navigate safely and efficiently.

The motivation behind Freight Flow was to create a specialized tool for truckers, logistics managers, and freight companies to streamline their operations, avoid costly errors like route detours, and enhance safety compliance. The application integrates real-time tracking and dynamic updates to ensure a smooth user experience, similar to popular navigation apps like Google Maps.

Through this project, I gained valuable experience in working with geolocation APIs, handling environmental variables securely, implementing responsive design, and optimizing backend database models for real-world use cases.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)

## Installation

Follow these steps to set up Freight Flow locally or in a development environment:

1. Clone the repository:
    ```bash
    git clone https://github.com/<your-username>/freight-flow.git
    ```

2. Navigate to the project directory:
    ```bash
    cd freight-flow
    ```

3. Install dependencies for both the backend and frontend:
    ```bash
    cd server
    npm install
    cd ../client
    npm install
    ```

4. Set up environment variables:
   - Create a `.env` file in the `server` directory with the following variables:
     ```
     MONGO_URI=<your-mongo-database-uri>
     JWT_SECRET=<your-secret-key>
     ```
   - Add your OpenRouteService and Google Maps API keys in the Render environment settings or `.env`:
     ```
     REACT_APP_ORS_API_KEY=<your-openrouteservice-api-key>
     REACT_APP_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
     ```

5. Start the backend:
    ```bash
    cd server
    npm start
    ```

6. Start the frontend:
    ```bash
    cd client
    npm start
    ```

## Usage

Freight Flow enables users to:
- Input their starting location and destination address.
- Add truck-specific constraints like height and weight to avoid restricted routes.
- View an optimized route tailored for freight trucks on an interactive map.
- Track their live location as they navigate the route.
- End trips and save the route to a database for future reference.

### Example Workflow:
1. Enter your starting location and destination address.
2. Specify your truck's height and weight.
3. Click "Fetch Route" to calculate an optimized route that avoids restricted areas.
4. Begin your journey, and the app will track your progress live.
5. When the trip is completed, click "End Route" to save the trip details.

## Credits

- **Spencer Henegar** - Developer and project lead.
- APIs and Libraries:
  - [OpenRouteService API](https://openrouteservice.org/)
  - [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
  - [React](https://reactjs.org/)

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

## Features

- **Customizable Truck Constraints**: Avoid height- or weight-restricted routes.
- **Live Location Tracking**: Continuously update your location during the trip.
- **Optimized Routing**: Generate routes tailored for freight trucks.
- **Trip Management**: Save completed trips to the database with details like route distance and duration.
- **Secure Authentication**: User-based route saving with secure tokens.
