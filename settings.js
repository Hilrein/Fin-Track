// Объект с настройками по умолчанию
const defaultSettings = {
    // Персонализация
    theme: 'dark', // dark, light, system
    defaultCurrency: 'USD',
    
    // Отображение
    defaultPeriod: '7',
    decimalPlaces: '2',
    compactMode: false,
    
    // Уведомления
    enableNotifications: true,
    rateChangeNotifications: false,
    notificationDuration: 3,
    
    // Данные
    autoRefresh: false,
    refreshInterval: '5',
    displayedCrypto: ['BTC', 'ETH'],
    
    // Прочие настройки
    lastUpdated: new Date().toISOString()
};

// Переменная для хранения текущих настроек
let currentSettings = {};

// Функция для загрузки настроек из localStorage
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('financeSettings');
        
        if (savedSettings) {
            currentSettings = JSON.parse(savedSettings);
            console.log('Настройки загружены:', currentSettings);
        } else {
            // Если настроек нет, используем значения по умолчанию
            currentSettings = { ...defaultSettings };
            localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
            console.log('Используются настройки по умолчанию');
        }
        
        // Заполняем форму текущими настройками
        populateSettingsForm();
    } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        showNotification('Ошибка при загрузке настроек', 'error');
        
        // В случае ошибки используем настройки по умолчанию
        currentSettings = { ...defaultSettings };
    }
}

// Функция для заполнения формы значениями из текущих настроек
function populateSettingsForm() {
    // Персонализация
    document.getElementById('themeSelect').value = currentSettings.theme || defaultSettings.theme;
    document.getElementById('defaultCurrency').value = currentSettings.defaultCurrency || defaultSettings.defaultCurrency;
    
    // Отображение
    document.getElementById('defaultPeriod').value = currentSettings.defaultPeriod || defaultSettings.defaultPeriod;
    document.getElementById('decimalPlaces').value = currentSettings.decimalPlaces || defaultSettings.decimalPlaces;
    document.getElementById('compactMode').checked = currentSettings.compactMode || defaultSettings.compactMode;
    
    // Уведомления
    document.getElementById('enableNotifications').checked = 
        currentSettings.enableNotifications !== undefined ? 
        currentSettings.enableNotifications : defaultSettings.enableNotifications;
    
    document.getElementById('rateChangeNotifications').checked = 
        currentSettings.rateChangeNotifications !== undefined ? 
        currentSettings.rateChangeNotifications : defaultSettings.rateChangeNotifications;
    
    const durationSlider = document.getElementById('notificationDuration');
    durationSlider.value = currentSettings.notificationDuration || defaultSettings.notificationDuration;
    document.getElementById('durationValue').textContent = `${durationSlider.value} сек`;
    
    // Данные
    document.getElementById('autoRefresh').checked = 
        currentSettings.autoRefresh !== undefined ? 
        currentSettings.autoRefresh : defaultSettings.autoRefresh;
    
    document.getElementById('refreshInterval').value = currentSettings.refreshInterval || defaultSettings.refreshInterval;
    
    // Отображаемые криптовалюты
    const displayedCrypto = currentSettings.displayedCrypto || defaultSettings.displayedCrypto;
    document.querySelectorAll('input[name="displayedCrypto"]').forEach(checkbox => {
        checkbox.checked = displayedCrypto.includes(checkbox.value);
    });
    
    // Применяем компактный режим, если он активирован
    if (currentSettings.compactMode) {
        document.documentElement.classList.add('compact-mode');
    } else {
        document.documentElement.classList.remove('compact-mode');
    }
}

// Функция для сохранения настроек
function saveSettings() {
    try {
        // Персонализация
        currentSettings.theme = document.getElementById('themeSelect').value;
        currentSettings.defaultCurrency = document.getElementById('defaultCurrency').value;
        
        // Отображение
        currentSettings.defaultPeriod = document.getElementById('defaultPeriod').value;
        currentSettings.decimalPlaces = document.getElementById('decimalPlaces').value;
        currentSettings.compactMode = document.getElementById('compactMode').checked;
        
        // Уведомления
        currentSettings.enableNotifications = document.getElementById('enableNotifications').checked;
        currentSettings.rateChangeNotifications = document.getElementById('rateChangeNotifications').checked;
        currentSettings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
        
        // Данные
        currentSettings.autoRefresh = document.getElementById('autoRefresh').checked;
        currentSettings.refreshInterval = document.getElementById('refreshInterval').value;
        
        // Отображаемые криптовалюты
        currentSettings.displayedCrypto = [];
        document.querySelectorAll('input[name="displayedCrypto"]:checked').forEach(checkbox => {
            currentSettings.displayedCrypto.push(checkbox.value);
        });
        
        // Обновляем дату последнего изменения
        currentSettings.lastUpdated = new Date().toISOString();
        
        // Сохраняем настройки в localStorage
        localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
        
        // Применяем настройки
        applySettings();
        
        console.log('Настройки сохранены:', currentSettings);
        showNotification('Настройки успешно сохранены', 'success');
    } catch (error) {
        console.error('Ошибка при сохранении настроек:', error);
        showNotification('Ошибка при сохранении настроек', 'error');
    }
}

