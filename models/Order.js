const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    crusty: {
        type: String,
        required: true
    },
    favorite_topping: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        required: true
    }
})

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;