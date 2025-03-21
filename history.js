let transactionsDatabase = [];
let cryptoRates = {};

let currentFilters = {
    period: 'all',
    type: 'all',
    crypto: 'all'
};

let currentPage = 1;
const recordsPerPage = 10;
let filteredTransactions = [];

async function fetchCurrentRates() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');
    
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin&vs_currencies=usd,eur,rub,kzt');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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
        
        generateTransactionHistory();
        
        showNotification('Данные о курсах криптовалют обновлены', 'success');
    } catch (error) {
        console.error('Ошибка при получении курсов криптовалют:', error);
        
        cryptoRates = {
            BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
            ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
            XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
            LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
        };
        
        generateTransactionHistory();
        
        showNotification('Не удалось получить актуальные курсы. Используются приблизительные данные.', 'error');
    } finally {
        refreshBtn.classList.remove('rotating');
    }
}

function generateTransactionHistory() {
    transactionsDatabase = [];
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const operationTemplates = [
        { type: 'buy', fromCurrency: 'USD', toCurrency: 'BTC', amount: 0.00125, status: 'completed' },
        { type: 'buy', fromCurrency: 'EUR', toCurrency: 'ETH', amount: 0.35, status: 'completed' },
        { type: 'buy', fromCurrency: 'RUB', toCurrency: 'ETH', amount: 0.12, status: 'completed' },
        { type: 'buy', fromCurrency: 'KZT', toCurrency: 'BTC', amount: 0.00075, status: 'completed' },
        { type: 'buy', fromCurrency: 'USD', toCurrency: 'LTC', amount: 3, status: 'completed' },
        { type: 'buy', fromCurrency: 'RUB', toCurrency: 'XRP', amount: 100, status: 'completed' },
        { type: 'buy', fromCurrency: 'KZT', toCurrency: 'ETH', amount: 0.05, status: 'completed' },
        { type: 'sell', fromCurrency: 'ETH', toCurrency: 'EUR', amount: 0.5, status: 'completed' },
        { type: 'sell', fromCurrency: 'BTC', toCurrency: 'USD', amount: 0.02, status: 'completed' },
        { type: 'sell', fromCurrency: 'XRP', toCurrency: 'USD', amount: 200, status: 'completed' },
        { type: 'sell', fromCurrency: 'ETH', toCurrency: 'RUB', amount: 0.15, status: 'completed' },
        { type: 'sell', fromCurrency: 'BTC', toCurrency: 'KZT', amount: 0.01, status: 'completed' },
        { type: 'sell', fromCurrency: 'LTC', toCurrency: 'EUR', amount: 2, status: 'completed' },
        { type: 'exchange', fromCurrency: 'BTC', toCurrency: 'ETH', amount: 0.05, status: 'completed' },
        { type: 'exchange', fromCurrency: 'ETH', toCurrency: 'XRP', amount: 0.25, status: 'completed' },
        { type: 'exchange', fromCurrency: 'LTC', toCurrency: 'BTC', amount: 2.5, status: 'completed' },
        { type: 'exchange', fromCurrency: 'XRP', toCurrency: 'ETH', amount: 500, status: 'completed' },
        { type: 'exchange', fromCurrency: 'ETH', toCurrency: 'LTC', amount: 0.2, status: 'completed' }
    ];
    
    const transactionCount = 20 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < transactionCount; i++) {
        const templateIndex = Math.floor(Math.random() * operationTemplates.length);
        const template = operationTemplates[templateIndex];
        
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        const amountVariation = template.amount * (0.8 + Math.random() * 0.4);
        const amount = parseFloat(amountVariation.toFixed(template.amount < 1 ? 5 : 2));
        
        const transaction = {
            id: i + 1,
            date: randomDate,
            type: template.type,
            fromCurrency: template.fromCurrency,
            toCurrency: template.toCurrency,
            amount: amount,
            status: template.status
        };
        
        if (template.type === 'buy') {
            transaction.rate = calculateRate(template.toCurrency, template.fromCurrency);
        } else if (template.type === 'sell') {
            transaction.rate = calculateRate(template.fromCurrency, template.toCurrency);
        } else if (template.type === 'exchange') {
            transaction.rate = calculateCryptoExchangeRate(template.fromCurrency, template.toCurrency);
            transaction.toAmount = parseFloat((transaction.amount * transaction.rate).toFixed(4));
        }
        
        const rateVariation = 0.95 + Math.random() * 0.1;
        transaction.rate = parseFloat((transaction.rate * rateVariation).toFixed(transaction.rate > 1000 ? 0 : transaction.rate > 100 ? 1 : transaction.rate > 1 ? 2 : 5));
        
        transactionsDatabase.push(transaction);
    }
    
    transactionsDatabase.sort((a, b) => b.date - a.date);
    
    transactionsDatabase.forEach((transaction, index) => {
        transaction.id = index + 1;
    });
    
    console.log('Сгенерирована история транзакций:', transactionsDatabase);
    
    filteredTransactions = [...transactionsDatabase];
    updateHistoryTable();
    updateSummary();
    updatePagination();
}

