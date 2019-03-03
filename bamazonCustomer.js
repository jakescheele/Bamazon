// Import Dependencies
mysql = require('mysql');
inquirer = require('inquirer');

var selectQuery = '';

// Create connection
var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'bamazon_db'
});

let shoppingCart = [];
function cartDisplay() { return 'My Cart (' + shoppingCart.length + ')' }
let myOrders = [];

// connect to database
connection.connect(function (err) {
    if (err) throw err;
    mainMenu();
})

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Welcome to Bamazon! What would you like to do?',
            choices: ['Go Shopping', cartDisplay(), 'Exit'],
            name: 'nav'
        }
    ]).then(function (res) {
        switch (res.nav) {
            case 'Go Shopping':
                goShopping()
                break;
            case cartDisplay():
                displayCart()
                break;
            case 'Exit':

                break;
        }
    })
}

function goShopping() {
    let choices = ['By Department', 'View All Items', cartDisplay()]
    inquirer.prompt([
        {
            type: 'list',
            message: 'How would you like to shop?',
            choices: choices,
            name: 'shopQuery'
        }
    ]).then(function (res) {
        switch (res.shopQuery) {
            case 'By Most Popular':

                break;
            case 'By Department':
                selectDepartment()
                break;
            case 'View All Items':
                selectQuery = 'SELECT * FROM products'
                displayProducts()
                break;
            default:
                displayCart();
        }
    })
}



// display by category
function selectDepartment() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Choose a department',
            // hoping to turn this into array from values in mySQL that updates as new depts are added/removed
            choices: ['Clothing', 'Electronics', 'Home & Garden', 'Sports & Outdoors', 'Pet Supplies'],
            name: 'dept'
        }
    ]).then(function (ans) {
        selectQuery = "SELECT * FROM products WHERE department_name='" + ans.dept + "'";
        displayProducts();
    })
}

// display all items available for sale
function displayProducts() {
    // include ids names prices
    connection.query(selectQuery, function (err, res) {
        if (err) throw (err);
        inquirer.prompt([
            {
                type: 'list',
                message: '',
                choices: function () {
                    var choiceArray = [];
                    let productLabel = '';
                    for (let i = 0; i < res.length; i++) {
                        productLabel = res[i].item_id + '. ' + res[i].product_name + '  -  $' + res[i].price
                        choiceArray.push(productLabel)
                    }
                    choiceArray.push(new inquirer.Separator(), 'Main Menu')
                    return choiceArray;
                },
                name: 'products'
            }
        ]).then(function (answer) {
            if (answer.products === 'Main Menu') return mainMenu()
            let selected = answer.products
            productSelected(selected.slice(0, 1))
        })
    })
}

function productSelected(id) {
    inquirer.prompt([
        {
            type: 'input',
            message: 'How many of these would you like to add to your cart?',
            name: 'quantity'
        }
    ]).then(function (res) {
        // add to cart
        shoppingCart.push(
            {
                id: id,
                quantity: res.quantity
            }
        )
        console.log(res.quantity + ' item(s) added to cart!')
        inquirer.prompt([
            {
                type: 'list',
                message: 'What would you like to do next?',
                choices: ['Keep Shopping', 'View Cart'],
                name: 'next'
            }
        ]).then(function (answer) {
            if (answer.next === 'Keep Shopping')
                goShopping();
            else displayCart();
        })
    })
}

function displayCart() {
    console.log('Your Cart:')
    let purchaseCost = 0;
    // get and disply product names/price from db using id's
    connection.query("SELECT * FROM products", function (err, products) {
        if (err) throw err
        for (e in shoppingCart) {
            for (i in products) {
                if (products[i].item_id === parseInt(shoppingCart[e].id)) {
                    purchaseCost += (parseFloat(products[i].price) * shoppingCart[e].quantity);
                    console.log(products[i].product_name, ' $', products[i].price, ' x ', shoppingCart[e].quantity, ' units')
                }
            }
        }
        console.log('Total: $', purchaseCost)
        inquirer.prompt([
            {
                type: 'list',
                message: 'What would you like to do with your cart?',
                choices: [new inquirer.Separator(), 'Check Out', 'Edit Cart', 'Keep Shopping'],
                name: 'cartnav'
            }
        ]).then(function (ans) {
            switch (ans.cartnav) {
                case 'Check Out':
                    checkOut();
                    break;
                case 'Edit Cart':
                    editCart();
                    break;
                case 'Keep Shopping':
                    goShopping();
                    break;
            }
        })
    })
}

function editCart() {
    // iquire which cart item do you want to modify?
    inquirer.prompt([
        {
            type: 'list',
            message: 'Which item in your cart do you want to modify?',
            choices: [],
            name: 'cartItems'
        }
    ])
    // .then(function(ans) {
    console.log(ans.cartItems)
    //})
}

function checkOut() {
    // loop through items in cart
    for (e in shoppingCart) {
        // connect to mysql to check if quantity is enough
        connection.query("SELECT * FROM products WHERE ? ",
            [{ item_id: shoppingCart[e].id }],
            function (err, products) {
                if (err) throw err
                // if theres NOT enough
                if (shoppingCart[e].quantity > products.quantity) {
                    console.log("Insufficient quantity! This item will not be ordered!")
                    // update purchaseCost to reflect items that will not be ordered
                    purchaseCost = purchaseCost - (shoppingCart[e].quantity * products.price)
                }
                // if there is enough
                else {
                    updateQuantity();
                }
            })
    }
    //show cost of purchase
    console.log("Order Successful!")
    console.log("Your order was $" + purchaseCost)
    connection.end()
}

// function updateQuantity() {
//     connection.query("UPDATE products SET ? WHERE ?",
//         [{ quantity = quantity - shoppingCart[e].quantity },
//         { item_id = shoppingCart[e].id }], 
//         function (err, result) {
//             if (err) throw err
//             console.log(result)
//         })
// }