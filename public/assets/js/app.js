const state = {
    currentDataset: 'weather',
    currentPage: 1,
    entriesPerPage: 6,
    chartType: 'line',
    data: {},
};

const selectors = {
    tableBody: document.getElementById('dataTableBody'),
    tableHead: document.getElementById('tableHeadRow'),
    tableMeta: document.getElementById('tableMeta'),
    currentPage: document.getElementById('currentPage'),
    tableTitle: document.getElementById('tableTitle'),
    tableSubtitle: document.getElementById('tableSubtitle'),
    chartNote: document.getElementById('chartNote'),
    dataSource: document.getElementById('dataSource'),
    heroTemperature: document.getElementById('heroTemperature'),
    heroCondition: document.getElementById('heroCondition'),
    locationLabel: document.getElementById('locationLabel'),
    currentTemperature: document.getElementById('currentTemperature'),
    currentFeelsLike: document.getElementById('currentFeelsLike'),
    currentUpdatedAt: document.getElementById('currentUpdatedAt'),
    currentHumidity: document.getElementById('currentHumidity'),
    currentWind: document.getElementById('currentWind'),
    currentRainChance: document.getElementById('currentRainChance'),
    metricPrimary: document.querySelector('[data-metric="primary"] .label'),
    metricSecondary: document.querySelector('[data-metric="secondary"] .label'),
    metricTertiary: document.querySelector('[data-metric="tertiary"] .label'),
    highlightPrimary: document.querySelector('[data-highlight="primary"] .badge'),
    highlightSecondary: document.querySelector('[data-highlight="secondary"] .badge'),
    highlightTertiary: document.querySelector('[data-highlight="tertiary"] .badge'),
    highlightPrimaryTitle: document.getElementById('highlightPrimaryTitle'),
    highlightPrimaryText: document.getElementById('highlightPrimaryText'),
    highlightSecondaryTitle: document.getElementById('highlightSecondaryTitle'),
    highlightSecondaryText: document.getElementById('highlightSecondaryText'),
    highlightTertiaryTitle: document.getElementById('highlightTertiaryTitle'),
    highlightTertiaryText: document.getElementById('highlightTertiaryText'),
};

