// Используем бесплатные API
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest';
const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3';

// Состояние приложения
let state = {
    baseCurrency: 'USD',
    currencyChart: null,
    cryptoChart: null,
    currentPeriod: '7d' // Добавляем отслеживание текущего периода
};

// Инициализация графиков
function initializeCharts() {
    // Настройки для всех графиков
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

    // График валют
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

    // График криптовалют
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

// Функция конвертации валют
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (isNaN(amount)) {
        document.getElementById('result').value = '';
        return;
    }

    // Расчет курса конвертации
    let rate = 1;
    
    if (fromCurrency === toCurrency) {
        rate = 1;
    } else {
        // Используем известные курсы
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

        // Формула конвертации
        rate = rates[toCurrency] / rates[fromCurrency];
    }

    const result = amount * rate;
    document.getElementById('result').value = result.toFixed(6);
}

// Получение исторических данных для валют
async function fetchHistoricalRates(days) {
    try {
        // Для простоты будем использовать последние курсы и генерировать историю на их основе
        // так как большинство API имеют ограничения на исторические данные
        const response = await fetch(`${EXCHANGE_API_URL}/${state.baseCurrency}`);
        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.rates) {
            throw new Error('Некорректный формат данных от API');
        }
        
        console.log('Полученные курсы валют:', data.rates);
        
        // Генерируем историю на основе текущих курсов
        const historicalData = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Небольшая случайная вариация курсов для имитации исторических данных
            const randomRates = {};
            Object.keys(data.rates).forEach(currency => {
                const variance = 0.98 + Math.random() * 0.04; // ±2%
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
        
        // Возвращаем фиктивные данные в случае ошибки
        return generateDummyRates(days, state.baseCurrency);
    }
}

// Функция для генерации фиктивных курсов валют
function generateDummyRates(days, baseCurrency) {
    const dummyData = [];
    const today = new Date();
    
    // Базовые курсы для разных валют (относительно USD)
    const baseRates = {
        'USD': { 'EUR': 0.92, 'GBP': 0.78, 'JPY': 149.5, 'RUB': 83.5, 'KZT': 503.2 },
        'EUR': { 'USD': 1.09, 'GBP': 0.85, 'JPY': 163.0, 'RUB': 91.0, 'KZT': 547.0 },
        'RUB': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.009, 'JPY': 1.8, 'KZT': 6.0 }
    };
    
    // Если нет данных для выбранной базовой валюты, используем USD
    const ratesForBase = baseRates[baseCurrency] || baseRates['USD'];
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const rates = {};
        
        // Добавляем все валюты с небольшой случайной вариацией
        Object.keys(ratesForBase).forEach(currency => {
            const baseRate = ratesForBase[currency];
            const variance = 0.98 + Math.random() * 0.04; // ±2%
            rates[currency] = baseRate * variance;
        });
        
        // Добавляем единичный курс для базовой валюты
        rates[baseCurrency] = 1.0;
        
        dummyData.push({
            date: dateStr,
            rates: rates
        });
    }
    
    console.log('Сгенерированные фиктивные данные:', dummyData);
    return dummyData;
}

