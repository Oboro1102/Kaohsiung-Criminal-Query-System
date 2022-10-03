const system = {
    data() {
        return {
            isLoading: false,
            showMessage: false,
            showOption: false,
            message: '',
            dataBase: [],
            dataYear: [],
            dataMonth: [],
            selectCurrentYear: '0',
            selectCurrentMonth: '0',
        }
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
        ctx() {
            return document.getElementById('chart').getContext('2d');
        },
        chart() {
            return new Chart(this.ctx, {
                type: 'bar',
                data: [],
                options: {
                    maintainAspectRatio: false,
                }
            });
        },
        chartYearData() {
            return this.dataBase.filter(item => item['年度'] === this.selectCurrentYear);
        },
        chartMonthData() {
            return this.chartYearData.filter(item => item['月份'] === this.selectCurrentMonth);
        },
        chartLabels() {
            return this.chartMonthData.map(item => item['案件別']).filter((element, index, array) =>
                array.indexOf(element) === index).map(item => item.substr(1));
        },
    },
    methods: {
        getDataBase() {
            const api = 'https://api.kcg.gov.tw/api/service/Get/99c8d84a-3553-4fe7-8321-f2f85c7a7715';
            this.isLoading = true;
            axios({
                method: 'get',
                url: api,
                'Content-Type': 'application/json',
            }).then(response => {
                const { data } = response.data
                this.dataBase = data;
                this.filterYear();
                this.$nextTick(() => {
                    this.isLoading = false;
                });
            }).catch((error) => {
                this.showMessage = true;
                this.message = '高雄市政府提供的 API 服務暫時無法使用，請稍後再試。';
            });
        },
        filterYear() {
            const tempTotalData = this.dataBase.map(item => item['年度']);

            this.dataYear = tempTotalData.filter((element, index, array) => array.indexOf(element) === index);
        },
        filterMonth() {
            const checkHasData = this.chartYearData.filter(item => item['發生數(件)'] !== '');
            const tempTotalData = checkHasData.map(item => item.月份);
            const notRepeatMonth = tempTotalData.filter((element, index, array) => array.indexOf(element) === index);

            this.dataMonth = [];
            this.selectCurrentMonth = '0';
            this.dataMonth = notRepeatMonth;
            this.showOption = true;
        },
        randomColor() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);

            return `rgba(${r},${g},${b}, 1)`;
        },
        poolColors(n, colors) {
            const pool = [];
            for (i = 0; i < n; i++) {
                pool.push(colors);
            }
            return pool;
        },
        organizeStrings(str) {
            return str.replace(/[,%]/g, "");
        },
        collationData(data, filter) {
            const array = data.map(item => item[filter]);
            const newArray = array.map(item => this.organizeStrings(item));
            return newArray;
        },
        callChart() {
            let data = this.chartMonthData;
            let showData = { // 圖表使用的數據設定
                labels: this.chartLabels,
                datasets: [{
                    label: '發生數(件)',
                    data: this.collationData(data, '發生數'),
                    backgroundColor: this.poolColors(data.length, this.randomColor()),
                }, {
                    label: '破獲數(件)',
                    data: this.collationData(data, '破獲數'),
                    backgroundColor: this.poolColors(data.length, this.randomColor()),
                }, {
                    label: '破獲率(%)',
                    data: this.collationData(data, '破獲率'),
                    backgroundColor: this.poolColors(data.length, this.randomColor()),
                }]
            };

            if (this.selectCurrentYear === '0') {
                this.isLoading = true;
                this.showMessage = true;
                this.message = '請設定查詢年度';
            } else if (this.selectCurrentMonth === '0') {
                this.isLoading = true;
                this.showMessage = true;
                this.message = '請設定查詢月份';
            } else {
                this.showMessage = false;
                this.isLoading = true;
                // 更新數據
                this.chart.config.data = showData;
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 250);
                });
                this.chart.update();
            }
        }
    },
    created() {
        this.getDataBase();
    },
};

Vue.createApp(system).mount('#app');