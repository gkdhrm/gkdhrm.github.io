const stockApiKey = 'YOUR_ALPHA_VANTAGE_API_KEY';
const weatherApiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
const location = 'YOUR_LOCATION'; // e.g., 'New York'

function fetchWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('weather-data').innerHTML = `
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Weather: ${data.weather[0].description}</p>
            `;
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchQQQPrice() {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=QQQ&apikey=${stockApiKey}`)
        .then(response => response.json())
        .then(data => {
            const dailyData = data['Time Series (Daily)'];
            const dates = Object.keys(dailyData);
            const latestDate = dates[0];
            const latestClose = parseFloat(dailyData[latestDate]['4. close']);
            const previousClose = parseFloat(dailyData[dates[1]]['4. close']);
            
            document.getElementById('qqq-data').innerHTML = `
                <p>Price: $${latestClose.toFixed(2)}</p>
                <p>Change Today: ${(latestClose - previousClose).toFixed(2)} (${((latestClose - previousClose) / previousClose * 100).toFixed(2)}%)</p>
            `;
        })
        .catch(error => console.error('Error fetching QQQ data:', error));
}

function fetchSPYPrice() {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=SPY&apikey=${stockApiKey}`)
        .then(response => response.json())
        .then(data => {
            const dailyData = data['Time Series (Daily)'];
            const dates = Object.keys(dailyData);
            const latestDate = dates[0];
            const latestClose = parseFloat(dailyData[latestDate]['4. close']);
            const previousClose = parseFloat(dailyData[dates[1]]['4. close']);
            
            document.getElementById('spy-data').innerHTML = `
                <p>Price: $${latestClose.toFixed(2)}</p>
                <p>Change Today: ${(latestClose - previousClose).toFixed(2)} (${((latestClose - previousClose) / previousClose * 100).toFixed(2)}%)</p>
            `;
        })
        .catch(error => console.error('Error fetching SPY data:', error));
}

function fetchBitcoinPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
        .then(response => response.json())
        .then(data => {
            const bitcoinData = data.bitcoin;
            const price = bitcoinData.usd;
            const change24h = bitcoinData.usd_24h_change;
            
            document.getElementById('bitcoin-data').innerHTML = `
                <p>Price: $${price.toFixed(2)}</p>
                <p>Change Today: ${change24h.toFixed(2)}%</p>
            `;
        })
        .catch(error => console.error('Error fetching Bitcoin data:', error));
}

function fetchAllData() {
    fetchWeather();
    fetchQQQPrice();
    fetchSPYPrice();
    fetchBitcoinPrice();
}

fetchAllData();
setInterval(fetchAllData, 600000); // Refresh every 10 minutes
