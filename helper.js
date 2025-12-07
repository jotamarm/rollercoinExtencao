function getMinMinerValues(myMiners, powerT, bonusT) {

    var minValue = 1000000.0;
    var minMiner;
    var totalCells = 0;

    var minPower;
    var minBonus;
    var minCells;

    myMiners.forEach((m) => {
        if (m.name != "BellGlobe" && m.name != "Codename Red" && m.name != "Codename Green" && m.name != "BowGlobe") {
            //console.log(m.name);
            const isDouble = myMiners.filter(x => x.miner_id == m.miner_id).length > 1;
            const power = m.power / 1000.0;
            const bonus = isDouble ? 0.0 : m.bonus_percent / 10000.0;
            const cells_ = m.width / 1.0;

            const f = power + power * bonusT + powerT * bonus;
            const g = f / cells_;
            const h = g;

            if (h < minValue) {
                minValue = h;
                minMiner = m.name + " | " + (m.level + 1) + (isDouble ? " | isDouble" : "");

                minPower = power;
                minBonus = bonus;
                minCells = cells_;
            }
        }

        totalCells = totalCells + m.width;
    });

    return {
        minValue,
        minMiner,
        totalCells,
        minPower,
        minBonus,
        minCells
    };
}

function newSpan(container, cells, power, bonus, powerT, bonusT, haveMiner, price, invertColor) {
    const f = power + power * bonusT + powerT * bonus;
    const g = f / cells;
    const h = g - cenas2;
    const i = h / price;

    const greenValue = parseFloat(txtGreen);
    const lightGreenValue = greenValue * 2 / 3

    //let result = Math.round(f) + ' | ' + Math.round(g) + ' | ' + Math.round(h) + ' | ' + Math.round(i) + ' | ' + txtBonus + ' | ' + txtPower + ' | ' + power;
    let result = Math.round(i);

    let newSpan = document.createElement('span');
    if (result > greenValue) {
        newSpan.style.color = !invertColor ? 'green' : 'orange';
    }
    else if (result > lightGreenValue) {
        newSpan.style.color = 'lightGreen';
    }
    else if (result > 0) {
        newSpan.style.color = !invertColor ? 'yellow' : 'green';
    }
    else {
        newSpan.style.color = 'red';
        result = "xxxx";
    }
    if (haveMiner && bonus > 0) {
        newSpan.style.textDecoration = 'line-through';
    }
    newSpan.textContent = result;

    container.appendChild(newSpan);
}

function newSpanText(container, text, color) {
    let newSpan = document.createElement('span');
    newSpan.style.color = color;
    newSpan.textContent = text;
    container.appendChild(newSpan);
}

function newSpanSeparador(container, separadorText) {
    const separador = document.createTextNode(separadorText);
    container.appendChild(separador);
}

function newSpanContainer(container, containerClass) {
    let newSpan = container.querySelector("." + containerClass);

    if (newSpan) {
        newSpan.parentNode.removeChild(newSpan);
    }

    newSpan = document.createElement('span');
    newSpan.classList.add(containerClass);
    container.appendChild(newSpan);

    return newSpan;
}