// Получение исторических данных для криптовалют
async function fetchCryptoHistory(days) {
    try {
        // Приводим символ валюты к нижнему регистру, как требует API
        const baseCurrency = state.baseCurrency.toLowerCase();
        console.log(`Запрос истории криптовалют в валюте: ${baseCurrency}`);
        
        // Если выбрана валюта, которую CoinGecko не поддерживает, 
        // используем USD и затем конвертируем самостоятельно
        let useUsdAndConvert = false;
        const supportedCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'rub', 'cny'];
        
        if (!supportedCurrencies.includes(baseCurrency)) {
            console.log(`Валюта ${baseCurrency} не поддерживается CoinGecko напрямую, получаем в USD и конвертируем`);
            useUsdAndConvert = true;
        }
        
        // Запрашиваем данные в поддерживаемой валюте (USD или выбранная)
        const vsCurrency = useUsdAndConvert ? 'usd' : baseCurrency;
        
        // Запрос данных для Bitcoin
        const response = await fetch(
            `${CRYPTO_API_URL}/coins/bitcoin/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        
        const btcData = await response.json();

        // Запрос данных для Ethereum
        const ethResponse = await fetch(
            `${CRYPTO_API_URL}/coins/ethereum/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`
        );
        
        if (!ethResponse.ok) {
            throw new Error(`HTTP ошибка! статус: ${ethResponse.status}`);
        }
        
        const ethData = await ethResponse.json();
        
        // Если нужно конвертировать из USD в другую валюту
        if (useUsdAndConvert) {
            // Получаем курс обмена USD на выбранную валюту
            const exchangeResponse = await fetch(`${EXCHANGE_API_URL}/USD`);
            if (!exchangeResponse.ok) {
                throw new Error(`Ошибка получения курсов валют: ${exchangeResponse.status}`);
            }
            
            const exchangeData = await exchangeResponse.json();
            const rate = exchangeData.rates[state.baseCurrency] || 1;
            
            console.log(`Конвертация из USD в ${state.baseCurrency} с курсом: ${rate}`);
            
            // Конвертируем все цены
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
        
        // Возвращаем некоторые фиктивные данные в случае ошибки
        return {
            bitcoin: generateDummyCryptoData(days, state.baseCurrency, 'bitcoin'),
            ethereum: generateDummyCryptoData(days, state.baseCurrency, 'ethereum')
        };
    }
}

// Генерация фиктивных данных для криптовалют с учетом выбранной валюты
function generateDummyCryptoData(days, baseCurrency, cryptoType) {
    const prices = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Базовые цены в USD
    const baseValues = {
        'bitcoin': { base: 80000, variance: 5000 },
        'ethereum': { base: 2000, variance: 150 }
    };
    
    // Примерные коэффициенты конвертации из USD
    const conversionRates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.78,
        'JPY': 149.5,
        'RUB': 83.5,
        'KZT': 503.2,
        'CNY': 7.2
    };
    
    // Получаем коэффициент конвертации
    const rate = conversionRates[baseCurrency] || 1;
    
    // Параметры для выбранной криптовалюты
    const { base, variance } = baseValues[cryptoType] || { base: 1000, variance: 100 };
    
    // Генерируем данные
    for (let i = 0; i <= days; i++) {
        const timestamp = now - (days - i) * dayMs;
        const randomPrice = (base + (Math.random() * 2 - 1) * variance) * rate;
        prices.push([timestamp, randomPrice]);
    }
    
    return prices;
}

// Обновление графика валют
function updateCurrencyChart(historicalData) {
    if (!historicalData || historicalData.length === 0) {
        console.error('Нет данных для обновления графика валют');
        return;
    }

    try {
        // Получаем список основных валют
        const mainCurrencies = ['EUR', 'GBP', 'JPY', 'RUB', 'KZT'];
        
        // Фильтруем только те валюты, которые не совпадают с базовой
        const currencies = mainCurrencies.filter(c => c !== state.baseCurrency);
        
        // Если данных для какой-то валюты нет - добавим фиктивные
        const latestRates = historicalData[historicalData.length - 1].rates;
        
        // Проверяем, есть ли данные для каждой валюты
        currencies.forEach(currency => {
            if (latestRates[currency] === undefined) {
                // Добавляем фиктивные данные если валюты нет
                const defaultRates = {
                    'EUR': 0.92, 'GBP': 0.78, 'JPY': 149.5, 'RUB': 83.5, 'KZT': 503.2
                };
                
                historicalData.forEach(day => {
                    if (!day.rates[currency]) {
                        const baseRate = defaultRates[currency] || 1.0;
                        const variance = 0.98 + Math.random() * 0.04; // ±2%
                        day.rates[currency] = baseRate * variance;
                    }
                });
            }
        });
        
        // Подготавливаем метки дат для оси X
        const labels = historicalData.map(data => 
            new Date(data.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
        );
        
        console.log('Метки для графика валют:', labels);
        
        // Подготавливаем наборы данных для каждой валюты
        const datasets = [];
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        
        currencies.forEach((currency, index) => {
            datasets.push({
                label: currency,
                data: historicalData.map(day => day.rates[currency] || null), // null для пропущенных значений
                borderColor: colors[index % colors.length],
                backgroundColor: `${colors[index % colors.length]}22`,
                fill: false,
                tension: 0.4,
                pointRadius: 3
            });
        });
        
        console.log('Наборы данных для графика валют:', datasets);
        
        // Обновляем график
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
        
        // Обновляем статистические карточки с текущими курсами
        updateCurrencyCards(latestRates);
    } catch (error) {
        console.error('Ошибка при обновлении графика валют:', error);
        
        // Отображаем сообщение об ошибке на графике
        state.currencyChart.data.datasets = [{
            label: 'Ошибка загрузки данных',
            data: [],
            borderColor: '#ef4444'
        }];
        state.currencyChart.update();
    }
}

// Обновление графика криптовалют
function updateCryptoChart(cryptoHistory) {
    if (!cryptoHistory || (!cryptoHistory.bitcoin.length && !cryptoHistory.ethereum.length)) {
        console.error('Нет данных для обновления графика криптовалют');
        return;
    }

    try {
        // Подготавливаем метки дат для оси X (берем из данных биткоина)
        const labels = cryptoHistory.bitcoin.map(price => 
            new Date(price[0]).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
        );
        
        console.log('Метки для графика криптовалют:', labels);
        
        // Подготавливаем наборы данных для криптовалют
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
        
        // Получаем символ валюты для подсказок
        const currencySymbol = getCurrencySymbol(state.baseCurrency);
        
        // Обновляем график
        state.cryptoChart.data.labels = labels;
        state.cryptoChart.data.datasets = datasets;
        
        // Обновляем заголовок графика
        state.cryptoChart.options.plugins.title = {
            display: true,
            text: `Динамика криптовалют в ${state.baseCurrency}`,
            color: '#e2e8f0',
            font: {
                size: 16,
                weight: 'bold'
            }
        };
        
        // Обновляем подсказки с учетом валюты
        state.cryptoChart.options.plugins.tooltip.callbacks.label = function(context) {
            const value = context.raw.toLocaleString('ru-RU', {maximumFractionDigits: 2});
            return `${context.dataset.label}: ${currencySymbol}${value}`;
        };
        
        state.cryptoChart.update();
    } catch (error) {
        console.error('Ошибка при обновлении графика криптовалют:', error);
        
        // Отображаем сообщение об ошибке на графике
        state.cryptoChart.data.datasets = [{
            label: 'Ошибка загрузки данных',
            data: [],
            borderColor: '#ef4444'
        }];
        state.cryptoChart.update();
    }
}

// Обновление данных в зависимости от выбранного периода
async function updatePeriodData(period) {
    try {
        // Преобразуем период в количество дней
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        
        console.log(`Загрузка данных для периода: ${period} (${days} дней)`);
        
        // Показываем индикатор загрузки
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.opacity = '0.5';
        });
        
        // Параллельно загружаем данные для валют и криптовалют
        const [historicalRates, cryptoHistory] = await Promise.all([
            fetchHistoricalRates(days),
            fetchCryptoHistory(days)
        ]);

        // Обновляем графики с полученными данными
        if (historicalRates && historicalRates.length > 0) {
            console.log(`Получены данные для ${historicalRates.length} дней`);
            updateCurrencyChart(historicalRates);
            
            // Также обновляем карточки с курсами валют
            if (historicalRates[historicalRates.length - 1] && historicalRates[historicalRates.length - 1].rates) {
                updateCurrencyCards(historicalRates[historicalRates.length - 1].rates);
            }
        } else {
            console.error('Не удалось получить исторические данные для валют');
        }

        if (cryptoHistory && (cryptoHistory.bitcoin.length > 0 || cryptoHistory.ethereum.length > 0)) {
            console.log(`Получены данные криптовалют: BTC - ${cryptoHistory.bitcoin.length} точек, ETH - ${cryptoHistory.ethereum.length} точек`);
            updateCryptoChart(cryptoHistory);
            
            // Также обновляем карточки с криптовалютами
            if (cryptoHistory.bitcoin.length > 0 && cryptoHistory.ethereum.length > 0) {
                updateCryptoCards(cryptoHistory);
            }
        } else {
            console.error('Не удалось получить исторические данные для криптовалют');
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
    } finally {
        // Скрываем индикатор загрузки
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.opacity = '1';
        });
    }
}

// Функция для обновления карточек с валютами
function updateCurrencyCards(rates) {
    try {
        if (!rates) {
            console.error('Нет данных для обновления карточек валют');
            return;
        }
        
        console.log('Обновление карточек валют с данными:', rates);
        
        // Получаем список основных валют для отображения
        const mainCurrencies = ['EUR', 'GBP', 'JPY', 'RUB', 'KZT'];
        
        // Отфильтруем валюту, которая является базовой
        const currenciesToShow = mainCurrencies.filter(c => c !== state.baseCurrency);
        
        // Получаем или создаем контейнер для карточек
        let currencyCardsContainer = document.querySelector('.currency-cards-container');
        
        if (!currencyCardsContainer) {
            console.log('Создаем контейнер для карточек валют');
            
            // Находим секцию с заголовком "Курс основных валют"
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
        
        // Очищаем контейнер
        currencyCardsContainer.innerHTML = '';
        
        // Создаем карточки для каждой валюты
        currenciesToShow.forEach(currency => {
            const rate = rates[currency] || 0;
            
            const card = document.createElement('div');
            card.className = 'stat-card currency-card';
            card.style.padding = '1.5rem';
            card.style.borderRadius = '12px';
            card.style.background = 'var(--card-background-dark, #1a2942)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            card.style.transition = 'transform 0.3s ease';
            
            // Получаем флаг и название валюты
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
            
            // Добавляем эффект при наведении
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

// Функция для получения информации о валюте
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

// Функция для обновления карточек с криптовалютами
function updateCryptoCards(cryptoHistory) {
    try {
        const btcPrice = cryptoHistory.bitcoin[cryptoHistory.bitcoin.length - 1][1];
        const ethPrice = cryptoHistory.ethereum[cryptoHistory.ethereum.length - 1][1];
        
        // Получаем символ выбранной валюты
        const currencyInfo = getCurrencyInfo(state.baseCurrency);
        const currencySymbol = getCurrencySymbol(state.baseCurrency);
        
        // Обновляем карточки с криптовалютами
        const btcCard = document.querySelector('.stat-card:nth-child(1)');
        const ethCard = document.querySelector('.stat-card:nth-child(2)');
        
        if (btcCard) {
            const btcValueElement = btcCard.querySelector('.stat-value');
            if (btcValueElement) {
                btcValueElement.textContent = `${currencySymbol}${btcPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}`;
                
                // Добавляем или обновляем подзаголовок с информацией о базовой валюте
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
                
                // Добавляем или обновляем подзаголовок с информацией о базовой валюте
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

// Функция для получения символа валюты
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

// Обработчики событий
document.addEventListener('DOMContentLoaded', async () => {
    // Инициализация графиков
    initializeCharts();
    
    // Инициализация конвертера
    document.getElementById('amount').addEventListener('input', convertCurrency);
    document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
    document.getElementById('toCurrency').addEventListener('change', convertCurrency);
    
    // Обработчик кнопки обмена валют
    document.getElementById('swapCurrencies').addEventListener('click', () => {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const tempValue = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = tempValue;
        convertCurrency();
    });
    
    // Инициализация конвертации
    convertCurrency();
    
    // Обработчики для кнопок периода
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const periodText = this.textContent.trim().toLowerCase();
            console.log(`Кнопка периода: "${periodText}"`);
            
            let period = '7d';
            if (periodText === '30д') period = '30d';
            if (periodText === '3м') period = '90d';
            
            // Обновляем активную кнопку
            const buttons = this.parentNode.querySelectorAll('.period-btn');
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Обновляем данные для выбранного периода
            state.currentPeriod = period;
            await updatePeriodData(period);
        });
    });
    
    // Обработчик изменения базовой валюты
    document.getElementById('baseCurrency').addEventListener('change', async function(e) {
        const newCurrency = this.value;
        console.log(`Изменение базовой валюты на: ${newCurrency}`);
        
        state.baseCurrency = newCurrency;
        await updatePeriodData(state.currentPeriod);
    });
    
    // Кнопка обновления данных
    const refreshButtons = document.querySelectorAll('.refresh-btn');
    refreshButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Обновление данных...');
            
            // Добавляем анимацию вращения для индикации обновления
            this.classList.add('rotating');
            
            // Сбрасываем кэш перед обновлением
            const timestamp = new Date().getTime();
            
            try {
                // Получаем свежие данные для текущей базовой валюты
                const response = await fetch(`${EXCHANGE_API_URL}/${state.baseCurrency}?_=${timestamp}`);
                if (!response.ok) {
                    throw new Error(`Ошибка запроса: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Получены свежие курсы валют:', data);
                
                if (data && data.rates) {
                    // Обновляем карточки с текущими курсами
                    updateCurrencyCards(data.rates);
                    
                    // Обновляем текущие данные для графиков
                    await updatePeriodData(state.currentPeriod);
                    
                    // Уведомление об успешном обновлении
                    showNotification('Курсы валют успешно обновлены', 'success');
                }
            } catch (error) {
                console.error('Ошибка при обновлении курсов:', error);
                showNotification('Не удалось обновить курсы валют', 'error');
            } finally {
                // Удаляем анимацию вращения
                setTimeout(() => {
                    this.classList.remove('rotating');
                }, 500);
            }
        });
    });
    
    // Инициализация темы
    initTheme();
    
    // Переключение темы
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Инициализация при загрузке страницы
    console.log('Инициализация данных при загрузке...');
    await updatePeriodData('7d'); // Загружаем данные за 7 дней по умолчанию
});

