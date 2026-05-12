import mongoose from 'mongoose';

const DeckSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    mainDeck: [{
        cardId: {type: String, required: true},
        quantity: {type: Number, required: true, min: 1}
    }],
    extraDeck: [{
        cardId: {type: String, required: true},
        quantity: {type: Number, required: true, min: 1}
    }],
    sideDeck: [{
        cardId: {type: String, required: true},
        quantity: {type: Number, required: true, min: 1}
    }],
    lastModified: {type: Date, default: Date.now}
});

export const Deck = mongoose.model('Deck', DeckSchema);