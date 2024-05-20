const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const dotenv = require('dotenv')
const helmet = require('helmet');

const { expressCspHeader } = require('express-csp-header');



// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Setting views directory
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(express.json())

// Setting .env file
dotenv.config({ path: 'config.env' })

app.use(helmet())

app.use(expressCspHeader({
    policies: {
        policies: {
            'default-src': [expressCspHeader.NONE],
            'img-src': [expressCspHeader.SELF],
        }
    }
}));

app.get('/', (req, res) => {
    res.render('index', { weather: null, error: null })
})


// Getting Weather DATA
app.get('/weather', async (req, res) => {
    let { city } = req.query
    let weather;
    let error = null;
    try {
        const completeURL = `${process.env.BASE_SEARCH_URL}${city}&appid=${process.env.API_KEY}&units=metric`;
        const response = await axios.get(completeURL);
        weather = response.data
        console.log(weather);
        if (response.data == null) {
            weather = null
            error = 'Data not found'
        }
        res.render('index', { weather, error })
    } catch (e) {
        if (e.response && e.response.data && e.response.data.cod === '404' && e.response.data.message === 'city not found') {
            console.log('City Not Found');
            res.render('index', { error: 'City Not Found' })
        } else {
            console.log("Error", e.message);
        }
    }
})


app.all('*', (req, res) => {
    res.send('Route does not exist')
})


app.listen(3000, () => {
    console.log('App running on port 3000...');
})