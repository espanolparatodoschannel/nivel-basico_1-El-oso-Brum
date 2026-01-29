import { CONFIG, UI_LABELS, SECTION_LABELS, SECTION_ICONS } from './config.js';
import { escapeHTML, delay } from './utils.js';
import { Storage } from './storage.js';

export const UIRenderer = {
    // ... (rest of the file until createSection)

    createSection(key, esData, targetData, index, isBilingual, langCode) {
        const sectionId = `section-${key}`;

        // Labels para el título de la sección
        const esLabel = SECTION_LABELS['es'][key] || key.replace(/_/g, ' ').toUpperCase();
        let targetLabel = '';

        if (isBilingual) {
            const labels = SECTION_LABELS[langCode];
            targetLabel = labels ? (labels[key] || '') : '';
        }

        // Icono de la sección: Lógica robusta con Fallback
        const normalizedKey = key.trim();

        // 1. Iconos Hardcoded (Prioridad Máxima) - Con estilos inline forzados
        const style = 'style="min-width: 24px; min-height: 24px; display: block;"';
        const LOCAL_ICONS = {
            conectores_logicos: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
            verbos_y_adjetivos: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
            sustantivos_clave: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
            expresiones_idiomaticas: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
            funciones_comunicativas: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
            palabras_clave: `<svg ${style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>`
        };

        // 2. Busqueda
        let iconSVG = LOCAL_ICONS[normalizedKey];

        // 3. Fallback: Buscar coincidencia parcial si no es exacto
        if (!iconSVG) {
            const fuzzyKey = Object.keys(LOCAL_ICONS).find(k => k.includes(normalizedKey) || normalizedKey.includes(k));
            if (fuzzyKey) iconSVG = LOCAL_ICONS[fuzzyKey];
        }

        // 4. Fallback Final: Icono genérico (Círculo Plus)
        if (!iconSVG) {
            console.error(`Missing icon for key: "${normalizedKey}"`);
            iconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        }

        const sectionEl = document.createElement('section');
        sectionEl.className = 'analysis-section fade-in';
        sectionEl.style.animationDelay = `${index * 100}ms`;

        // Contenido interno (depende de si es array de strings u objetos)
        let innerContent = '';

        if (this.isStringArray(esData)) {
            innerContent = `
                <div class="keywords-container">
                    ${esData.map((word, i) => {
                const targetWord = targetData[i] || word;
                return `<span class="keyword-chip">
                            <span class="es-word">${escapeHTML(word)}</span>
                            ${isBilingual ? `<span class="target-word">(${escapeHTML(targetWord)})</span>` : ''}
                        </span>`;
            }).join('')}
                </div>
            `;
        } else if (Array.isArray(esData)) {
            innerContent = `
                <div class="items-list-accordion">
                    ${esData.map((item, i) => {
                const targetItem = targetData[i] || item;
                return this.createInnerAccordionItem(sectionId, item, targetItem, i, isBilingual);
            }).join('')}
                </div>
            `;
        }

        // Estructura de Acordeón para la Sección Entera
        sectionEl.innerHTML = `
            <div class="section-accordion-container">
                <button type="button" 
                        class="section-header-btn" 
                        aria-expanded="false" 
                        aria-controls="content-${sectionId}" 
                        data-accordion-id="${sectionId}">
                    
                    <div class="section-header-left">
                        ${iconSVG ? `<div class="section-category-icon">${iconSVG}</div>` : ''}
                        <div class="section-titles">
                            <h2 class="section-title-es">${esLabel}</h2>
                            ${isBilingual && targetLabel ? `<span class="section-title-target">${targetLabel}</span>` : ''}
                        </div>
                    </div>

                    <span class="accordion-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </button>
                <div id="content-${sectionId}" class="section-content" hidden>
                    <div class="section-body">
                        ${innerContent}
                    </div>
                </div>
            </div>
        `;

        return sectionEl;
    },
    /**
     * Elementos del DOM cacheados (se inicializan en init)
     */
    elements: {},

    init() {
        this.elements = {
            title: document.querySelector(CONFIG.SELECTORS.MAIN_TITLE),
            content: document.querySelector(CONFIG.SELECTORS.CONTENT_CONTAINER),
            selector: document.querySelector(CONFIG.SELECTORS.LANGUAGE_SELECTOR),
            credits: document.querySelector(CONFIG.SELECTORS.CREDITS),
            loading: document.querySelector(CONFIG.SELECTORS.LOADING_INDICATOR),
            error: document.querySelector(CONFIG.SELECTORS.ERROR_CONTAINER),
            errorMsg: document.querySelector(CONFIG.SELECTORS.ERROR_MESSAGE)
        };
    },

    /**
     * Renderiza el selector de idiomas
     * @param {Object} config - Datos de configuration de idiomas
     * @param {string} currentLang - Código del idioma actual
     */
    renderLanguageSelector(config, currentLang) {
        if (!this.elements.selector) return;

        this.elements.selector.innerHTML = config.languages.map(lang => {
            const isSelected = lang.code === currentLang ? 'selected' : '';
            return `<option value="${lang.code}" ${isSelected}>
                ${lang.flag} ${lang.name}
            </option>`;
        }).join('');
    },

    /**
     * Muestra el estado de carga
     */
    showLoading() {
        this.elements.content.classList.add('hidden');
        this.elements.error.classList.add('hidden');
        this.elements.loading.classList.remove('hidden');
        this.elements.title.textContent = UI_LABELS.DEFAULT_TITLE;
        this.elements.selector.disabled = true;
    },

    /**
     * Muestra mensaje de error
     * @param {string} message 
     */
    showError(message) {
        this.elements.loading.classList.add('hidden');
        this.elements.content.classList.add('hidden');
        this.elements.error.classList.remove('hidden');
        this.elements.errorMsg.textContent = message || "Error desconocido";
        this.elements.selector.disabled = false;
    },

    /**
     * Renderiza la historia completa
     * @param {Object} data - Datos JSON de la historia
     */
    renderStory(esData, targetData) {
        // Ocultar estados previos
        this.elements.loading.classList.add('hidden');
        this.elements.error.classList.add('hidden');
        this.elements.content.classList.remove('hidden');
        this.elements.selector.disabled = false;

        const effectiveTarget = targetData || esData;
        const isBilingual = !!targetData && targetData !== esData;

        // Obtenemos el código de idioma del targetData (aunque no lo tenemos explícito en el JSON, 
        // lo ideal sería pasarlo a renderStory. Por ahora, inferimos que targetData *es* el target seleccionado en App)
        // Para simplificar, usaremos 'es' como base y buscaremos las etiquetas del target si podemos.
        // HACK: App.js debería pasar el código del idioma actual.
        // Como no lo pasamos, asumimos que estamos renderizando lo que pidió el usuario.
        // Pero necesitamos el código de idioma para buscar en SECTION_LABELS.
        // Vamos a sacar el idioma del selector del DOM.
        const currentLangCode = this.elements.selector.value || 'es';


        // 1. Meta información
        this.elements.title.style.opacity = '0';
        setTimeout(() => {
            let titleHTML = escapeHTML(esData.meta.titulo_historia || esData.titulo);
            if (isBilingual) {
                const targetTitle = escapeHTML(targetData.meta.titulo_historia || targetData.titulo);
                titleHTML += `<br><span class="foreign-title-sub">${targetTitle}</span>`;
            }
            this.elements.title.innerHTML = titleHTML;
            this.elements.title.style.opacity = '1';
        }, 200);

        if (this.elements.credits) {
            this.elements.credits.innerHTML = `
                ${esData.meta.autor ? `Autor: ${escapeHTML(esData.meta.autor)}` : ''} 
                ${esData.meta.fecha ? `| Fecha: ${escapeHTML(esData.meta.fecha)}` : ''}
            `;
        }

        // 2. Generar secciones dinámicamente
        const excludeKeys = ['meta', 'titulo'];
        const sectionsData = Object.entries(esData)
            .filter(([key]) => !excludeKeys.includes(key));

        this.elements.content.innerHTML = '';

        sectionsData.forEach(([key, esValue], index) => {
            const targetValue = effectiveTarget[key] || esValue;
            const section = this.createSection(key, esValue, targetValue, index, isBilingual, currentLangCode);
            this.elements.content.appendChild(section);
        });

        // 3. Restaurar estado de acordeones (ahora son secciones)
        this.restoreAccordionState();
    },

    createSection(key, esData, targetData, index, isBilingual, langCode) {
        const sectionId = `section-${key}`;

        // Labels para el título de la sección
        const esLabel = SECTION_LABELS['es'][key] || key.replace(/_/g, ' ').toUpperCase();
        let targetLabel = '';

        if (isBilingual) {
            const labels = SECTION_LABELS[langCode];
            targetLabel = labels ? (labels[key] || '') : '';
        }

        const sectionEl = document.createElement('section');
        sectionEl.className = 'analysis-section fade-in';
        sectionEl.style.animationDelay = `${index * 100}ms`;

        // Contenido interno (depende de si es array de strings u objetos)
        let innerContent = '';

        if (this.isStringArray(esData)) {
            innerContent = `
                <div class="keywords-container">
                    ${esData.map((word, i) => {
                const targetWord = targetData[i] || word;
                return `<span class="keyword-chip">
                            <span class="es-word">${escapeHTML(word)}</span>
                            ${isBilingual ? `<span class="target-word">(${escapeHTML(targetWord)})</span>` : ''}
                        </span>`;
            }).join('')}
                </div>
            `;
        } else if (Array.isArray(esData)) {
            innerContent = `
                <div class="items-list-accordion">
                    ${esData.map((item, i) => {
                const targetItem = targetData[i] || item;
                return this.createInnerAccordionItem(sectionId, item, targetItem, i, isBilingual);
            }).join('')}
                </div>
            `;
        }

        // Estructura de Acordeón para la Sección Entera
        sectionEl.innerHTML = `
            <div class="section-accordion-container">
                <button type="button" 
                        class="section-header-btn" 
                        aria-expanded="false" 
                        aria-controls="content-${sectionId}" 
                        data-accordion-id="${sectionId}">
                    <div class="section-titles">
                        <h2 class="section-title-es">${esLabel}</h2>
                        ${isBilingual && targetLabel ? `<span class="section-title-target">${targetLabel}</span>` : ''}
                    </div>
                    <span class="accordion-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </button>
                <div id="content-${sectionId}" class="section-content" hidden>
                    <div class="section-body">
                        ${innerContent}
                    </div>
                </div>
            </div>
        `;

        return sectionEl;
    },

    createInnerAccordionItem(sectionId, esItem, targetItem, index, isBilingual) {
        const itemId = `${sectionId}-item-${index}`;

        return `
            <div class="item-accordion-card">
                <button type="button" 
                        class="item-header-btn" 
                        aria-expanded="false" 
                        aria-controls="content-${itemId}" 
                        data-accordion-id="${itemId}">
                    
                    <div class="item-titles">
                         <span class="term-es">${escapeHTML(esItem.termino)}</span>
                         ${isBilingual ? `<span class="term-target">${escapeHTML(targetItem.termino)}</span>` : ''}
                    </div>
                    
                    <span class="accordion-icon inner-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </button>

                <div id="content-${itemId}" class="item-content hidden">
                    <div class="content-block">
                        <p class="definition-es">${escapeHTML(esItem.explicacion)}</p>
                        ${isBilingual ? `<p class="definition-target">${escapeHTML(targetItem.explicacion)}</p>` : ''}
                    </div>

                    <div class="example-box">
                        <p class="example-es">"${escapeHTML(esItem.ejemplo)}"</p>
                        ${isBilingual ? `<p class="example-target">"${escapeHTML(targetItem.ejemplo)}"</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    isStringArray(arr) {
        return Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string';
    },

    addAccordionListeners() {
        // Listener para cabeceras de Sección
        const sectionHeaders = document.querySelectorAll('.section-header-btn');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const contentId = header.getAttribute('aria-controls');
                const content = document.getElementById(contentId);

                header.setAttribute('aria-expanded', !isExpanded);
                content.hidden = isExpanded; // Si estaba expandido, ahora oculto (hidden=true)

                // Persistencia de Sección
                const id = header.getAttribute('data-accordion-id');
                Storage.setAccordionState(id, !isExpanded);
            });
        });

        // Listener para cabeceras de Items Internos
        const itemHeaders = document.querySelectorAll('.item-header-btn');
        itemHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el clic cierre la sección padre
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const contentId = header.getAttribute('aria-controls');
                const content = document.getElementById(contentId);

                header.setAttribute('aria-expanded', !isExpanded);

                // Toggle de clase hidden para items
                if (isExpanded) {
                    content.classList.add('hidden');
                } else {
                    content.classList.remove('hidden');
                }

                // Persistencia de Item
                const id = header.getAttribute('data-accordion-id');
                Storage.setAccordionState(id, !isExpanded);
            });
        });
    },

    restoreAccordionState() {
        const openIds = Storage.getAccordionStates();

        // Si no hay historial, abrir primera sección por defecto
        if (openIds.length === 0) {
            const firstHeader = document.querySelector('.section-header-btn');
            if (firstHeader) {
                firstHeader.setAttribute('aria-expanded', 'true');
                const content = document.getElementById(firstHeader.getAttribute('aria-controls'));
                if (content) content.hidden = false;
            }
        } else {
            // Restaurar estado de Secciones y de Items
            openIds.forEach(id => {
                // Intentar buscar como botón de sección o de item
                const header = document.querySelector(`button[data-accordion-id="${id}"]`);
                if (header) {
                    header.setAttribute('aria-expanded', 'true');

                    const contentId = header.getAttribute('aria-controls');
                    const content = document.getElementById(contentId);

                    if (content) {
                        // Si es sección usa 'hidden' attribute, si es item usa class 'hidden'
                        if (header.classList.contains('section-header-btn')) {
                            content.hidden = false;
                        } else {
                            content.classList.remove('hidden');
                        }
                    }
                }
            });
        }

        this.addAccordionListeners();
    }
};