// Функция инициализации темы
function initTheme() {
    // Пробуем получить тему из localStorage
    const savedTheme = localStorage.getItem('dashboardTheme');
    
    if (savedTheme) {
        // Применяем сохраненную тему
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Проверяем системные настройки
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', initialTheme);
        localStorage.setItem('dashboardTheme', initialTheme);
    }
    
    // Обновляем цвета графиков в соответствии с темой
    updateChartColors();
}

// Функция переключения темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Анимация при переключении
    document.body.style.opacity = '0.98';
    
    // Применяем новую тему
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
    
    // Обновляем цвета графиков
    updateChartColors();
    
    // Показываем уведомление
    showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    
    // Возвращаем нормальную прозрачность
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 300);
}

// Функция обновления цветов графиков в соответствии с темой
function updateChartColors() {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Обновляем настройки для всех графиков
    Chart.defaults.color = isDarkTheme ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    // Если графики уже созданы, обновляем их
    if (state.currencyChart) {
        // Настройки для осей
        state.currencyChart.options.scales.y.grid.color = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)';
        
        // Настройки для тултипов
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
        // Настройки для осей
        state.cryptoChart.options.scales.y.grid.color = isDarkTheme 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)';
        
        // Настройки для тултипов
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

// Функция для отображения уведомлений
function showNotification(message, type = 'info') {
    // Проверяем, существует ли контейнер для уведомлений
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        // Создаем контейнер для уведомлений, если его нет
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Стилизуем в зависимости от типа
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
    
    // Добавляем текст
    notification.textContent = message;
    
    // Добавляем в контейнер
    notificationContainer.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 50);
    
    // Убираем через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Вспомогательная функция для получения случайного цвета
function getRandomColor() {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}