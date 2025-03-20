// Объявление глобальных переменных
let transactionsDatabase = []; // Будет заполнена реальными данными
let cryptoRates = {}; // Текущие курсы криптовалют

// Текущее состояние фильтров
let currentFilters = {
    period: 'all',
    type: 'all',
    crypto: 'all'
};

// Текущая страница
let currentPage = 1;
// Количество записей на странице
const recordsPerPage = 10;
// Массив отфильтрованных транзакций
let filteredTransactions = [];

// Функция для загрузки данных о текущих курсах криптовалют с реального API
async function fetchCurrentRates() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');
    
    try {
        // Используем CoinGecko API для получения реальных курсов криптовалют
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin&vs_currencies=usd,eur,rub,kzt');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Преобразуем данные в удобный формат
        cryptoRates = {
            BTC: {
                USD: data.bitcoin.usd,
                EUR: data.bitcoin.eur,
                RUB: data.bitcoin.rub,
                KZT: data.bitcoin.kzt
            },
            ETH: {
                USD: data.ethereum.usd,
                EUR: data.ethereum.eur,
                RUB: data.ethereum.rub,
                KZT: data.ethereum.kzt
            },
            XRP: {
                USD: data.ripple.usd,
                EUR: data.ripple.eur,
                RUB: data.ripple.rub,
                KZT: data.ripple.kzt
            },
            LTC: {
                USD: data.litecoin.usd,
                EUR: data.litecoin.eur,
                RUB: data.litecoin.rub,
                KZT: data.litecoin.kzt
            }
        };
        
        console.log('Получены текущие курсы криптовалют:', cryptoRates);
        
        // После получения курсов, генерируем историю транзакций
        generateTransactionHistory();
        
        showNotification('Данные о курсах криптовалют обновлены', 'success');
    } catch (error) {
        console.error('Ошибка при получении курсов криптовалют:', error);
        
        // Если не удалось получить данные, используем заглушки
        cryptoRates = {
            BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
            ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
            XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
            LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
        };
        
        // После получения курсов, генерируем историю транзакций
        generateTransactionHistory();
        
        showNotification('Не удалось получить актуальные курсы. Используются приблизительные данные.', 'error');
    } finally {
        refreshBtn.classList.remove('rotating');
    }
}

