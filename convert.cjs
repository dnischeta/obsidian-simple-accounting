const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Input CSV file path
const inputFile = '/Users/dmitrijniseta/Downloads/Капитал 2024 - Расходы.csv';

// Output MD file path
const outputFile = './temp.md';

// Create a write stream for the output file
const writeStream = fs.createWriteStream(path.resolve(outputFile));

// Function to convert date from DD.MM.YYYY to YYYY-MM-DD
function convertDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const categories = {
  "подарки": "Подарки",
  "кафе и рестораны": "Еда/Кафе",
  "доставка еды": "Еда/Доставка",
  "здоровье и красота": "Здоровье/Красота (deprecated)",
  "продукты и хозтовары": "Еда/Продукты",
  "образование": "Образование",
  "терапия": "Здоровье/Врач",
  "цифровые покупки": "Подписки",
  "чрезмерное потребление": "Другое",
  "туризм, путешествия": "Туризм",
  "одежда, товары": "Одежда",
  "аренда": "Аренда",
  "развлечения": "Развлечения",
  "комиссии": "Комиссии",
  "интернет и связь": "Другое",
  "благотворительность": "Благотворительность",
  "транспорт": "Транспорт",
  "непредвиденное, ремонт": "Экстра",
  "крупные траты": "Другое",
  "Надя": "Надя",
  "хобби": "Другое",
  "кредит": "Кредит"
};

// Read and process the CSV file
fs.createReadStream(inputFile)
  .pipe(csv({ headers: ['date', 'category', 'amount', 'description'], separator: ',' }))
  .on('data', (row) => {
    const date = convertDate(row.date);
    const amount = row.amount.replace(/\s/g, '');
    const category = row.category.trim();
    const description = row.description ? row.description.trim() : '';
    if (!categories[category]) {
      throw new Error(`Unknown category: ${category}`);
    }
    const formattedLine = `${date} ${amount}RUB ${categories[category]} Карта/СБЕР ${description}\n`;
    writeStream.write(formattedLine);
  })
  .on('end', () => {
    writeStream.end();
    console.log('Conversion completed. Output saved to temp.md');
  });
