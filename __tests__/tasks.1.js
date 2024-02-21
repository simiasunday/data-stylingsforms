const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');
const browserOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
}

let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    await page.goto('file://' + path.resolve('./index.html'));
}, 30000);

afterAll((done) => {
    try {
        this.puppeteer.close();
    } catch (e) { }
    done();
});
describe('basic HTML structure', () => {
    test('Document type has been declared', () => {
        const fs = require('fs');
        const path = require('path');
        const htmlDoc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        expect(htmlDoc).toMatch(/<.*!DOCTYPE.*html.*>/gmi);
    });
    test('HTML element has been declared', () => {
        const path = require('path');
        const htmlDoc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        expect(htmlDoc).toMatch(/<html.*>/gmi);
    });
    test('Head element has been declared', () => {
        const path = require('path');
        const htmlDoc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        expect(htmlDoc).toMatch(/<head.*>/gmi);
    });
    test('Body element has been declared', () => {
        const path = require('path');
        const htmlDoc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        expect(htmlDoc).toMatch(/<body.*>/gmi);
    });
});
describe('Form fields', () => {
    test('Form has been declared', () => {
        const path = require('path');
        const htmlDoc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        expect(htmlDoc).toMatch(/<form.*>/gmi);
    }),
    test('Form has at least three input fields', async () => {
        const textFields = await page.$$('input');
        expect(textFields.length).toBeGreaterThan(2);
    });
    test('Form has at least one date field', async () => {
        //test field with type date is could be not found because there is many ways to declare date field like <input type="date">, <input type="date">, <input type="datetime-local" placeholder="YYYY-MM-DD"> etc.
        // so that we should check for the type of the field with type contains "date"
        const dateFields = await page.$$eval('input', (els) => els.filter(el => el.type.includes('date')));
        expect(dateFields.length).toBeGreaterThan(0);
    });
    test('Input fields have labels', async () => {
        const labels = await page.$$('label');
        expect(labels.length).toBeGreaterThan(2);
    })
});
describe('Styling Forms', () => {
    test('Page should have a background image', async () => {
        //get array of all element and filter for computed style background-image
        const backgroundImage = await page.evaluate(() => {
            const background = Array.from(document.querySelectorAll('*')).filter(el => window.getComputedStyle(el).getPropertyValue('background-image') !== 'none').toString();
            return background;
        });
        expect(backgroundImage).toBeTruthy();
    });
    test('The form should centered on the page', async () => {
        const formPosition = await page.evaluate(() => {
            const form = document.querySelector('form');
            const {left} = form.getBoundingClientRect();
            return left;
        })
        // get form width
        const formWidth = await page.evaluate(() => {
            const form = document.querySelector('form');
            const {width} = form.getBoundingClientRect();
            return width;
        })
        const pageSize = await page.evaluate(() => {
            const pageSize = {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
            return pageSize;
        })
        
        expect(formPosition).toBeGreaterThan((pageSize.width / 2 - formWidth / 2) - 10) && expect(formPosition).toBeLessThan((pageSize.width / 2 + formWidth / 2) + 10); // The student has 10px margin on each side of the form
    });
    test('All input fields should be aligned vertically', async () => {
        //const inputFields = await page.$$('input');
        const inputFieldsPosition = await page.evaluate(() => {
            const inputFields = Array.from(document.querySelectorAll('input'));
            return inputFields.map(el => {
                const {top} = el.getBoundingClientRect();
                return top;
            }).sort((a, b) => a - b);
        });
        expect(inputFieldsPosition[0]).toBeLessThan(inputFieldsPosition[1]);
        expect(inputFieldsPosition[1]).toBeLessThan(inputFieldsPosition[2]);
    });
});