const datasetConfig = {
    weather: {
        endpoint: '/api/weather/overview',
        table: {
            columns: [
                { key: 'time', label: 'Zeit', formatter: (value) => formatHour(value) },
                { key: 'temperature', label: 'Temperatur (°C)', formatter: (value) => formatNumber(value, '°C') },
                { key: 'apparentTemperature', label: 'Gefühlt (°C)', formatter: (value) => formatNumber(value, '°C') },
                { key: 'humidity', label: 'Luftfeuchte (%)', formatter: (value) => formatNumber(value, '%') },
                { key: 'windSpeed', label: 'Wind (km/h)', formatter: (value) => formatNumber(value, ' km/h') },
                { key: 'precipitationProbability', label: 'Regenchance (%)', formatter: (value) => formatNumber(value, '%') },
            ],
        },
        chart: {
            note: 'Temperatur, gefühlte Temperatur und Wind im Vergleich (stündlich).',
            datasets: [
                {
                    key: 'temperature',
                    label: 'Temperatur (°C)',
                    backgroundColor: 'rgba(13, 110, 253, 0.35)',
                    borderColor: '#0d6efd',
                },
                {
                    key: 'apparentTemperature',
                    label: 'Gefühlt (°C)',
                    backgroundColor: 'rgba(96, 165, 250, 0.35)',
                    borderColor: '#60a5fa',
                },
                {
                    key: 'windSpeed',
                    label: 'Wind (km/h)',
                    backgroundColor: 'rgba(52, 211, 153, 0.35)',
                    borderColor: '#34d399',
                },
            ],
        },
        apply: (payload) => {
            selectors.locationLabel.textContent = payload.meta?.location ?? '—';
            selectors.heroTemperature.textContent = formatNumber(payload.current?.temperature, '°C');
            selectors.heroCondition.textContent = payload.current?.description ?? 'Aktualisiert';
            selectors.currentTemperature.textContent = formatNumber(payload.current?.temperature, '°C');
            selectors.currentFeelsLike.textContent = formatNumber(payload.current?.apparentTemperature, '°C');
            selectors.currentUpdatedAt.textContent = formatDateTime(payload.current?.time);

            selectors.metricPrimary.textContent = 'Luftfeuchtigkeit';
            selectors.metricSecondary.textContent = 'Wind';
            selectors.metricTertiary.textContent = 'Regenrisiko';

            selectors.currentHumidity.textContent = formatNumber(payload.current?.humidity, '%');
            selectors.currentWind.textContent = formatNumber(payload.current?.windSpeed, ' km/h');
            selectors.currentRainChance.textContent = formatNumber(payload.highlights?.rainChance, '%');

            selectors.highlightPrimary.textContent = 'Temperatur';
            selectors.highlightSecondary.textContent = 'Wind';
            selectors.highlightTertiary.textContent = 'Sonne';
            selectors.highlightPrimary.className = 'badge rounded-pill bg-primary-subtle text-primary mb-2';
            selectors.highlightSecondary.className = 'badge rounded-pill bg-success-subtle text-success mb-2';
            selectors.highlightTertiary.className = 'badge rounded-pill bg-warning-subtle text-warning mb-2';

            selectors.highlightPrimaryTitle.textContent = 'Tagesverlauf';
            selectors.highlightPrimaryText.textContent = `Max ${formatNumber(payload.highlights?.maxTemperature, '°C')} · Min ${formatNumber(payload.highlights?.minTemperature, '°C')}`;
            selectors.highlightSecondaryTitle.textContent = 'Durchschnittliche Geschwindigkeit';
            selectors.highlightSecondaryText.textContent = formatNumber(payload.highlights?.averageWindSpeed, ' km/h');
            selectors.highlightTertiaryTitle.textContent = 'Tageslicht';
            selectors.highlightTertiaryText.textContent = `Aufgang ${formatHour(payload.highlights?.sunrise)} · Untergang ${formatHour(payload.highlights?.sunset)}`;

            selectors.tableTitle.textContent = 'Stündliche Wetterdaten';
            selectors.tableSubtitle.textContent = 'Vergleich von Temperatur, gefühlter Temperatur, Luftfeuchte und Windstärke.';
            selectors.chartNote.textContent = datasetConfig.weather.chart.note;
            selectors.dataSource.textContent = `Quelle: ${payload.meta?.source ?? 'Open‑Meteo'}`;
        },
    },
    'air-quality': {
        endpoint: '/api/weather/air-quality',
        table: {
            columns: [
                { key: 'time', label: 'Zeit', formatter: (value) => formatHour(value) },
                { key: 'pm25', label: 'PM2.5 (µg/m³)', formatter: (value) => formatNumber(value, ' µg/m³') },
                { key: 'pm10', label: 'PM10 (µg/m³)', formatter: (value) => formatNumber(value, ' µg/m³') },
                { key: 'ozone', label: 'Ozon (µg/m³)', formatter: (value) => formatNumber(value, ' µg/m³') },
                { key: 'carbonMonoxide', label: 'CO (µg/m³)', formatter: (value) => formatNumber(value, ' µg/m³') },
            ],
        },
        chart: {
            note: 'Feinstaub (PM2.5/PM10) und Ozonbelastung pro Stunde.',
            datasets: [
                {
                    key: 'pm25',
                    label: 'PM2.5',
                    backgroundColor: 'rgba(220, 38, 38, 0.35)',
                    borderColor: '#dc2626',
                },
                {
                    key: 'pm10',
                    label: 'PM10',
                    backgroundColor: 'rgba(249, 115, 22, 0.35)',
                    borderColor: '#f97316',
                },
                {
                    key: 'ozone',
                    label: 'Ozon',
                    backgroundColor: 'rgba(245, 158, 11, 0.35)',
                    borderColor: '#f59e0b',
                },
            ],
        },
        apply: (payload) => {
            selectors.locationLabel.textContent = payload.meta?.location ?? '—';
            selectors.heroTemperature.textContent = `${formatNumber(payload.airQualityIndex?.score, '')} AQI`;
            selectors.heroCondition.textContent = payload.airQualityIndex?.category ?? '—';
            selectors.currentTemperature.textContent = `${formatNumber(payload.airQualityIndex?.score, '')} AQI`;
            selectors.currentFeelsLike.textContent = payload.airQualityIndex?.category ?? '—';
            selectors.currentUpdatedAt.textContent = formatDateTime(payload.meta?.updatedAt);

            selectors.metricPrimary.textContent = 'Ø PM2.5';
            selectors.metricSecondary.textContent = 'PM10 Peak';
            selectors.metricTertiary.textContent = 'Ozon Peak';

            selectors.currentHumidity.textContent = formatNumber(payload.highlights?.averagePm25, ' µg/m³');
            selectors.currentWind.textContent = formatNumber(payload.highlights?.maxPm10, ' µg/m³');
            selectors.currentRainChance.textContent = formatNumber(payload.highlights?.maxOzone, ' µg/m³');

            selectors.highlightPrimary.textContent = 'Luftqualität';
            selectors.highlightSecondary.textContent = 'Empfehlung';
            selectors.highlightTertiary.textContent = 'Belastung';
            selectors.highlightPrimary.className = `badge rounded-pill bg-${payload.airQualityIndex?.color ?? 'primary'}-subtle text-${payload.airQualityIndex?.color ?? 'primary'} mb-2`;
            selectors.highlightSecondary.className = 'badge rounded-pill bg-info-subtle text-info mb-2';
            selectors.highlightTertiary.className = 'badge rounded-pill bg-warning-subtle text-warning mb-2';

            selectors.highlightPrimaryTitle.textContent = 'Air Quality Index';
            selectors.highlightPrimaryText.textContent = `Durchschnittlicher AQI ${formatNumber(payload.airQualityIndex?.score, '')}`;
            selectors.highlightSecondaryTitle.textContent = 'Gesundheitstipp';
            selectors.highlightSecondaryText.textContent = payload.airQualityIndex?.message ?? 'Aktualisierung steht aus.';
            selectors.highlightTertiaryTitle.textContent = 'Stärkster Wert';
            selectors.highlightTertiaryText.textContent = `PM10 Spitze ${formatNumber(payload.highlights?.maxPm10, ' µg/m³')}`;

            selectors.tableTitle.textContent = 'Luftqualitäts-Monitoring';
            selectors.tableSubtitle.textContent = 'Partikel- und Gasbelastungen je Stunde im Überblick.';
            selectors.chartNote.textContent = datasetConfig['air-quality'].chart.note;
            selectors.dataSource.textContent = `Quelle: ${payload.meta?.source ?? 'Open‑Meteo'}`;
        },
    },
    solar: {
        endpoint: '/api/weather/solar',
        table: {
            columns: [
                { key: 'time', label: 'Zeit', formatter: (value) => formatHour(value) },
                { key: 'shortwaveRadiation', label: 'Global (W/m²)', formatter: (value) => formatNumber(value, ' W/m²') },
                { key: 'directRadiation', label: 'Direkt (W/m²)', formatter: (value) => formatNumber(value, ' W/m²') },
                { key: 'diffuseRadiation', label: 'Diffus (W/m²)', formatter: (value) => formatNumber(value, ' W/m²') },
                { key: 'directNormalIrradiance', label: 'DNI (W/m²)', formatter: (value) => formatNumber(value, ' W/m²') },
            ],
        },
        chart: {
            note: 'Solarstrahlung zur Abschätzung des Energiepotenzials.',
            datasets: [
                {
                    key: 'shortwaveRadiation',
                    label: 'Globalstrahlung',
                    backgroundColor: 'rgba(250, 204, 21, 0.35)',
                    borderColor: '#facc15',
                },
                {
                    key: 'directRadiation',
                    label: 'Direktstrahlung',
                    backgroundColor: 'rgba(253, 186, 116, 0.35)',
                    borderColor: '#f97316',
                },
                {
                    key: 'diffuseRadiation',
                    label: 'Diffusstrahlung',
                    backgroundColor: 'rgba(251, 191, 36, 0.35)',
                    borderColor: '#fbbf24',
                },
            ],
        },
        apply: (payload) => {
            selectors.locationLabel.textContent = payload.meta?.location ?? '—';
            selectors.heroTemperature.textContent = formatNumber(payload.highlights?.peakRadiation, ' W/m²');
            selectors.heroCondition.textContent = 'Maximale Solarleistung';
            selectors.currentTemperature.textContent = formatNumber(payload.highlights?.peakRadiation, ' W/m²');
            selectors.currentFeelsLike.textContent = 'Solarspitze';
            selectors.currentUpdatedAt.textContent = formatDateTime(payload.meta?.updatedAt);

            selectors.metricPrimary.textContent = 'Global Ø';
            selectors.metricSecondary.textContent = 'Direkt Ø';
            selectors.metricTertiary.textContent = 'Tageslicht';

            const hourly = payload.hourly ?? [];
            selectors.currentHumidity.textContent = formatNumber(averageFromSeries(hourly, 'shortwaveRadiation'), ' W/m²');
            selectors.currentWind.textContent = formatNumber(averageFromSeries(hourly, 'directRadiation'), ' W/m²');
            selectors.currentRainChance.textContent = `Tageslicht ${formatNumber(payload.highlights?.daylightHours, ' h')}`;

            selectors.highlightPrimary.textContent = 'Solarenergie';
            selectors.highlightSecondary.textContent = 'Tagesverlauf';
            selectors.highlightTertiary.textContent = 'Sonnenfenster';
            selectors.highlightPrimary.className = 'badge rounded-pill bg-warning-subtle text-warning mb-2';
            selectors.highlightSecondary.className = 'badge rounded-pill bg-info-subtle text-info mb-2';
            selectors.highlightTertiary.className = 'badge rounded-pill bg-success-subtle text-success mb-2';

            selectors.highlightPrimaryTitle.textContent = 'Peak-Leistung';
            selectors.highlightPrimaryText.textContent = `Maximal ${formatNumber(payload.highlights?.peakRadiation, ' W/m²')}`;
            selectors.highlightSecondaryTitle.textContent = 'Durchschnittswerte';
            selectors.highlightSecondaryText.textContent = `${formatNumber(averageFromSeries(hourly, 'shortwaveRadiation'), ' W/m²')} im Mittel`;
            selectors.highlightTertiaryTitle.textContent = 'Sonnenfenster';
            selectors.highlightTertiaryText.textContent = `Aufgang ${formatHour(payload.highlights?.sunrise)} · Untergang ${formatHour(payload.highlights?.sunset)}`;

            selectors.tableTitle.textContent = 'Solarstrahlung pro Stunde';
            selectors.tableSubtitle.textContent = 'Strahlungswerte zur Planung von Photovoltaik und Energie-Management.';
            selectors.chartNote.textContent = datasetConfig.solar.chart.note;
            selectors.dataSource.textContent = `Quelle: ${payload.meta?.source ?? 'Open‑Meteo'}`;
        },
    },
};

