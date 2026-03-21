import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; //npm install -D @types/cors
import dotenv from 'dotenv';
import {Card} from './models/card.ts';

dotenv.config();

const app = express();

//allows cross origin requests from our react frontend
//e.g. localhost:5173 can talk to localhost:5000
app.use(cors());
app.use(express.json());

//connect to local atlas deployment (make sure matches)
const MONGO_URI =  process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

//search endpoint
app.get('/api/cards/search', async (req, res) => {
    try {
        //if theres a name search for it
        const {name} = req.query;
        //otherwise return the first 30 cards
        const query = name ? {name: {$regex: name as string, $options: 'i'}}:{};
        const cards = await Card.find(query).limit(30);
        res.json(cards);
    } catch (error){
        console.error('Error searching cards:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});