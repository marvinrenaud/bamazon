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

// Function that logs the initial message to the user
function managerWelcome() {
    console.log("");
    console.log("---------------------------------------------------------------");
    console.log("Welcome to Bamazon Manager Portal. What do you want to do boss?");
    console.log("---------------------------------------------------------------");
    console.log("");
};

// Function below prompts the user for what they would like
function userPrompt() {
    inquirer.prompt([

        {
            type: "list",
            name: "managerSelection",
            message: "What would you like to do boss?",
            choices: ["View Kicks We Have for Sale", "View Kicks That Have Low Inventory", "Add Inventory to Current Kicks", "Add a New Dope Item to Our Selection"]
        }

    ]).then(function(userResponse) {
        switch (userResponse.managerSelection) {
            case "View Kicks We Have for Sale":
                console.log("Option 1 working");
                displayInventory();
                break;
            case "View Kicks That Have Low Inventory":
                console.log("Option 2 working");
                displayLowInventory();
                break;
            case "Add Inventory to Current Kicks":
                console.log("Option 3 working");
                addInventory();
                break;
            case "Add a New Dope Pair of Kicks to Our Selection":
                console.log("Option 4 working");

                break;
            default:
                console.log("Pick a legitimate options bro!");

        }
    })
};

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
    setTimeout(userPrompt, 500);
};

// Function that displays the current low inventory for Bamazon using CLI-Table
function displayLowInventory() {
    console.log("");
    console.log("-----------------------------------------------------------------");
    console.log("Here's a look at our selection that has low inventory levels (<5)");
    console.log("-----------------------------------------------------------------");
    console.log("");

    // Instantiate CLI table
    var table = new Table({
        head: ['Item', 'Product Name', 'Price', 'Avail.'],
        colWidths: [10, 20, 10, 10]
    });

    // Code below pulls back all data from the productstable where inventory is less than 5
    connection.query("SELECT * FROM productstable WHERE stock_quantity<5;", function(err, res) {
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
    setTimeout(userPrompt, 500);
};

// Function below prompts the manager to enter which item they want to add inventory to and how many
function addInventory() {
    inquirer.prompt([

            {
                type: "input",
                name: "itemSelected",
                message: "Enter the item number for the kicks you will add inventory to."
            },

            {
                type: "input",
                name: "additionalQuantity",
                message: "Cool! Enter the number of these kicks you will add to inventory."
            }

        ]).then(function(userResponse) {
                console.log("");
                console.log("-----------------------------------------------------------------");
                console.log("Cool! We've added ", userResponse.additionalQuantity, " kicks to Item #", userResponse.itemSelected);
                console.log("-----------------------------------------------------------------");
                console.log("");

                // Query action below adds the select volume to the selected item
                connection.query("UPDATE productstable SET stock_quantity= stock_quantity +? WHERE item_id = ?;", [userResponse.additionalQuantity, userResponse.itemSelected], function(err, res) {
                    if (err) throw err;

                    // Instantiate CLI table
                    var table = new Table({
                        head: ['Item', 'Product Name', 'Price', 'Avail.'],
                        colWidths: [10, 20, 10, 10]
                    });

                    displayInventory();
                });
            });
          };




            // Run initial functions
            managerWelcome();
            userPrompt();
