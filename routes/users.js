const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const _ = require('lodash');
const {validationResult} = require('express-validator');
const Order = require('../models/Order');
let database = require('../database/pizzadb');
let crusties = _.uniq(_.map(database, 'crusty'));
let newOrder = {customer: {}, order: {}};
let PriceCalculator = require('../modules/PriceCalculator');


//User model
const User = require ('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Index Page
router.get('/index', (req, res) => res.render('index', {crusties: crusties, pizzas: database}));

router.get('/pizzas/:crusty', (req, res) => {
    let pizzas = _.filter(database, {'crusty': req.params.crusty})
    res.send(pizzas)
});

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, address, phone, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !address || !phone || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'});
    }

    // Check passwords match
    if(password !== password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    //Check pass length
    if(password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            address,
            phone,
            password,
            password2
        })
    } else {
        // Validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user) {
                //User exists
                errors.push({msg: 'Email is already registered'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    address,
                    phone,
                    password,
                    password2
                })
            } else {
                const newUser = new User({
                    name,
                    email,
                    address,
                    phone,
                    password 
                });
                
                // Hash Password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        //Set password to hashed
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in') 
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err))
                }))
            }
        })
    }
});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/index',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/order', (req, res) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let calculator = new PriceCalculator(req.body)
    let price = calculator.getFinalPrice()
    const {crusty, favorite_topping, size, quantity} = req.body;
    const {name, email, address, phone} = req.user;
    
    const order = new Order({
        email,
        crusty,
        favorite_topping,
        size,
        quantity,
        price
    });

    order.save();
    
    res.render('order', {'request': req, 'price': price, 'timeToDelivery': '30 min'})
});

module.exports = router;