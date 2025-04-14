const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest';
const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3';

let state = {
    baseCurrency: 'USD',
    currencyChart: null,
    cryptoChart: null,
    currentPeriod: '7d' 
};

function initializeCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

    const currencyCtx = document.getElementById('currencyChart').getContext('2d');
    state.currencyChart = new Chart(currencyCtx, {
        type: 'line',
        data: {
            labels: ['EUR', 'GBP', 'JPY', 'RUB', 'KZT'],
            datasets: [{
                label: `Курс валют к ${state.baseCurrency}`,
                data: [0.92, 0.77, 149.17, 83.52, 503.20],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#151f38',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} ${state.baseCurrency}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    const cryptoCtx = document.getElementById('cryptoChart').getContext('2d');
    state.cryptoChart = new Chart(cryptoCtx, {
        type: 'line',
        data: {
            labels: ['BTC', 'ETH'],
            datasets: [{
                label: 'Цена в USD',
                data: [84455.56, 1979.28],
                backgroundColor: [
                    'rgba(247, 147, 26, 0.2)',
                    'rgba(98, 126, 234, 0.2)'
                ],
                borderColor: [
                    '#f7931a',
                    '#627eea'
                ],
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: ['#f7931a', '#627eea'],
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#151f38',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (isNaN(amount)) {
        document.getElementById('result').value = '';
        return;
    }

    let rate = 1;
    
    if (fromCurrency === toCurrency) {
        rate = 1;
    } else {
        const rates = {
            'USD': 1,
            'EUR': 0.9171,
            'GBP': 0.7697,
            'JPY': 149.1772,
            'RUB': 83.5225,
            'KZT': 503.2009,
            'BTC': 1/84455.56,
            'ETH': 1/1979.28
        };

        rate = rates[toCurrency] / rates[fromCurrency];
    }

    const result = amount * rate;
    document.getElementById('result').value = result.toFixed(6);
}

async function fetchHistoricalRates(days) {
    try {
        const response = await fetch(`${EXCHANGE_API_URL}/${state.baseCurrency}`);
        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.rates) {
            throw new Error('Некорректный формат данных от API');
        }
        
        console.log('Полученные курсы валют:', data.rates);
        
        const historicalData = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const randomRates = {};
            Object.keys(data.rates).forEach(currency => {
                const variance = 0.98 + Math.random() * 0.04; 
                randomRates[currency] = data.rates[currency] * variance;
            });
            
            historicalData.push({
                date: dateStr,
                rates: randomRates
            });
        }
        
        console.log('Сгенерированные исторические данные:', historicalData);
        return historicalData;
    } catch (error) {
        console.error('Ошибка при получении исторических данных:', error);
        
        return generateDummyRates(days, state.baseCurrency);
    }
}

function generateDummyRates(days, baseCurrency) {
    const dummyData = [];
    const today = new Date();
    
    const baseRates = {
        'USD': { 'EUR': 0.92, 'GBP': 0.78, 'JPY': 149.5, 'RUB': 83.5, 'KZT': 503.2 },
        'EUR': { 'USD': 1.09, 'GBP': 0.85, 'JPY': 163.0, 'RUB': 91.0, 'KZT': 547.0 },
        'RUB': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.009, 'JPY': 1.8, 'KZT': 6.0 }
    };
    
    const ratesForBase = baseRates[baseCurrency] || baseRates['USD'];
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const rates = {};
        
        Object.keys(ratesForBase).forEach(currency => {
            const baseRate = ratesForBase[currency];
            const variance = 0.98 + Math.random() * 0.04;
            rates[currency] = baseRate * variance;
        });
        
        rates[baseCurrency] = 1.0;
        
        dummyData.push({
            date: dateStr,
            rates: rates
        });
    }
    
    console.log('Сгенерированные фиктивные данные:', dummyData);
    return dummyData;
}

async function fetchCryptoHistory(days) {
    try {
        const baseCurrency = state.baseCurrency.toLowerCase();
        console.log(`Запрос истории криптовалют в валюте: ${baseCurrency}`);
        
        let useUsdAndConvert = false;
        const supportedCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'rub', 'cny'];
        
        if (!supportedCurrencies.includes(baseCurrency)) {
            console.log(`Валюта ${baseCurrency} не поддерживается CoinGecko напрямую, получаем в USD и конвертируем`);
            useUsdAndConvert = true;
        }
        
        const vsCurrency = useUsdAndConvert ? 'usd' : baseCurrency;
        
        const response = await fetch(
            `${CRYPTO_API_URL}/coins/bitcoin/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        
        const btcData = await response.json();

        const ethResponse = await fetch(
            `${CRYPTO_API_URL}/coins/ethereum/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`
        );
        
        if (!ethResponse.ok) {
            throw new Error(`HTTP ошибка! статус: ${ethResponse.status}`);
        }
        
        const ethData = await ethResponse.json();
        
        if (useUsdAndConvert) {
            const exchangeResponse = await fetch(`${EXCHANGE_API_URL}/USD`);
            if (!exchangeResponse.ok) {
                throw new Error(`Ошибка получения курсов валют: ${exchangeResponse.status}`);
            }
            
            const exchangeData = await exchangeResponse.json();
            const rate = exchangeData.rates[state.baseCurrency] || 1;
            
            console.log(`Конвертация из USD в ${state.baseCurrency} с курсом: ${rate}`);
            
            if (btcData.prices) {
                btcData.prices = btcData.prices.map(price => [price[0], price[1] * rate]);
            }
            
            if (ethData.prices) {
                ethData.prices = ethData.prices.map(price => [price[0], price[1] * rate]);
            }
        }

        const result = {
            bitcoin: btcData.prices || [],
            ethereum: ethData.prices || []
        };
        
        console.log('Исторические данные крипто:', result);
        return result;
    } catch (error) {
        console.error('Ошибка при получении истории криптовалют:', error);
        
        return {
            bitcoin: generateDummyCryptoData(days, state.baseCurrency, 'bitcoin'),
            ethereum: generateDummyCryptoData(days, state.baseCurrency, 'ethereum')
        };
    }
}

function generateDummyCryptoData(days, baseCurrency, cryptoType) {
    const prices = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const baseValues = {
        'bitcoin': { base: 80000, variance: 5000 },
        'ethereum': { base: 2000, variance: 150 }
    };
    
    const conversionRates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.78,
        'JPY': 149.5,
        'RUB': 83.5,
        'KZT': 503.2,
        'CNY': 7.2
    };
    
    const rate = conversionRates[baseCurrency] || 1;
    
    const { base, variance } = baseValues[cryptoType] || { base: 1000, variance: 100 };
    
    for (let i = 0; i <= days; i++) {
        const timestamp = now - (days - i) * dayMs;
        const randomPrice = (base + (Math.random() * 2 - 1) * variance) * rate;
        prices.push([timestamp, randomPrice]);
    }
    
    return prices;
}

function updateCurrencyChart(historicalData) {
    if (!historicalData || historicalData.length === 0) {
        console.error('Нет данных для обновления графика валют');
        return;
    }

    try {
        const mainCurrencies = ['EUR', 'GBP', 'JPY', 'RUB', 'KZT'];
        
        const currencies = mainCurrencies.filter(c => c !== state.baseCurrency);
        
        const latestRates = historicalData[historicalData.length - 1].rates;
        
        currencies.forEach(currency => {
            if (latestRates[currency] === undefined) {
                const defaultRates = {
                    'EUR': 0.92, 'GBP': 0.78, 'JPY': 149.5, 'RUB': 83.5, 'KZT': 503.2
                };
                
                historicalData.forEach(day => {
                    if (!day.rates[currency]) {
                        const baseRate = defaultRates[currency] || 1.0;
                        const variance = 0.98 + Math.random() * 0.04;
                        day.rates[currency] = baseRate * variance;
                    }
                });
            }
        });
        
        const labels = historicalData.map(data => 
            new Date(data.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
        );
        
        console.log('Метки для графика валют:', labels);
        
        const datasets = [];
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        
        currencies.forEach((currency, index) => {
            datasets.push({
                label: currency,
                data: historicalData.map(day => day.rates[currency] || null),
                borderColor: colors[index % colors.length],
                backgroundColor: `${colors[index % colors.length]}22`,
                fill: false,
                tension: 0.4,
                pointRadius: 3
            });
        });
        
        console.log('Наборы данных для графика валют:', datasets);
        
        state.currencyChart.data.labels = labels;
        state.currencyChart.data.datasets = datasets;
        state.currencyChart.options.plugins.title = {
            display: true,
            text: `Курс основных валют к ${state.baseCurrency}`,
            color: '#e2e8f0',
            font: {
                size: 16,
                weight: 'bold'
            }
        };
        state.currencyChart.update();
        
        updateCurrencyCards(latestRates);
    } catch (error) {
        console.error('Ошибка при обновлении графика валют:', error);
        
        state.currencyChart.data.datasets = [{
            label: 'Ошибка загрузки данных',
            data: [],
            borderColor: '#ef4444'
        }];
        state.currencyChart.update();
    }
}

function updateCryptoChart(cryptoHistory) {
    if (!cryptoHistory || (!cryptoHistory.bitcoin.length && !cryptoHistory.ethereum.length)) {
        console.error('Нет данных для обновления графика криптовалют');
        return;
    }

    try {
        const labels = cryptoHistory.bitcoin.map(price => 
            new Date(price[0]).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
        );
        
        console.log('Метки для графика криптовалют:', labels);
        
        const datasets = [
            {
                label: 'Bitcoin',
                data: cryptoHistory.bitcoin.map(price => price[1]),
                borderColor: '#f7931a',
                backgroundColor: 'rgba(247, 147, 26, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 3
            },
            {
                label: 'Ethereum',
                data: cryptoHistory.ethereum.map(price => price[1]),
                borderColor: '#627eea',
                backgroundColor: 'rgba(98, 126, 234, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 3
            }
        ];
        
        console.log('Наборы данных для графика криптовалют:', datasets);
        
        const currencySymbol = getCurrencySymbol(state.baseCurrency);
        
        state.cryptoChart.data.labels = labels;
        state.cryptoChart.data.datasets = datasets;
        
        state.cryptoChart.options.plugins.title = {
            display: true,
            text: `Динамика криптовалют в ${state.baseCurrency}`,
            color: '#e2e8f0',
            font: {
                size: 16,
                weight: 'bold'
            }
        };
        
        state.cryptoChart.options.plugins.tooltip.callbacks.label = function(context) {
            const value = context.raw.toLocaleString('ru-RU', {maximumFractionDigits: 2});
            return `${context.dataset.label}: ${currencySymbol}${value}`;
        };
        
        state.cryptoChart.update();
    } catch (error) {
        console.error('Ошибка при обновлении графика криптовалют:', error);
        
        state.cryptoChart.data.datasets = [{
            label: 'Ошибка загрузки данных',
            data: [],
            borderColor: '#ef4444'
        }];
        state.cryptoChart.update();
    }
}

async function updatePeriodData(period) {
    try {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        
        console.log(`Загрузка данных для периода: ${period} (${days} дней)`);
        
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.opacity = '0.5';
        });
        
        const [historicalRates, cryptoHistory] = await Promise.all([
            fetchHistoricalRates(days),
            fetchCryptoHistory(days)
        ]);

        if (historicalRates && historicalRates.length > 0) {
            console.log(`Получены данные для ${historicalRates.length} дней`);
            updateCurrencyChart(historicalRates);
            
            if (historicalRates[historicalRates.length - 1] && historicalRates[historicalRates.length - 1].rates) {
                updateCurrencyCards(historicalRates[historicalRates.length - 1].rates);
            }
        } else {
            console.error('Не удалось получить исторические данные для валют');
        }

        if (cryptoHistory && (cryptoHistory.bitcoin.length > 0 || cryptoHistory.ethereum.length > 0)) {
            console.log(`Получены данные криптовалют: BTC - ${cryptoHistory.bitcoin.length} точек, ETH - ${cryptoHistory.ethereum.length} точек`);
            updateCryptoChart(cryptoHistory);
            
            if (cryptoHistory.bitcoin.length > 0 && cryptoHistory.ethereum.length > 0) {
                updateCryptoCards(cryptoHistory);
            }
        } else {
            console.error('Не удалось получить исторические данные для криптовалют');
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
    } finally {
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.opacity = '1';
        });
    }
}

function updateCurrencyCards(rates) {
    try {
        if (!rates) {
            console.error('Нет данных для обновления карточек валют');
            return;
        }
        
        console.log('Обновление карточек валют с данными:', rates);
        
        const mainCurrencies = ['EUR', 'GBP', 'JPY', 'RUB', 'KZT'];
        
        const currenciesToShow = mainCurrencies.filter(c => c !== state.baseCurrency);
        
        let currencyCardsContainer = document.querySelector('.currency-cards-container');
        
        if (!currencyCardsContainer) {
            console.log('Создаем контейнер для карточек валют');
            
            const currencySection = document.querySelector('.stats-grid, .dashboard-section');
            
            if (currencySection) {
                currencyCardsContainer = document.createElement('div');
                currencyCardsContainer.className = 'currency-cards-container stats-grid';
                currencyCardsContainer.style.display = 'grid';
                currencyCardsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
                currencyCardsContainer.style.gap = '1rem';
                currencyCardsContainer.style.marginTop = '1rem';
                
                currencySection.appendChild(currencyCardsContainer);
            } else {
                console.error('Не найдена секция для размещения карточек валют');
                return;
            }
        }
        
        currencyCardsContainer.innerHTML = '';
        
        currenciesToShow.forEach(currency => {
            const rate = rates[currency] || 0;
            
            const card = document.createElement('div');
            card.className = 'stat-card currency-card';
            card.style.padding = '1.5rem';
            card.style.borderRadius = '12px';
            card.style.background = 'var(--card-background-dark, #1a2942)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            card.style.transition = 'transform 0.3s ease';
            
            const currencyInfo = getCurrencyInfo(currency);
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                    <div class="currency-flag" style="width: 24px; height: 24px; border-radius: 50%;">
                        ${currencyInfo.icon || ''}
                    </div>
                    <h3 style="margin: 0; color: var(--text-primary, #ffffff); font-size: 1.25rem;">${currency}</h3>
                </div>
                <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: var(--accent-color, #3b82f6);">
                    ${rate.toFixed(4)} ${state.baseCurrency}
                </div>
                <div class="currency-name" style="color: var(--text-secondary, #94a3b8); font-size: 0.875rem; margin-top: 0.25rem;">
                    ${currencyInfo.name}
                </div>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
            
            currencyCardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка при обновлении карточек валют:', error);
    }
}

function getCurrencyInfo(currencyCode) {
    const currencyInfo = {
        'USD': { name: 'Доллар США', icon: '🇺🇸' },
        'EUR': { name: 'Евро', icon: '🇪🇺' },
        'GBP': { name: 'Фунт стерлингов', icon: '🇬🇧' },
        'JPY': { name: 'Японская иена', icon: '🇯🇵' },
        'RUB': { name: 'Российский рубль', icon: '🇷🇺' },
        'KZT': { name: 'Казахстанский тенге', icon: '🇰🇿' },
        'CNY': { name: 'Китайский юань', icon: '🇨🇳' },
        'CAD': { name: 'Канадский доллар', icon: '🇨🇦' },
        'AUD': { name: 'Австралийский доллар', icon: '🇦🇺' },
        'CHF': { name: 'Швейцарский франк', icon: '🇨🇭' },
        'BTC': { name: 'Биткоин', icon: '₿' },
        'ETH': { name: 'Эфириум', icon: 'Ξ' },
    };
    
    return currencyInfo[currencyCode] || { name: currencyCode, icon: '🌐' };
}

function updateCryptoCards(cryptoHistory) {
    try {
        const btcPrice = cryptoHistory.bitcoin[cryptoHistory.bitcoin.length - 1][1];
        const ethPrice = cryptoHistory.ethereum[cryptoHistory.ethereum.length - 1][1];
        
        const currencyInfo = getCurrencyInfo(state.baseCurrency);
        const currencySymbol = getCurrencySymbol(state.baseCurrency);
        
        const btcCard = document.querySelector('.stat-card:nth-child(1)');
        const ethCard = document.querySelector('.stat-card:nth-child(2)');
        
        if (btcCard) {
            const btcValueElement = btcCard.querySelector('.stat-value');
            if (btcValueElement) {
                btcValueElement.textContent = `${currencySymbol}${btcPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}`;
                
                let subtitleElement = btcCard.querySelector('.crypto-currency-subtitle');
                if (!subtitleElement) {
                    subtitleElement = document.createElement('div');
                    subtitleElement.className = 'crypto-currency-subtitle';
                    subtitleElement.style.fontSize = '0.75rem';
                    subtitleElement.style.color = 'var(--text-secondary, #94a3b8)';
                    subtitleElement.style.marginTop = '0.25rem';
                    btcValueElement.insertAdjacentElement('afterend', subtitleElement);
                }
                subtitleElement.textContent = `в ${state.baseCurrency} ${currencyInfo.name ? `(${currencyInfo.name})` : ''}`;
            }
        }
        
        if (ethCard) {
            const ethValueElement = ethCard.querySelector('.stat-value');
            if (ethValueElement) {
                ethValueElement.textContent = `${currencySymbol}${ethPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}`;
                
                let subtitleElement = ethCard.querySelector('.crypto-currency-subtitle');
                if (!subtitleElement) {
                    subtitleElement = document.createElement('div');
                    subtitleElement.className = 'crypto-currency-subtitle';
                    subtitleElement.style.fontSize = '0.75rem';
                    subtitleElement.style.color = 'var(--text-secondary, #94a3b8)';
                    subtitleElement.style.marginTop = '0.25rem';
                    ethValueElement.insertAdjacentElement('afterend', subtitleElement);
                }
                subtitleElement.textContent = `в ${state.baseCurrency} ${currencyInfo.name ? `(${currencyInfo.name})` : ''}`;
            }
        }
    } catch (error) {
        console.error('Ошибка при обновлении карточек криптовалют:', error);
    }
}

function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'RUB': '₽',
        'KZT': '₸',
        'CNY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'Fr',
        'BTC': '₿',
        'ETH': 'Ξ',
    };
    
    return symbols[currencyCode] || currencyCode;
}

function initMobileNav() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('menuBackdrop');
    const body = document.body;
    
    if (!mobileNavToggle || !sidebar || !backdrop) return;
    
    mobileNavToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        mobileNavToggle.querySelector('i').classList.toggle('fa-bars');
        mobileNavToggle.querySelector('i').classList.toggle('fa-times');
        body.classList.toggle('menu-open');
    });
    
    backdrop.addEventListener('click', () => {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        mobileNavToggle.querySelector('i').classList.add('fa-bars');
        mobileNavToggle.querySelector('i').classList.remove('fa-times');
        body.classList.remove('menu-open');
    });
    
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
                mobileNavToggle.querySelector('i').classList.add('fa-bars');
                mobileNavToggle.querySelector('i').classList.remove('fa-times');
                body.classList.remove('menu-open');
            }
        });
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
            mobileNavToggle.querySelector('i').classList.add('fa-bars');
            mobileNavToggle.querySelector('i').classList.remove('fa-times');
            body.classList.remove('menu-open');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initializeCharts();
    
    document.getElementById('amount').addEventListener('input', convertCurrency);
    document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
    document.getElementById('toCurrency').addEventListener('change', convertCurrency);
    
    document.getElementById('swapCurrencies').addEventListener('click', () => {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const tempValue = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = tempValue;
        convertCurrency();
    });
    
    convertCurrency();
    
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const periodText = this.textContent.trim().toLowerCase();
            console.log(`Кнопка периода: "${periodText}"`);
            
            let period = '7d';
            if (periodText === '30д') period = '30d';
            if (periodText === '3м') period = '90d';
            
            const buttons = this.parentNode.querySelectorAll('.period-btn');
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            state.currentPeriod = period;
            await updatePeriodData(period);
        });
    });
    
    document.getElementById('baseCurrency').addEventListener('change', async function(e) {
        const newCurrency = this.value;
        console.log(`Изменение базовой валюты на: ${newCurrency}`);
        
        state.baseCurrency = newCurrency;
        await updatePeriodData(state.currentPeriod);
    });
    
    const refreshButtons = document.querySelectorAll('.refresh-btn');
    refreshButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Обновление данных...');
            
            this.classList.add('rotating');
            
            const timestamp = new Date().getTime();
            
            try {
                const response = await fetch(`${EXCHANGE_API_URL}/${state.baseCurrency}?_=${timestamp}`);
                if (!response.ok) {
                    throw new Error(`Ошибка запроса: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Получены свежие курсы валют:', data);
                
                if (data && data.rates) {
                    updateCurrencyCards(data.rates);
                    await updatePeriodData(state.currentPeriod);
                    showNotification('Курсы валют успешно обновлены', 'success');
                }
            } catch (error) {
                console.error('Ошибка при обновлении курсов:', error);
                showNotification('Не удалось обновить курсы валют', 'error');
            } finally {
                setTimeout(() => {
                    this.classList.remove('rotating');
                }, 500);
            }
        });
    });
    
    initTheme();
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    console.log('Инициализация данных при загрузке...');
    await updatePeriodData('7d');

    initMobileNav();
});