// Функция для генерации реалистичной истории транзакций на основе текущих курсов
function generateTransactionHistory() {
    // Очищаем существующую историю
    transactionsDatabase = [];
    
    // Определяем диапазон дат (последние 3 месяца)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    // Определяем шаблоны операций для разных типов
    const operationTemplates = [
        // Покупки
        { type: 'buy', fromCurrency: 'USD', toCurrency: 'BTC', amount: 0.00125, status: 'completed' },
        { type: 'buy', fromCurrency: 'EUR', toCurrency: 'ETH', amount: 0.35, status: 'completed' },
        { type: 'buy', fromCurrency: 'RUB', toCurrency: 'ETH', amount: 0.12, status: 'completed' },
        { type: 'buy', fromCurrency: 'KZT', toCurrency: 'BTC', amount: 0.00075, status: 'completed' },
        { type: 'buy', fromCurrency: 'USD', toCurrency: 'LTC', amount: 3, status: 'completed' },
        { type: 'buy', fromCurrency: 'RUB', toCurrency: 'XRP', amount: 100, status: 'completed' },
        { type: 'buy', fromCurrency: 'KZT', toCurrency: 'ETH', amount: 0.05, status: 'completed' },
        
        // Продажи
        { type: 'sell', fromCurrency: 'ETH', toCurrency: 'EUR', amount: 0.5, status: 'completed' },
        { type: 'sell', fromCurrency: 'BTC', toCurrency: 'USD', amount: 0.02, status: 'completed' },
        { type: 'sell', fromCurrency: 'XRP', toCurrency: 'USD', amount: 200, status: 'completed' },
        { type: 'sell', fromCurrency: 'ETH', toCurrency: 'RUB', amount: 0.15, status: 'completed' },
        { type: 'sell', fromCurrency: 'BTC', toCurrency: 'KZT', amount: 0.01, status: 'completed' },
        { type: 'sell', fromCurrency: 'LTC', toCurrency: 'EUR', amount: 2, status: 'completed' },
        
        // Обмены
        { type: 'exchange', fromCurrency: 'BTC', toCurrency: 'ETH', amount: 0.05, status: 'completed' },
        { type: 'exchange', fromCurrency: 'ETH', toCurrency: 'XRP', amount: 0.25, status: 'completed' },
        { type: 'exchange', fromCurrency: 'LTC', toCurrency: 'BTC', amount: 2.5, status: 'completed' },
        { type: 'exchange', fromCurrency: 'XRP', toCurrency: 'ETH', amount: 500, status: 'completed' },
        { type: 'exchange', fromCurrency: 'ETH', toCurrency: 'LTC', amount: 0.2, status: 'completed' }
    ];
    
    // Генерируем ~20 транзакций в случайные даты
    const transactionCount = 20 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < transactionCount; i++) {
        // Выбираем случайный шаблон
        const templateIndex = Math.floor(Math.random() * operationTemplates.length);
        const template = operationTemplates[templateIndex];
        
        // Генерируем случайную дату в диапазоне
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Небольшая вариация суммы (±20%)
        const amountVariation = template.amount * (0.8 + Math.random() * 0.4);
        const amount = parseFloat(amountVariation.toFixed(template.amount < 1 ? 5 : 2));
        
        // Создаем транзакцию
        const transaction = {
            id: i + 1,
            date: randomDate,
            type: template.type,
            fromCurrency: template.fromCurrency,
            toCurrency: template.toCurrency,
            amount: amount,
            status: template.status
        };
        
        // Рассчитываем курс на основе реальных данных
        if (template.type === 'buy') {
            // Для покупки используем курс криптовалюты в фиатной валюте
            transaction.rate = calculateRate(template.toCurrency, template.fromCurrency);
        } else if (template.type === 'sell') {
            // Для продажи используем курс криптовалюты в фиатной валюте
            transaction.rate = calculateRate(template.fromCurrency, template.toCurrency);
        } else if (template.type === 'exchange') {
            // Для обмена рассчитываем соотношение между криптовалютами
            transaction.rate = calculateCryptoExchangeRate(template.fromCurrency, template.toCurrency);
            
            // Рассчитываем получаемую сумму
            transaction.toAmount = parseFloat((transaction.amount * transaction.rate).toFixed(4));
        }
        
        // Добавляем небольшую случайность в курс (±5%)
        const rateVariation = 0.95 + Math.random() * 0.1;
        transaction.rate = parseFloat((transaction.rate * rateVariation).toFixed(transaction.rate > 1000 ? 0 : transaction.rate > 100 ? 1 : transaction.rate > 1 ? 2 : 5));
        
        // Добавляем транзакцию в базу данных
        transactionsDatabase.push(transaction);
    }
    
    // Сортируем транзакции по дате (от новых к старым)
    transactionsDatabase.sort((a, b) => b.date - a.date);
    
    // Обновляем идентификаторы после сортировки
    transactionsDatabase.forEach((transaction, index) => {
        transaction.id = index + 1;
    });
    
    console.log('Сгенерирована история транзакций:', transactionsDatabase);
    
    // Обновляем отображение
    filteredTransactions = [...transactionsDatabase];
    updateHistoryTable();
    updateSummary();
    updatePagination();
}

// Функция для расчета курса обмена криптовалюты в фиатную
function calculateRate(cryptoCurrency, fiatCurrency) {
    // Если есть реальные курсы, используем их
    if (cryptoRates[cryptoCurrency] && cryptoRates[cryptoCurrency][fiatCurrency]) {
        return cryptoRates[cryptoCurrency][fiatCurrency];
    }
    
    // Если нет данных, возвращаем приблизительные значения
    const approximateRates = {
        BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
        ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
        XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
        LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
    };
    
    return approximateRates[cryptoCurrency][fiatCurrency];
}

// Функция для расчета соотношения между криптовалютами
function calculateCryptoExchangeRate(fromCrypto, toCrypto) {
    // Используем USD в качестве промежуточной валюты для расчета кросс-курса
    const fromToUsd = cryptoRates[fromCrypto]?.USD || approximateRate(fromCrypto, 'USD');
    const toToUsd = cryptoRates[toCrypto]?.USD || approximateRate(toCrypto, 'USD');
    
    return fromToUsd / toToUsd;
}

