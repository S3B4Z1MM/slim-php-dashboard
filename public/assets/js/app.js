let currentDataSet = [];
let currentPage = 1;
let entriesPerPage = 10;
let chartType = 'bar';

const tableBody = document.querySelector('#dataTableBody');

const showLoader = () => {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </td>
        </tr>`;
};

const ctx = document.getElementById('chartCanvas').getContext('2d');
const dataChart = new Chart(ctx, {
    type: chartType,
    data: {
        labels: [],
        datasets: [{
            label: 'Views',
            data: [],
            backgroundColor: 'blue',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },{
            label: 'Likes',
            data: [],
            backgroundColor: 'green',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },{
            label: 'Dislikes',
            data: [],
            backgroundColor: 'red',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

const loadData = (page) => {
    currentPage = 1;
    currentDataSet = [];

    fetch(`/api/${page}`)
        .then((response) => response.json())
        .then((data) => {
            // TODO: remove in prod | maybe handle different response.data i.e. here posts and so on
            if (data.posts) data = data.posts;
            currentDataSet = data;
            updateTable(currentDataSet);
            updateChart(currentDataSet);
        })
        .catch((error) => {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-danger text-center">Error loading data!</td>
                </tr>`;
            console.error('Error loading data:', error);
        });
};

const updateTable = (currentDataSet) => {
    tableBody.innerHTML = '';
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const pageData = currentDataSet.slice(start, end);

    pageData.forEach((item, index) => {
        const row = `
            <tr>
                <th scope="row">${start + index + 1}</th>
                <td>${item.title}</td>
                <td>${item.views}</td>
                <td>${item.reactions.likes}</td>
                <td>${item.reactions.dislikes}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
    }

    document.getElementById('currentPage').textContent = currentPage;
}

const updateChart = (currentDataSet) => {
    dataChart.data.labels = currentDataSet.map(item => item.title);
    dataChart.data.datasets[0].data = currentDataSet.map(item => item.views);
    dataChart.data.datasets[1].data = currentDataSet.map(item => item.reactions.likes);
    dataChart.data.datasets[2].data = currentDataSet.map(item => item.reactions.dislikes);
    dataChart.update();
}

const previousPage = () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable(currentDataSet);
    }
}

const nextPage =() => {
    if (currentPage * entriesPerPage < currentDataSet.length) {
        currentPage++;
        updateTable(currentDataSet);
    }
}

const setChartType = (type) => {
    chartType = type;
    dataChart.config.type = chartType;
    dataChart.update();
}

const buttons = document.querySelectorAll('button[data-page]');

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        buttons.forEach((btn) => btn.classList.remove('btn-success'));
        button.classList.add('btn-success');

        showLoader();
        loadData(button.getAttribute('data-page'));
    });
});

showLoader();
buttons[0].classList.add('btn-success');
loadData('page1');
