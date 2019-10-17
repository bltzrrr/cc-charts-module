(function( $ ) {
    Chart.plugins.unregister(ChartDataLabels);

    function getLabels(data) {
        return data.map(el => el.name);
    }
    
    function getBarDataSets(chartData) {
        let dataSets = [];
        let labels = [];
        let items = chartData.map(item => item.data).flat();
        items.forEach(element => {
            if (!labels.includes(element.label)) {
                labels.push(element.label);
            }
        });
        labels.forEach(label => {
            let data = items.filter(el => el.label === label);
            let item = items.find(el => el.label === label);
            dataSets.push({
                label: label,
                backgroundColor: item.color,
                data: data.map(el => el.value)
            });
        });
        return dataSets;
    }
    
    function getDoughnutDataSets(chartData) {
        let dataSets = [];
        let data = chartData.map(el => el.percentage);
        let color = chartData.map(el => el.color);
        dataSets.push({
            data: data,
            backgroundColor: color
        });
        return dataSets;
    }

    function prepareChart(options, chartContext) {
        var wrapper = document.createElement('div');
        var canvasWrapper = document.createElement('div');
        canvasWrapper.classList.add('canvas-wrapper');
        wrapper.classList.add('cc-chart-element');
        wrapper.classList.add('cc-chart-element__' + options.type);
        wrapper.style.height = options.height ? options.height + 'px' : '500px';
        wrapper.style.width = options.width ? options.width + 'px' : '700px';
        chartContext.canvas.parentNode.insertBefore(wrapper, chartContext.canvas);
        if (options.heading) {
            let heading = document.createElement('div');
            heading.classList.add('cc-chart-element__heading');
            if (options.heading.axisLabel) {
                let axisLabel = document.createElement('div');
                axisLabel.classList.add('axis-label');
                axisLabel.innerText = options.heading.axisLabel;
                heading.appendChild(axisLabel);
            }
            if (options.heading.title) {
                let title = document.createElement('h3');
                title.classList.add('cc-chart-title');
                title.innerText = options.heading.title
                heading.appendChild(title);
            } 
            wrapper.appendChild(heading);
        }
        wrapper.appendChild(canvasWrapper);
        canvasWrapper.appendChild(chartContext.canvas);
    }

    function getBarConfig (options) {

        let getData = (dataSource) => ({
            labels: getLabels(dataSource),
            datasets: getBarDataSets(dataSource)
        });

        return {
            type: 'bar',
            data: getData(options.data),
            options: {
                legend: {
                    position: 'bottom'
                },
                scales: {
                    yAxes: [{
                        stacked: options.stacked,
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: options.stacked ? [{
                        stacked: true
                    }] : []
                }
            }
        }
    }

    function getDoughnutConfig(options) {
        let getData = (dataSource) => ({
            labels: getLabels(dataSource),
            datasets: getDoughnutDataSets(dataSource)
        });

        const afterLayout = {
            afterLayout(chart) {
                let chartId = chart.canvas.getAttribute('id');
                let chartElement = document.getElementById(chartId);
                let wrapper = chartElement.parentNode;
                let config = chart.config;
                let chartWidth = chart.width - chart.legend.width; 
                if (config.centerText) {
                    let centerText = config.centerText;
                    let parent = chartElement.parentElement;
                    let content = document.createElement('div');
                    for (const key in centerText) {
                        let element = document.createElement('div');
                        if (key === 'title') {
                            element.classList.add('title');
                        }
                        element.classList.add(key === 'value' ? 'value' : 'label');
                        element.innerText = centerText[key];
                        content.append(element);
                    }
                    content.classList.add('cc-chart-element__center');
                    content.style.left = chartWidth / 2 + 'px';
                    content.style.top = wrapper.clientHeight / 2 + 'px';
                    parent.append(content);
                }
            }
        };
        return {
            type: 'doughnut',
            data: getData(options.data),
            plugins: [ChartDataLabels, afterLayout],
            options: {
                legend: {
                    position: 'right'
                },
                plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(2) + "%";
                            return percentage;
                        },
                        color: '#fff'
                    }
                }
            },
            centerText: options.centerText
        }
    }
 
    $.fn.initChart = function( options ) {
        let configMapping = {
            'bar': getBarConfig,
            'doughnut': getDoughnutConfig
        }
        let currentConfig = configMapping[options.type](options);
        var chartContext = this.get(0).getContext('2d');
        prepareChart(options, chartContext);
        var chart = new Chart(chartContext, currentConfig);
 
    };
 
}( jQuery ));