// Функция для получения приблизительного курса
function approximateRate(crypto, fiat) {
    const rates = {
        BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
        ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
        XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
        LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
    };
    
    return rates[crypto][fiat];
}

// Функция для фильтрации операций
function filterTransactions() {
    const period = document.getElementById('historyPeriod').value;
    const type = document.getElementById('operationType').value;
    const crypto = document.getElementById('cryptoCurrency').value;

    // Сохраняем выбранные фильтры
    currentFilters = {
        period,
        type,
        crypto
    };

    console.log('Применяем фильтры:', currentFilters);

    // Имитируем запрос к серверу
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');

    // Фильтруем данные
    setTimeout(() => {
        // Применяем реальную фильтрацию данных
        filteredTransactions = transactionsDatabase.filter(transaction => {
            // Фильтр по периоду
            let passesDateFilter = true;
            const now = new Date();
            const transactionDate = new Date(transaction.date);
            
            if (period === 'day') {
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                passesDateFilter = transactionDate >= oneDayAgo;
            } else if (period === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                passesDateFilter = transactionDate >= oneWeekAgo;
            } else if (period === 'month') {
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                passesDateFilter = transactionDate >= oneMonthAgo;
            }
            
            // Фильтр по типу операции
            const passesTypeFilter = type === 'all' || transaction.type === type;
            
            // Фильтр по криптовалюте
            const passesCryptoFilter = crypto === 'all' || 
                transaction.fromCurrency === crypto || 
                transaction.toCurrency === crypto;
            
            return passesDateFilter && passesTypeFilter && passesCryptoFilter;
        });

        // Сбрасываем на первую страницу при изменении фильтров
        currentPage = 1;
        
        // Обновляем UI
        refreshBtn.classList.remove('rotating');
        updateHistoryTable();
        updateSummary();
        updatePagination();
        
        // Показываем уведомление
        showNotification('Фильтры применены', 'success');
    }, 800);
}

// Функция для обновления сводной информации
function updateSummary() {
    // Рассчитываем реальную статистику из отфильтрованных данных
    const totalOps = filteredTransactions.length;
    
    const buyOps = filteredTransactions.filter(t => t.type === 'buy').length;
    const sellOps = filteredTransactions.filter(t => t.type === 'sell').length;
    
    // Рассчитываем общий объем
    let totalVolume = 0;
    const baseCurrency = document.getElementById('baseCurrency').value;
    
    // Рассчитываем общий объем операций с конвертацией в базовую валюту
    filteredTransactions.forEach(t => {
        let operationVolume = 0;
        
        if (t.type === 'buy' || t.type === 'sell') {
            // Для покупок и продаж используем стоимость операции
            if (isCrypto(t.fromCurrency)) {
                // Если исходная валюта - крипта, используем её курс к базовой валюте
                const rateToBase = calculateRate(t.fromCurrency, baseCurrency);
                operationVolume = t.amount * rateToBase;
            } else if (isCrypto(t.toCurrency)) {
                // Если целевая валюта - крипта, используем её курс к базовой валюте
                const rateToBase = calculateRate(t.toCurrency, baseCurrency);
                operationVolume = t.amount * rateToBase;
            }
        } else if (t.type === 'exchange') {
            // Для обменов берем стоимость исходной криптовалюты
            const rateToBase = calculateRate(t.fromCurrency, baseCurrency);
            operationVolume = t.amount * rateToBase;
        }
        
        totalVolume += operationVolume;
    });
    
    // Форматируем объем в базовой валюте
    const formattedTotalVolume = formatCurrency(totalVolume, baseCurrency);
    
    // Обновляем значения в карточках
    const summaryCards = document.querySelectorAll('.summary-value');
    summaryCards[0].textContent = totalOps;
    summaryCards[1].textContent = buyOps;
    summaryCards[2].textContent = sellOps;
    summaryCards[3].textContent = formattedTotalVolume;
}

