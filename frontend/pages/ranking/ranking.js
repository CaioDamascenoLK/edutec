document.addEventListener("DOMContentLoaded", () => {
    const rankingList = document.getElementById("ranking-list");

    const backendUrl = 'https://edutec-pied.vercel.app';
    const user = JSON.parse(localStorage.getItem('user'))

    if (user)
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