const ctx = document.getElementById('chartCanvas').getContext('2d');
const chart = new Chart(ctx, {
    type: state.chartType,
    data: {
        labels: [],
        datasets: [],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    color: '#4b5563',
                },
            },
            x: {
                ticks: {
                    color: '#6b7280',
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
    },
});

const showLoader = () => {
    selectors.tableHead.innerHTML = '';
    selectors.tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="py-5">
                <div class="d-flex flex-column align-items-center gap-2 text-muted">
                    <div class="spinner-border text-primary" role="status"></div>
                    <small>Live-Daten werden geladen …</small>
                </div>
            </td>
        </tr>`;
    selectors.tableMeta.textContent = 'Daten werden geladen …';
};

const loadDataset = async (type) => {
    const config = datasetConfig[type];
    if (!config) {
        return;
    }

    if (!state.data[type]) {
        showLoader();
    }

    try {
        const response = await fetch(config.endpoint, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        state.data[type] = payload;
        state.currentDataset = type;
        state.currentPage = 1;

        applyDataset(type, payload);
        highlightActiveButton(type);
        window.showSnackbar?.('Daten erfolgreich aktualisiert.');
    } catch (error) {
        console.error('Error fetching dataset', error);
        selectors.tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-5">
                    Fehler beim Laden der Daten. Bitte später erneut versuchen.
                </td>
            </tr>`;
        selectors.tableMeta.textContent = 'Keine Daten verfügbar.';
        window.showSnackbar?.('Die Daten konnten nicht geladen werden.', 'danger');
    }
};

