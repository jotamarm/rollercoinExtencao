
var txtProfileLink;
var txtGreen;
var txtCellPrice;

var txtBonus;
var txtPower;
var cenas2;

var myMiners;

var minPower;
var minBonus;
var minCells;

//var miners;
//var miners_;

chrome.storage.sync.get(["txtProfileLink", "txtGreen", "txtCellPrice"], (result) => {
    txtProfileLink = result.txtProfileLink;
    txtGreen = result.txtGreen;
    txtCellPrice = result.txtCellPrice;

    //console.log(txtProfileLink  && txtGreen);
    if (txtProfileLink && txtGreen) {
        fetch("https://rollercoin.com/api/profile/public-user-profile-data/" + txtProfileLink)
            .then((response) => response.json())
            .then((json) => {
                if (json.data) {
                    const avatar_id = json.data.avatar_id;

                    fetch("https://rollercoin.com/api/profile/user-power-data/" + avatar_id)
                        .then((response) => response.json())
                        .then((json) => {
                            txtPower = json.data.miners / 1000.0;
                            txtBonus = json.data.bonus_percent / 10000.0;

                            fetch("https://rollercoin.com/api/game/room-config/" + avatar_id)
                                .then((response) => response.json())
                                .then((json) => {
                                    myMiners = json.data.miners;

                                    const bonusT = parseFloat(txtBonus);
                                    const powerT = parseFloat(txtPower);

                                    var minMinerValues = getMinMinerValues(myMiners, powerT, bonusT);

                                    cenas2 = minMinerValues.totalCells < 528 ? 0.0 : (minMinerValues.minPower * (parseFloat(txtBonus) + 1.0) + minMinerValues.minBonus * parseFloat(txtPower)) / minMinerValues.minCells;
                                    console.log(minMinerValues.totalCells);
                                });
                        });
                }
            });
    }
});

let db; // Variável para armazenar a instância do banco de dados

// Abrir ou criar o banco de dados
const request = indexedDB.open('MeuBancoDeDados', 1);

// Configurar o banco de dados na primeira criação ou atualização
request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('meuStore')) {
        db.createObjectStore('meuStore', { keyPath: 'id' }); // Cria um object store
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    const transaction = db.transaction(['meuStore'], 'readwrite');
    const store = transaction.objectStore('meuStore');

    //const getRequest = store.get('meuItem');
    //getRequest.onsuccess = function () {
    //    if (getRequest.result) {
    //        //console.log(getRequest.result.data);
    //        miners = getRequest.result.data || {};
    //        miners_ = miners;
    //    }
    //    else {
    //        miners = {};
    //        miners_ = miners;
    //    }
    //};
};

function getData(id) {
    if (!db) {
        console.error('Banco de dados ainda não está pronto!');
        return;
    }

    const transaction = db.transaction(['meuStore'], 'readwrite');
    const store = transaction.objectStore('meuStore');

    const getRequest = store.get(id);
    getRequest.onsuccess = function () {
        if (getRequest.result) {
            //do cenas
        }
    };
}

function setData(id, data) {
    if (!db) {
        console.error('Banco de dados ainda não está pronto!');
        return;
    }

    const transaction = db.transaction(['meuStore'], 'readwrite');
    const store = transaction.objectStore('meuStore');

    const request = store.put({ id, data });

    //request.onsuccess = function () {
    //    console.log(`Dados com ID ${id} adicionados com sucesso!`);
    //};

    request.onerror = function (event) {
        console.error('Erro ao adicionar dados:', event.target.error);
    };
}

document.addEventListener('click', () => {
    //console.log(txtBonus && txtPower && cenas2 && myMiners);
    if (txtBonus && txtPower && cenas2 && myMiners) {
        var cells1 = document.getElementById('1');
        var cells2 = document.getElementById('2');
        var miner = document.getElementById('miner');
        const correctPage = window.location.href.endsWith("marketplace/buy");
        if (correctPage && ((cells1 && cells2) || miner)) {
            doCenasClear();
            setTimeout(doCells, 2000)
        }
        const correctPage2 = window.location.href.includes("marketplace/buy/miner/");
        if (correctPage2) {
            doCenasClear2();
            setTimeout(doCells, 500)
        }
    }
});

function doCenasClear() {
    const linhas = document.querySelectorAll(".marketplace-buy-item-card");

    linhas.forEach((container) => {
        let newSpan = container.querySelector(".span-new");

        if (newSpan) {
            newSpan.textContent = "";
        }
    });
}

function doCenasClear2() {
    const itemPage = document.querySelector(".marketplace-buy-item-page");

    let newSpan = itemPage.querySelector(".span-new");

    if (newSpan) {
        newSpan.textContent = "";
    }
}

