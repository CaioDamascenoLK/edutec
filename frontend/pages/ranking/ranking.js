document.addEventListener("DOMContentLoaded", () => {
    const rankingList = document.getElementById("ranking-list");

    const backendUrl = 'http://localhost:3333';


    fetch(`${backendUrl}/ranking`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                rankingList.innerHTML = "<li>Ainda não há pontuações. Seja o primeiro!</li>";
                return;
            }
            data.forEach((item, index) => {
                const li = document.createElement("li");
                li.innerHTML = `<span>${index + 1}. ${item.name}</span><span>${item.score}</span>`;
                rankingList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching ranking:", error);
            rankingList.innerHTML = "<li>Erro ao carregar o ranking.</li>";
        });
});