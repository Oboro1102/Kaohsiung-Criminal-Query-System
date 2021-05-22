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
            return this.dataBase.filter(item => item.年度 === this.selectCurrentYear);
        },
        chartMonthData() {
            return this.chartYearData.filter(item => item.月份 === this.selectCurrentMonth);
        },
        chartLabels() {
            return this.chartMonthData.map(item => item.案件別).filter((element, index, array) =>
                array.indexOf(element) === index).map(item => item.substr(1));
        },
        chartDatasetsLabels() {
            return this.chartMonthData.map(item => item['發生數(件)']);
        }
    },
    methods: {
        getDataBase() {
            const api = 'https://api.kcg.gov.tw/api/service/Get/0a9699b8-9a4b-434d-ae00-eb75e1901123';
            let vm = this;
            vm.isLoading = true;
            axios({
                method: 'get',
                url: api,
                'Content-Type': 'application/json',
            }).then(response => {
                vm.dataBase = response.data.data;
                vm.filterYear();
                vm.$nextTick(() => {
                    vm.isLoading = false;
                });
            }).catch((error) => {
                vm.showMessage = true;
                vm.message = '高雄市政府提供的 API 服務暫時無法使用，請稍後再試。';
                console.log(error);
            });
        },
        filterYear() {
            let tempTotalData = this.dataBase.map(item => item.年度);

            this.dataYear = tempTotalData.filter((element, index, array) => array.indexOf(element) === index);
        },
        filterMonth() {
            let checkHasData = this.chartYearData.filter(item => item['發生數(件)'] !== ''),
                tempTotalData = checkHasData.map(item => item.月份),
                notRepeatMounth = tempTotalData.filter((element, index, array) => array.indexOf(element) === index);

            this.dataMonth = [];
            this.selectCurrentMonth = '0';
            this.dataMonth = notRepeatMounth;
            this.showOption = true;
        },
        randomColor() {
            let r = Math.floor(Math.random() * 255);
            let g = Math.floor(Math.random() * 255);
            let b = Math.floor(Math.random() * 255);

            return "rgba(" + r + "," + g + "," + b + ", 1)";
        },
        poolColors(n, colors) {
            let pool = [];
            for (i = 0; i < n; i++) {
                pool.push(colors);
            }
            return pool;
        },
        organizeStrings(str) {
            let text = str.replace(/[,%]/g, "");
            return text;
        },
        collationData(data, filter) {
            const vm = this;
            let array = data.map(item => item[filter]),
                newArray = array.map(item => vm.organizeStrings(item));
            return newArray;
        },
        callChart() {
            const vm = this;
            let data = vm.chartMonthData;
            let showData = { // 圖表使用的數據設定
                labels: vm.chartLabels,
                datasets: [{
                    label: '發生數(件)',
                    data: vm.collationData(data, '發生數(件)'),
                    backgroundColor: vm.poolColors(data.length, vm.randomColor()),
                }, {
                    label: '破獲數(件)',
                    data: vm.collationData(data, '破獲數(件)'),
                    backgroundColor: vm.poolColors(data.length, vm.randomColor()),
                }, {
                    label: '破獲率(%)',
                    data: vm.collationData(data, '破獲率(％)'),
                    backgroundColor: vm.poolColors(data.length, vm.randomColor()),
                }]
            };

            if (vm.selectCurrentYear === '0') {
                vm.isLoading = true;
                vm.showMessage = true;
                vm.message = '請設定查詢年度';
            } else if (vm.selectCurrentMonth === '0') {
                vm.isLoading = true;
                vm.showMessage = true;
                vm.message = '請設定查詢月份';
            } else {
                vm.showMessage = false;
                vm.isLoading = true;
                // 更新數據
                vm.chart.config.data = showData;
                vm.$nextTick(() => {
                    setTimeout(() => {
                        vm.isLoading = false;
                    }, 250);
                });
                vm.chart.update();
            }
        }
    },
    created() {
        this.getDataBase();
    },
};

Vue.createApp(system).mount('#app');