// Функция для применения настроек
function applySettings() {
    // Применяем тему
    const selectedTheme = currentSettings.theme;
    if (selectedTheme === 'system') {
        // Определяем предпочтение системы
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById('themeToggle').classList.add('light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('themeToggle').classList.remove('light');
        }
    } else {
        document.documentElement.setAttribute('data-theme', selectedTheme);
        if (selectedTheme === 'light') {
            document.getElementById('themeToggle').classList.add('light');
        } else {
            document.getElementById('themeToggle').classList.remove('light');
        }
    }
    
    // Применяем компактный режим
    if (currentSettings.compactMode) {
        document.documentElement.classList.add('compact-mode');
    } else {
        document.documentElement.classList.remove('compact-mode');
    }
    
    // Обновляем базовую валюту в селекторе, если он существует на странице
    const currencySelector = document.getElementById('baseCurrency');
    if (currencySelector && currencySelector.value !== currentSettings.defaultCurrency) {
        currencySelector.value = currentSettings.defaultCurrency;
        // Если есть обработчик изменения валюты, вызываем его
        const event = new Event('change');
        currencySelector.dispatchEvent(event);
    }
}

// Функция для экспорта настроек в файл
function exportSettings() {
    try {
        // Создаем объект с настройками для экспорта
        const exportData = {
            settings: currentSettings,
            version: '1.0',
            exportDate: new Date().toISOString()
        };
        
        // Преобразуем данные в JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Создаем Blob и ссылку для скачивания
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Создаем ссылку и имитируем клик для скачивания
        const a = document.createElement('a');
        a.href = url;
        a.download = `fintrack_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Очищаем ресурсы
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification('Настройки экспортированы в файл', 'success');
    } catch (error) {
        console.error('Ошибка при экспорте настроек:', error);
        showNotification('Ошибка при экспорте настроек', 'error');
    }
}

// Функция для импорта настроек из файла
function importSettings(file) {
    try {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Проверяем структуру файла
                if (!importedData.settings) {
                    throw new Error('Неверный формат файла настроек');
                }
                
                // Применяем импортированные настройки
                currentSettings = importedData.settings;
                
                // Сохраняем настройки в localStorage
                localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
                
                // Обновляем форму
                populateSettingsForm();
                
                // Применяем настройки
                applySettings();
                
                showNotification('Настройки успешно импортированы', 'success');
            } catch (parseError) {
                console.error('Ошибка при обработке файла настроек:', parseError);
                showNotification('Неверный формат файла настроек', 'error');
            }
        };
        
        reader.onerror = function() {
            showNotification('Ошибка при чтении файла', 'error');
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error('Ошибка при импорте настроек:', error);
        showNotification('Ошибка при импорте настроек', 'error');
    }
}

// Функция для сброса настроек к значениям по умолчанию
function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
        currentSettings = { ...defaultSettings };
        localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
        
        // Обновляем форму
        populateSettingsForm();
        
        // Применяем настройки
        applySettings();
        
        showNotification('Настройки сброшены до значений по умолчанию', 'info');
    }
}

// Функция для отображения уведомлений (такая же, как в app.js и history.js)
function showNotification(message, type = 'info') {
    // Проверяем, включены ли уведомления в настройках
    if (currentSettings.enableNotifications === false && type !== 'error') {
        console.log('Уведомления отключены в настройках');
        return;
    }
    
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
    
    // Получаем длительность отображения из настроек
    const duration = (currentSettings.notificationDuration || 3) * 1000;
    
    // Автоматически скрываем уведомление
    setTimeout(() => {
        notification.classList.remove('show');
        // После завершения анимации удаляем элемент
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Функция для инициализации мобильной навигации
function initMobileNav() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('menuBackdrop');
    const body = document.body;
    
    if (!mobileNavToggle || !sidebar || !backdrop) return;
    
    // Переключение состояния мобильного меню
    mobileNavToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        mobileNavToggle.querySelector('i').classList.toggle('fa-bars');
        mobileNavToggle.querySelector('i').classList.toggle('fa-times');
        body.classList.toggle('menu-open');
    });
    
    // Закрытие меню при клике на подложку
    backdrop.addEventListener('click', () => {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        mobileNavToggle.querySelector('i').classList.add('fa-bars');
        mobileNavToggle.querySelector('i').classList.remove('fa-times');
        body.classList.remove('menu-open');
    });
    
    // Закрытие меню при клике на пункт меню
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
    
    // Настройка поведения при изменении размера окна
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

// Инициализация настроек при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем настройки
    loadSettings();
    
    // Обработчик изменения слайдера длительности уведомлений
    document.getElementById('notificationDuration').addEventListener('input', function() {
        document.getElementById('durationValue').textContent = `${this.value} сек`;
    });
    
    // Обработчик кнопки сохранения
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Обработчик кнопки экспорта
    document.getElementById('exportSettings').addEventListener('click', exportSettings);
    
    // Обработчик выбора файла для импорта
    document.getElementById('importSettings').addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            importSettings(event.target.files[0]);
        }
    });
    
    // Обработчик кнопки сброса
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    // Обработчик изменения темы
    document.getElementById('themeSelect').addEventListener('change', function() {
        // Временно меняем тему для предпросмотра
        const selectedTheme = this.value;
        if (selectedTheme === 'system') {
            // Определяем предпочтение системы
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.getElementById('themeToggle').classList.add('light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.getElementById('themeToggle').classList.remove('light');
            }
        } else {
            document.documentElement.setAttribute('data-theme', selectedTheme);
            if (selectedTheme === 'light') {
                document.getElementById('themeToggle').classList.add('light');
            } else {
                document.getElementById('themeToggle').classList.remove('light');
            }
        }
    });
    
    // Обработчик изменения компактного режима
    document.getElementById('compactMode').addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('compact-mode');
        } else {
            document.documentElement.classList.remove('compact-mode');
        }
    });
    
    // Активируем обработчик для переключения темы
    document.getElementById('themeToggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Обновляем тему
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Обновляем состояние переключателя
        this.classList.toggle('light', newTheme === 'light');
        
        // Обновляем селектор темы
        document.getElementById('themeSelect').value = newTheme;
        
        // Показываем уведомление
        showNotification(`Тема переключена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
    });
    
    // Инициализация мобильной навигации
    initMobileNav();
}); 