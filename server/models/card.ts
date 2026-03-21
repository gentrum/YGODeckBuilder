import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true, index: true},
    type: {type: String, required: true},
    desc: {type: String, required: true},
    atk: {type: Number},
    def: {type: Number},
    level: {type: Number},
    race: {type: String}, //wth why does ygoprodeck use race lmao
    attribute: {type: String},
    archetype: {type: String},
    card_images:[
        {
            image_url: String,
            image_url_small: String,
        },
    ]
});

// for efficient searching
cardSchema.index({name: 'text'});

export const Card = mongoose.model('Card', cardSchema);