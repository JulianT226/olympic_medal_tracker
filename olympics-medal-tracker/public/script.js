document.addEventListener('DOMContentLoaded', () => {
    const medalTableBody = document.querySelector('#medal-table tbody');

    // Fetch medal data from the server
    fetch('/medals')
        .then(response => response.json())
        .then(data => {
            // Calculate weighted points and add it to each team's data
            data.forEach(row => {
                row.weightedPoints = (parseInt(row.gold) * 5) + (parseInt(row.silver) * 3) + (parseInt(row.bronze) * 1);
            });

            // Sort the data by weighted points in descending order
            data.sort((a, b) => b.weightedPoints - a.weightedPoints);

            // Populate the table with sorted data and add a row for weighted points
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.team}</td>
                    <td>${row.gold}</td>
                    <td>${row.silver}</td>
                    <td>${row.bronze}</td>
                    <td>${row.total}</td>
                    <td>${row.weightedPoints}</td>
                `;
                medalTableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching medal data:', error));
});