const applyDataset = (type, payload) => {
    const config = datasetConfig[type];
    if (!config) {
        return;
    }

    config.apply?.(payload);
    renderTable(type, payload.hourly ?? []);
    updateChart(type, payload.hourly ?? []);
};

const renderTable = (type, rows) => {
    const config = datasetConfig[type];
    const columns = config.table.columns;

    selectors.tableHead.innerHTML = columns
        .map((column) => `<th scope="col">${column.label}</th>`)
        .join('');

    if (!rows.length) {
        selectors.tableBody.innerHTML = `
            <tr>
                <td colspan="${columns.length}" class="text-center text-muted py-5">Keine Datensätze verfügbar</td>
            </tr>`;
        selectors.tableMeta.textContent = 'Keine Daten vorhanden.';
        selectors.currentPage.textContent = '1';
        return;
    }

    const start = (state.currentPage - 1) * state.entriesPerPage;
    const end = start + state.entriesPerPage;
    const pageRows = rows.slice(start, end);

    selectors.tableBody.innerHTML = pageRows
        .map((row) => `
            <tr>
                ${columns
                    .map((column) => `<td>${column.formatter?.(row[column.key], row, column) ?? sanitize(row[column.key])}</td>`)
                    .join('')}
            </tr>`)
        .join('');

    selectors.currentPage.textContent = String(state.currentPage);
    selectors.tableMeta.textContent = `Zeigt ${pageRows.length ? start + 1 : 0} – ${start + pageRows.length} von ${rows.length} Datensätzen`;
};

