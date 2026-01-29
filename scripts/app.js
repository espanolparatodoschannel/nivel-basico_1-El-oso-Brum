import { CONFIG } from './config.js';
import { DataLoader } from './data-loader.js';
import { UIRenderer } from './ui-renderer.js';
import { Storage } from './storage.js';
import { Accessibility } from './accessibility.js';


class App {
    constructor() {
        this.currentLanguage = 'es';
        this.languagesConfig = null;

    }

    async init() {
        console.log('Iniciando aplicación Analysis Linguistico...');



        // Inicializar UI Renderer (buscando elementos en el DOM)
        UIRenderer.init();

        // Listeners globales
        this.setupEventListeners();

        try {
            // 1. Cargar configuración de idiomas
            this.languagesConfig = await DataLoader.loadLanguagesConfig();

            // 2. Determinar idioma inicial
            this.currentLanguage = this.getInitialLanguage();

            // 3. Renderizar Selector
            UIRenderer.renderLanguageSelector(this.languagesConfig, this.currentLanguage);

            // 4. Cargar datos iniciales
            await this.loadContent(this.currentLanguage);

        } catch (error) {
            console.error('Error crítico de inicialización:', error);
            UIRenderer.showError("No se pudo iniciar la aplicación.");
        }
    }

    getInitialLanguage() {
        // Prioridad: 1. LocalStorage, 2. Default Config
        const stored = Storage.getLanguage();
        if (stored) return stored;

        return this.languagesConfig.default || 'es';
    }

    setupEventListeners() {
        // Selector de cambio de idioma
        const selector = document.querySelector(CONFIG.SELECTORS.LANGUAGE_SELECTOR);
        if (selector) {
            selector.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
        }

        // Botón de reintentar en error
        const retryBtn = document.querySelector(CONFIG.SELECTORS.RETRY_BUTTON);
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadContent(this.currentLanguage));
        }
    }


    async handleLanguageChange(newLang) {
        if (newLang === this.currentLanguage) return;

        this.currentLanguage = newLang;
        Storage.setLanguage(newLang);
        await this.loadContent(newLang);
    }

    async loadContent(lang) {
        UIRenderer.showLoading();
        Accessibility.announce(`Cargando contenido en ${this.getLanguageName(lang)}...`);

        try {
            // Simular un mínimo delay para evitar parpadeos
            await new Promise(r => setTimeout(r, 300));

            // Cargar SIEMPRE español (base) y el idioma objetivo
            const [esData, targetData] = await Promise.all([
                DataLoader.loadStoryData('es'),
                (lang === 'es') ? Promise.resolve(null) : DataLoader.loadStoryData(lang)
            ]);

            // Si el idioma es español, targetData será null, el UI Renderer lo manejará
            UIRenderer.renderStory(esData, targetData);

            Accessibility.announce(`Contenido cargado exitosamente.`);

        } catch (error) {
            console.error('Error cargando contenido:', error);
            UIRenderer.showError(`Error al cargar los datos. Verifica los archivos JSON de 'es' y '${lang}'.`);
        }
    }

    getLanguageName(code) {
        const lang = this.languagesConfig?.languages.find(l => l.code === code);
        return lang ? lang.name : code;
    }
}

// Iniciar App cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
