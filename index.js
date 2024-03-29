const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');

async function getBrowserInstance() {
    return puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        ignoreHTTPSErrors: true,
        headless: "new"
    });

}


// Countdown section
let count = 49;
let activeButton = 0;
let interval;

function startCountdown() {
    const interval = setInterval(() => {
        if (count > 0) {
            count--;
            activeButton++;
        } else {
            clearInterval(interval);
            restartCountdown();
        }


        console.log(count);
    }, 1000);
}


function restartCountdown() {
    count = 49;
    activeButton = 4;
    startCountdown(); // Start the countdown again
}

app.get("/countdown", (req, res) => {
    res.json({ count, activeButton });
});

// Start the countdown when the server starts
startCountdown();
setInterval(() => {
    console.log(`this is ${count}`)
}, 1000)



setInterval(async () => {
    if (count === 6) {
        try {
            await scrapeAndStoreData();
        } catch (error) {
            console.error("An error occurred during scraping:", error);
        }
    }
}, 1000);

async function scrapeAndStoreData() {
    console.log("started")
    try {
        const browser = await getBrowserInstance();
        const page = await browser.newPage();


        await page.goto(
            "https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201"
        );




        await page.waitForSelector('.balls span'); // Wait for the target elements to be available

        const balls = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.balls span'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });

        await page.waitForSelector('.statistics > tbody > tr > td'); // Wait for the target elements to be available

        const statistics = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.statistics > tbody > tr > td'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });


        await page.waitForSelector('.statistics > tbody > tr > td > .colours'); // Wait for the target elements to be available

        const statistics1 = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.statistics > tbody > tr > td > .colours'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });


        await page.waitForSelector('.hot .ball-holder .ball-value'); // Wait for the target elements to be available

        const statistics2 = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.hot .ball-holder .ball-value'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });



        await page.waitForSelector('.cold .ball-holder .ball-value'); // Wait for the target elements to be available

        const statistics3 = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.cold .ball-holder .ball-value'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        })



        await page.waitForSelector('.hot .stats__numbers-count--value'); // Wait for the target elements to be available

        const statistics4 = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.hot .stats__numbers-count--value'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });





        await page.waitForSelector('.cold .stats__numbers-count--value'); // Wait for the target elements to be available

        const statistics5 = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.cold .stats__numbers-count--value'));
            return elements.map(element => element.textContent.trim()); // Trim whitespace if needed
        });




        await browser.close();


        const data = {
            balls,
            statistics,
            statistics1,
            statistics2,
            statistics3,
            statistics4,
            statistics5,
        };

        const jsonData = JSON.stringify(data);
        let previousData = fs.readFileSync("./scraped-data.json", "utf8"); // Read the current data from scraped-data.json

        // Check if the newly scraped data is different from the previous data
        if (jsonData !== previousData) {
            fs.writeFile("./scraped-data.json", jsonData, (err) => {
                if (err) {
                    console.error("An error occurred while writing the file:", err);
                } else {
                    console.log("Data scraped and stored successfully!");
                    previousData = jsonData; // Update the previousData variable with the new data
                }
            });
        } else {
            console.log("Data is the same!");
        }
    } catch (error) {
        console.error("An error occurred during web scraping:", error);
        res.status(500).send("Something went wrong on the server.");

    }

}



// Start the Express server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

app.get("/fetch", (req, res) => {
    try {
        fs.readFile("./scraped-data.json", (err, data) => {
            if (err) {
                console.error("An error occurred while reading the file:", err);
                res.status(500).send("An error occurred while fetching the data.");
            } else {
                const jsonData = JSON.parse(data);
                res.status(200).json(jsonData);
            }
        });
    } catch (error) {
        console.error("An error occurred in the /fetch route:", error);
        res.status(500).send("Something went wrong on the server.");
    }
});