const _ = require('lodash')
const pricesBySize = require('../database/size_price')
const pricesByCrusty = require('../database/crusty_price')
const pricesByToppings = require('../database/toppings_price')
const TAX = 0.12

function roundToDecimals(amount) {
    return Math.round(amount * 100) / 100
}

module.exports = class PriceCalculator {

    constructor(body) {
        this.crusty = body.crusty;
        this.quantity = body.quantity;
        this.toppings = body.favorite_topping;
        this.size = body.size;
    }

    getFinalPrice() {
        let size = this.size
        let crusty = this.crusty
        let toppings = this.toppings
        let priceSize = (_.find(pricesBySize, function (o) { return o.size.toUpperCase() === size.toUpperCase() })).price
        let priceCrusty = (_.find(pricesByCrusty, function (o) { return o.crusty.toUpperCase() === crusty.toUpperCase() })).price
        let sumToppings = 0;

        if (Array.isArray(toppings)) {
            for (let i = 0; i < toppings; i++) {
                let priceTopping = _.find(pricesByToppings, function (o) { return o.topping.toUpperCase() === toppings[i].toUpperCase() })
                if (priceTopping !== undefined) {
                    sumToppings += parseFloat(priceTopping[i].price)
                }
            }
        } else {
            sumToppings += parseFloat((_.find(pricesByToppings, function (o) { return o.topping.toUpperCase() === toppings.toUpperCase() })).price)
        }
        let total = roundToDecimals(parseFloat(priceSize) + parseFloat(priceCrusty) + sumToppings) * this.quantity
        let tax = roundToDecimals(TAX * total)
        return roundToDecimals(total + tax)
    }

}