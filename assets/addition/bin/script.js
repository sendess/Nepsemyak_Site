function generateTable(data, excludeColumns) {
    const table = document.createElement('table');
    table.classList.add('custom-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        if (!excludeColumns.includes(key)) {
            const th = document.createElement('th');
            th.textContent = key;
            if (key == 'Links'){
                th.setAttribute('style', 'text-align: right; padding-right :65px');
            }
            if(key == 'Title'){
                th.setAttribute('style', 'text-align: left; padding-left :30px');    
            }
            headerRow.appendChild(th);
        }
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        Object.entries(item).forEach(([key, value]) => {
            if (!excludeColumns.includes(key)) {
                const td = document.createElement('td');
                if (key === 'Links') {
                    
                    const button = document.createElement('button');
                    
                    const link = document.createElement('a');
                    button.textContent = "Click...";
                    button.setAttribute('style', 'display:inline');
                    link.href = value;
                    link.target = '_blank'; 
                    link.appendChild(button);
                    td.appendChild(link);
                } else {
                    td.textContent = value;
                }
                row.appendChild(td);
            }
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

const tableContainer = document.getElementById('table-container');
const stringContainer = document.getElementById('string-container');

const excludeColumns = []; 

fetch('./links.json')
    .then(response => response.json())
    .then(jsonData => {
        const jsonString = JSON.stringify(jsonData, null, 2);
        stringContainer.textContent = jsonString;

        const table = generateTable(jsonData, excludeColumns);
        tableContainer.appendChild(table);
    })
    .catch(error => {
        console.error('Failed to fetch the JSON file:', error);
    });