function doCells() {
    var cells1 = document.getElementById('1');
    var cells2 = document.getElementById('2');
    var miner = document.getElementById('miner');
    var rack = document.getElementById('rack');
    const correctPage = window.location.href.endsWith("marketplace/buy");
    if (correctPage) {
        if (cells1 && cells1.checked && cells2 && !cells2.checked) {
            doCenas(1.0);
        }
        else if (cells1 && !cells1.checked && cells2 && cells2.checked) {
            doCenas(2.0);
        }
        else if (cells1 && cells1.checked && cells2 && cells2.checked) {
            doCenas(0.0);
        }
        else if (cells1 && !cells1.checked && cells2 && !cells2.checked) {
            doCenas(0.0);
        }
        //else if (miner) {
        //    doCenas(0.0);
        //}
        else if (rack.checked) {
            doCenasRack();
        }
    }
    const correctPage2 = window.location.href.includes("marketplace/buy/miner/");
    if (correctPage2) {
        doCenas(0.0);
    }
}

function doSpan(cells, container, bonusT, powerT, id, isToSetData) {
    let item = container.querySelector(".item-addition");
    const bonus = parseFloat(container.querySelector(".item-addition-bonus").innerText.replace("%", "")) / 100.0;
    const price = parseFloat(container.querySelector(".item-price").innerText.replace(" RLT", "").replace(" ", ""));
    const power_ = container.querySelector(".item-addition-power").innerText;
    var power = 0.0;
    if (power_.includes(" Ph/s")) {
        power = parseFloat(power_.replace(" Ph/s", "")) * 1000.0;
    }
    else if (power_.includes(" Gh/s")) {
        power = parseFloat(power_.replace(" Gh/s", "")) / 1000.0;
    }
    else if (power_.includes(" Th/s")) {
        power = parseFloat(power_.replace(" Th/s", ""));
    }

    if (isToSetData) {
        setData(id, { cells: cells, power: power, bonus: bonus });
    }

    const haveMiner = myMiners.some(i => i["miner_id"] == id);

    let container2 = newSpanContainer(item, "span-new");

    if (txtCellPrice) {
        const price2temp = price - (parseFloat(txtCellPrice) * cells);
        const price2 = price2temp < 0.0 ? 0.00001 : price2temp;

        if (haveMiner) {
            newSpanSeparador(container2, " | (");
            newSpan(container2, cells, power, 0, powerT, bonusT, haveMiner, price, false);
            newSpanSeparador(container2, " x ");
            newSpan(container2, cells, power, 0, powerT, bonusT, haveMiner, price2, false);
            newSpanSeparador(container2, ")");
            newSpanText(container2, " haveMiner ", "orange");
            newSpan(container2, cells, power, bonus, powerT, bonusT, !haveMiner, price / 10, true);
        } else {
            newSpanSeparador(container2, " | (");
            newSpan(container2, cells, power, bonus, powerT, bonusT, haveMiner, price, false);
            newSpanSeparador(container2, " x ");
            newSpan(container2, cells, power, bonus, powerT, bonusT, haveMiner, price2, false);
            newSpanSeparador(container2, ")");
        }
    } else {
        if (haveMiner) {
            newSpanSeparador(container2, " | ");
            newSpan(container2, cells, power, 0, powerT, bonusT, haveMiner, price, false);
            newSpanText(container2, " haveMiner", "orange");
        } else {
            newSpanSeparador(container2, " | ");
            newSpan(container2, cells, power, bonus, powerT, bonusT, haveMiner, price, false);
        }
    }
}

function doSpan2(data, itemPage, bonusT, powerT, id) {
    const cells = data.cells;
    const power = data.power;
    const bonus = data.bonus;

    const price = parseFloat(itemPage.querySelector(".item-price").innerText.replace(" RLT", "").replace(" ", ""));
    let item = itemPage.querySelector(".main-item-title");

    const haveMiner = myMiners.some(i => i["miner_id"] == id);

    let container2 = newSpanContainer(item, "span-new");

    const price2temp = price - (parseFloat(txtCellPrice) * cells);
    const price2 = price2temp < 0.0 ? 0.00001 : price2temp;

    newSpanSeparador(container2, " | ");
    newSpanText(container2, price, "orange");
    if (haveMiner) {
        newSpanSeparador(container2, " | (");
        newSpan(container2, cells, power, 0, powerT, bonusT, haveMiner, price, false);
        newSpanSeparador(container2, " x ");
        newSpan(container2, cells, power, 0, powerT, bonusT, haveMiner, price2, false);
        newSpanSeparador(container2, ")");
        newSpanText(container2, " haveMiner ", "orange");
        newSpan(container2, cells, power, bonus, powerT, bonusT, !haveMiner, price / 10, true);
    } else {
        newSpanSeparador(container2, " | (");
        newSpan(container2, cells, power, bonus, powerT, bonusT, haveMiner, price, false);
        newSpanSeparador(container2, " x ");
        newSpan(container2, cells, power, bonus, powerT, bonusT, haveMiner, price2, false);
        newSpanSeparador(container2, ")");
    }
}

