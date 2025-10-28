const store = {
    users: [], //array para armazenar usuários
    streams: [], //array para armazenar serviços de streaming
    series: [], //array para armazenar séries
    userSeasonRecords: [], //array para armazenar registros de temporadas assistidas por usuários
    userIdCounter: 1, //contador para gerar IDs únicos para usuários -- melhor que uuid dado que precisamos do id para relacionamtos/crud
    streamIdCounter: 1, //contador para gerar IDs únicos para serviços de streaming
    seriesIdCounter: 1 //contador para gerar IDs únicos para séries
};

module.exports = store;