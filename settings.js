const defaultSettings = {
    theme: 'dark', 
    defaultCurrency: 'USD',
    

    defaultPeriod: '7',
    decimalPlaces: '2',
    compactMode: false,
    

    enableNotifications: true,
    rateChangeNotifications: false,
    notificationDuration: 3,
    

    autoRefresh: false,
    refreshInterval: '5',
    displayedCrypto: ['BTC', 'ETH'],
    

    lastUpdated: new Date().toISOString()
};


let currentSettings = {};

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('financeSettings');
        
        if (savedSettings) {
            currentSettings = JSON.parse(savedSettings);
            console.log('Настройки загружены:', currentSettings);
        } else {
            currentSettings = { ...defaultSettings };
            localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
            console.log('Используются настройки по умолчанию');
        }
        
        populateSettingsForm();
    } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        showNotification('Ошибка при загрузке настроек', 'error');
        
        currentSettings = { ...defaultSettings };
    }
}

function populateSettingsForm() {
    document.getElementById('themeSelect').value = currentSettings.theme || defaultSettings.theme;
    document.getElementById('defaultCurrency').value = currentSettings.defaultCurrency || defaultSettings.defaultCurrency;
    
    document.getElementById('defaultPeriod').value = currentSettings.defaultPeriod || defaultSettings.defaultPeriod;
    document.getElementById('decimalPlaces').value = currentSettings.decimalPlaces || defaultSettings.decimalPlaces;
    document.getElementById('compactMode').checked = currentSettings.compactMode || defaultSettings.compactMode;
    
    document.getElementById('enableNotifications').checked = 
        currentSettings.enableNotifications !== undefined ? 
        currentSettings.enableNotifications : defaultSettings.enableNotifications;
    
    document.getElementById('rateChangeNotifications').checked = 
        currentSettings.rateChangeNotifications !== undefined ? 
        currentSettings.rateChangeNotifications : defaultSettings.rateChangeNotifications;
    
    const durationSlider = document.getElementById('notificationDuration');
    durationSlider.value = currentSettings.notificationDuration || defaultSettings.notificationDuration;
    document.getElementById('durationValue').textContent = `${durationSlider.value} сек`;
    

    document.getElementById('autoRefresh').checked = 
        currentSettings.autoRefresh !== undefined ? 
        currentSettings.autoRefresh : defaultSettings.autoRefresh;
    
    document.getElementById('refreshInterval').value = currentSettings.refreshInterval || defaultSettings.refreshInterval;
    
    const displayedCrypto = currentSettings.displayedCrypto || defaultSettings.displayedCrypto;
    document.querySelectorAll('input[name="displayedCrypto"]').forEach(checkbox => {
        checkbox.checked = displayedCrypto.includes(checkbox.value);
    });
    
    if (currentSettings.compactMode) {
        document.documentElement.classList.add('compact-mode');
    } else {
        document.documentElement.classList.remove('compact-mode');
    }
}

function saveSettings() {
    try {
        currentSettings.theme = document.getElementById('themeSelect').value;
        currentSettings.defaultCurrency = document.getElementById('defaultCurrency').value;
        
        currentSettings.defaultPeriod = document.getElementById('defaultPeriod').value;
        currentSettings.decimalPlaces = document.getElementById('decimalPlaces').value;
        currentSettings.compactMode = document.getElementById('compactMode').checked;
        
        currentSettings.enableNotifications = document.getElementById('enableNotifications').checked;
        currentSettings.rateChangeNotifications = document.getElementById('rateChangeNotifications').checked;
        currentSettings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
        
        currentSettings.autoRefresh = document.getElementById('autoRefresh').checked;
        currentSettings.refreshInterval = document.getElementById('refreshInterval').value;
        
        currentSettings.displayedCrypto = [];
        document.querySelectorAll('input[name="displayedCrypto"]:checked').forEach(checkbox => {
            currentSettings.displayedCrypto.push(checkbox.value);
        });
        
        currentSettings.lastUpdated = new Date().toISOString();
        
        localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
        
        applySettings();
        
        console.log('Настройки сохранены:', currentSettings);
        showNotification('Настройки успешно сохранены', 'success');
    } catch (error) {
        console.error('Ошибка при сохранении настроек:', error);
        showNotification('Ошибка при сохранении настроек', 'error');
    }
}

function applySettings() {
    const selectedTheme = currentSettings.theme;
    if (selectedTheme === 'system') {
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
    
    if (currentSettings.compactMode) {
        document.documentElement.classList.add('compact-mode');
    } else {
        document.documentElement.classList.remove('compact-mode');
    }
    
    const currencySelector = document.getElementById('baseCurrency');
    if (currencySelector && currencySelector.value !== currentSettings.defaultCurrency) {
        currencySelector.value = currentSettings.defaultCurrency;
        const event = new Event('change');
        currencySelector.dispatchEvent(event);
    }
}

function exportSettings() {
    try {      
        const exportData = {
            settings: currentSettings,
            version: '1.0',
            exportDate: new Date().toISOString()
        };
        
        
        const jsonData = JSON.stringify(exportData, null, 2);
        
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fintrack_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
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

function importSettings(file) {
    try {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (!importedData.settings) {
                    throw new Error('Неверный формат файла настроек');
                }
                
                currentSettings = importedData.settings;
                
                localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
                
                populateSettingsForm();
                
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

function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
        currentSettings = { ...defaultSettings };
        localStorage.setItem('financeSettings', JSON.stringify(currentSettings));
        
        populateSettingsForm();
        

        applySettings();
        
        showNotification('Настройки сброшены до значений по умолчанию', 'info');
    }
}


function showNotification(message, type = 'info') {
    if (currentSettings.enableNotifications === false && type !== 'error') {
        console.log('Уведомления отключены в настройках');
        return;
    }
    
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
    
    const duration = (currentSettings.notificationDuration || 3) * 1000;
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
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
    loadSettings();
    
    document.getElementById('notificationDuration').addEventListener('input', function() {
        document.getElementById('durationValue').textContent = `${this.value} сек`;
    });
    
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    document.getElementById('exportSettings').addEventListener('click', exportSettings);
    
    document.getElementById('importSettings').addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            importSettings(event.target.files[0]);
        }
    });
    
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    document.getElementById('themeSelect').addEventListener('change', function() {
        const selectedTheme = this.value;
        if (selectedTheme === 'system') {
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
    
    document.getElementById('compactMode').addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('compact-mode');
        } else {
            document.documentElement.classList.remove('compact-mode');
        }
    });
    
    document.getElementById('themeToggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        this.classList.toggle('light', newTheme === 'light');
        
        document.getElementById('themeSelect').value = newTheme;
        

       showNotification(`Тема переключена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
    });
    
    initMobileNav();
}); 