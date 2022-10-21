function storageGet(table) {
    return localStorage.getItem(table);
}

function storageSet(table, dados) {
    return localStorage.setItem(table, JSON.stringify(dados));
}