// Функция форматирования валют
function formatCurrency(amount, currency) {
    const currencySymbol = getCurrencySymbol(currency);
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: currency,
        currencyDisplay: 'symbol',
        maximumFractionDigits: 2
    }).format(amount);
}

// Функция получения символа валюты
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'RUB': '₽',
        'KZT': '₸',
        'BTC': '₿',
        'ETH': 'Ξ',
        'XRP': 'XRP',
        'LTC': 'Ł'
    };
    
    return symbols[currency] || currency;
}

// Функция обновления таблицы истории
function updateHistoryTable() {
    const tableBody = document.querySelector('.history-table tbody');
    
    // Очищаем таблицу
    tableBody.innerHTML = '';
    
    // Определяем, какие записи отображать на текущей странице
    const startIdx = (currentPage - 1) * recordsPerPage;
    const endIdx = Math.min(startIdx + recordsPerPage, filteredTransactions.length);
    
    // Если нет данных, показываем сообщение
    if (filteredTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="no-data">Операций не найдено</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Добавляем записи
    for (let i = startIdx; i < endIdx; i++) {
        const transaction = filteredTransactions[i];
        
        const row = document.createElement('tr');
        
        // Форматируем дату
        const dateStr = new Intl.DateTimeFormat('ru-RU', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        }).format(transaction.date);
        
        // Определяем тип операции на русском
        let typeText = '';
        switch(transaction.type) {
            case 'buy': typeText = 'Покупка'; break;
            case 'sell': typeText = 'Продажа'; break;
            case 'exchange': typeText = 'Обмен'; break;
        }
        
        // Форматируем отображение криптовалют и фиатных денег
        const fromIcon = isCrypto(transaction.fromCurrency) ? 
            `<i class="fab fa-${getCryptoIcon(transaction.fromCurrency)}"></i> ` : '';
        
        const toIcon = isCrypto(transaction.toCurrency) ? 
            `<i class="fab fa-${getCryptoIcon(transaction.toCurrency)}"></i> ` : '';
        
        // Форматируем курс в зависимости от типа операции
        let rateDisplay = '';
        if (transaction.type === 'exchange') {
            rateDisplay = `1 ${transaction.fromCurrency} = ${transaction.rate} ${transaction.toCurrency}`;
        } else {
            const currencySymbol = getCurrencySymbol(transaction.fromCurrency === 'BTC' || 
                                    transaction.fromCurrency === 'ETH' || 
                                    transaction.fromCurrency === 'XRP' || 
                                    transaction.fromCurrency === 'LTC' ? 
                                    transaction.toCurrency : transaction.fromCurrency);
            rateDisplay = `${currencySymbol}${transaction.rate.toLocaleString('ru-RU')}`;
        }
        
        // Форматируем сумму в зависимости от типа операции
        let amountDisplay = '';
        if (transaction.type === 'exchange') {
            amountDisplay = `${transaction.amount} ${transaction.fromCurrency} → ${transaction.toAmount} ${transaction.toCurrency}`;
        } else {
            amountDisplay = `${transaction.amount} ${transaction.type === 'buy' ? transaction.toCurrency : transaction.fromCurrency}`;
        }
        
        // Определяем статус операции
        let statusText = '';
        switch(transaction.status) {
            case 'completed': statusText = 'Завершено'; break;
            case 'pending': statusText = 'В обработке'; break;
            case 'failed': statusText = 'Ошибка'; break;
        }
        
        row.innerHTML = `
            <td>${dateStr}</td>
            <td><span class="badge ${transaction.type}">${typeText}</span></td>
            <td>${fromIcon}${transaction.fromCurrency}</td>
            <td>${toIcon}${transaction.toCurrency}</td>
            <td>${rateDisplay}</td>
            <td>${amountDisplay}</td>
            <td><span class="status ${transaction.status}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    }
}

// Проверка, является ли валюта криптовалютой
function isCrypto(currency) {
    return ['BTC', 'ETH', 'XRP', 'LTC'].includes(currency);
}

// Получение названия иконки для криптовалюты
function getCryptoIcon(currency) {
    const icons = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'XRP': 'xrp',
        'LTC': 'litecoin'
    };
    
    return icons[currency] || 'question';
}

// Функция обновления пагинации
function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
    
    // Обновляем кнопки с номерами страниц
    const pageNumbers = document.querySelector('.page-numbers');
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 5) {
        // Если страниц мало, показываем все
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-number${i === currentPage ? ' active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => changePage(i));
            pageNumbers.appendChild(btn);
        }
    } else {
        // Если страниц много, показываем первую, последнюю и несколько вокруг текущей
        // Первая страница
        addPageButton(1, pageNumbers);
        
        // Если текущая страница далеко от начала, добавляем многоточие
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbers.appendChild(dots);
        }
        
        // Страницы вокруг текущей
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            addPageButton(i, pageNumbers);
        }
        
        // Если текущая страница далеко от конца, добавляем многоточие
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbers.appendChild(dots);
        }
        
        // Последняя страница
        if (totalPages > 1) {
            addPageButton(totalPages, pageNumbers);
        }
    }
    
    // Обновляем состояние кнопок "Предыдущая" и "Следующая"
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Вспомогательная функция для добавления кнопки страницы
function addPageButton(pageNum, container) {
    const btn = document.createElement('button');
    btn.className = `page-number${pageNum === currentPage ? ' active' : ''}`;
    btn.textContent = pageNum;
    btn.addEventListener('click', () => changePage(pageNum));
    container.appendChild(btn);
}

// Функция для переключения страниц
function changePage(pageNum) {
    // Обновляем текущую страницу
    currentPage = pageNum;
    
    console.log('Переключаемся на страницу', pageNum);
    
    // Имитируем загрузку данных
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');
    
    // Обновляем таблицу и пагинацию
    setTimeout(() => {
        refreshBtn.classList.remove('rotating');
        updateHistoryTable();
        updatePagination();
    }, 600);
}

// Функция для отображения уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
    `;
    
    // Добавляем уведомление на страницу
    document.body.appendChild(notification);
    
    // Через небольшую задержку добавляем класс для анимации появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматически скрываем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        // После завершения анимации удаляем элемент
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функция инициализации темы
function initTheme() {
    // Проверяем, сохранена ли тема в localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Если есть сохраненная тема, применяем ее
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Также обновляем состояние переключателя темы
        if (savedTheme === 'light') {
            document.getElementById('themeToggle').classList.add('light');
        }
    } 
    // Если нет сохраненной темы, используем системные настройки
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeToggle').classList.add('light');
    }
}

