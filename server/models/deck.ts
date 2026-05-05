import mongoos from 'mongoose';

const DeckSchema = new mongoos.Schema({
    name: {type: String, required: true, unique: true},
    cards: [{
        cardId: {type: String, required: true},
        quantity: {type: Number, required: true, min: 1, max: 3}
    }],
    lastModified: {type: Date, default: Date.now}
});

export const Deck = mongoos.model('Deck', DeckSchema);