function doCenas(cells) {
    if (!db) {
        console.error('Banco de dados ainda não está pronto!');
        return;
    }
    const transaction = db.transaction(['meuStore'], 'readwrite');
    const store = transaction.objectStore('meuStore');

    const linhas = document.querySelectorAll(".marketplace-buy-item-card");

    const bonusT = parseFloat(txtBonus);
    const powerT = parseFloat(txtPower);

    //console.log("cenas");
    if (linhas && linhas.length > 0) {
        linhas.forEach((container) => {
            const id = container.href.split('/').slice(-1)[0];

            if (cells > 0.0) {
                doSpan(cells, container, bonusT, powerT, id, true);
                //setData(id, { cells: cells });
            }
            else {
                const getRequest = store.get(id);
                getRequest.onsuccess = function () {
                    if (getRequest.result) {
                        //console.log(getRequest.result.data);
                        doSpan(getRequest.result.data.cells, container, bonusT, powerT, id, false);
                    }
                };
            }
        });
    }
    else {
        console.log("itemPage");
        const itemPage = document.querySelector(".marketplace-buy-item-page");
        if (itemPage) {
            const id = window.location.href.split('/').slice(-1)[0];
            const getRequest = store.get(id);
            getRequest.onsuccess = function () {
                if (getRequest.result) {
                    //console.log(getRequest.result.data);
                    doSpan2(getRequest.result.data, itemPage, bonusT, powerT, id);
                }
            };
        }
    }
}


function doCenasRack() {
    const linhas = document.querySelectorAll(".marketplace-buy-item-card");

    const racksDictionary = {
        '5a4e4aca032ecc8ffe42ed81': 0.69,
        '63985e43cc914df92b1a450e': 0.69,
        '63867205f4875ce94e93453b': 0.69,
        '64490f83547cfab9a273c894': 0.99,
        '67c574e988262b01d3b36b8f': 0.99,
        '64490fc1547cfab9a2759638': 1.5,
        '63985e82cc914df92b1b5bcf': 1.5,
        '65bba192a19c394aa309623b': 1.5,
        '6538e1ffca0c3f24592559a0': 2.1,
        '64d6284e6d7008148575df77': 2.1,
        '64d62a7d6d7008148575df7b': 2.1,
        '662a2ed024d9775f45fd6e9e': 2.1,
        '645a47a0eccd3c43207474cb': 2.1,
        '64d6299b6d7008148575df79': 2.99,
        '6571ab76ca8bfef34adcd9ea': 2.99,
        '662a2ed024d9775f45fd6ea2': 3.99,
        '65bba192a19c394aa309623f': 3.99,
        '6825aaa7e2da6536108ec08e': 6.99,
        '668d22fc5a25375fc803333c': 6.99,
        '6752f0a50b2ea70a05bc1c5b': 9.5,
        '67ae5d6532b2ba8a144d0f0a': 9.5,
        '68dbc757c05c26894e019db2': 16.99,
        '68109bc6af17e9c540319ed1': 16.99,
        '687953dc850c0148212ddf82': 16.99
    };

    //console.log("cenas");
    if (linhas && linhas.length > 0) {
        linhas.forEach((container) => {
            const id = container.href.split('/').slice(-1)[0];

            //Object.keys(dicionario).forEach((itemKey) => {
                
            //});

            if (racksDictionary[id]) {
                let item = container.querySelector(".item-addition");
                let container2 = newSpanContainer(item, "span-new");
                const price = parseFloat(container.querySelector(".item-price").innerText.replace(" RLT", "").replace(" ", ""));

                newSpanSeparador(container2, " | ");
                if (price <= racksDictionary[id]) {
                    newSpanText(container2, "" + racksDictionary[id] + "buy buy buy", "green");
                }
                else {
                    newSpanText(container2, "" + racksDictionary[id], "orange");
                }
            }

            //if (id == '5a4e4aca032ecc8ffe42ed81') {
            //    let item = container.querySelector(".item-addition");
            //    let container2 = newSpanContainer(item, "span-new");
            //    const price = parseFloat(container.querySelector(".item-price").innerText.replace(" RLT", "").replace(" ", ""));

            //    newSpanSeparador(container2, " | ");
            //    if (price <= 0.69) {
            //        newSpanText(container2, "0.69 buy buy buy", "green");
            //    }
            //    else {
            //        newSpanText(container2, "0.69", "orange");
            //    }
            //}
        });
    }
}
