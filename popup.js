chrome.storage.sync.get(["txtProfileLink", "txtGreen", "txtCellPrice"], (result) => {
    const txtProfileLink = result.txtProfileLink;
    const txtGreen = result.txtGreen;
    const txtCellPrice = result.txtCellPrice;

    document.getElementById('txtProfileLink').value = txtProfileLink;
    document.getElementById('txtGreen').value = txtGreen;
    document.getElementById('txtCellPrice').value = txtCellPrice;

    //console.log(txtProfileLink && txtGreen);
    if (txtProfileLink && txtGreen) {
        fetch("https://rollercoin.com/api/profile/public-user-profile-data/" + txtProfileLink)
            .then((response) => response.json())
            .then((json) => {
                if (json.data) {
                    const avatar_id = json.data.avatar_id;

                    fetch("https://rollercoin.com/api/profile/user-power-data/" + avatar_id)
                        .then((response) => response.json())
                        .then((json) => {
                            const txtPower = json.data.miners / 1000.0;
                            const txtBonus = json.data.bonus_percent / 10000.0;

                            fetch("https://rollercoin.com/api/game/room-config/" + avatar_id)
                                .then((response) => response.json())
                                .then((json) => {
                                    const myMiners = json.data.miners;

                                    const bonusT = parseFloat(txtBonus);
                                    const powerT = parseFloat(txtPower);

                                    var minMinerValues = getMinMinerValues(myMiners, powerT, bonusT);

                                    document.getElementById('txtMinMiner').value = minMinerValues.minMiner;
                                    document.getElementById('txtMinMiner2').value = (((minMinerValues.minPower * (parseFloat(txtBonus) + 1.0) + minMinerValues.minBonus * parseFloat(txtPower)) / minMinerValues.minCells) + "").replace(".", ",");
                                });
                        });
                }
            });
    }


});


document.getElementById('botao').addEventListener('click', () => {

    const props = {
        txtProfileLink: document.getElementById('txtProfileLink').value,
        txtGreen: document.getElementById('txtGreen').value,
        txtCellPrice: document.getElementById('txtCellPrice').value
    };

    chrome.storage.sync.set(props, () => {
        console.log("Propriedades salvas:", props);
    });

    //alert(document.getElementById('txtBonus').id + document.getElementById('txtBonus').value);
});
