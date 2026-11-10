const express = require('express');

const pilotsRouter = require('./routes/pilots');
const dronesRouter = require('./routes/drones');
const assignmentsRouter = require('./routes/assignments');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'DroneDeck Club',
    message: 'Drone Management and Pilot Assignment API',
    status: 'Running'
  });
});

// Register routers
app.use('/pilots', pilotsRouter);
app.use('/drones', dronesRouter);
app.use('/assignments', assignmentsRouter);

// Register routers under /api prefix as well
app.use('/api/pilots', pilotsRouter);
app.use('/api/drones', dronesRouter);
app.use('/api/assignments', assignmentsRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
