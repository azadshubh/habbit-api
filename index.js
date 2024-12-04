const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { WebSocketServer } = require('ws');

const app = express();
app.use(bodyParser.json());

// Improved in-memory storage with better error handling
const habitStore = {
    habits: [], 
    weeklyLogs: {}
};

// Enhanced utility functions
const utils = {
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },
    
    validateHabitInput(name, dailyGoal) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid habit name');
        }
        
        if (!dailyGoal || typeof dailyGoal !== 'number' || dailyGoal <= 0) {
            throw new Error('Invalid daily goal');
        }
    }
};

// Add a new habit with improved error handling
app.post('/habits', (req, res) => {
    try {
        const { name, dailyGoal } = req.body;
        
        // Validate input
        utils.validateHabitInput(name, dailyGoal);
        
        const habit = {
            id: habitStore.habits.length + 1,
            name: name.trim(),
            dailyGoal,
            progress: {}, // Tracks completion by date
            createdAt: new Date().toISOString()
        };
        
        habitStore.habits.push(habit);
        res.status(201).json({ status: 'success', data: habit });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// Mark a habit as complete for a day with improved validation
app.put('/habits/:id', (req, res) => {
    const habitId = parseInt(req.params.id);
    const { quantity } = req.body;

    // Find the habit
    const habit = habitStore.habits.find(h => h.id === habitId);
    
    if (!habit) {
        return res.status(404).json({ status: 'error', message: 'Habit not found' });
    }

    const today = utils.getCurrentDate();
    const currentProgress = habit.progress[today] || 0;
    const incrementAmount = quantity || 1;

    // Update progress, ensuring it doesn't exceed daily goal
    habit.progress[today] = Math.min(
        currentProgress + incrementAmount, 
        habit.dailyGoal
    );

    res.json({ 
        status: 'success', 
        data: { 
            habitId: habit.id, 
            date: today, 
            progress: habit.progress[today] 
        } 
    });
});

// Enhanced habits retrieval with optional filtering
app.get('/habits', (req, res) => {
    const { completed, startDate, endDate } = req.query;
    
    let filteredHabits = habitStore.habits;

    if (completed === 'true') {
        filteredHabits = filteredHabits.filter(habit => 
            Object.values(habit.progress).some(progress => progress >= habit.dailyGoal)
        );
    }

    // Optional date filtering logic could be added here

    res.json({ 
        status: 'success', 
        data: filteredHabits,
        total: filteredHabits.length 
    });
});

// More robust weekly report generation
app.get('/habits/report', (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const report = habitStore.habits.map(habit => {
        const weeklyData = Object.entries(habit.progress)
            .filter(([date]) => new Date(date) >= sevenDaysAgo)
            .reduce((acc, [date, progress]) => {
                acc[date] = {
                    progress,
                    completed: progress >= habit.dailyGoal
                };
                return acc;
            }, {});

        return {
            id: habit.id,
            name: habit.name,
            dailyGoal: habit.dailyGoal,
            weeklyData,
            weeklyCompletion: Object.values(weeklyData)
                .filter(day => day.completed).length
        };
    });

    const reportDate = utils.getCurrentDate();
    habitStore.weeklyLogs[reportDate] = report;

    res.json({ 
        status: 'success', 
        data: report,
        reportDate 
    });
});

// Root route with more informative response
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Habit Tracker!',
        endpoints: [
            '/habits (GET, POST)',
            '/habits/:id (PUT)',
            '/habits/report (GET)'
        ]
    });
});

// WebSocket for daily reminders with error handling
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Cron job for daily reminders with better logging
cron.schedule('0 9 * * *', () => {
    try {
        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                    type: 'reminder',
                    message: 'Don\'t forget to complete your habits today!',
                    timestamp: new Date().toISOString()
                }));
            }
        });
        console.log('Daily reminder sent successfully');
    } catch (error) {
        console.error('Failed to send daily reminder:', error);
    }
});

// Enhanced error handling for server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
    console.error('Server startup error:', error);
    process.exit(1);
});

// Optional: Periodic cleanup of old data
setInterval(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    habitStore.habits.forEach(habit => {
        Object.keys(habit.progress).forEach(date => {
            if (new Date(date) < thirtyDaysAgo) {
                delete habit.progress[date];
            }
        });
    });
}, 24 * 60 * 60 * 1000); // Run daily