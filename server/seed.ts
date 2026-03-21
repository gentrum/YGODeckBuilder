import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
//this being typescript but having to end in js is weird
import { Card } from './models/card.ts';

dotenv.config();

const SEED_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

async function seedDatabase() {
    try{
        //connect to local atlas deployment
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true');
        console.log('Connected to MongoDB');

        //fetch data from ygoprodeck api
        const response = await axios.get(SEED_URL);
        //this kinda thing may be api specific
        const cards = response.data.data;

        //clear existing cards
        await Card.deleteMany({});

        //insert cards
        console.log('Seeding ${cards.length} cards...');
        await Card.insertMany(cards);
        console.log('${cards.length} cards seeded successfully');
        //dont forget to exit process
        process.exit(0);
    } catch (error){
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();