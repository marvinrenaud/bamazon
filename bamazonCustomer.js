// Load required npm packages
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

// Connect to mySQL database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "marvin",
    database: "BamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
});

// Run initial database query to ensure connection works
// connection.query("SELECT * FROM productstable", function(err, res) {
//     if (err) throw err;
//     console.log(res[8]);
// });

// Declare global variables
var currentItemPrice;
var currentItemName;
var currentInventory;

// Function that logs the initial message to the user
function userWelcome() {
    console.log("");
    console.log("------------------------------------------------");
    console.log("Welcome to Bamazon. We Sell Dope Footware...Bam!");
    console.log("------------------------------------------------");
    console.log("");

    displayInventory();
};

userWelcome();

// Function that displays the current inventory for Bamazon using CLI-Table
function displayInventory() {
    console.log("");
    console.log("------------------------------------------------");
    console.log("Here's a look at our current inventory selection");
    console.log("------------------------------------------------");
    console.log("");

    // Instantiate CLI table
    var table = new Table({
        head: ['Item', 'Product Name', 'Price', 'Avail.'],
        colWidths: [10, 20, 10, 10]
    });

    // Code below pulls back all data from the productstable
    connection.query("SELECT * FROM productstable", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            // Code below pushing this into the CLI table package to display the inventory
            table.push(
                [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        console.log("");
    });
    setTimeout(userPrompt, 1000);
};

// Function below prompts the user for what they would like
function userPrompt() {
    inquirer.prompt([

        {
            type: "input",
            name: "userItem",
            message: "Please enter the 4-digit item number you are interested in."
        },

        {
            type: "input",
            name: "userQuantity",
            message: "Cool! Please enter how many you want and we'll confirm our inventory."
        }

    ]).then(function(userResponse) {
        userItemRequested = userResponse.userItem;
        userQuantityRequested = userResponse.userQuantity;
        checkInventory();
    })
};

// Function below checks inventory in the database
function checkInventory() {

    // Run query aqainst productstable to pull in available inventory for shoe requested
    connection.query("SELECT * FROM productstable WHERE item_id=?", [userItemRequested], function(err, res) {
        if (err) throw err;
        currentInventory = res[0].stock_quantity;
        currentItemPrice = res[0].price;
        currentItemName = res[0].product_name;
        // If statement calculates if there is enough inventory then runs follow-up functions based on the result
        if (currentInventory >= userQuantityRequested) {
            enoughInventory();
        } else {
            notEnoughInventory();
        }
    });
}

// Function below decreases confirms purchase and notes total price
function enoughInventory() {
    console.log("");
    console.log("Thank you for your purcase of the ", currentItemName);
    var totalPrice = userQuantityRequested * currentItemPrice;
    console.log("Your total price is: ", totalPrice);
    console.log("Your items will be shipped out tommorrow.");
    decreaseInventory();

}

// Function below runs if there is not enough inventory to fill the requested
function notEnoughInventory() {
    console.log("");
    console.log("Hey, sorry but we don't have ", userQuantityRequested, " of those.");
    console.log("Check out our selection and inventory again.");
    console.log("");
    userPrompt();

}

function decreaseInventory() {
    // Create a variable that equals the inventory remaining after purchase
    var remainingInventory = currentInventory - userQuantityRequested;

    // Update db with remaining inventory value
    connection.query("UPDATE productstable SET stock_quantity=? WHERE item_id=?", [remainingInventory, userItemRequested], function(err, res) {
        if (err) throw err;
        console.log("");
        connection.end();
    });
}
