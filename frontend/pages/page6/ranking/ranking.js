document.addEventListener('DOMContentLoaded', async () => {
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '<li>Carregando ranking...</li>';

    // Constrói a URL do backend dinamicamente
    const currentHost = window.location.host;
    const backendHost = currentHost.replace(/^\d+/, '3000');
    const backendUrl = `https://${backendHost}`;

    try {
        const response = await fetch(`${backendUrl}/ranking`);
        if (!response.ok) {
            throw new Error('Não foi possível carregar o ranking.');
        }

        const scores = await response.json();

        if (scores.length === 0) {
            rankingList.innerHTML = '<li>Nenhuma pontuação registrada ainda.</li>';
            return;
        }

        rankingList.innerHTML = scores
            .map(score => `<li><span>${score.username}</span><span>${score.score}</span></li>`)
            .join('');

    } catch (error) {
        console.error('Erro ao buscar o ranking:', error);
        rankingList.innerHTML = `<li>${error.message}</li>`;
    }
});
