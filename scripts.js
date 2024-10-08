document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput').files[0];

    if (!fileInput) {
        alert('Por favor, selecione um arquivo!');
        return;
    }

    document.getElementById('loadingMessage').style.display = 'block'; // Exibe a mensagem de carregamento

    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Obtém os dados da primeira coluna (números dos cartões)
        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
        
        // Formata apenas a coluna dos cartões
        const updatedRows = rows.map(row => {
            // Converte o número do cartão, se estiver no formato científico
            let cardNumber = row[0].toString(); // Converte para string

            // Verifica se é um número de cartão válido
            if (cardNumber.match(/^\d{12,13}$/)) {
                return [formatCardNumber(cardNumber)];
            }
            return row; // Retorna a linha original se não for válida
        });

        // Cria nova planilha
        const newSheet = XLSX.utils.aoa_to_sheet(updatedRows);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

        // Gera o arquivo Excel
        const wbout = XLSX.write(newWorkbook, {bookType: 'xlsx', type: 'array'});
        const blob = new Blob([wbout], {type: "application/octet-stream"});
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'cartoes_convertidos.xlsx';
        downloadLink.textContent = 'Baixar Cartões Convertidos';
        downloadLink.style.display = 'block';

        document.getElementById('loadingMessage').style.display = 'none'; // Esconde a mensagem de carregamento
    };

    reader.readAsArrayBuffer(fileInput);
});

function formatCardNumber(number) {
    return `${number.substring(0, 2)}.${number.substring(2, 4)}.${number.substring(4, 12)}-${number.substring(12)}`;
}