const updateChart = (type, rows) => {
    const config = datasetConfig[type];
    const datasets = config.chart.datasets;
    const labels = rows.map((row) => formatHour(row.time));

    chart.config.type = state.chartType;
    chart.data.labels = labels;
    chart.data.datasets = datasets.map((dataset) => ({
        label: dataset.label,
        data: rows.map((row) => row[dataset.key] ?? null),
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.borderColor,
        fill: state.chartType === 'line',
        tension: 0.35,
        pointRadius: 3,
    }));

    chart.update();
};

const highlightActiveButton = (type) => {
    document.querySelectorAll('.dataset-switch').forEach((button) => {
        if (button.dataset.dataset === type) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
};

const setChartType = (type) => {
    state.chartType = type;
    const payload = state.data[state.currentDataset];
    if (payload) {
        updateChart(state.currentDataset, payload.hourly ?? []);
    }
};

const previousPage = () => {
    if (state.currentPage <= 1) {
        return;
    }
    state.currentPage -= 1;
    const payload = state.data[state.currentDataset];
    if (payload) {
        renderTable(state.currentDataset, payload.hourly ?? []);
    }
};

const nextPage = () => {
    const payload = state.data[state.currentDataset];
    if (!payload) {
        return;
    }

    const rows = payload.hourly ?? [];
    if (state.currentPage * state.entriesPerPage >= rows.length) {
        return;
    }

    state.currentPage += 1;
    renderTable(state.currentDataset, rows);
};

const formatNumber = (value, suffix = '', fallback = '--') => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return fallback;
    }
    const number = Number(value);
    const options = { minimumFractionDigits: 0, maximumFractionDigits: 1 };
    return `${number.toLocaleString('de-DE', options)}${suffix}`;
};

const sanitize = (value) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return String(value);
};

const formatHour = (isoString) => {
    if (!isoString) {
        return '--';
    }
    const [datePart, timePart = ''] = isoString.split('T');
    const time = timePart.slice(0, 5);
    if (!datePart) {
        return `${time} Uhr`;
    }
    const [year, month, day] = datePart.split('-');
    return `${time} Uhr (${day}.${month})`;
};

const formatDateTime = (isoString) => {
    if (!isoString) {
        return '--';
    }
    const [datePart, timePart = ''] = isoString.split('T');
    if (!datePart) {
        return isoString;
    }
    const [year, month, day] = datePart.split('-');
    const time = timePart.slice(0, 5);
    return `${day}.${month}.${year} · ${time} Uhr`;
};

const averageFromSeries = (rows, key) => {
    if (!rows.length) {
        return null;
    }
    const filtered = rows
        .map((row) => (typeof row[key] === 'number' ? row[key] : Number(row[key])))
        .filter((value) => !Number.isNaN(value));
    if (!filtered.length) {
        return null;
    }
    const sum = filtered.reduce((acc, value) => acc + value, 0);
    return sum / filtered.length;
};

const datasetButtons = document.querySelectorAll('.dataset-switch');

datasetButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const dataset = button.dataset.dataset;
        if (!dataset || dataset === state.currentDataset) {
            return;
        }
        loadDataset(dataset);
    });
});

showLoader();
loadDataset(state.currentDataset);

window.setChartType = setChartType;
window.previousPage = previousPage;
window.nextPage = nextPage;