function calculateRate(cryptoCurrency, fiatCurrency) {
    if (cryptoRates[cryptoCurrency] && cryptoRates[cryptoCurrency][fiatCurrency]) {
        return cryptoRates[cryptoCurrency][fiatCurrency];
    }
    
    const approximateRates = {
        BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
        ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
        XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
        LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
    };
    
    return approximateRates[cryptoCurrency][fiatCurrency];
}

function calculateCryptoExchangeRate(fromCrypto, toCrypto) {
    const fromToUsd = cryptoRates[fromCrypto]?.USD || approximateRate(fromCrypto, 'USD');
    const toToUsd = cryptoRates[toCrypto]?.USD || approximateRate(toCrypto, 'USD');
    
    return fromToUsd / toToUsd;
}

function approximateRate(crypto, fiat) {
    const rates = {
        BTC: { USD: 85000, EUR: 75000, RUB: 7650000, KZT: 38250000 },
        ETH: { USD: 3000, EUR: 2700, RUB: 270000, KZT: 1350000 },
        XRP: { USD: 0.55, EUR: 0.49, RUB: 49.5, KZT: 247.5 },
        LTC: { USD: 90, EUR: 81, RUB: 8100, KZT: 40500 }
    };
    
    return rates[crypto][fiat];
}

function filterTransactions() {
    const period = document.getElementById('historyPeriod').value;
    const type = document.getElementById('operationType').value;
    const crypto = document.getElementById('cryptoCurrency').value;

    currentFilters = {
        period,
        type,
        crypto
    };

    console.log('Применяем фильтры:', currentFilters);

    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');

    setTimeout(() => {
        filteredTransactions = transactionsDatabase.filter(transaction => {
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
            
            const passesTypeFilter = type === 'all' || transaction.type === type;
            
            const passesCryptoFilter = crypto === 'all' || 
                transaction.fromCurrency === crypto || 
                transaction.toCurrency === crypto;
            
            return passesDateFilter && passesTypeFilter && passesCryptoFilter;
        });

        currentPage = 1;
        
        refreshBtn.classList.remove('rotating');
        updateHistoryTable();
        updateSummary();
        updatePagination();
        
        showNotification('Фильтры применены', 'success');
    }, 800);
}

function updateSummary() {
    const totalOps = filteredTransactions.length;
    
    const buyOps = filteredTransactions.filter(t => t.type === 'buy').length;
    const sellOps = filteredTransactions.filter(t => t.type === 'sell').length;
    
    let totalVolume = 0;
    const baseCurrency = document.getElementById('baseCurrency').value;
    
    filteredTransactions.forEach(t => {
        let operationVolume = 0;
        
        if (t.type === 'buy' || t.type === 'sell') {
            if (isCrypto(t.fromCurrency)) {
                const rateToBase = calculateRate(t.fromCurrency, baseCurrency);
                operationVolume = t.amount * rateToBase;
            } else if (isCrypto(t.toCurrency)) {
                const rateToBase = calculateRate(t.toCurrency, baseCurrency);
                operationVolume = t.amount * rateToBase;
            }
        } else if (t.type === 'exchange') {
            const rateToBase = calculateRate(t.fromCurrency, baseCurrency);
            operationVolume = t.amount * rateToBase;
        }
        
        totalVolume += operationVolume;
    });
    
    const formattedTotalVolume = formatCurrency(totalVolume, baseCurrency);
    
    const summaryCards = document.querySelectorAll('.summary-value');
    summaryCards[0].textContent = totalOps;
    summaryCards[1].textContent = buyOps;
    summaryCards[2].textContent = sellOps;
    summaryCards[3].textContent = formattedTotalVolume;
}