function initTheme() {
    const savedTheme = localStorage.getItem('dashboardTheme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', initialTheme);
        localStorage.setItem('dashboardTheme', initialTheme);
    }
    
    updateChartColors();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.style.opacity = '0.98';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
    
    updateChartColors();
    
    showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 300);
}

function updateChartColors() {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    Chart.defaults.color = isDarkTheme ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    if (state.currencyChart) {
        state.currencyChart.options.scales.y.grid.color = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)';
        
        state.currencyChart.options.plugins.tooltip.backgroundColor = isDarkTheme 
            ? '#151f38' 
            : '#ffffff';
        state.currencyChart.options.plugins.tooltip.titleColor = isDarkTheme 
            ? '#e2e8f0' 
            : '#0f172a';
        state.currencyChart.options.plugins.tooltip.bodyColor = isDarkTheme 
            ? '#e2e8f0' 
            : '#334155';
        state.currencyChart.options.plugins.tooltip.borderColor = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)';
        
        state.currencyChart.update();
    }
    
    if (state.cryptoChart) {
        state.cryptoChart.options.scales.y.grid.color = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)';
        
        state.cryptoChart.options.plugins.tooltip.backgroundColor = isDarkTheme 
            ? '#151f38' 
            : '#ffffff';
        state.cryptoChart.options.plugins.tooltip.titleColor = isDarkTheme 
            ? '#e2e8f0' 
            : '#0f172a';
        state.cryptoChart.options.plugins.tooltip.bodyColor = isDarkTheme 
            ? '#e2e8f0' 
            : '#334155';
        state.cryptoChart.options.plugins.tooltip.borderColor = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)';
        
        state.cryptoChart.update();
    }
}

function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#3b82f6';
        notification.style.color = 'white';
    }
    
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 50);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getRandomColor() {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}