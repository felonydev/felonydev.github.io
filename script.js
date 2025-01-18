// script.js
let currentPage = 1; // Track the current page
const apiUrlBase = 'https://felonydev-github-io.onrender.com/leaderboard'; // Base API URL
const playersPerPage = 20; // Number of players per page

// Function to fetch data from the API
async function fetchData(page) {
    try {
        const apiUrl = `${apiUrlBase}?page=${page}&pageSize=${playersPerPage}`; // Include page and pageSize in the URL
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const jsonData = await response.json(); // Fetch and parse JSON data
        console.log('API Data:', jsonData); // Log the API response for debugging
        const newData = jsonData.players; // Extract the players array from the new page
        displayData(newData, page); // Display the new data with global ranks
        updatePaginationButtons(page); // Update the pagination buttons
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('data-container').innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    }
}

// Function to display data in a Bootstrap-styled table
function displayData(data, page) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear previous content

    if (Array.isArray(data)) {
        const table = document.createElement('table');
        table.className = 'table table-striped mb-5'; // Remove 'table-hover' to disable hover effects
        table.innerHTML = `
            <thead class="table-dark">
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Combo</th> <!-- Switched position: Combo now comes before Car -->
                    <th>Car</th>
                    <th>Map</th>
                    <th>Avg Speed</th>
                    <th>Distance</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((item, index) => {
                    const globalRank = (page - 1) * playersPerPage + index + 1; // Calculate global rank
                    const steamAvatar = item.avatarfull || 'images/placeholder.png'; // Use avatarfull URL from API or fallback to placeholder
                    const formattedScore = item.score ? item.score.toLocaleString() : 'N/A'; // Format score with commas
                    const formattedCombo = item.combo ? `${item.combo}x` : 'N/A'; // Add 'x' behind combo number
                    const formattedAvgSpeed = item.avg_speed ? `${item.avg_speed} km/h` : 'N/A'; // Add 'km/h' behind Avg Speed number
                    const formattedDistance = item.run_distance ? `${item.run_distance} km` : 'N/A'; // Add 'km' behind Distance number
                    const mapName = item.map === 'shuto_revival_project_beta' ? 'Shutoko Revival Project' : item.map === 'nohesi_415' ? '415' : item.map || 'N/A'; // Rename maps
                    console.log('Avatar URL:', steamAvatar); // Log the avatar URL for debugging
                    return `
                        <tr>
                            <td>#${globalRank}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <img src="${steamAvatar}" alt="Avatar" class="avatar me-2" onerror="this.src='images/placeholder.png';">
                                    <span class="player-name">${item.personaname || 'N/A'}</span>
                                </div>
                            </td>
                            <td>${formattedScore}</td>
                            <td>${formattedCombo}</td> <!-- Add 'x' behind combo number -->
                            <td>${item.car_model || 'N/A'}</td>
                            <td>${mapName}</td> <!-- Use renamed map name -->
                            <td>${formattedAvgSpeed}</td> <!-- Add 'km/h' behind Avg Speed number -->
                            <td>${formattedDistance}</td> <!-- Add 'km' behind Distance number -->
                            <td>${item.run_time || 'N/A'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }
}

// Function to generate pagination buttons
function generatePaginationButtons() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear previous buttons

    // Always add the "1" button
    const button1 = document.createElement('button');
    button1.className = 'btn btn-outline-primary mx-1';
    button1.textContent = '1';
    button1.addEventListener('click', () => {
        currentPage = 1; // Update the current page to 1
        fetchData(currentPage); // Fetch data for page 1
        generatePaginationButtons(); // Regenerate buttons
        window.scrollTo(0, 0); // Scroll to the top of the page
    });
    paginationContainer.appendChild(button1);

    // Calculate the range of buttons to display
    let startPage = Math.max(2, currentPage - 4); // Start 4 pages before the current page
    let endPage = Math.min(49, currentPage + 5); // End 5 pages after the current page

    // Ensure there are always 10 buttons (excluding 1 and 50)
    if (endPage - startPage < 9) {
        if (currentPage < 5) {
            endPage = 10;
        } else if (currentPage > 45) {
            startPage = 41;
        }
    }

    // Add buttons for the calculated range
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary mx-1';
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i; // Update the current page
            fetchData(currentPage); // Fetch data for the selected page
            generatePaginationButtons(); // Regenerate buttons
            window.scrollTo(0, 0); // Scroll to the top of the page
        });
        paginationContainer.appendChild(button);
    }

    // Always add the "50" button
    const button50 = document.createElement('button');
    button50.className = 'btn btn-outline-primary mx-1';
    button50.textContent = '50';
    button50.addEventListener('click', () => {
        currentPage = 50; // Update the current page to 50
        fetchData(currentPage); // Fetch data for page 50
        generatePaginationButtons(); // Regenerate buttons
        window.scrollTo(0, 0); // Scroll to the top of the page
    });
    paginationContainer.appendChild(button50);
}

// Function to update the active state of pagination buttons
function updatePaginationButtons(activePage) {
    const buttons = document.querySelectorAll('#pagination button');
    buttons.forEach((button) => {
        if (button.textContent == activePage) {
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary');
        } else {
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline-primary');
        }
    });
}

// Generate pagination buttons when the page loads
generatePaginationButtons();

// Fetch data for the first page when the page loads
fetchData(currentPage);