function formatCurrency(amount, currency) {
    const currencySymbol = getCurrencySymbol(currency);
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: currency,
        currencyDisplay: 'symbol',
        maximumFractionDigits: 2
    }).format(amount);
}

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

function updateHistoryTable() {
    const tableBody = document.querySelector('.history-table tbody');
    
    tableBody.innerHTML = '';
    
    const startIdx = (currentPage - 1) * recordsPerPage;
    const endIdx = Math.min(startIdx + recordsPerPage, filteredTransactions.length);
    
    if (filteredTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="no-data">Операций не найдено</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    for (let i = startIdx; i < endIdx; i++) {
        const transaction = filteredTransactions[i];
        
        const row = document.createElement('tr');
        
        const dateStr = new Intl.DateTimeFormat('ru-RU', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        }).format(transaction.date);
        
        let typeText = '';
        switch(transaction.type) {
            case 'buy': typeText = 'Покупка'; break;
            case 'sell': typeText = 'Продажа'; break;
            case 'exchange': typeText = 'Обмен'; break;
        }
        
        const fromIcon = isCrypto(transaction.fromCurrency) ? 
            `<i class="fab fa-${getCryptoIcon(transaction.fromCurrency)}"></i> ` : '';
        
        const toIcon = isCrypto(transaction.toCurrency) ? 
            `<i class="fab fa-${getCryptoIcon(transaction.toCurrency)}"></i> ` : '';
        
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
        
        let amountDisplay = '';
        if (transaction.type === 'exchange') {
            amountDisplay = `${transaction.amount} ${transaction.fromCurrency} → ${transaction.toAmount} ${transaction.toCurrency}`;
        } else {
            amountDisplay = `${transaction.amount} ${transaction.type === 'buy' ? transaction.toCurrency : transaction.fromCurrency}`;
        }
        
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

function isCrypto(currency) {
    return ['BTC', 'ETH', 'XRP', 'LTC'].includes(currency);
}

function getCryptoIcon(currency) {
    const icons = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'XRP': 'xrp',
        'LTC': 'litecoin'
    };
    
    return icons[currency] || 'question';
}

function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
    
    const pageNumbers = document.querySelector('.page-numbers');
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-number${i === currentPage ? ' active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => changePage(i));
            pageNumbers.appendChild(btn);
        }
    } else {
        addPageButton(1, pageNumbers);
        
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbers.appendChild(dots);
        }
        
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            addPageButton(i, pageNumbers);
        }
        
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            pageNumbers.appendChild(dots);
        }
        
        if (totalPages > 1) {
            addPageButton(totalPages, pageNumbers);
        }
    }
    
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function addPageButton(pageNum, container) {
    const btn = document.createElement('button');
    btn.className = `page-number${pageNum === currentPage ? ' active' : ''}`;
    btn.textContent = pageNum;
    btn.addEventListener('click', () => changePage(pageNum));
    container.appendChild(btn);
}

function changePage(pageNum) {
    currentPage = pageNum;
    
    console.log('Переключаемся на страницу', pageNum);
    
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('rotating');
    
    setTimeout(() => {
        refreshBtn.classList.remove('rotating');
        updateHistoryTable();
        updatePagination();
    }, 600);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
            document.getElementById('themeToggle').classList.add('light');
        }
    } 
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeToggle').classList.add('light');
    }
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    
    themeToggle.classList.toggle('light', newTheme === 'light');
    
    localStorage.setItem('theme', newTheme);
    
    showNotification(`Тема переключена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
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

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    fetchCurrentRates();
    
    document.getElementById('applyFilters').addEventListener('click', filterTransactions);
    
    document.querySelector('.refresh-btn').addEventListener('click', () => {
        fetchCurrentRates();
    });
    
    document.getElementById('baseCurrency').addEventListener('change', () => {
        updateSummary();
    });
    
    document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });
    
    document.querySelector('.pagination-btn.next').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    });
    
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
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    initMobileNav();
}); 