// Функция переключения темы
function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    // Получаем текущую тему
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    // Определяем новую тему
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Применяем новую тему
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Обновляем состояние переключателя
    themeToggle.classList.toggle('light', newTheme === 'light');
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', newTheme);
    
    // Показываем уведомление
    showNotification(`Тема переключена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
}

// Инициализация страницы при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация темы
    initTheme();
    
    // Загружаем реальные данные о курсах криптовалют
    fetchCurrentRates();
    
    // Обработчик кнопки применения фильтров
    document.getElementById('applyFilters').addEventListener('click', filterTransactions);
    
    // Обработчик кнопки обновления
    document.querySelector('.refresh-btn').addEventListener('click', () => {
        // Обновляем курсы и историю
        fetchCurrentRates();
    });
    
    // Обработчик изменения базовой валюты
    document.getElementById('baseCurrency').addEventListener('change', () => {
        updateSummary();
    });
    
    // Обработчик для кнопки "Предыдущая страница"
    document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });
    
    // Обработчик для кнопки "Следующая страница"
    document.querySelector('.pagination-btn.next').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    });
    
    // Если в URL есть параметры фильтров, сохраняем их для применения после загрузки данных
    const urlParams = new URLSearchParams(window.location.search);
    const periodParam = urlParams.get('period');
    const typeParam = urlParams.get('type');
    const cryptoParam = urlParams.get('crypto');
    
    if (periodParam) {
        document.getElementById('historyPeriod').value = periodParam;
        currentFilters.period = periodParam;
    }
    
    if (typeParam) {
        document.getElementById('operationType').value = typeParam;
        currentFilters.type = typeParam;
    }
    
    if (cryptoParam) {
        document.getElementById('cryptoCurrency').value = cryptoParam;
        currentFilters.crypto = cryptoParam;
    }
    
    // Активируем обработчик для переключения темы
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}); 